use axum::{async_trait, extract::FromRequestParts, http::StatusCode, Extension};
use db::{models::Domain, DbPool};

use crate::common::{APIResponse, GenericMessage};

#[derive(Debug, Clone)]
pub struct ExtractedDomain(pub String, pub i32);


#[async_trait]
impl<S> FromRequestParts<S> for ExtractedDomain
where
	S: Send + Sync
{
	type Rejection = APIResponse<GenericMessage>;

	async fn from_request_parts(
		parts: &mut axum::http::request::Parts,
		state: &S
	) -> Result<Self, Self::Rejection> {		
		let Extension(pool): Extension<DbPool> = Extension::from_request_parts(parts, state).await.map_err(|_| {
			return Err((StatusCode::INTERNAL_SERVER_ERROR, GenericMessage::new("Failed to get database extension.")))
		})?;

		let host = parts.headers.get(axum::http::header::HOST)
			.ok_or_else(|| {
				return Err((StatusCode::INTERNAL_SERVER_ERROR, GenericMessage::new("Invalid host header.")))
			})?
			.to_str()
			.map_err(|_| {
				return Err((StatusCode::INTERNAL_SERVER_ERROR, GenericMessage::new("Failed to parse host header.")))
			})?;

		let conn = &mut pool.get().map_err(|_| {
			return Err((StatusCode::INTERNAL_SERVER_ERROR, GenericMessage::new("Failed to get connection.")))
		})?;

		let domain = Domain::get_by_domain(host.to_string(), conn).map_err(|_| {
			return Err((StatusCode::NOT_FOUND, GenericMessage::new("Failed to find requested host.")))
		})?;


		
		Ok(ExtractedDomain(host.to_string(), domain.id))
	}
}