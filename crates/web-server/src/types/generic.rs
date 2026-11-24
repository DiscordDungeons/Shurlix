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

#[cfg(test)]
mod test {
	use super::*;

	#[test]
	fn clamped_bounds_page() {
		assert_eq!(PaginationQuery { page: 0, per_page: 10 }.clamped().page, 1);
		assert_eq!(PaginationQuery { page: -5, per_page: 10 }.clamped().page, 1);
		assert_eq!(PaginationQuery { page: 42, per_page: 10 }.clamped().page, 42);
		assert_eq!(PaginationQuery { page: 1_000_001, per_page: 10 }.clamped().page, 1_000_000);
		assert_eq!(PaginationQuery { page: i64::MAX, per_page: 10 }.clamped().page, 1_000_000);
	}

	#[test]
	fn clamped_bounds_per_page() {
		assert_eq!(PaginationQuery { page: 1, per_page: 0 }.clamped().per_page, 1);
		assert_eq!(PaginationQuery { page: 1, per_page: -100 }.clamped().per_page, 1);
		assert_eq!(PaginationQuery { page: 1, per_page: 101 }.clamped().per_page, 100);
		assert_eq!(PaginationQuery { page: 1, per_page: 50 }.clamped().per_page, 50);
	}

	#[test]
	fn clamped_offset_cannot_overflow() {
		let clamped = PaginationQuery { page: i64::MAX, per_page: i64::MAX }.clamped();
		let offset = (clamped.page - 1) * clamped.per_page;
		assert!(offset >= 0);
		assert_eq!(offset, 999_999 * 100);
	}
}