use super::EmailTemplate;

pub struct VerificationEmail<'a> {
	pub username: &'a str,
	pub verification_token: &'a str,
	pub base_url: &'a str,
	pub ttl: &'a str,
}

impl<'a> EmailTemplate for VerificationEmail<'a> {
	fn subject(&self) -> String {
		"Please verify your email".to_string()
	}

	fn body(&self) -> String {
		format!(
			r#"Hello {},
            Thank you for signing up! Please verify your email address to complete your registration.

            Verification Link:
            {}/api/user/verify/{}

            Clicking the link above will confirm your email and activate your account. This link is valid for the next {}.

            If you didn't create an account, you can safely ignore this email.
            "#,
			self.username, self.base_url, self.verification_token, self.ttl
		)
	}
}
