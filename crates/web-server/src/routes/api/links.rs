use axum::{extract::Path, http::StatusCode, routing::{delete, post}, Extension, Json, Router};
use db::{models::{Link, NewLink, User}, DbPool};
use crate::{common::{APIResponse, GenericMessage}, config::Config, constants, extensions::auth::AuthedUser, util::{self, is_url, starts_with_any}};


use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
struct CreateLink {
    custom_slug: Option<String>,
    link: String,
}

async fn create_link(
    Extension(config): Extension<Config>,
    Extension(pool): Extension<DbPool>,
    AuthedUser(user): AuthedUser,
    Json(payload): Json<CreateLink>
) -> APIResponse<Link> {
    let owner_id: Option<i32> = user.map(|u| u.id);

    if !config.allow_anonymous_shorten && owner_id.is_none() {
        return Err((StatusCode::UNAUTHORIZED, GenericMessage::new("You are not allowed to perform this action.")));
    }

    // Validate before even getting the db

    if !is_url(&payload.link) {
        return Err((StatusCode::BAD_REQUEST, GenericMessage::new("Provided link is not a valid URL.")))
    }

    let conn = &mut pool.get().map_err(|e| {
        (StatusCode::INTERNAL_SERVER_ERROR, GenericMessage::from_string(e.to_string()))
    })?;

    if payload.custom_slug.clone().is_some() {
        let custom_slug = payload.custom_slug.clone().unwrap();

        // Validate custom slug
        // TODO: Improve this. Maybe make it reject if only matches exacly and with /*, instead of starts with.
        if starts_with_any(&custom_slug, &constants::RESERVED_SLUGS) {
            return Err((StatusCode::BAD_REQUEST, GenericMessage::new("Custom slug contains prohibited value")));
        }

        let existing_link = Link::get_by_slug(&payload.custom_slug.clone().unwrap(), conn);

        if existing_link.is_err() {
            return Err((StatusCode::INTERNAL_SERVER_ERROR, GenericMessage::new("Internal Server Error")));
        }

        let existing_link = existing_link.unwrap();

        if existing_link.len() > 0 {
            return Err((StatusCode::CONFLICT, GenericMessage::new("Slug already exists.")));
        }
    }
    let slug = util::generate_unique_string(config.shortened_link_length);

    let new_link = NewLink {
        custom_slug: payload.custom_slug,
        original_link: payload.link,
        owner_id,
        slug: slug
    };

    let link = new_link.insert(conn);

    // Return a response
    Ok((StatusCode::CREATED, Json(link)))
}

async fn delete_link(
    Extension(config): Extension<Config>,
    Extension(pool): Extension<DbPool>,
    AuthedUser(user): AuthedUser,
    Path(slug): Path<String>,
) -> APIResponse<GenericMessage> {
    // TODO: Check link ownership

    let owner_id: Option<i32> = user.map(|u| u.id);

    if owner_id.is_none() {
        return Err((StatusCode::UNAUTHORIZED, GenericMessage::new("You are not allowed to perform this action.")));
    }

    let conn = &mut pool.get().map_err(|e| {
        (StatusCode::INTERNAL_SERVER_ERROR, GenericMessage::from_string(e.to_string()))
    })?;

    let existing_link = Link::get_by_slug(&slug, conn);
    
    if existing_link.is_err() {
        return Err((StatusCode::NOT_FOUND, GenericMessage::new("Slug not found")));
    }

    let existing_link = existing_link.unwrap();

    if existing_link.len() == 0 {
        return Err((StatusCode::NOT_FOUND, GenericMessage::new("Slug not found")));
    }
    
    let existing_link = existing_link.first().unwrap();

    if existing_link.owner_id != owner_id {
        return Err((StatusCode::UNAUTHORIZED, GenericMessage::new("You are not allowed to perform this action.")));
    }

    return match existing_link.delete(conn) {
        Ok(_) => Ok((StatusCode::OK, GenericMessage::new("Slug deleted."))),
        Err(_) => Err((StatusCode::INTERNAL_SERVER_ERROR, GenericMessage::new("Internal server error.")))
    }

}

// Starts at /api/link
pub fn links_router() -> Router {
    Router::new()
        .route("/shorten", post(create_link))
        .route("/:slug", delete(delete_link))
}