use rand::{Rng, thread_rng};
use rand::distributions::Alphanumeric;

pub fn generate_unique_string(length: usize) -> String {
    // Generate a random alphanumeric string
    thread_rng()
        .sample_iter(&Alphanumeric)
        .take(length)
        .map(char::from)
        .collect()
}