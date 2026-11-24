pub mod jwt;

use db::models::User;
use rand::distributions::Alphanumeric;
use rand::{thread_rng, Rng};
use url::Url;

/// Generates a unique alphanumeric string of given length
pub fn generate_unique_string(length: usize) -> String {
	// Generate a random alphanumeric string
	thread_rng()
		.sample_iter(&Alphanumeric)
		.take(length)
		.map(char::from)
		.collect()
}

/// Checks if the given string is a valid http(s) URL
pub fn is_url(url: &str) -> bool {
	match Url::parse(url) {
		Ok(parsed) => matches!(parsed.scheme(), "http" | "https"),
		Err(_) => false,
	}
}

/// Strips protocol from a url
pub fn strip_protocol(url_str: &str) -> Result<String, url::ParseError> {
	let url = Url::parse(url_str)?;

	// Get the host and port
	let host_with_port = match url.port() {
		Some(port) => format!("{}:{}", url.host_str().unwrap(), port),
		None => url.host_str().unwrap().to_string(),
	};

	Ok(host_with_port)
}

/// Checks if the input starts with any of the given patterns
pub fn starts_with_any(input: &str, patterns: &[String]) -> bool {
	patterns.iter().any(|pattern| input.starts_with(pattern))
}

pub fn is_admin(user: Option<User>) -> bool {
	user.map_or(false, |u| u.is_admin)
}

#[cfg(test)]
mod test {
	use super::*;
	use crate::util::strip_protocol;
	use chrono::NaiveDateTime;

	#[test]
	fn strip_localhost_test() {
		assert_eq!(strip_protocol("http://localhost").unwrap(), "localhost")
	}

	#[test]
	fn strip_localhost_port_test() {
		assert_eq!(strip_protocol("http://localhost:3000").unwrap(), "localhost:3000")
	}

	#[test]
	fn is_url_accepts_http_and_https() {
		assert!(is_url("http://example.com"));
		assert!(is_url("https://example.com/path?q=1"));
	}

	#[test]
	fn is_url_rejects_other_schemes() {
		assert!(!is_url("javascript:alert(1)"));
		assert!(!is_url("data:text/html;base64,PGI+"));
		assert!(!is_url("ftp://example.com"));
		assert!(!is_url("not a url"));
	}

	#[test]
	fn test_is_admin_when_user_is_admin() {
		let user = Some(User {
			id: 1,
			username: "admin".to_string(),
			email: "admin@example.com".to_string(),
			password_hash: "hash".to_string(),
			verified_at: None,
			is_admin: true,
			created_at: NaiveDateTime::from_timestamp(0, 0),
			deleted_at: None,
		});
		assert!(is_admin(user));
	}

	#[test]
	fn test_is_admin_when_user_is_not_admin() {
		let user = Some(User {
			id: 2,
			username: "user".to_string(),
			email: "user@example.com".to_string(),
			password_hash: "hash".to_string(),
			verified_at: None,
			is_admin: false,
			created_at: NaiveDateTime::from_timestamp(0, 0),
			deleted_at: None,
		});
		assert!(!is_admin(user));
	}

	#[test]
	fn test_is_admin_when_user_is_none() {
		let user: Option<User> = None;
		assert!(!is_admin(user));
	}
}
