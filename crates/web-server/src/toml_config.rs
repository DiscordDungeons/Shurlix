use chrono::Duration;
use serde::{Deserialize, Serialize};
use zxcvbn::Score;

use crate::types::WrappedDuration;

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct DatabaseConfig {
	pub url: String,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct AppConfig {
	pub shortened_link_length: usize,
	pub allow_anonymous_shorten: bool,
	pub allow_registering: bool,
	pub base_url: String,
	pub enable_email_verification: bool,
	pub email_verification_ttl: WrappedDuration,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct SecurityConfig {
	pub jwt_secret: String,
	pub min_password_strength: Score,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct SmtpConfig {
	pub enabled: bool,
	pub username: Option<String>,
	pub password: Option<String>,
	pub from: Option<String>,
	pub host: Option<String>,
	pub port: Option<u16>,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct SetupConfig {
	pub setup_done: bool,
}


#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct Config {
	pub db: Option<DatabaseConfig>,
	pub app: Option<AppConfig>,
	pub security: Option<SecurityConfig>,
	pub smtp: Option<SmtpConfig>,
	pub setup: SetupConfig,
}

impl Config {
	pub fn new() -> Self {
		Self {
			db: None,
			app: None,
			security: None,
			smtp: None,
			setup: SetupConfig {
				setup_done: false,
			},
		}
	}
}

#[cfg(test)]
mod test {
    use crate::toml_config::Config;

	#[test]
	fn parse_test() {
		let toml_str = r#"
		# Database configuration
		[database]
		url = "postgres://username:password@localhost/shurlix"

		[setup]
		setup_done = false
		"#;

		let config: Config = toml::de::from_str(toml_str).expect("Failed to parse TOML");
		println!("{:?}", config);

		assert!(true == true)
	} 
}