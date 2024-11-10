use axum::{
	extract::{Path, Query},
	http::StatusCode,
	routing::{delete, get, post},
	Extension, Json, Router,
};
use chrono::Utc;
use db::{
	models::{Link, LinkWithDomain, NewUser, NewVerificationToken, SanitizedUser, UpdateUser, User, VerificationToken},
	DbPool,
};
use email_address::EmailAddress;
use serde::{Deserialize, Serialize};

use axum_extra::extract::cookie::{Cookie, CookieJar};

use argon2::{
	password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
	Argon2,
};
use zxcvbn::{
	feedback::{Suggestion, Warning},
	zxcvbn, Entropy, Score,
};

use crate::{
	common::{APIResponse, CookiedAPIResponse, GenericMessage},
	config::Config,
	extensions::auth::AuthedUser,
	services::email::{templates::VerificationEmail, Email},
	types::{PaginatedResponse, PaginationQuery},
	util::{generate_unique_string, jwt::encode_user_token},
};

#[derive(Deserialize)]
struct RegisterRequest {
	username: String,
	password: String,
	confirm_password: String,
	email: String,
	confirm_email: String,
}

#[derive(Deserialize)]
struct LoginRequest {
	email: String,
	password: String,
}

#[derive(Deserialize)]
struct CheckPasswordRequest {
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

#[derive(Serialize)]
struct CheckPasswordFeedback {
	warning: Option<Warning>,
	warning_string: Option<String>,
	suggestion: Vec<Suggestion>,
	suggestion_string: Option<String>,
}
#[derive(Serialize)]
struct CheckPasswordResponse {
	score: Score,
	feedback: Option<CheckPasswordFeedback>,
}

#[derive(Deserialize)]
struct ChangePasswordRequest {
	password: String,
	new_password: String,
	confirm_password: String,
}

#[derive(Deserialize)]
struct UserUpdateRequest {
	username: Option<String>,
	email: Option<String>,
}

impl From<Entropy> for CheckPasswordResponse {
	fn from(value: Entropy) -> Self {
		Self {
			score: value.score(),
			feedback: match value.feedback() {
				Some(feedback) => Some(CheckPasswordFeedback {
					warning: feedback.warning(),
					warning_string: match feedback.warning() {
						Some(warning) => Some(format!("{}", warning)),
						None => None,
					},
					suggestion: feedback.suggestions().to_vec(),
					suggestion_string: Some(
						feedback
							.suggestions()
							.iter()
							.map(|s| format!("{}", s))
							.collect::<Vec<_>>()
							.join(" "),
					),
				}),
				None => None,
			},
		}
	}
}

async fn register_user(
	Extension(pool): Extension<DbPool>,
	Extension(config): Extension<Config>,
	Extension(email): Extension<Email>,
	Json(payload): Json<RegisterRequest>,
) -> APIResponse<RegisteredUser> {
	let app_config = config.app.unwrap();
	let security_config = config.security.unwrap();

	if payload.email != payload.confirm_email {
		return Err((StatusCode::BAD_REQUEST, GenericMessage::new("Emails don't match")));
	}

	if payload.password != payload.confirm_password {
		return Err((StatusCode::BAD_REQUEST, GenericMessage::new("Passwords don't match")));
	}

	if !EmailAddress::is_valid(&payload.email) {
		return Err((StatusCode::BAD_REQUEST, GenericMessage::new("Invalid email")));
	}

	let password_estimate = zxcvbn(&payload.password, &[]);

	if password_estimate.score().lt(&security_config.min_password_strength) {
		return Err((StatusCode::CONFLICT, GenericMessage::new("Password is not strong enough.")));
	}

	let conn = &mut pool
		.get()
		.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, GenericMessage::from_string(e.to_string())))?;

	if User::email_exists(&payload.email, conn) {
		return Err((StatusCode::CONFLICT, GenericMessage::new("Email already in use")));
	}

	if User::username_exists(&payload.username, conn) {
		return Err((StatusCode::CONFLICT, GenericMessage::new("Username already in use")));
	}

	let salt = SaltString::generate(&mut OsRng);

	let argon2 = Argon2::default();

	// Hash password to PHC string ($argon2id$v=19$...)
	let password_hash = match argon2.hash_password(&payload.password.into_bytes(), &salt) {
		Ok(hash) => hash.to_string(),
		Err(_) => return Err((StatusCode::INTERNAL_SERVER_ERROR, GenericMessage::new("Internal Server Error"))),
	};

	let new_user = NewUser {
		email: payload.email.clone(),
		password_hash,
		username: payload.username.clone(),
	};

	let user = new_user.insert(conn);

	// TODO: Send validation link (if REQUIRE_EMAIL_VALIDATION & SMTP configured)

	if app_config.enable_email_verification {
		let verification_token = generate_unique_string(32);

		let new_token = NewVerificationToken {
			user_id: user.id,
			token: verification_token.clone(),
			expires_at: (Utc::now() + app_config.email_verification_ttl).naive_utc(),
		};

		new_token.insert(conn);

		if email.is_available() {
			tokio::spawn(async move {
				let _ = email
					.send_template::<VerificationEmail>(
						&payload.email,
						&VerificationEmail {
							base_url: &app_config.base_url,
							username: &payload.username,
							verification_token: verification_token.as_str(),
							ttl: format!(
								"{}",
								app_config.email_verification_ttl
							)
							.as_str(),
						},
					)
					.await;
			});
		}
	}

	let registered_user = RegisteredUser {
		email: user.email,
		id: user.id,
		username: user.username,
	};

	Ok((StatusCode::CREATED, Json(registered_user)))
}

