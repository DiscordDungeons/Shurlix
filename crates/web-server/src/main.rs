mod asset;
mod common;
mod config;
mod constants;
mod extensions;
mod hostname_router;
mod routes;
mod services;
mod types;
mod util;

use asset::Asset;
use axum::{
	body::Body,
	extract::{Path, Request},
	http::StatusCode,
	middleware::{self, Next},
	response::{IntoResponse, Redirect, Response},
	routing::get,
	Extension, Router,
};
use common::GenericMessage;
use config::Config;
use db::{
	models::{Link, VerificationToken},
	DbPool,
};
use extensions::domain::ExtractedDomain;
use hostname_router::HostnameRouter;
use mime_guess::from_path;
use owo_colors::OwoColorize;
use services::email::Email;
use tokio::sync::oneshot;
use std::{net::SocketAddr, sync::{Arc, Mutex}};

use tokio_cron_scheduler::{Job, JobScheduler, JobSchedulerError};

async fn asset_handler(uri: axum::http::Uri) -> Response {
	let path = uri.clone().to_string().replace("/assets/", "");
	match Asset::get(&path) {
		Some(file) => {
			// Determine MIME type
			let mime_type = from_path(&path).first().unwrap_or(mime::APPLICATION_OCTET_STREAM);

			// Create a response with the correct content type and body
			Response::builder()
				.header(axum::http::header::CONTENT_TYPE, mime_type.as_ref())
				.body(Body::from(file.data)) // Convert file.data to Body
				.unwrap()
		}
		None => {
			let not_found_message = "File not found";
			// Create a 404 response
			Response::builder()
				.status(StatusCode::NOT_FOUND)
				.body(Body::from(not_found_message)) // Convert to Body
				.unwrap()
		}
	}
}
async fn index() -> impl IntoResponse {
	axum::response::Html(include_str!("../static/index.html")) // Serve your index.html
}

async fn create_scheduler(pool: &DbPool) -> Result<(), JobSchedulerError> {
	let scheduler = JobScheduler::new().await?;
	let pool_clone = pool.clone();

	scheduler
		.add(Job::new("* 0 0 * * *", move |_, _| match VerificationToken::delete_expired_pooled(&pool_clone) {
			Ok(_) => log::debug!("Deleted expired verification tokens."),
			Err(e) => log::error!("Failed to delete expired verification tokens: {:#?}", e),
		})?)
		.await?;

	scheduler.start().await?;

	Ok(())
}

// Middleware for logging
async fn log_request(req: Request<Body>, next: Next) -> Result<Response, StatusCode> {
	let path = req.uri().path().to_string();
	let method = req.method().to_string();

	log::debug!("Request received: Method: {} Path: {}", method, path);

	let response = next.run(req).await;

	log::debug!("Response status: {}", response.status());

	Ok(response)
}

async fn start_app(config: Config) {
	let db_config = config.db.clone().unwrap();
	let smtp_config = config.smtp.clone();

	let pool = db::create_pool(&db_config.url);
	let email: Option<Email> = smtp_config
		.as_ref() // Avoid cloning `smtp_config` unnecessarily
		.and_then(|config| {
			if config.enabled {
				match Email::new(config.clone()) {
					Ok(email) => Some(email),
					Err(e) => {
						panic!("Failed to create email service {:#?}", e);
					}
				}
			} else {
				Some(Email::default())
			}
		})
		.or_else(|| Some(Email::default()));

	db::run_migrations(&pool.clone());

	match create_scheduler(&pool).await {
		Ok(_) => {}
		Err(e) => eprintln!("Failed to create scheduler: {:#?}", e),
	}

	let app_router = Router::new()
		.route("/", get(index))
		.route("/:slug", get(handle_slug))
		.route("/dash/*path", get(index))
		.route("/assets/*path", get(asset_handler))
		.nest("/api", routes::api::api_router())
		.layer(Extension(config.clone()))
		.layer(Extension(email.unwrap()))
		.layer(Extension(pool.clone()))
		.layer(middleware::from_fn(log_request));

	let slug_router = Router::new()
		.route("/:slug", get(handle_slug))
		.layer(Extension(pool.clone()))
		.layer(middleware::from_fn(log_request));

	let hostname_router = HostnameRouter::new(app_router, slug_router, config.clone());

	let app = Router::new().fallback(hostname_router);

	let addr = SocketAddr::from(([0, 0, 0, 0], 3000));
	log::info!("APP listening on {}", addr);
	let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
	axum::serve(listener, app.into_make_service()).await.unwrap();
}

pub async fn start_setup(config: config::Config, shutdown_tx: Arc<Mutex<Option<oneshot::Sender<()>>>>, shutdown_rx: oneshot::Receiver<()>) {
    let setup_router = Router::new()
        .route("/", get(index))
        .route("/:slug", get(handle_slug))
        .route("/dash/*path", get(index))
        .route("/setup", get(index))
        .route("/setup/*path", get(index))
        .route("/assets/*path", get(asset_handler))
        .nest("/api", routes::api::api_router())
		.layer(Extension(config))
        .layer(Extension(shutdown_tx));

    // Run the listener
    let addr = SocketAddr::from(([0, 0, 0, 0], 3000));
    log::info!("SETUP listening on {}", addr);
    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();

    axum::serve(listener, setup_router.into_make_service())
        .with_graceful_shutdown(async {
            shutdown_rx.await.ok();
        })
        .await.unwrap();
}

#[tokio::main]
async fn main() {
	env_logger::init();
	
	let mut config = config::Config::new();
	
	if config.file_exists() {
		config.load_from_file();
	}

	if !config.setup.setup_done {
			
		let (shutdown_tx, shutdown_rx) = oneshot::channel();
		let shutdown_tx = Arc::new(Mutex::new(Some(shutdown_tx)));

		start_setup(config.clone(), shutdown_tx, shutdown_rx).await;
	}

	match config.validate() {
		Ok(()) => start_app(config).await,
		Err(errors) => {
			for error in errors {
				println!("{} {} {}", "[CONFIG ERROR]".bright_red(), "✗".red().bold(), error);
			}
		}
	};
}

async fn handle_slug(
	Extension(pool): Extension<DbPool>,
	ExtractedDomain(_domain, domain_id): ExtractedDomain,
	Path(slug): Path<String>,
) -> impl IntoResponse {
	let conn = &mut pool
		.get()
		.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, GenericMessage::from_string(e.to_string())))?;

	let existing_link = Link::get_by_domain_slug(domain_id, &slug, conn);

	if existing_link.is_err() {
		return Err((StatusCode::INTERNAL_SERVER_ERROR, GenericMessage::new("Internal Server Error")));
	}

	let existing_link = existing_link.unwrap();

	if existing_link.len() == 0 {
		return Err((StatusCode::NOT_FOUND, GenericMessage::new("Slug not found.")));
	}

	let link = existing_link.first().unwrap();

	Ok(Redirect::permanent(&link.original_link))
}
