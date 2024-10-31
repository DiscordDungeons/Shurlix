use diesel::prelude::*;
use chrono::NaiveDateTime;
use serde::Serialize;

use crate::{schema::verification_tokens, DbConnection, DbPool};

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
        diesel::sql_query("SELECT delete_expired_tokens();")
            .execute(conn)
    }

    pub fn delete_expired_pooled(pool: &DbPool) -> Result<usize, diesel::result::Error> {
        let mut conn: diesel::r2d2::PooledConnection<diesel::r2d2::ConnectionManager<PgConnection>> = match pool.clone().get() {
            Ok(conn) => conn,
            Err(e) => {
                log::error!("Failed to get conn from pool: {:#?}", e);
                return Ok(0)
            }
        };

        diesel::sql_query("SELECT delete_expired_tokens();")
            .execute(&mut conn)
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