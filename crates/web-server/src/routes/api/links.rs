use axum::{http::StatusCode, routing::post, Extension, Json, Router};
use db::{models::{Link, NewLink}, DbPool};
use crate::{common::GenericError, config::Config, constants, util::{self, is_url, starts_with_any}};


use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
struct CreateLink {
    custom_slug: Option<String>,
    link: String,
}

async fn create_link(
    Extension(config): Extension<Config>,
    Extension(pool): Extension<DbPool>,
    Json(payload): Json<CreateLink>
) -> Result<(StatusCode, Json<Link>), (StatusCode, Json<GenericError>)> {
    // Validate before even getting the db

    if !is_url(&payload.link) {
        return Err((StatusCode::BAD_REQUEST, GenericError::new("Provided link is not a valid URL.")))
    }

    let conn = &mut pool.get().map_err(|e| {
        (StatusCode::INTERNAL_SERVER_ERROR, GenericError::from_string(e.to_string()))
    })?;

    if payload.custom_slug.clone().is_some() {
        let custom_slug = payload.custom_slug.clone().unwrap();

        // Validate custom slug
        // TODO: Improve this. Maybe make it reject if only matches exacly and with /*, instead of starts with.
        if starts_with_any(&custom_slug, &constants::RESERVED_SLUGS) {
            return Err((StatusCode::BAD_REQUEST, GenericError::new("Custom slug contains prohibited value")));
        }

        let existing_link = Link::get_by_slug(&payload.custom_slug.clone().unwrap(), conn);

        if existing_link.is_err() {
            return Err((StatusCode::INTERNAL_SERVER_ERROR, GenericError::new("Internal Server Error")));
        }

        let existing_link = existing_link.unwrap();

        if existing_link.len() > 0 {
            return Err((StatusCode::CONFLICT, GenericError::new("Slug already exists.")));
        }
    }

    println!("Received link: {:?}", payload);

    let slug = util::generate_unique_string(config.shortened_link_length);

    let new_link = NewLink {
        custom_slug: payload.custom_slug,
        original_link: payload.link,
        owner_id: 1,
        slug: slug
    };

    let link = new_link.insert(conn);

    // Return a response
    Ok((StatusCode::CREATED, Json(link)))
}

// Starts at /api/link
pub fn links_router() -> Router {
    let links_router = Router::new()
        .route("/shorten", post(create_link));

    links_router
}