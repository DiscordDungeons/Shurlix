use axum::Router;

pub mod links;
pub mod user;

// Starts at /api
pub fn api_router() -> Router {
    let api_router = Router::new()
        .nest("/link", links::links_router())
        .nest("/user", user::user_router());

    api_router
}