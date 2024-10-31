use diesel::prelude::*;
use chrono::NaiveDateTime;
use serde::Serialize;

use crate::{DbConnection, DbPool};

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

    pub fn delete_expired_pooled(pool: DbPool) -> Result<usize, diesel::result::Error> {
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