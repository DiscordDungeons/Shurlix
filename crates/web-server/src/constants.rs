use lazy_static::lazy_static;

lazy_static! {
	/// A list of reserved slugs that can't be used
    pub static ref RESERVED_SLUGS: Vec<String> = vec![
        "api".to_string(),
		"assets".to_string()
	];
}

