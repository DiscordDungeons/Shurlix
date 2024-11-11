use axum::{http::StatusCode, routing::get, Extension, Json, Router};
use zxcvbn::Score;

use crate::{common::APIResponse, config::Config};

use serde::Serialize;

#[derive(Serialize, Debug)]
struct ConfigResponse {
	allow_anonymous_shorten: bool,
	allow_registering: bool,
	min_password_strength: Score,
	base_url: String,
	setup_done: bool,
}

async fn get_config(Extension(config): Extension<Config>) -> APIResponse<ConfigResponse> {
	let app_config = config.app.unwrap();
	let security_config = config.security.unwrap();

	let response = ConfigResponse {
		allow_anonymous_shorten: app_config.allow_anonymous_shorten,
		allow_registering: app_config.allow_registering,
		min_password_strength: security_config.min_password_strength,
		base_url: app_config.base_url,
		setup_done: config.setup.setup_done,
	};

	Ok((StatusCode::OK, Json(response)))
}

// Starts at /api/config
pub fn config_router() -> Router {
	Router::new().route("/", get(get_config))
}
