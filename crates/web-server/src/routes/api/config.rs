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
}

async fn get_config(
    Extension(config): Extension<Config>,
) -> APIResponse<ConfigResponse> {
	let response = ConfigResponse {
		allow_anonymous_shorten: config.allow_anonymous_shorten,
		allow_registering: config.allow_registering,
		min_password_strength: config.min_password_strength,
		base_url: config.base_url,
	};

	Ok((StatusCode::OK, Json(response)))
}

// Starts at /api/config
pub fn config_router() -> Router {
	Router::new()
		.route("/", get(get_config))
}