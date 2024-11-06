use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use time::{Duration, OffsetDateTime};

#[derive(Serialize, Deserialize, Debug)]
struct JwtClaims {
	sub: String, // User ID
	iat: usize,  // Issued at (timestamp)
	exp: usize,  // Expiration (timestamp)
}

pub fn encode_user_token(id: i32, jwt_secret: &[u8]) -> String {
	let now = OffsetDateTime::now_utc();

	let claims = JwtClaims {
		sub: id.to_string(),
		iat: now.unix_timestamp() as usize,
		exp: (now + Duration::hours(1)).unix_timestamp() as usize, // 1 hour
	};
	let token = encode(
		&Header::default(),
		&claims,
		&EncodingKey::from_secret(jwt_secret),
	)
	.unwrap();

	token
}

pub fn decode_user_token(token: &String, jwt_secret: &[u8]) -> Option<i32> {
	let decoded_token = match decode::<JwtClaims>(
		&token,
		&DecodingKey::from_secret(jwt_secret.as_ref()),
		&Validation::default(),
	) {
		Ok(token) => token,
		Err(e) => {
			log::debug!("Failed to decode JWT: {}", e);
			return None;
		}
	};

	let user_id = match decoded_token.claims.sub.parse::<i32>() {
		Ok(n) => n,
		Err(e) => {
			log::debug!("Failed to parse user_id id: {}", e);
			return None;
		}
	};

	Some(user_id)
}
