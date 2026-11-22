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

#[cfg(test)]
mod test {
	use super::*;

	const VALID_CONFIG_TOML: &str = r#"
		[db]
		url = "postgres://username:password@localhost/shurlix"

		[app]
		shortened_link_length = 8
		allow_anonymous_shorten = true
		allow_registering = true
		base_url = "https://example.com"
		enable_email_verification = false
		email_verification_ttl = "1h"

		[security]
		jwt_secret = "0123456789abcdef0123456789abcdef"
		min_password_strength = 3

		[smtp]
		enabled = false

		[setup]
		setup_done = false
	"#;

	#[tokio::test]
	async fn set_initial_config_rejects_when_setup_already_done() {
		let mut config = Config::new();
		config.set_is_setup_done(true);

		let (tx, _rx) = oneshot::channel();
		let tx = Arc::new(Mutex::new(Some(tx)));

		let payload: Config = toml::de::from_str(VALID_CONFIG_TOML).unwrap();

		let result = set_initial_config(Extension(config), Extension(tx), Json(payload)).await;

		assert!(matches!(result, Err((StatusCode::FORBIDDEN, _))));
	}

	#[tokio::test]
	async fn set_initial_config_persists_setup_done_true() {
		// The handler writes the config to ./Config.toml; make sure we don't
		// clobber a real one and clean up afterwards.
		assert!(!std::path::Path::new("Config.toml").exists());

		let config = Config::new();

		let (tx, _rx) = oneshot::channel();
		let tx = Arc::new(Mutex::new(Some(tx)));

		let payload: Config = toml::de::from_str(VALID_CONFIG_TOML).unwrap();
		assert!(!payload.setup.setup_done);

		let result = set_initial_config(Extension(config), Extension(tx), Json(payload)).await;

		let written = std::fs::read_to_string("Config.toml").expect("config file was not written");
		std::fs::remove_file("Config.toml").expect("failed to clean up config file");

		assert!(matches!(result, Ok((StatusCode::OK, _))));

		let persisted: Config = toml::de::from_str(&written).unwrap();
		assert!(persisted.setup.setup_done);
	}
}
