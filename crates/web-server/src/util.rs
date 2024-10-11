use rand::{Rng, thread_rng};
use rand::distributions::Alphanumeric;
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

/// Checks is given string is url
pub fn is_url(url: &str) -> bool {
    match Url::parse(url) {
        Ok(_) => true,
        Err(_) => false,
    }
}

pub fn contains_any(input: &str, patterns: &[String]) -> bool {
    patterns.iter().any(|pattern| input.contains(pattern))
}

/// Checks if the input starts with any of the given patterns
pub fn starts_with_any(input: &str, patterns: &[String]) -> bool {
    patterns.iter().any(|pattern| input.starts_with(pattern))
}