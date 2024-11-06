use std::{future::Future, pin::Pin};

use axum::{async_trait, body::Body, handler::Handler, http::{Request, StatusCode}, response::Response, Router};
use tower::ServiceExt;

use crate::{config::Config, util::strip_protocol}; // ServiceExt for `oneshot`

#[derive(Clone)]
pub struct HostnameRouter {
    host1_router: Router,
    host2_router: Router,
	config: Config,
}

impl HostnameRouter {
    pub fn new(
		router_1: Router,
		router_2: Router,
		config: Config,
	) -> Self {
        HostnameRouter {
            host1_router: router_1,
            host2_router: router_2,
			config,
        }
    }
}

#[async_trait]
impl Handler<Request<Body>, ()> for HostnameRouter {
    type Future = Pin<Box<dyn Future<Output = Response<Body>> + Send>>;

    fn call(self, req: Request<Body>, _: ()) -> Self::Future {
        let host = req
            .headers()
            .get("host")
            .and_then(|v| v.to_str().ok())
            .map(|host| host.to_string());

        let future_response = async move {
			if host.is_none() {
                return Response::builder()
                    .status(StatusCode::INTERNAL_SERVER_ERROR)
                    .body(Body::empty())
                    .unwrap();
            }

			let base_url = match strip_protocol(self.config.base_url.as_str()) {
				Ok(host) => host,
				Err(_) => {
					return Response::builder()
						.status(StatusCode::INTERNAL_SERVER_ERROR)
						.body(Body::empty())
						.unwrap();
				}
			};
			
			log::debug!("Host is {:#?}", host);
			log::debug!("Base url is {}", base_url);

			if host.unwrap() == base_url {
				self.host1_router.clone().oneshot(req).await.unwrap_or_else(|_| {
					Response::builder()
						.status(StatusCode::INTERNAL_SERVER_ERROR)
						.body(Body::empty())
						.unwrap()
				})
			} else {
				self.host2_router.clone().oneshot(req).await.unwrap_or_else(|_| {
					Response::builder()
						.status(StatusCode::INTERNAL_SERVER_ERROR)
						.body(Body::empty())
						.unwrap()
				})
			}
        };

        Box::pin(future_response)
    }
}