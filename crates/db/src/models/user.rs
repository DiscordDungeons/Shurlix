use diesel::prelude::*;
use chrono::NaiveDateTime;
use serde::Serialize;

use crate::{schema::users, DbConnection};

#[derive(Debug, Queryable, Selectable, Serialize, Clone)]
#[diesel(table_name = crate::schema::users)]
pub struct User {
    pub id: i32,
    pub username: String,
    pub email: String,
    pub password_hash: String,
    pub verified_at: Option<NaiveDateTime>,
    pub created_at: NaiveDateTime,
    pub deleted_at: Option<NaiveDateTime>
}

#[derive(AsChangeset, Clone, Debug)]
#[diesel(table_name = crate::schema::users)]
pub struct UpdateUser {
    pub username: Option<String>,
    pub email: Option<String>,
    pub verified_at: Option<NaiveDateTime>,
}

#[derive(Debug, Serialize)]
pub struct SanitizedUser {
    pub id: i32,
    pub username: String,
    pub email: String,  
    pub verified_at: Option<NaiveDateTime>,
    pub created_at: NaiveDateTime,
    pub deleted_at: Option<NaiveDateTime>
}

impl From<&User> for SanitizedUser {
    fn from(user: &User) -> Self {
        Self {
            id: user.id,
            username: user.username.clone(),
            email: user.email.clone(),  
            verified_at: user.verified_at,
            created_at: user.created_at,
            deleted_at: user.deleted_at
        }
    }
}


impl User {
    pub fn sanitize(&self) -> SanitizedUser {
        SanitizedUser::from(self)
    }

    pub fn username_exists(username: &str, conn: &mut DbConnection) -> bool {
        let count = users::table.filter(users::username.ilike(username)).count().get_result::<i64>(conn).unwrap_or(0);
        count > 0
    }

    pub fn email_exists(email: &str, conn: &mut DbConnection) -> bool {
        let count = users::table.filter(users::email.ilike(email)).count().get_result::<i64>(conn).unwrap_or(0);
        count > 0
    }

    /// Gets a user by username
    pub fn get_by_username(username: &str, conn: &mut DbConnection) -> Result<Vec<User>, diesel::result::Error> {
        users::table.filter(
            users::username.eq(username)
        )
        .load::<User>(conn)
    }

    pub fn get_by_email(email: &str, conn: &mut DbConnection) -> Result<Vec<User>, diesel::result::Error> {
        users::table.filter(
            users::email.eq(email)
        )
        .load::<User>(conn)
    }

    pub fn get_by_id(id: &i32, conn: &mut DbConnection) -> Result<Vec<User>, diesel::result::Error> {
        users::table.filter(
            users::id.eq(id)
        )
        .load::<User>(conn)
    }

    pub fn update_password_hash(&self, password_hash: String, conn: &mut DbConnection) -> Result<usize, diesel::result::Error> {
        diesel::update(users::table.filter(
            users::id.eq(self.id)
        ))
        .set(users::password_hash.eq(password_hash))
        .execute(conn)
    }

    pub fn set_verified_at(&self, verified_at: Option<NaiveDateTime>, conn: &mut DbConnection) -> Result<usize, diesel::result::Error> {
        diesel::update(users::table.find(self.id))
            .set(users::verified_at.eq(verified_at))
            .execute(conn)
    }

    pub fn delete(&self, conn: &mut DbConnection) -> Result<usize, diesel::result::Error> {
        diesel::delete(
            users::table.filter(
                users::id.eq(self.id)
            )
        ).execute(conn)
    }

    pub fn update(&self, values: UpdateUser, conn: &mut DbConnection) -> Result<usize, diesel::result::Error> {
        diesel::update(users::table.find(self.id))
            .set(&values)
            .execute(conn)
    }
}


#[derive(Debug, Insertable)]
#[diesel(table_name = crate::schema::users)]
pub struct NewUser {
    pub username: String,
    pub password_hash: String,
    pub email: String,
}

impl NewUser {
    pub fn insert(&self, conn: &mut DbConnection) -> User {
        diesel::insert_into(users::table)
            .values(self)
            .returning(User::as_returning())
            .get_result(conn)
            .expect("Error saving new user")
    }
}