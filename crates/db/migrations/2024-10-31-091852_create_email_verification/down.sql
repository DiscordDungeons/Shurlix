-- This file should undo anything in `up.sql`

-- Drop the delete_expired_tokens function if it exists
DROP FUNCTION IF EXISTS delete_expired_tokens();

-- Drop the verification_tokens table if it exists
DROP TABLE IF EXISTS verification_tokens;