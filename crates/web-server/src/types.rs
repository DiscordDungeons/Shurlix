use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub struct PaginationQuery {
	pub per_page: i64,
	pub page: i64,
}

#[derive(Serialize)]
pub struct PaginatedResponse<T> {
	pub items: Vec<T>,
	pub total_count: i64,
}
