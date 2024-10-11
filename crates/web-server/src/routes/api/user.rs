use std::str::FromStr;

use axum::{http::StatusCode, routing::post, Extension, Json, Router};
use db::{models::{NewUser, User}, DbPool};
use email_address::EmailAddress;
use serde::{Deserialize, Serialize};

use argon2::{
    password_hash::{
        rand_core::OsRng,
        PasswordHash, PasswordHasher, PasswordVerifier, SaltString
    },
    Argon2
};

use crate::common::{APIResponse, GenericMessage};

#[derive(Deserialize)]
struct RegisterRequest {
    username: String,
    password: String,
    email: String, // Optional field
}


#[derive(Serialize)]
struct RegisteredUser {
	id: i32,
	username: String,
    email: String,
}

async fn register_user(
    Extension(pool): Extension<DbPool>,
	Json(payload): Json<RegisterRequest>,
) -> APIResponse<User> {
	// TODO: Password requirements
	if !EmailAddress::is_valid(&payload.email) {
		return Err((StatusCode::BAD_REQUEST, GenericMessage::new("Invalid email")));
	}

	let conn = &mut pool.get().map_err(|e| {
        (StatusCode::INTERNAL_SERVER_ERROR, GenericMessage::from_string(e.to_string()))
    })?;


	if User::email_exists(&payload.email, conn) {
		return Err((StatusCode::CONFLICT, GenericMessage::new("Email already in use")));
	}

	if User::username_exists(&payload.username, conn) {
		return Err((StatusCode::CONFLICT, GenericMessage::new("Username already in use")));
	}

	let salt = SaltString::generate(&mut OsRng);

	let argon2 = Argon2::default();

	// TODO: Send validation link (if REQUIRE_EMAIL_VALIDATION & SMTP configured)

	// Hash password to PHC string ($argon2id$v=19$...)
	let password_hash = match argon2.hash_password(&payload.password.into_bytes(), &salt) {
		Ok(hash) => hash.to_string(),
		Err(_) =>  return Err((StatusCode::INTERNAL_SERVER_ERROR, GenericMessage::new("Internal Server Error")))
	};

	let new_user = NewUser {
		email: payload.email,
		password_hash,
		password_salt: salt.to_string(), 
		username: payload.username,
	};

	let user = new_user.insert(conn);

	let regisered_user = RegisteredUser {
		email: user.email,
		id: user.id,
		username: user.username
	}
	
	Ok((StatusCode::CREATED, Json(regisered_user)))
}

// Starts at /api/user
pub fn user_router() -> Router {
     Router::new()
        .route("/register", post(register_user))
}