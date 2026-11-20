use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub struct PaginationQuery {
	pub per_page: i64,
	pub page: i64,
}

impl PaginationQuery {
	/// Clamps pagination parameters to sane bounds: 1 <= page <= 1_000_000, 1 <= per_page <= 100.
	/// The page cap keeps (page - 1) * per_page from overflowing.
	pub fn clamped(mut self) -> Self {
		self.page = self.page.clamp(1, 1_000_000);
		self.per_page = self.per_page.clamp(1, 100);
		self
	}
}

#[derive(Serialize)]
pub struct PaginatedResponse<T> {
	pub items: Vec<T>,
	pub total_count: i64,
}