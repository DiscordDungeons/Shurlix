pub mod verification_email;

pub use verification_email::*;

pub trait EmailTemplate {
	fn subject(&self) -> String;
	fn body(&self) -> String;
}
