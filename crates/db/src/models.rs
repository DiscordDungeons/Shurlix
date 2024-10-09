use diesel::prelude::*;
use chrono::NaiveDateTime;
use serde::Serialize;

use crate::{schema::links, DbConnection};

#[derive(Debug, Queryable, Selectable, Serialize)]
#[diesel(table_name = crate::schema::links)]
pub struct Link {
    pub id: i32,
    pub slug: String,
    pub custom_slug: Option<String>,
    pub original_link: String,
    pub owner_id: i32,
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
}

#[derive(Debug, Insertable)]
#[diesel(table_name = crate::schema::links)]
pub struct NewLink {
    pub slug: String,
    pub custom_slug: Option<String>,
    pub original_link: String,
    pub owner_id: i32,
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

#[derive(Queryable, Selectable)]
#[diesel(table_name = crate::schema::users)]
pub struct User {
    pub id: i32,
    pub username: String,
    pub email: String,
    pub password_hash: String,
    pub password_salt: i32,
    pub created_at: NaiveDateTime,
    pub verified_at: Option<NaiveDateTime>,
    pub deleted_at: Option<NaiveDateTime>
}
