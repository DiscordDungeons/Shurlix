use axum::{extract::Path, http::StatusCode, routing::{delete, get, post}, Extension, Json, Router};



use db::{models::{Domain, NewDomain}, DbPool};
use serde::{Deserialize, Serialize};

use crate::{common::{APIResponse, GenericMessage}, extensions::auth::AuthedUser, util::{is_url, strip_protocol}};

#[derive(Serialize, Deserialize, Debug)]
struct CreateDomain {
	domain: String,
}


async fn create_domain(
	Extension(pool): Extension<DbPool>,
    AuthedUser(user): AuthedUser,
    Json(payload): Json<CreateDomain>
) -> APIResponse<Domain> {
	let is_admin: Option<bool> = user.map(|u| u.is_admin);

    if is_admin.is_none() || (is_admin.is_some() && is_admin.unwrap() == false) {
        return Err((StatusCode::UNAUTHORIZED, GenericMessage::new("You are not allowed to perform this action.")));
    }

	let conn = &mut pool.get().map_err(|e| {
        (StatusCode::INTERNAL_SERVER_ERROR, GenericMessage::from_string(e.to_string()))
    })?;

	if !is_url(&payload.domain) {
        return Err((StatusCode::BAD_REQUEST, GenericMessage::new("Provided domain is not a valid URL.")))
    }
	
	let stripped_domain = strip_protocol(&payload.domain).map_err(|e| {
        (StatusCode::BAD_REQUEST, GenericMessage::from_string(e.to_string()))
    })?;

	// Check if the domain already exists
	if let Ok(_) = Domain::get_by_domain(stripped_domain.clone(), conn) {
		return Err((StatusCode::CONFLICT, GenericMessage::new("Domain already exists.")));
	}

	let new_domain = NewDomain { domain: stripped_domain };

	match new_domain.insert(conn) {
		Ok(domain) => Ok((StatusCode::CREATED, Json(domain))),
		Err(_) => Err((StatusCode::INTERNAL_SERVER_ERROR, GenericMessage::new("Failed to create domain.")))
	}
}

async fn delete_domain(
	Extension(pool): Extension<DbPool>,
    AuthedUser(user): AuthedUser,
	Path(id): Path<i32>,
) -> APIResponse<GenericMessage> {
	let is_admin: Option<bool> = user.map(|u| u.is_admin);

    if is_admin.is_none() || (is_admin.is_some() && is_admin.unwrap() == false) {
        return Err((StatusCode::UNAUTHORIZED, GenericMessage::new("You are not allowed to perform this action.")));
    }

	let conn = &mut pool.get().map_err(|e| {
        (StatusCode::INTERNAL_SERVER_ERROR, GenericMessage::from_string(e.to_string()))
    })?;

	let _= Domain::delete_by_id(id, conn);
	
	Ok((StatusCode::OK, GenericMessage::new("Domain deleted.")))
}

// Starts at /api/domains
pub fn domains_router() -> Router {
    Router::new()
        .route("/create", post(create_domain))
		.route("/:id", delete(delete_domain))
}