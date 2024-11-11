use axum::{http::StatusCode, Json};
use axum_extra::extract::CookieJar;
use serde::Serialize;

#[derive(Serialize, Debug)]
pub struct GenericMessage {
	message: String,
}

impl GenericMessage {
	pub fn new(message: &str) -> Json<Self> {
		Json(Self {
			message: message.to_string(),
		})
	}

	pub fn from_string(message: String) -> Json<Self> {
		Json(Self { message: message })
	}
}

pub type APIResponse<T> = Result<(StatusCode, Json<T>), (StatusCode, Json<GenericMessage>)>;
pub type APIResultWithError<T, T2> = Result<(StatusCode, Json<T>), (StatusCode, Json<T2>)>;
pub type CookiedAPIResponse<T> = Result<(CookieJar, Json<T>), (StatusCode, Json<GenericMessage>)>;
