use axum::{http::StatusCode, routing::post, Extension, Json, Router};
use db::{models::{NewUser, User}, DbPool};
use email_address::EmailAddress;
use jsonwebtoken::{encode, EncodingKey, Header};
use serde::{Deserialize, Serialize};

use axum_extra::extract::cookie::{Cookie, CookieJar,};

use argon2::{
    password_hash::{
        rand_core::OsRng,
        PasswordHash, PasswordHasher, PasswordVerifier, SaltString
    },
    Argon2
};

use crate::{common::{APIResponse, CookiedAPIResponse, GenericMessage}, config::Config};

#[derive(Deserialize)]
struct RegisterRequest {
    username: String,
    password: String,
    email: String, // Optional field
}

#[derive(Deserialize)]
struct LoginRequest {
    username: String,
    password: String,
}


#[derive(Serialize)]
struct RegisteredUser {
	id: i32,
	username: String,
    email: String,
}

#[derive(Serialize)]
struct JwtClaims {
    sub: String, // User ID
    // Other claims if needed
}

#[derive(Serialize)]
struct LoginResponse {
	token: String
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

	let users = match User::get_by_username(&payload.username, conn) {
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
			let claims = JwtClaims {
                sub: user.id.to_string(),
            };
            let token = encode(&Header::default(), &claims, &EncodingKey::from_secret(config.jwt_secret.as_bytes())).unwrap();

			let cookie = Cookie::build(("auth_token", token.clone()))
				.http_only(true) // Prevent JavaScript access
				.secure(false) // Only send over HTTPS
				.same_site(axum_extra::extract::cookie::SameSite::Lax) // Control cross-site sending
				.path("/") // Path for which the cookie is valid
				.max_age(time::Duration::hours(1)) // Set cookie expiration
				.build();

			let jar2 = jar.add(cookie);

            Ok((jar2, Json(LoginResponse {
				token
			})))
		}
        Err(_) => Err((StatusCode::UNAUTHORIZED, GenericMessage::new("Invalid credentials.")))
    }
}

async fn user_profile() -> APIResponse<GenericMessage> {
	Ok((StatusCode::OK, GenericMessage::new("profile")))
}

// Starts at /api/user
pub fn user_router() -> Router {
     Router::new()
        .route("/register", post(register_user))
        .route("/login", post(login_user))
		.route("/me", get(user_profile))
}