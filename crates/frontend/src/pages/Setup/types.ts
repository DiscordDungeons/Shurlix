interface DatabaseConfig {
	url: string,
}

interface AppConfig {
	shortened_link_length: number,
	allow_anonymous_shorten: boolean,
	allow_registering: boolean,
	base_url: string,
	enable_email_verification: boolean,
	email_verification_ttl: string,
}

interface SecurityConfig {
	jwt_secret: string,
	min_password_strength: number,
}

interface SmtpConfig {
	enabled: boolean,
	username?: string,
	password?: string,
	from?: string,
	host?: string,
	port?: number,
}

interface SetupConfig {
	setup_done: boolean,
}

export interface Config {
	db?: DatabaseConfig,
	app?: AppConfig,
	security?: SecurityConfig,
	smtp?: SmtpConfig,
	setup: SetupConfig,
}
