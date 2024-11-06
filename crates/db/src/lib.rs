pub mod models;
pub mod schema;

use diesel::pg::PgConnection;
use diesel::r2d2::{self, ConnectionManager};
use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};

pub type DbPool = r2d2::Pool<ConnectionManager<PgConnection>>;
pub type DbConnection = r2d2::PooledConnection<ConnectionManager<PgConnection>>;

const MIGRATIONS: EmbeddedMigrations = embed_migrations!("migrations");

pub fn create_pool(database_url: &str) -> DbPool {
	let manager = ConnectionManager::<PgConnection>::new(database_url);
	r2d2::Pool::builder()
		.build(manager)
		.expect("Failed to create pool.")
}

pub fn run_migrations(pool: &DbPool) {
	let mut conn = pool
		.get()
		.expect("Failed to get a DB connection from the pool");

	conn.run_pending_migrations(MIGRATIONS)
		.expect("Failed to run migrations");
}
