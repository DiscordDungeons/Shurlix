use std::str::FromStr;

use axum::{async_trait, extract::FromRequestParts, Extension};
use axum_extra::extract::{cookie::Cookie, CookieJar};
use db::{models::User, DbPool};

use crate::{config::Config, util::jwt::decode_user_token};

#[derive(Debug, Clone)]
pub struct AuthedUser(pub Option<User>);

// TODO: Clean this up?
#[async_trait]
impl<S> FromRequestParts<S> for AuthedUser
where
	S: Send + Sync,
{
	type Rejection = ();

	async fn from_request_parts(parts: &mut axum::http::request::Parts, state: &S) -> Result<Self, Self::Rejection> {
		// Create a CookieJar from the cookies
		let mut cookie_jar = CookieJar::new();

		let Extension(config): Extension<Config> = Extension::from_request_parts(parts, state).await.map_err(|_| ())?;
		let Extension(pool): Extension<DbPool> = Extension::from_request_parts(parts, state).await.map_err(|_| ())?;

		// Extract the Cookie header
		if let Some(cookie_header) = parts.headers.get(axum::http::header::COOKIE) {
			// Convert the header value to a string
			if let Ok(cookie_str) = cookie_header.to_str() {
				for cookie in cookie_str.split(';') {
					if let Ok(cookie) = Cookie::from_str(cookie.trim()) {
						// Add the cookie to the CookieJar
						cookie_jar = cookie_jar.add(cookie);
					}
				}

				// Access a specific cookie if needed
				if let Some(cookie) = cookie_jar.get("auth_token") {
					let user_id = match decode_user_token(&cookie.value().to_string(), config.security.unwrap().jwt_secret.as_bytes()) {
						Some(user_id) => user_id,
						None => return Ok(AuthedUser(None)),
					};

					let conn = &mut pool.get();

					let conn = match conn {
						Ok(conn) => conn,
						Err(_) => return Ok(AuthedUser(None)),
					};

					let users = match User::get_by_id(&user_id, conn) {
						Ok(users) => users,
						Err(_) => return Ok(AuthedUser(None)),
					};

					if users.len() == 0 {
						return Ok(AuthedUser(None));
					}

					let user = users.first().unwrap().to_owned();

					return Ok(AuthedUser(Some(user)));
				}
			}
		}

		Ok(AuthedUser(None))
	}
}
