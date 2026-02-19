-- V4__create_poks_table.sql
-- Create poks table for storing user's pieces of knowledge (POKs)

CREATE TABLE poks (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title      VARCHAR(200),  -- NULLABLE (optional)
    content    TEXT NOT NULL CHECK (length(content) BETWEEN 1 AND 50000),
    deleted_at TIMESTAMP WITH TIME ZONE,  -- SOFT DELETE
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Index for active POKs (excludes soft-deleted), sorted by most recently updated
CREATE INDEX idx_poks_user_id_updated_at
    ON poks (user_id, updated_at DESC)
    WHERE deleted_at IS NULL;

-- Index for soft delete queries (if needed for restore UI in Phase 2)
CREATE INDEX idx_poks_deleted_at ON poks (deleted_at);

-- Comments
COMMENT ON TABLE poks IS 'Pieces of Knowledge (POKs) - user learning entries';
COMMENT ON COLUMN poks.title IS 'Optional title (0-200 chars) - can be empty for frictionless capture';
COMMENT ON COLUMN poks.content IS 'Mandatory content (1-50K chars) - the actual learning/knowledge';
COMMENT ON COLUMN poks.deleted_at IS 'Soft delete timestamp - POK hidden when not null';
