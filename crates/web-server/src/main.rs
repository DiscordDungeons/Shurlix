mod config;
mod util;
mod routes;
mod common;

use common::GenericError;
use db::{models::Link, DbPool};
use web_pages::{
    render,
    index::IndexPage
};
use dioxus::dioxus_core::VirtualDom;
use axum::{extract::Path, http::StatusCode, response::{Html, IntoResponse, Redirect}, routing::get, Extension, Router};
use std::net::SocketAddr;


#[tokio::main]
async fn main() {
    let config = config::Config::new();

    let pool = db::create_pool(&config.database_url);

    // build our application with a route
    let app = Router::new()
        .route("/", get(index))
        .route("/:slug", get(handle_slug))
        .nest("/api", routes::api::api_router())
        .layer(Extension(config))
        .layer(Extension(pool.clone()));

    // run it
    let addr = SocketAddr::from(([0, 0, 0, 0], 3000));
    println!("listening on {}", addr);
    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    axum::serve(listener, app.into_make_service()).await.unwrap();
}

async fn index() -> Html<String> {
    // create a VirtualDom with the app component
    let mut app = VirtualDom::new(IndexPage);
    // rebuild the VirtualDom before rendering
    app.rebuild_in_place();

    // render the VirtualDom to HTML
    Html(dioxus_ssr::render(&app))
}

async fn handle_slug(
    Extension(pool): Extension<DbPool>,
    Path(slug): Path<String>,
) -> impl IntoResponse {
    let conn = &mut pool.get().map_err(|e| {
        (StatusCode::INTERNAL_SERVER_ERROR, GenericError::from_string(e.to_string()))
    })?;

    let existing_link = Link::get_by_slug(&slug, conn);

    if existing_link.is_err() {
        return Err((StatusCode::INTERNAL_SERVER_ERROR, GenericError::new("Internal Server Error")));
    }

    let existing_link = existing_link.unwrap();

    if existing_link.len() == 0 {
        return Err((StatusCode::NOT_FOUND, GenericError::new("Slug not found.")));
    }

    let link = existing_link.first().unwrap();

    Ok(Redirect::permanent(&link.original_link))
}