async fn login_user(
	jar: CookieJar,
	Extension(config): Extension<Config>,
	Extension(pool): Extension<DbPool>,
	Json(payload): Json<LoginRequest>,
) -> CookiedAPIResponse<LoginResponse> {
	let security_config = config.security.unwrap();

	let conn = &mut pool
		.get()
		.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, GenericMessage::from_string(e.to_string())))?;

	let users = match User::get_by_email(&payload.email, conn) {
		Ok(users) => users,
		Err(_) => return Err((StatusCode::INTERNAL_SERVER_ERROR, GenericMessage::new("Internal server error."))),
	};

	if users.len() == 0 {
		return Err((StatusCode::UNAUTHORIZED, GenericMessage::new("Invalid credentials.")));
	}

	let user = users.first().unwrap();

	let argon2 = Argon2::default();
	let parsed_hash = PasswordHash::new(&user.password_hash)
		.map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, GenericMessage::new("Internal Server Error")))?;

	// Verify the password
	match argon2.verify_password(&payload.password.as_bytes(), &parsed_hash) {
		Ok(_) => {
			let token = encode_user_token(user.id, security_config.jwt_secret.as_bytes());

			let cookie = Cookie::build(("auth_token", token.clone()))
				.http_only(true) // Prevent JavaScript access
				.secure(false) // Only send over HTTPS
				.same_site(axum_extra::extract::cookie::SameSite::Lax) // Control cross-site sending
				.path("/") // Path for which the cookie is valid
				.max_age(time::Duration::hours(1))
				.build();

			let jar2 = jar.add(cookie);

			Ok((
				jar2,
				Json(LoginResponse {
					token,
					user: user.sanitize(),
				}),
			))
		}
		Err(_) => Err((StatusCode::UNAUTHORIZED, GenericMessage::new("Invalid credentials."))),
	}
}

async fn user_profile(AuthedUser(user): AuthedUser) -> APIResponse<SanitizedUser> {
	match user {
		None => Err((StatusCode::UNAUTHORIZED, GenericMessage::new("Invalid credentials."))),
		Some(user) => Ok((StatusCode::OK, Json(SanitizedUser::from(&user)))),
	}
}

