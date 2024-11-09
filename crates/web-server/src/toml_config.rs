use serde::{Deserialize, Serialize};


#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct Config {
	pub setup_done: bool,
}

impl Config {
	pub fn new() -> Self {
		Self {
			setup_done: false,
		}
	}
}