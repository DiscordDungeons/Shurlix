use diesel::prelude::*;
use chrono::NaiveDateTime;
use serde::Serialize;

use crate::{schema::links, DbConnection};

#[derive(Debug, Queryable, Selectable, Serialize)]
#[diesel(table_name = crate::schema::links)]
pub struct Link {
    pub id: i32,
    pub domain_id: i32,
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

    pub fn get_by_domain_slug(domain_id: i32, slug: &String, conn: &mut DbConnection) -> Result<Vec<Link>, diesel::result::Error>  {
        links::table
            .filter(
                links::custom_slug.eq(slug)
                    .or(links::slug.eq(slug))
                    .and(links::domain_id.eq(domain_id)),
            )
            .load::<Link>(conn)
    }

    pub fn get_by_owner_id(owner: i32, conn: &mut DbConnection) -> Result<Vec<Link>, diesel::result::Error> {
        links::table.filter(
            links::owner_id.eq(owner)
        )
        .order_by(links::created_at.desc())
        .load::<Link>(conn)
    }

    pub fn get_by_owner_id_paginated(owner: i32, page: i64, per_page: i64, conn: &mut DbConnection) -> Result<Vec<Link>, diesel::result::Error> {
        let offset_value = (page - 1) * per_page;
        links::table
            .filter(links::owner_id.eq(owner))
            .order_by(links::created_at.desc())
            .limit(per_page)
            .offset(offset_value)
            .load::<Link>(conn)
    }

    pub fn get_total_count(owner: i32, conn: &mut DbConnection) -> QueryResult<i64> {
        links::table.filter(links::owner_id.eq(owner)).count().get_result(conn)
    }

    pub fn delete(&self, conn: &mut DbConnection) -> Result<usize, diesel::result::Error> {
        diesel::delete(links::table.filter(links::id.eq(self.id))).execute(conn)
    }
}

#[derive(Debug, Insertable)]
#[diesel(table_name = crate::schema::links)]
pub struct NewLink {
    pub slug: String,
    pub domain_id: i32,
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