use std::sync::{Arc, Mutex};

use axum::{http::StatusCode, routing::post, Extension, Json, Router};
use serde::Serialize;
use tokio::sync::oneshot;

use crate::{common::{APIResultWithError, GenericMessage}, config::Config};

#[derive(Serialize)]
struct SetConfigError {
	pub errors: Vec<String>,
}

async fn set_initial_config(
	Extension(mut config): Extension<Config>,
	Extension(shutdown_tx): Extension<Arc<Mutex<Option<oneshot::Sender<()>>>>>,
	Json(payload): Json<Config>,
) -> APIResultWithError<GenericMessage, SetConfigError> {
	if config.setup.setup_done {
		return Ok((StatusCode::NOT_FOUND, GenericMessage::new("Not found")))
	};

	println!("Payload {:#?}", payload);

	if let Err(errors) = payload.validate() {
		return Err((StatusCode::BAD_REQUEST, Json(SetConfigError { errors })))
	};

	config.set(payload);

	match config.write_to_file() {
		Ok(_) => {
			let mut tx = shutdown_tx.lock().unwrap();

			if let Some(sender) = tx.take() {
				if let Err(_) = sender.send(()) {
					eprintln!("Failed to send restart signal.");
				}
			}
			
			Ok((StatusCode::OK, GenericMessage::new("OK. Restarting.")))
		},
		Err(e) => Ok((StatusCode::INTERNAL_SERVER_ERROR, GenericMessage::new(e.to_string().as_str())))
	}
}


// Starts at /api/setup
pub fn setup_router() -> Router {
	Router::new()
		.route("/set", post(set_initial_config))
}