async fn my_links(
	AuthedUser(user): AuthedUser,
	Query(pagination): Query<PaginationQuery>,
	Extension(pool): Extension<DbPool>,
) -> APIResponse<PaginatedResponse<LinkWithDomain>> {
	let owner_id: Option<i32> = user.map(|u| u.id);

	if owner_id.is_none() {
		return Err((StatusCode::UNAUTHORIZED, GenericMessage::new("You are not allowed to perform this action.")));
	}

	let conn = &mut pool
		.get()
		.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, GenericMessage::from_string(e.to_string())))?;

	let items = Link::get_by_owner_id_paginated(owner_id.unwrap(), pagination.page, pagination.per_page, conn)
		.map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, GenericMessage::new("Internal server error.")))?;

	let items = items.iter().map(|(link, domain)| {
		LinkWithDomain::new(link.clone(), domain.clone())
	}).collect();

	let total_count = Link::get_total_count(owner_id.unwrap(), conn)
		.map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, GenericMessage::new("Internal server error.")))?;



	Ok((StatusCode::OK, Json(PaginatedResponse::<LinkWithDomain> { items, total_count })))
}

async fn logout_user(jar: CookieJar) -> CookiedAPIResponse<GenericMessage> {
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

async fn check_password(Json(payload): Json<CheckPasswordRequest>) -> APIResponse<CheckPasswordResponse> {
	let estimate = zxcvbn(&payload.password, &[]);

	Ok((StatusCode::OK, Json(CheckPasswordResponse::from(estimate))))
}

async fn update_password(
	AuthedUser(user): AuthedUser,
	Extension(config): Extension<Config>,
	Extension(pool): Extension<DbPool>,
	Json(payload): Json<ChangePasswordRequest>,
) -> APIResponse<GenericMessage> {
	let security_config = config.security.unwrap();
	let owner_id: Option<i32> = user.clone().map(|u| u.id);

	if owner_id.is_none() {
		return Err((StatusCode::UNAUTHORIZED, GenericMessage::new("You are not allowed to perform this action.")));
	}

	let user = user.unwrap();

	let conn = &mut pool
		.get()
		.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, GenericMessage::from_string(e.to_string())))?;

	// Confirm password

	let argon2 = Argon2::default();
	let parsed_hash = PasswordHash::new(&user.password_hash)
		.map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, GenericMessage::new("Internal Server Error")))?;

	// Verify the password
	match argon2.verify_password(&payload.password.as_bytes(), &parsed_hash) {
		Ok(_) => {
			if payload.new_password != payload.confirm_password {
				return Err((StatusCode::CONFLICT, GenericMessage::new("Passwords do not match.")));
			}

			let password_estimate = zxcvbn(&payload.new_password, &[]);

			if password_estimate.score().lt(&security_config.min_password_strength) {
				return Err((StatusCode::CONFLICT, GenericMessage::new("Password is not strong enough.")));
			}

			let salt = SaltString::generate(&mut OsRng);

			let argon2 = Argon2::default();

			// TODO: Send validation link (if REQUIRE_EMAIL_VALIDATION & SMTP configured)

			// Hash password to PHC string ($argon2id$v=19$...)
			let password_hash = match argon2.hash_password(&payload.new_password.into_bytes(), &salt) {
				Ok(hash) => hash.to_string(),
				Err(_) => {
					return Err((StatusCode::INTERNAL_SERVER_ERROR, GenericMessage::new("Internal Server Error")))
				}
			};

			match user.update_password_hash(password_hash, conn) {
				Ok(_) => Ok((StatusCode::OK, GenericMessage::new("Password updated."))),
				Err(_) => {
					return Err((StatusCode::INTERNAL_SERVER_ERROR, GenericMessage::new("Internal Server Error")))
				}
			}
		}
		Err(_) => Err((StatusCode::UNAUTHORIZED, GenericMessage::new("Invalid credentials."))),
	}
}

async fn validate_email(Extension(pool): Extension<DbPool>, Path(token): Path<String>) -> APIResponse<GenericMessage> {
	let conn = &mut pool
		.get()
		.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, GenericMessage::from_string(e.to_string())))?;

	let records = VerificationToken::get_by_token(token, conn)
		.map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, GenericMessage::new("Failed to get token.")))?;

	if records.len() == 0 {
		return Err((StatusCode::NOT_FOUND, GenericMessage::new("Token expired or invalid.")));
	}

	let (token, user) = records.get(0).unwrap();

	if token.is_expired() {
		return Err((StatusCode::NOT_FOUND, GenericMessage::new("Token expired or invalid.")));
	}

	let _ = token.delete(conn);

	user.set_verified_at(Some(Utc::now().naive_utc()), conn)
		.map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, GenericMessage::new("Failed to set verified at.")))?;

	Ok((StatusCode::OK, GenericMessage::new("Email verified.")))
}

