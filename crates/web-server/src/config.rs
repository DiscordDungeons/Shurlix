use std::fs;

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

const CONFIG_FILE_PATH: &str = "Config.toml";

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

	pub fn validate(&self) -> Result<(), Vec<String>> {
		let mut errors = Vec::new();

		// Validate DatabaseConfig
		if let Some(db) = &self.db {
			if db.url.is_empty() {
				errors.push("Database URL (db.url) is empty".to_string());
			}
		} else {
			errors.push("Database configuration is required".to_string());
		}

		// Validate AppConfig
		if let Some(app) = &self.app {
			if app.base_url.is_empty() {
				errors.push("App base URL (app.base_url) is empty".to_string());
			}
			if app.enable_email_verification && app.email_verification_ttl.0.is_zero() {
				errors.push("App email verification TTL (app.email_verification_ttl) is zero, but email verification is enabled".to_string());
			}

			// Check if SMTP should be enabled when email verification is enabled
			if app.enable_email_verification && self.smtp.as_ref().map(|s| !s.enabled).unwrap_or(true) {
				errors.push("SMTP must be enabled when email verification is enabled".to_string());
			}
		} else {
			errors.push("App configuration is required".to_string());
		}

		// Validate SecurityConfig
		if let Some(security) = &self.security {
			if security.jwt_secret.is_empty() {
				errors.push("JWT secret (security.jwt_secret) is empty".to_string());
			}
		} else {
			errors.push("Security configuration is required".to_string());
		}

		// Validate SmtpConfig if SMTP is enabled
		if let Some(smtp) = &self.smtp {
			if smtp.enabled {
				let missing_fields: Vec<&str> = [
					("SMTP username (smtp.username)", smtp.username.as_deref()),
					("SMTP password (smtp.password)", smtp.password.as_deref()),
					("SMTP 'from' address (smtp.from)", smtp.from.as_deref()),
					("SMTP host (smtp.host)", smtp.host.as_deref()),
					("SMTP port (smtp.port)", smtp.port.map(|_| "exists").as_deref()),
				]
				.iter()
				.filter_map(|&(name, value)| if value.is_none() || value == Some("") { Some(name) } else { None })
				.collect();

				if !missing_fields.is_empty() {
					errors.push(format!(
						"Missing required SMTP fields when SMTP is enabled: {:?}",
						missing_fields
					));
				}
			}
		}

		if errors.is_empty() {
			Ok(())
		} else {
			Err(errors)
		}
	}
	
	pub fn write_to_file(&self) -> Result<(), Box<dyn std::error::Error>> {
		let serialized = toml::to_string(&self)?;
	
		match fs::write(CONFIG_FILE_PATH, serialized) {
			Ok(_) => Ok(()),
			Err(e) => Err(format!("Failed to save config file: {}", e).into())
		}
	}

	pub fn file_exists(&self) -> bool {
		match fs::exists(CONFIG_FILE_PATH) {
			Ok(exists) => exists,
			Err(e) => panic!("Failed to check if file exists, {}", e),
		}
	}

	pub fn load_from_file(&mut self) {
		if let Ok(false) = fs::exists(CONFIG_FILE_PATH) {
			panic!("Failed to load config file, as it does not exist.");
		};

		let file_content = match fs::read_to_string(CONFIG_FILE_PATH) {
			Ok(content) => content,
			Err(e) => panic!("Failed to read config file. {}", e)
		};

		let config: Config = match toml::de::from_str(file_content.as_str()) {
			Ok(config) => config,
			Err(e) => panic!("Failed to deserialize config file: {}", e)
		};

		*self = config;
	}

	pub fn set(&mut self, new: Config) {
		*self = new;
	}

	pub fn set_is_setup_done(&mut self, is: bool) {
		self.setup.setup_done = is;
	}
}

#[cfg(test)]
mod test {
	use crate::config::Config;

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