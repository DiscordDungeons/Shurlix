use std::sync::{Arc, Mutex};

use axum::{http::StatusCode, response::IntoResponse, routing::{get, post}, Extension, Json, Router};
use serde::Serialize;
use tokio::sync::oneshot;
use toml;

use crate::{common::{APIResponse, APIResultWithError, GenericMessage}, config::Config};

#[derive(Serialize)]
struct SetConfigError {
	pub errors: Vec<String>,
}

#[axum::debug_handler]
async fn restart(
	Extension(shutdown_tx): Extension<Arc<Mutex<Option<oneshot::Sender<()>>>>>,
) -> impl IntoResponse {
	let mut tx = shutdown_tx.lock().unwrap();

	if let Some(sender) = tx.take() {
		if let Err(_) = sender.send(()) {
			eprintln!("Failed to send restart signal.");
		}
	}

    return "Setup server is shutting down..."
}

async fn set_initial_config(
	Extension(mut config): Extension<Config>,
	Extension(shutdown_tx): Extension<Arc<Mutex<Option<oneshot::Sender<()>>>>>,
	Json(payload): Json<Config>,
) -> APIResultWithError<GenericMessage, SetConfigError> {
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

async fn serialize(
	Extension(config): Extension<Config>
) -> impl IntoResponse {
	let serialized = match toml::to_string(&config) {
		Ok(value) => value,
		Err(e) => format!("Failed to serialize {}", e)
	};

	serialized
}

// Starts at /api/setup
pub fn setup_router() -> Router {
	Router::new()
		.route("/restart", post(restart))
		.route("/set", post(set_initial_config))
		.route("/serialize", get(serialize))
}
