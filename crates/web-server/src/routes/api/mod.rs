use axum::Router;

pub mod links;
pub mod user;
pub mod config;

// Starts at /api
pub fn api_router() -> Router {
    Router::new()
        .nest("/link", links::links_router())
        .nest("/user", user::user_router())
        .nest("/config", config::config_router())
}