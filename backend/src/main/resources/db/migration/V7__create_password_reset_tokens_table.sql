-- V7__create_password_reset_tokens_table.sql
-- Create password_reset_tokens table for self-service password recovery

CREATE TABLE password_reset_tokens (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id    UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at    TIMESTAMP WITH TIME ZONE,             -- NULL = pending; non-NULL = consumed
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Index for efficient per-user queries (invalidate previous tokens, rate-limit check)
CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens (user_id);

-- Comments
COMMENT ON TABLE password_reset_tokens IS 'Time-limited, single-use tokens for the self-service password reset flow';
COMMENT ON COLUMN password_reset_tokens.token_hash IS 'SHA-256 hex hash of the raw token transmitted via email — raw value never stored';
COMMENT ON COLUMN password_reset_tokens.expires_at IS 'Token is invalid after this timestamp (1-hour window)';
COMMENT ON COLUMN password_reset_tokens.used_at IS 'Set when the token is consumed; NULL means pending. Used tokens are treated identically to expired tokens.';
