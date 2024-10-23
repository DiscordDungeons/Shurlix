use dotenvy::dotenv;
use owo_colors::OwoColorize;
use zxcvbn::Score;

#[derive(Clone, Debug)]
pub struct Config {
    pub database_url: String,
    pub shortened_link_length: usize,
    pub allow_anonymous_shorten: bool,
    pub jwt_secret: String,
    pub min_password_strength: Score,
    pub allow_registering: bool,
    pub base_url: String,
}

// TODO: Improve this code
impl Config {

    pub fn new() -> Config {
        dotenv().ok();

        let database_url = std::env::var("DATABASE_URL").expect(&format!("{} {} {} {}", "[CONFIG ERROR]".bright_red(), "✗ ".red().bold(), "DATABASE_URL".yellow(), "not set in .env"));
        let shortened_link_length = std::env::var("SHORTENED_LINK_LENGTH").expect(&format!("{} {} {} {}", "[CONFIG ERROR]".bright_red(), "✗".red().bold(), "SHORTENED_LINK_LENGTH".yellow(), "not set in .env"));
        let jwt_secret = std::env::var("JWT_SECRET").expect(&format!("{} {} {} {}", "[CONFIG ERROR]".bright_red(), "✗".red().bold(), "JWT_SECRET".yellow(), "not set in .env"));
        let min_password_strength = std::env::var("MIN_PASSWORD_STRENGTH").expect(&format!("{} {} {} {}", "[CONFIG ERROR]".bright_red(), "✗".red().bold(), "MIN_PASSWORD_STRENGTH".yellow(), "not set in .env"));
        let base_url = std::env::var("BASE_URL").expect(&format!("{} {} {} {}", "[CONFIG ERROR]".bright_red(), "✗".red().bold(), "BASE_URL".yellow(), "not set in .env"));

        let shortened_link_length = match shortened_link_length.parse::<usize>() {
            Ok(n) => n,
            Err(e) => panic!("{} {} Failed to parse {}: {:?}", "[CONFIG ERROR]".bright_red(), "✗".red().bold(), "SHORTENED_LINK_LENGTH".yellow(), e),
        };

        let allow_anonymous_shorten = std::env::var("ALLOW_ANOYMOUS_SHORTEN").expect(&format!("{} {} {} {}", "[CONFIG ERROR]".bright_red(), "✗".red().bold(), "ALLOW_ANOYMOUS_SHORTEN".yellow(), "not set in .env"));

        let allow_anonymous_shorten = match allow_anonymous_shorten.parse::<bool>() {
            Ok(n) => n,
            Err(e) => panic!("{} {} Failed to parse {}: {:?}", "[CONFIG ERROR]".bright_red(), "✗".red().bold(), "ALLOW_ANOYMOUS_SHORTEN".yellow(), e),
        };

        let min_password_strength = match min_password_strength.parse::<u8>() {
            Ok(n) => n,
            Err(e) => panic!("{} {} Failed to parse {}: {:?}", "[CONFIG ERROR]".bright_red(), "✗".red().bold(), "MIN_PASSWORD_STRENGTH".yellow(), e),
        };

        let allow_registering = std::env::var("ALLOW_REGISTERING").expect(&format!("{} {} {} {}", "[CONFIG ERROR]".bright_red(), "✗".red().bold(), "ALLOW_REGISTERING".yellow(), "not set in .env"));

        let allow_registering = match allow_registering.parse::<bool>() {
            Ok(n) => n,
            Err(e) => panic!("{} {} Failed to parse {}: {:?}", "[CONFIG ERROR]".bright_red(), "✗".red().bold(), "ALLOW_REGISTERING".yellow(), e),
        };

        let min_password_strength = match Score::try_from(min_password_strength) {
            Ok(score) => score,
            Err(e) => panic!("{} {} Failed to parse {}: {:?}", "[CONFIG ERROR]".bright_red(), "✗".red().bold(), "MIN_PASSWORD_STRENGTH".yellow(), e),
        };
        

        Config {
            database_url,
            shortened_link_length,
            allow_anonymous_shorten,
            jwt_secret,
            min_password_strength,
            allow_registering,
            base_url,
        }
    }
}