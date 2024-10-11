use diesel::prelude::*;
use chrono::NaiveDateTime;
use serde::Serialize;

use crate::{schema::{links, users}, DbConnection};

#[derive(Debug, Queryable, Selectable, Serialize)]
#[diesel(table_name = crate::schema::links)]
pub struct Link {
    pub id: i32,
    pub slug: String,
    pub custom_slug: Option<String>,
    pub original_link: String,
    pub owner_id: Option<i32>,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
    pub deleted_at: Option<NaiveDateTime>
}

impl Link {
    /// Gets a link by custom slug
    /// 
    pub fn get_by_custom_slug(slug: String, conn: &mut DbConnection) -> Result<Vec<Link>, diesel::result::Error> {
        let links = links::table.filter(
            links::custom_slug.eq(slug)
        )
        .load::<Link>(conn);

        links
    }

    /// Gets links by any slug (both custom and regular)
    pub fn get_by_slug(slug: &String, conn: &mut DbConnection) -> Result<Vec<Link>, diesel::result::Error> {
        let links = links::table.filter(
            links::custom_slug.eq(slug)
            .or(links::slug.eq(slug))
        )
        .load::<Link>(conn);

        links
    }

    pub fn delete(&self, conn: &mut DbConnection) -> Result<usize, diesel::result::Error> {
        diesel::delete(links::table.filter(links::id.eq(self.id))).execute(conn)
    }
}

#[derive(Debug, Insertable)]
#[diesel(table_name = crate::schema::links)]
pub struct NewLink {
    pub slug: String,
    pub custom_slug: Option<String>,
    pub original_link: String,
    pub owner_id: Option<i32>,
}

impl NewLink {
    pub fn insert(&self, conn: &mut DbConnection) -> Link {
        let link = diesel::insert_into(links::table)
            .values(self)
            .returning(Link::as_returning())
            .get_result(conn)
            .expect("Error saving new link");

        link
    }
}

#[derive(Debug, Queryable, Selectable, Serialize)]
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

impl User {
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