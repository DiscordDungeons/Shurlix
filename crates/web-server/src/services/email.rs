use lettre::{
	address::AddressError, message::Mailbox, transport::smtp::{authentication::Credentials}, AsyncSmtpTransport, AsyncTransport, Message, Tokio1Executor
};
use std::error::Error;

use crate::config::SmtpConfig;

#[derive(Clone, Debug)]
pub struct Email {
	mailer: AsyncSmtpTransport<Tokio1Executor>,
	from: String,
	is_available: bool,
}

impl Default for Email {
	fn default() -> Self {
		Self {
			mailer: AsyncSmtpTransport::<Tokio1Executor>::unencrypted_localhost(),
			from: Default::default(),
			is_available: false,
		}
	}
}

impl Email {
	pub fn new(config: SmtpConfig) -> Result<Self, Box<dyn Error>> {
		let smtp_credentials= Credentials::new(
			config.username.unwrap(),
			config.password.unwrap(),
		);


		let mailer = AsyncSmtpTransport::<Tokio1Executor>::relay(config.host.unwrap().as_str())?
			.credentials(smtp_credentials)
			.port(config.port.unwrap())
			.build();
		
		Ok(Self {
			mailer,
			from: config.from.unwrap(),
			is_available: true,
		})
	}

	pub fn is_available(&self) -> bool {
		return self.is_available
	}

	pub async fn send(&self, subject: &str, to: &str, body: &str) -> Result<lettre::transport::smtp::response::Response, Box<dyn Error>> {		
		let from_address = self.from.parse::<Mailbox>()
        	.map_err(|e| Box::new(e) as Box<dyn Error>)?;
    
		let to_address = to.parse::<Mailbox>()
			.map_err(|e| Box::new(e) as Box<dyn Error>)?; // Co
		
		let email = Message::builder()
			.from(from_address)
			.to(to_address)
			.subject(subject)
			.body(body.to_string())
			.map_err(|e| Box::new(e) as Box<dyn Error>)?; // Convert other errors to Box<dyn Error>
	
		match self.mailer.send(email).await {
			Ok(response) => {
				println!("Email sent successfully: {:?}", response);
				Ok(response)
			}
			Err(e) => {
				eprintln!("Failed to send email: {:?}", e);
				Err(Box::new(e))
			}
		}
	}
}