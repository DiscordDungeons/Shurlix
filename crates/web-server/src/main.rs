mod config;
mod util;
mod routes;

use web_pages::{
    render,
    index::IndexPage
};
use dioxus::dioxus_core::VirtualDom;
use axum::{extract::Path, http::StatusCode, response::{Html, IntoResponse}, routing::get, Extension, Router};
use std::net::SocketAddr;


#[tokio::main]
async fn main() {
    let config = config::Config::new();

    let pool = db::create_pool(&config.database_url);

    // build our application with a route
    let app = Router::new()
        .route("/:link", get(index))
        .nest("/api", routes::api::api_router())
        .layer(Extension(config))
        .layer(Extension(pool.clone()));

    // run it
    let addr = SocketAddr::from(([0, 0, 0, 0], 3000));
    println!("listening on {}", addr);
    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    axum::serve(listener, app.into_make_service()).await.unwrap();
}


async fn index(Path(link): Path<String>) -> impl IntoResponse {
    // Do something with the link, e.g., look it up in a database
    let response = format!("Received link: {}", link);

    // Return the response
    (StatusCode::OK, response)
}
