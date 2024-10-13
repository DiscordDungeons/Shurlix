use axum::{http::StatusCode, routing::get, Extension, Json, Router};

use crate::{common::APIResponse, config::Config};

use serde::Serialize;

#[derive(Serialize, Debug)]
struct ConfigResponse {
    allow_anonymous_shorten: bool,
}

async fn get_config(
    Extension(config): Extension<Config>,
) -> APIResponse<ConfigResponse> {
	let response = ConfigResponse {
		allow_anonymous_shorten: config.allow_anonymous_shorten
	};

	Ok((StatusCode::OK, Json(response)))
}

// Starts at /api/config
pub fn config_router() -> Router {
	Router::new()
		.route("/", get(get_config))
}