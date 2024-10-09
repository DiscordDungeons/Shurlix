use axum::Json;
use serde::Serialize;

#[derive(Serialize, Debug)]
pub struct GenericError {
    message: String,
}

impl GenericError {
    pub fn new(message: &str) -> Json<Self> {
        Json(Self { message: message.to_string() })
    }

    pub fn from_string(message: String) -> Json<Self> {
        Json(Self { message: message })
    }
}