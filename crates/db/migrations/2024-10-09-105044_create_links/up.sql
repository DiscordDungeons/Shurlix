-- Your SQL goes here

CREATE TABLE links (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    custom_slug VARCHAR(255) UNIQUE,
    original_link TEXT NOT NULL,
    owner_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP DEFAULT NULL,
    FOREIGN KEY (owner_id) REFERENCES users(id)
)
