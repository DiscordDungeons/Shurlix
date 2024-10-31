-- Your SQL goes here

CREATE TABLE verification_tokens (
    id SERIAL PRIMARY KEY,
	user_id INTEGER NOT NULL,
	token VARCHAR(255) NOT NULL UNIQUE,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


CREATE OR REPLACE FUNCTION delete_expired_tokens() 
RETURNS void AS $$
BEGIN
    DELETE FROM verification_tokens
    WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