async fn delete_me(AuthedUser(user): AuthedUser, Extension(pool): Extension<DbPool>) -> APIResponse<GenericMessage> {
	if user.is_none() {
		return Err((StatusCode::UNAUTHORIZED, GenericMessage::new("You are not allowed to perform this action.")));
	}

	let user = user.unwrap();

	let conn = &mut pool
		.get()
		.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, GenericMessage::from_string(e.to_string())))?;

	match user.delete(conn) {
		Ok(_) => Ok((StatusCode::OK, GenericMessage::new("Deleted."))),
		Err(_) => Err((StatusCode::INTERNAL_SERVER_ERROR, GenericMessage::new("Failed to delete user."))),
	}
}

// TODO: Ask for password?
async fn update_user(
	AuthedUser(user): AuthedUser,
	Extension(email): Extension<Email>,
	Extension(config): Extension<Config>,
	Extension(pool): Extension<DbPool>,
	Json(payload): Json<UserUpdateRequest>,
) -> APIResponse<GenericMessage> {
	let app_config = config.app.unwrap();
	
	if user.is_none() {
		return Err((StatusCode::UNAUTHORIZED, GenericMessage::new("You are not allowed to perform this action.")));
	}

	let user = user.unwrap();

	let conn = &mut pool
		.get()
		.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, GenericMessage::from_string(e.to_string())))?;

	let mut update_user = UpdateUser {
		email: None,
		username: None,
		verified_at: None,
	};

	match payload.email {
		Some(email) => {
			if User::email_exists(&email, conn) {
				return Err((StatusCode::CONFLICT, GenericMessage::new("Email already in use")));
			}

			if !EmailAddress::is_valid(&email) {
				return Err((StatusCode::BAD_REQUEST, GenericMessage::new("Invalid email")));
			}

			update_user.email = Some(email.clone());
		}
		None => {}
	}

	match payload.username {
		Some(username) => {
			if User::username_exists(&username, conn) {
				return Err((StatusCode::CONFLICT, GenericMessage::new("Username already in use")));
			}

			update_user.username = Some(username.clone());
		}
		None => {}
	}

	// TODO: Make this less ugly

	match user.update(update_user.clone(), conn) {
		Ok(_) => {
			let email_username = match update_user.username.clone() {
				Some(username) => username,
				None => user.username,
			};

			let verification_token = generate_unique_string(32);

			let new_token = NewVerificationToken {
				user_id: user.id,
				token: verification_token.clone(),
				expires_at: (Utc::now() + app_config.email_verification_ttl).naive_utc(),
			};

			new_token.insert(conn);

			if update_user.email.is_some() && email.is_available() {
				tokio::spawn(async move {
					let _ = email
						.send_template::<VerificationEmail>(
							&update_user.email.unwrap(),
							&VerificationEmail {
								base_url: &app_config.base_url,
								username: &email_username,
								verification_token: verification_token.as_str(),
								ttl: format!(
									"{}",
									app_config.email_verification_ttl,
								)
								.as_str(),
							},
						)
						.await;
				});
			}

			Ok((StatusCode::OK, GenericMessage::new("Updated.")))
		}
		Err(_) => Err((StatusCode::INTERNAL_SERVER_ERROR, GenericMessage::new("Failed to update user."))),
	}
}

// Starts at /api/user
pub fn user_router() -> Router {
	Router::new()
		.route("/password", post(check_password))
		.route("/register", post(register_user))
		.route("/login", post(login_user))
		.route("/logout", post(logout_user))
		.route("/me", get(user_profile))
		.route("/me", delete(delete_me))
		.route("/me/links", get(my_links))
		.route("/me/update", post(update_user))
		.route("/me/password", post(update_password))
		.route("/verify/:token", get(validate_email))
}
