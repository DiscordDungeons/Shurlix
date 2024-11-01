-- Your SQL goes here

CREATE TABLE links (
    id SERIAL PRIMARY KEY,
    domain_id INTEGER NOT NULL,
    slug VARCHAR(255) NOT NULL,
    custom_slug VARCHAR(255),
    original_link TEXT NOT NULL,
    owner_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP DEFAULT NULL,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE CASCADE,
    UNIQUE (domain_id, slug),
    UNIQUE (domain_id, custom_slug)
)
