use axum::{
	extract::{Path, Query},
	http::StatusCode,
	routing::{delete, get, post},
	Extension, Json, Router,
};

use db::{
	models::{Domain, NewDomain},
	DbPool,
};
use serde::{Deserialize, Serialize};

use crate::{
	common::{APIResponse, GenericMessage}, config::Config, extensions::auth::AuthedUser, types::{PaginatedResponse, PaginationQuery}, util::{is_admin, is_url, strip_protocol}
};

#[derive(Serialize, Deserialize, Debug)]
struct CreateDomain {
	domain: String,
}

async fn create_domain(
	Extension(pool): Extension<DbPool>,
	AuthedUser(user): AuthedUser,
	Json(payload): Json<CreateDomain>,
) -> APIResponse<Domain> {
	if !is_admin(user) {
		return Err((StatusCode::UNAUTHORIZED, GenericMessage::new("You are not allowed to perform this action.")));
	}

	let conn = &mut pool
		.get()
		.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, GenericMessage::from_string(e.to_string())))?;

	if !is_url(&payload.domain) {
		return Err((StatusCode::BAD_REQUEST, GenericMessage::new("Provided domain is not a valid URL.")));
	}

	let stripped_domain = strip_protocol(&payload.domain)
		.map_err(|e| (StatusCode::BAD_REQUEST, GenericMessage::from_string(e.to_string())))?;

	// Check if the domain already exists
	if let Ok(_) = Domain::get_by_domain(stripped_domain.clone(), conn) {
		return Err((StatusCode::CONFLICT, GenericMessage::new("Domain already exists.")));
	}

	let new_domain = NewDomain {
		domain: stripped_domain,
	};

	match new_domain.insert(conn) {
		Ok(domain) => Ok((StatusCode::CREATED, Json(domain))),
		Err(_) => Err((StatusCode::INTERNAL_SERVER_ERROR, GenericMessage::new("Failed to create domain."))),
	}
}

async fn delete_domain(
	Extension(pool): Extension<DbPool>,
	AuthedUser(user): AuthedUser,
	Extension(config): Extension<Config>,
	Path(id): Path<i32>,
) -> APIResponse<GenericMessage> {
	if !is_admin(user) {
		return Err((StatusCode::UNAUTHORIZED, GenericMessage::new("You are not allowed to perform this action.")));
	}

	let conn = &mut pool
		.get()
		.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, GenericMessage::from_string(e.to_string())))?;

	let domain = Domain::get_by_id(id, conn).map_err(|_| (StatusCode::NOT_FOUND, GenericMessage::new("Domain not found")))?;

    let base_url = strip_protocol(&config.base_url).map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, GenericMessage::from_string(e.to_string())))?;

    if domain.domain == base_url {
        return Err((StatusCode::FORBIDDEN, GenericMessage::new("You are not allowed to delete the base url.")));
    }

	let _ = Domain::delete_by_id(id, conn);

	Ok((StatusCode::OK, GenericMessage::new("Domain deleted.")))
}

async fn get_domains(
	Extension(pool): Extension<DbPool>,
	AuthedUser(user): AuthedUser,
	Query(pagination): Query<PaginationQuery>,
) -> APIResponse<PaginatedResponse<Domain>> {
	if !is_admin(user) {
		return Err((StatusCode::UNAUTHORIZED, GenericMessage::new("You are not allowed to perform this action.")));
	}

	let conn = &mut pool
		.get()
		.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, GenericMessage::from_string(e.to_string())))?;

	let items = Domain::get_paginated(pagination.page, pagination.per_page, conn)
		.map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, GenericMessage::new("Internal server error.")))?;
	let total_count = Domain::get_total_count(conn)
		.map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, GenericMessage::new("Internal server error.")))?;

	Ok((StatusCode::OK, Json(PaginatedResponse::<Domain> { items, total_count })))
}

// Starts at /api/domains
pub fn domains_router() -> Router {
	Router::new()
		.route("/", get(get_domains))
		.route("/create", post(create_domain))
		.route("/:id", delete(delete_domain))
}
