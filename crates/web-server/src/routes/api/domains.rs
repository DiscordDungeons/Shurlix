use axum::{
	extract::{Path, Query},
	http::StatusCode,
	routing::{delete, get, post, put},
	Extension, Json, Router,
};

use db::{
	models::{Domain, NewDomain, UpdateDomain},
	DbPool,
};
use serde::{Deserialize, Serialize};

use crate::{
	common::{APIResponse, GenericMessage}, config::Config, extensions::auth::AuthedUser, types::{PaginatedResponse, PaginationQuery}, util::{is_admin, is_url, strip_protocol}
};

#[derive(Serialize, Deserialize, Debug)]
struct CreateDomain {
	domain: String,
    public: Option<bool>,
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
        public: payload.public,
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

    let base_url = strip_protocol(&config.app.unwrap().base_url).map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, GenericMessage::from_string(e.to_string())))?;

    if domain.domain == base_url {
        return Err((StatusCode::FORBIDDEN, GenericMessage::new("You are not allowed to delete the base url.")));
    }

	let _ = Domain::delete_by_id(id, conn);

	Ok((StatusCode::OK, GenericMessage::new("Domain deleted.")))
}

async fn get_paged_domains(
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

async fn update_domain(
    Extension(pool): Extension<DbPool>,
	AuthedUser(user): AuthedUser,
    Path(id): Path<i32>,
	Json(payload): Json<UpdateDomain>,
) -> APIResponse<GenericMessage> {
    if !is_admin(user) {
		return Err((StatusCode::UNAUTHORIZED, GenericMessage::new("You are not allowed to perform this action.")));
	}

	let conn = &mut pool
		.get()
		.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, GenericMessage::from_string(e.to_string())))?;

	if payload.domain.is_some() && !is_url(&payload.domain.clone().unwrap()) {
		return Err((StatusCode::BAD_REQUEST, GenericMessage::new("Provided domain is not a valid URL.")));
	}

	let domain = match &payload.domain {
        Some(domain) => match strip_protocol(&domain.clone()) {
            Ok(domain) => Some(domain),
            Err(e) => return Err((StatusCode::BAD_REQUEST, GenericMessage::from_string(e.to_string()))),
        },
        None => return Err((StatusCode::BAD_REQUEST, GenericMessage::new("Failed to parse domain."))),
    };

	let update_values = UpdateDomain {
		domain: domain.clone(),
		public: payload.public,
	};

	// Check if the new domain already exists
	
	if let Some(domain) = domain.clone() {
		if let Ok(_) = Domain::get_by_domain(domain, conn) {
			return Err((StatusCode::CONFLICT, GenericMessage::new("Domain already exists.")));
		}
	}

    let domain = Domain::get_by_id(id, conn).map_err(|_| (StatusCode::NOT_FOUND, GenericMessage::new("Domain not found")))?;

    match domain.update(update_values, conn) {
        Ok(_) => Ok((StatusCode::OK, GenericMessage::new("Updated."))),
        Err(_) => Err((StatusCode::INTERNAL_SERVER_ERROR, GenericMessage::new("Internal server error."))),
    }
}

async fn get_public_domains(
    Extension(pool): Extension<DbPool>,
) -> APIResponse<Vec<Domain>> {
    let conn = &mut pool
		.get()
		.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, GenericMessage::from_string(e.to_string())))?;

    match Domain::get_public(conn) {
        Ok(domains) => Ok((StatusCode::OK, Json(domains))),
        Err(_) => Err((StatusCode::INTERNAL_SERVER_ERROR, GenericMessage::new("Internal server error.")))
    }
}

async fn get_all_domains(
    Extension(pool): Extension<DbPool>,
	AuthedUser(user): AuthedUser,
) -> APIResponse<Vec<Domain>> {
    let conn = &mut pool
		.get()
		.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, GenericMessage::from_string(e.to_string())))?;
    
    if is_admin(user) {
		match Domain::get_all(conn) {
            Ok(domains) => Ok((StatusCode::OK, Json(domains))),
            Err(_) => Err((StatusCode::INTERNAL_SERVER_ERROR, GenericMessage::new("Internal server error.")))
        }
	} else {
        match Domain::get_public(conn) {
            Ok(domains) => Ok((StatusCode::OK, Json(domains))),
            Err(_) => Err((StatusCode::INTERNAL_SERVER_ERROR, GenericMessage::new("Internal server error.")))
        }
    }
}

// Starts at /api/domains
pub fn domains_router() -> Router {
	Router::new()
		.route("/", get(get_paged_domains))
		.route("/public", get(get_public_domains))
		.route("/all", get(get_all_domains))
		.route("/create", post(create_domain))
		.route("/:id", delete(delete_domain))
		.route("/:id", put(update_domain))
}
