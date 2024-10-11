use dotenvy::dotenv;
use owo_colors::OwoColorize;

#[derive(Clone, Debug)]
pub struct Config {
    pub database_url: String,
    pub shortened_link_length: usize,
    pub allow_anonymous_shorten: bool,
}

impl Config {

    pub fn new() -> Config {
        dotenv().ok();

        //"DATABASE_URL". not set in env")

        let database_url = std::env::var("DATABASE_URL").expect(&format!("{} {} {} {}", "[CONFIG ERROR]".bright_red(), "✗ ".red().bold(), "DATABASE_URL".yellow(), "not set in .env"));
        let shortened_link_length = std::env::var("SHORTENED_LINK_LENGTH").expect(&format!("{} {} {} {}", "[CONFIG ERROR]".bright_red(), "✗".red().bold(), "SHORTENED_LINK_LENGTH".yellow(), "not set in .env"));

        let shortened_link_length = match shortened_link_length.parse::<usize>() {
            Ok(n) => n,
            Err(e) => panic!("{} {} Failed to parse {}: {:?}", "[CONFIG ERROR]".bright_red(), "✗".red().bold(), "SHORTENED_LINK_LENGTH".yellow(), e),
        };

        let allow_anonymous_shorten = std::env::var("ALLOW_ANOYMOUS_SHORTEN").expect(&format!("{} {} {} {}", "[CONFIG ERROR]".bright_red(), "✗".red().bold(), "ALLOW_ANOYMOUS_SHORTEN".yellow(), "not set in .env"));

        let allow_anonymous_shorten = match allow_anonymous_shorten.parse::<bool>() {
            Ok(n) => n,
            Err(e) => panic!("{} {} Failed to parse {}: {:?}", "[CONFIG ERROR]".bright_red(), "✗".red().bold(), "ALLOW_ANOYMOUS_SHORTEN".yellow(), e),
        };

        Config {
            database_url,
            shortened_link_length,
            allow_anonymous_shorten
        }
    }
}