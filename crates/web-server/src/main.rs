use web_pages::{
    render,
    index::IndexPage
};
use dioxus::dioxus_core::VirtualDom;
use axum::{response::{Html, Json}, routing::get, Router};
use std::net::SocketAddr;

#[tokio::main]
async fn main() {
    // build our application with a route
    let app = Router::new()
        .route("/", get(index));

    // run it
    let addr = SocketAddr::from(([0, 0, 0, 0], 3000));
    println!("listening on {}", addr);
    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    axum::serve(listener, app.into_make_service()).await.unwrap();
}

async fn index() -> Html<String> {
    let html = render(VirtualDom::new(IndexPage));

    Html(html)
}