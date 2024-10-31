use diesel::prelude::*;
use chrono::NaiveDateTime;
use serde::Serialize;

use crate::DbConnection;

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
}