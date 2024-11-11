use axum::{http::StatusCode, response::IntoResponse, Router, routing::get};

pub mod config;
pub mod domains;
pub mod links;
pub mod user;
pub mod setup;

async fn health_check() -> impl IntoResponse {
    StatusCode::OK
}

// Starts at /api
pub fn api_router() -> Router {
	Router::new()
		.route("/health", get(health_check))
		.nest("/link", links::links_router())
		.nest("/user", user::user_router())
		.nest("/config", config::config_router())
		.nest("/domains", domains::domains_router())
		.nest("/setup", setup::setup_router())
}
