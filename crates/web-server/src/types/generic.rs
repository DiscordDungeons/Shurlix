use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub struct PaginationQuery {
	pub per_page: i64,
	pub page: i64,
}

impl PaginationQuery {
	/// Clamps pagination parameters to sane bounds: page >= 1, 1 <= per_page <= 100.
	pub fn clamped(mut self) -> Self {
		self.page = self.page.max(1);
		self.per_page = self.per_page.clamp(1, 100);
		self
	}
}

#[derive(Serialize)]
pub struct PaginatedResponse<T> {
	pub items: Vec<T>,
	pub total_count: i64,
}