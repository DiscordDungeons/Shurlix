use axum::Router;

pub mod links;

// Starts at /api
pub fn api_router() -> Router {
    let api_router = Router::new()
        .nest("/link", links::links_router());

    api_router
}