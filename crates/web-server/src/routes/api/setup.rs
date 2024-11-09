use std::sync::{Arc, Mutex};

use axum::{response::IntoResponse, routing::post, Extension, Router};
use tokio::sync::oneshot;

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

    return "Server is shutting down..."
}

// Starts at /api/setup
pub fn setup_router() -> Router {
	Router::new()
		.route("/restart", post(restart))
}
