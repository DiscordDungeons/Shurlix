pub mod jwt;

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

#[cfg(test)]
mod test {
    use crate::util::strip_protocol;

    #[test]
    fn strip_localhost_test() {
        assert_eq!(strip_protocol("http://localhost").unwrap(), "localhost")
    }

    #[test]
    fn strip_localhost_port_test() {
        assert_eq!(strip_protocol("http://localhost:3000").unwrap(), "localhost:3000")
    }
}