use axum::{http::StatusCode, routing::{get, post}, Extension, Json, Router};
use db::{models::{Link, NewUser, SanitizedUser, User}, DbPool};
use email_address::EmailAddress;
use serde::{Deserialize, Serialize};

use axum_extra::extract::cookie::{Cookie, CookieJar};

use argon2::{
    password_hash::{
        rand_core::OsRng,
        PasswordHash, PasswordHasher, PasswordVerifier, SaltString
    },
    Argon2
};

use crate::{common::{APIResponse, CookiedAPIResponse, GenericMessage}, config::Config, extensions::auth::AuthedUser, util::jwt::encode_user_token};

#[derive(Deserialize)]
struct RegisterRequest {
    username: String,
    password: String,
    email: String, // Optional field
}

#[derive(Deserialize)]
struct LoginRequest {
    email: String,
    password: String,
}


#[derive(Serialize)]
struct RegisteredUser {
	id: i32,
	username: String,
    email: String,
}

#[derive(Serialize)]
struct LoginResponse {
	token: String,
	user: SanitizedUser,
}

async fn register_user(
    Extension(pool): Extension<DbPool>,
	Json(payload): Json<RegisterRequest>,
) -> APIResponse<RegisteredUser> {
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
		username: payload.username,
	};

	let user = new_user.insert(conn);

	let registered_user = RegisteredUser {
		email: user.email,
		id: user.id,
		username: user.username
	};
	
	Ok((StatusCode::CREATED, Json(registered_user)))
}

async fn login_user(
	jar: CookieJar,
    Extension(config): Extension<Config>,
	Extension(pool): Extension<DbPool>,
	Json(payload): Json<LoginRequest>,
) -> CookiedAPIResponse<LoginResponse> {

	let conn = &mut pool.get().map_err(|e| {
        (StatusCode::INTERNAL_SERVER_ERROR, GenericMessage::from_string(e.to_string()))
    })?;

	let users = match User::get_by_email(&payload.email, conn) {
		Ok(users) => users,
		Err(_) => return Err((StatusCode::INTERNAL_SERVER_ERROR, GenericMessage::new("Internal server error.")))
	};

	if users.len() == 0 {
		return Err((StatusCode::UNAUTHORIZED, GenericMessage::new("Invalid credentials.")))
	}

	let user = users.first().unwrap();

	let argon2 = Argon2::default();
    let parsed_hash = PasswordHash::new(&user.password_hash).map_err(|_| {
        (StatusCode::INTERNAL_SERVER_ERROR, GenericMessage::new("Internal Server Error"))
    })?;



    // Verify the password
    match argon2.verify_password(&payload.password.as_bytes(), &parsed_hash) {
        Ok(_) => {
			let token = encode_user_token(user.id, config.jwt_secret.as_bytes());

			let cookie = Cookie::build(("auth_token", token.clone()))
				.http_only(true) // Prevent JavaScript access
				.secure(false) // Only send over HTTPS
				.same_site(axum_extra::extract::cookie::SameSite::Lax) // Control cross-site sending
				.path("/") // Path for which the cookie is valid
				.max_age(time::Duration::hours(1)) // Set cookie expiration
				.build();

			let jar2 = jar.add(cookie);

            Ok((jar2, Json(LoginResponse {
				token,
				user: user.sanitize(),
			})))
		}
        Err(_) => Err((StatusCode::UNAUTHORIZED, GenericMessage::new("Invalid credentials.")))
    }
}

async fn user_profile(
    AuthedUser(user): AuthedUser,
) -> APIResponse<SanitizedUser> {
	match user {
		None => Err((StatusCode::UNAUTHORIZED, GenericMessage::new("Invalid credentials."))),
		Some(user) => Ok((StatusCode::OK, Json(SanitizedUser::from(&user))))
	}
}

async fn my_links(
	AuthedUser(user): AuthedUser,
	Extension(pool): Extension<DbPool>,
) -> APIResponse<Vec<Link>> {
	let owner_id: Option<i32> = user.map(|u| u.id);

    if owner_id.is_none() {
        return Err((StatusCode::UNAUTHORIZED, GenericMessage::new("You are not allowed to perform this action.")));
    }

	let conn = &mut pool.get().map_err(|e| {
        (StatusCode::INTERNAL_SERVER_ERROR, GenericMessage::from_string(e.to_string()))
    })?;

	let links = Link::get_by_owner_id(owner_id.unwrap(), conn);

	match links {
		Ok(links) => Ok((StatusCode::OK, Json(links))),
		Err(_) => Err((StatusCode::INTERNAL_SERVER_ERROR, GenericMessage::new("Internal Server Error")))
	}
}

async fn logout_user(
	jar: CookieJar,
) -> CookiedAPIResponse<GenericMessage> {
	let cookie = Cookie::build(("auth_token", "deleted"))
		.http_only(true) // Prevent JavaScript access
		.secure(false) // Only send over HTTPS
		.same_site(axum_extra::extract::cookie::SameSite::Lax) // Control cross-site sending
		.path("/") // Path for which the cookie is valid
		.max_age(time::Duration::hours(1)) // Set cookie expiration
		.expires(time::OffsetDateTime::from_unix_timestamp(0).unwrap())
		.build();

	let jar2 = jar.add(cookie);

	Ok((jar2, GenericMessage::new("Logged out")))
}

// Starts at /api/user
pub fn user_router() -> Router {
     Router::new()
        .route("/register", post(register_user))
        .route("/login", post(login_user))
        .route("/logout", post(logout_user))
		.route("/me", get(user_profile))
		.route("/me/links", get(my_links))
}