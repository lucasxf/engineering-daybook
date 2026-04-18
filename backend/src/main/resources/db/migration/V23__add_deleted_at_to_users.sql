-- Soft-delete support for users: adds deleted_at column and converts unique indices
-- to partial unique indices so deleted accounts do not block handle/email re-use.
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMPTZ;
ALTER TABLE users ALTER COLUMN handle TYPE VARCHAR(64);
DROP INDEX idx_users_email;
DROP INDEX idx_users_handle;
CREATE UNIQUE INDEX idx_users_email ON users (LOWER(email)) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX idx_users_handle ON users (handle) WHERE deleted_at IS NULL;
