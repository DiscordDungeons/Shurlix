use diesel::prelude::*;
use chrono::NaiveDateTime;
use serde::Serialize;

use crate::{schema::domains, DbConnection};


#[derive(Debug, Queryable, Selectable, Serialize)]
#[diesel(table_name = crate::schema::domains)]
pub struct Domain {
    pub id: i32,
	pub domain: String,
	pub created_at: NaiveDateTime,
	pub updated_at: NaiveDateTime,
}

impl Domain {
	pub fn get_by_id(id: i32, conn: &mut DbConnection) -> Result<Domain, diesel::result::Error> {
		domains::table.find(id).first(conn)
	}

	pub fn get_by_domain(domain: String, conn: &mut DbConnection) -> Result<Domain, diesel::result::Error> {
		domains::table.filter(domains::domain.eq(domain)).first(conn)
	}
}

#[derive(Debug, Insertable)]
#[diesel(table_name = crate::schema::domains)]
pub struct NewDomain {
	pub domain: String,
}

impl NewDomain {
    pub fn insert(&self, conn: &mut DbConnection) -> Result<Domain, diesel::result::Error> {
		diesel::insert_into(domains::table)
			.values(self)
			.returning(Domain::as_returning())
			.get_result(conn)
    }
}