use chrono::{Local, NaiveDateTime};
use diesel::prelude::*;
use serde::Serialize;

use crate::{
	schema::{users, verification_tokens},
	DbConnection, DbPool,
};

use super::User;

#[derive(Debug, Queryable, Selectable, Serialize)]
#[diesel(table_name = crate::schema::verification_tokens)]
pub struct VerificationToken {
	pub id: i32,
	pub user_id: i32,
	pub token: String,
	pub created_at: NaiveDateTime,
	pub expires_at: NaiveDateTime,
}

impl VerificationToken {
	pub fn delete_expired(conn: &mut DbConnection) -> Result<usize, diesel::result::Error> {
		diesel::sql_query("SELECT delete_expired_tokens();").execute(conn)
	}

	pub fn delete_expired_pooled(pool: &DbPool) -> Result<usize, diesel::result::Error> {
		let mut conn: diesel::r2d2::PooledConnection<
			diesel::r2d2::ConnectionManager<PgConnection>,
		> = match pool.clone().get() {
			Ok(conn) => conn,
			Err(e) => {
				log::error!("Failed to get conn from pool: {:#?}", e);
				return Ok(0);
			}
		};

		diesel::sql_query("SELECT delete_expired_tokens();").execute(&mut conn)
	}

	pub fn get_by_token(
		token: String,
		conn: &mut DbConnection,
	) -> Result<Vec<(VerificationToken, User)>, diesel::result::Error> {
		verification_tokens::table
			.filter(verification_tokens::token.eq(token))
			.inner_join(users::table.on(verification_tokens::user_id.eq(users::id)))
			.select((verification_tokens::all_columns, users::all_columns))
			.load::<(VerificationToken, User)>(conn)
	}

	pub fn is_expired(&self) -> bool {
		let now = Local::now().naive_utc();
		now > self.expires_at
	}

	pub fn delete(&self, conn: &mut DbConnection) -> Result<usize, diesel::result::Error> {
		diesel::delete(verification_tokens::table.filter(verification_tokens::id.eq(self.id)))
			.execute(conn)
	}
}

#[derive(Debug, Insertable)]
#[diesel(table_name = crate::schema::verification_tokens)]
pub struct NewVerificationToken {
	pub user_id: i32,
	pub token: String,
	pub expires_at: NaiveDateTime,
}

impl NewVerificationToken {
	pub fn insert(&self, conn: &mut DbConnection) -> VerificationToken {
		let token = diesel::insert_into(verification_tokens::table)
			.values(self)
			.returning(VerificationToken::as_returning())
			.get_result(conn)
			.expect("Error saving new verification token");

		token
	}
}
