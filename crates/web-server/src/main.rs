mod config;
mod util;
mod routes;
mod common;
mod asset;
mod constants;
mod extensions;

use asset::Asset;
use common::GenericMessage;
use db::{models::Link, DbPool};
use axum::{body::Body, extract::Path, http::StatusCode,response::{IntoResponse, Redirect, Response}, routing::get, Extension, Router};
use mime_guess::from_path;
use std::net::SocketAddr;

async fn asset_handler(uri: axum::http::Uri) -> Response {
    let path = uri.clone().to_string().replace("/assets/", "");
    match Asset::get(&path) {
        Some(file) => {
            // Determine MIME type
            let mime_type = from_path(&path).first().unwrap_or(mime::APPLICATION_OCTET_STREAM);

            // Create a response with the correct content type and body
            Response::builder()
                .header(axum::http::header::CONTENT_TYPE, mime_type.as_ref())
                .body(Body::from(file.data)) // Convert file.data to Body
                .unwrap()
        },
        None => {
            let not_found_message = "File not found";
            // Create a 404 response
            Response::builder()
                .status(StatusCode::NOT_FOUND)
                .body(Body::from(not_found_message)) // Convert to Body
                .unwrap()
        }
    }
}


#[tokio::main]
async fn main() {
    env_logger::init();

    let config = config::Config::new();

    let pool = db::create_pool(&config.database_url);

    db::run_migrations(&pool.clone());


    // build our application with a route
    let app = Router::new()
        .route("/", get(index))
        .route("/assets/*path", get(asset_handler))
        .route("/:slug", get(handle_slug))
        .nest("/api", routes::api::api_router())
        .layer(Extension(config))
        .layer(Extension(pool.clone()));

    // run it
    let addr = SocketAddr::from(([0, 0, 0, 0], 3000));
    log::info!("listening on {}", addr);
    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    axum::serve(listener, app.into_make_service()).await.unwrap();
}

async fn index() -> impl IntoResponse {
    axum::response::Html(include_str!("../static/index.html")) // Serve your index.html
}

async fn handle_slug(
    Extension(pool): Extension<DbPool>,
    Path(slug): Path<String>,
) -> impl IntoResponse {
    let conn = &mut pool.get().map_err(|e| {
        (StatusCode::INTERNAL_SERVER_ERROR, GenericMessage::from_string(e.to_string()))
    })?;

    let existing_link = Link::get_by_slug(&slug, conn);

    if existing_link.is_err() {
        return Err((StatusCode::INTERNAL_SERVER_ERROR, GenericMessage::new("Internal Server Error")));
    }

    let existing_link = existing_link.unwrap();

    if existing_link.len() == 0 {
        return Err((StatusCode::NOT_FOUND, GenericMessage::new("Slug not found.")));
    }

    let link = existing_link.first().unwrap();

    Ok(Redirect::permanent(&link.original_link))
}
