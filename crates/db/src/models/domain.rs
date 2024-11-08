use chrono::NaiveDateTime;
use diesel::prelude::*;
use serde::{Deserialize, Serialize};

use crate::{schema::domains, DbConnection};

#[derive(Debug, Queryable, Selectable, Serialize)]
#[diesel(table_name = crate::schema::domains)]
pub struct Domain {
	pub id: i32,
	pub domain: String,
	pub public: bool,
	pub created_at: NaiveDateTime,
	pub updated_at: NaiveDateTime,
}

#[derive(AsChangeset, Clone, Debug, Deserialize)]
#[diesel(table_name = crate::schema::domains)]
pub struct UpdateDomain {
	pub domain: Option<String>,
	pub public: Option<bool>,
}

impl Domain {
	pub fn get_by_id(id: i32, conn: &mut DbConnection) -> Result<Domain, diesel::result::Error> {
		domains::table.find(id).first(conn)
	}

	pub fn get_by_domain(domain: String, conn: &mut DbConnection) -> Result<Domain, diesel::result::Error> {
		domains::table.filter(domains::domain.eq(domain)).first(conn)
	}

	pub fn delete_by_id(id: i32, conn: &mut DbConnection) -> Result<usize, diesel::result::Error> {
		diesel::delete(domains::table.filter(domains::id.eq(id))).execute(conn)
	}

	pub fn get_public(conn: &mut DbConnection) -> Result<Vec<Domain>, diesel::result::Error> {
		domains::table
			.order_by(domains::created_at.desc())
			.filter(domains::public.eq(true))
			.load::<Domain>(conn)
	}

	pub fn get_all(conn: &mut DbConnection) -> Result<Vec<Domain>, diesel::result::Error> {
		domains::table
			.order_by(domains::created_at.desc())
			.load::<Domain>(conn)
	}

	pub fn get_paginated(
		page: i64,
		per_page: i64,
		conn: &mut DbConnection,
	) -> Result<Vec<Domain>, diesel::result::Error> {
		let offset_value = (page - 1) * per_page;
		domains::table
			.order_by(domains::created_at.desc())
			.limit(per_page)
			.offset(offset_value)
			.load::<Domain>(conn)
	}

	pub fn get_total_count(conn: &mut DbConnection) -> QueryResult<i64> {
		domains::table.count().get_result(conn)
	}

	pub fn set_domain(&self, domain: String, conn: &mut DbConnection) -> Result<usize, diesel::result::Error> {
		diesel::update(domains::table.filter(domains::id.eq(self.id)))
			.set(domains::domain.eq(domain))
			.execute(conn)
	}

	pub fn set_public(&self, public: bool, conn: &mut DbConnection) -> Result<usize, diesel::result::Error> {
		diesel::update(domains::table.filter(domains::id.eq(self.id)))
			.set(domains::public.eq(public))
			.execute(conn)
	}

	pub fn update(&self, values: UpdateDomain, conn: &mut DbConnection) -> Result<usize, diesel::result::Error> {
		diesel::update(domains::table.find(self.id)).set(&values).execute(conn)
	}
}

#[derive(Debug, Insertable)]
#[diesel(table_name = crate::schema::domains)]
pub struct NewDomain {
	pub domain: String,
	pub public: Option<bool>,
}

impl NewDomain {
	pub fn insert(&self, conn: &mut DbConnection) -> Result<Domain, diesel::result::Error> {
		diesel::insert_into(domains::table)
			.values(self)
			.returning(Domain::as_returning())
			.get_result(conn)
	}
}
