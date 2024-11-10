use std::sync::{Arc, Mutex};

use axum::{http::StatusCode, response::IntoResponse, routing::{get, post}, Extension, Json, Router};
use tokio::sync::oneshot;
use toml;

use crate::{common::{APIResponse, GenericMessage}, config::Config};

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
	Json(payload): Json<Config>,
) -> APIResponse<GenericMessage> {
	println!("Payload {:#?}", payload);

	config.set_is_setup_done(payload.setup.setup_done);

	match config.write_to_file() {
		Ok(_) => Ok((StatusCode::OK, GenericMessage::new("ur mom"))),
		Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, GenericMessage::new(e.to_string().as_str())))
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
