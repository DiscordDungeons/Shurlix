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
	Json(mut payload): Json<Config>,
) -> APIResultWithError<GenericMessage, SetConfigError> {
	if config.setup.setup_done {
		return Err((
			StatusCode::FORBIDDEN,
			Json(SetConfigError {
				errors: vec!["Setup has already been completed.".to_string()],
			}),
		))
	};

	if let Err(errors) = payload.validate() {
		return Err((StatusCode::BAD_REQUEST, Json(SetConfigError { errors })))
	};

	// Never persist the client-supplied setup state: once the initial config
	// is written, setup is done and this endpoint must stay closed.
	payload.set_is_setup_done(true);

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
