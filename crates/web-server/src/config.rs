use std::str::FromStr;

use dotenvy::dotenv;
use humantime::parse_duration;
use owo_colors::OwoColorize;
use zxcvbn::Score;
use chrono::Duration;

#[derive(Clone, Debug)]
pub struct SmtpConfig {
    pub enabled: bool,
    pub username: Option<String>,
    pub password: Option<String>,
    pub from: Option<String>,
    pub host: Option<String>,
    pub port: Option<u16>,
}

#[derive(Clone, Debug)]
pub struct Config {
    pub database_url: String,
    pub shortened_link_length: usize,
    pub allow_anonymous_shorten: bool,
    pub jwt_secret: String,
    pub min_password_strength: Score,
    pub allow_registering: bool,
    pub base_url: String,
    pub enable_email_verification: bool,
    pub email_verification_ttl: Duration,
    pub smtp: SmtpConfig,
}

#[derive(Debug)]
struct WrappedDuration(Duration);

impl FromStr for WrappedDuration {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        parse_duration(s)
            .map(|d| WrappedDuration(Duration::seconds(d.as_secs() as i64)))
            .map_err(|_| format!("Failed to parse '{}' as a Duration", s))
    }
}

impl Config {

    pub fn get_var_required<T>(name: &str) -> T
    where
        T: FromStr,
        T::Err: std::fmt::Debug,
    {
        let value = std::env::var(name).expect(&format!("{} {} {} {}", "[CONFIG ERROR]".bright_red(), "✗ ".red().bold(), name.yellow(), "not set in .env"));
    
        if value == "" {
            panic!("{} {} {} {}", "[CONFIG ERROR]".bright_red(), "✗ ".red().bold(), name.yellow(), "not set in .env");
        }

        match value.parse::<T>() {
            Ok(n) => n,
            Err(e) => panic!("{} {} Failed to parse {}: {:?}", "[CONFIG ERROR]".bright_red(), "✗".red().bold(), name.yellow(), e),
        }
    }

    pub fn get_var<T>(name: &str) -> Option<T>
    where
        T: FromStr,
        T::Err: std::fmt::Debug,
    {
        let value = std::env::var(name);

        match value {
            Ok(value) => {
                match value.parse::<T>() {
                    Ok(n) => Some(n),
                    Err(e) => panic!("{} {} Failed to parse {}: {:?}", "[CONFIG ERROR]".bright_red(), "✗".red().bold(), name.yellow(), e),
                }
            },
            Err(_) => None
        }
    }

    pub fn get_smtp_config() -> SmtpConfig {
        let enabled = Config::get_var::<bool>("SMTP_ENABLED").unwrap_or(false);

        let username = Config::get_var::<String>("SMTP_USERNAME");
        let password = Config::get_var::<String>("SMTP_PASSWORD");
        let from = Config::get_var::<String>("SMTP_FROM");
        let host = Config::get_var::<String>("SMTP_HOST");
        let port = Config::get_var::<u16>("SMTP_PORT");

        if enabled {
            let mut missing_vars = vec![];

            for (name, value) in [
                ("SMTP_USERNAME", &username),
                ("SMTP_PASSWORD", &password),
                ("SMTP_FROM", &from),
                ("SMTP_HOST", &host),
                ("SMTP_PORT", &host),
            ] {
                if value.is_none() || value.clone().is_some_and(|val| val == "") {
                    missing_vars.push(name);
                }
            }

            if !missing_vars.is_empty() {
                for name in &missing_vars {
                    eprintln!("{} {} is required if SMTP is enabled", "[CONFIG ERROR]".bright_red(), name.yellow());
                }
                panic!("{} {} missing required environment variables for SMTP configuration", "[CONFIG ERROR]".bright_red(), "✗".red().bold());
            }
        }

        SmtpConfig {
            enabled,
            username,
            password,
            from,
            host,
            port,
        }
    }

    pub fn new() -> Config {
        dotenv().ok();

        let database_url = Config::get_var_required::<String>("DATABASE_URL");
        let shortened_link_length = Config::get_var_required::<usize>("SHORTENED_LINK_LENGTH");
        let jwt_secret = Config::get_var_required::<String>("JWT_SECRET");
        let min_password_strength = Config::get_var_required::<u8>("MIN_PASSWORD_STRENGTH");
        let base_url = Config::get_var_required::<String>("BASE_URL");
        let allow_anonymous_shorten = Config::get_var_required::<bool>("ALLOW_ANOYMOUS_SHORTEN");
        let allow_registering = Config::get_var_required::<bool>("ALLOW_REGISTERING");
        let enable_email_verification = Config::get_var_required::<bool>("ALLOW_REGISTERING");
        let email_verification_ttl = Config::get_var_required::<WrappedDuration>("EMAIL_VERIFICATION_TTL"); // TODO: Make this optional, but required if enable_email_verification is true

        // TODO: Require smtp to be enabled if enable_email_verification is true

        let min_password_strength = match Score::try_from(min_password_strength) {
            Ok(score) => score,
            Err(e) => panic!("{} {} Failed to parse {}: {:?}", "[CONFIG ERROR]".bright_red(), "✗".red().bold(), "ENABLE_EMAIL_VERIFICATION".yellow(), e),
        };
        

        Config {
            database_url,
            shortened_link_length,
            allow_anonymous_shorten,
            jwt_secret,
            min_password_strength,
            allow_registering,
            enable_email_verification,
            email_verification_ttl: email_verification_ttl.0,
            base_url,
            smtp: Config::get_smtp_config(),
        }
    }
}