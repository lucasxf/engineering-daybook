-- V8__create_tags_table.sql
-- Global tag pool — shared across all users, append-only (never physically deleted)

CREATE TABLE tags (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name       VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Case-insensitive unique index: prevents duplicate global tags regardless of user input casing
CREATE UNIQUE INDEX idx_tags_name_lower ON tags (LOWER(name));

-- Comments
COMMENT ON TABLE tags IS 'Global tag pool — shared across all users. Tags are never deleted; users interact via user_tags subscriptions.';
COMMENT ON COLUMN tags.id IS 'Surrogate primary key';
COMMENT ON COLUMN tags.name IS 'Tag name as entered by the first creator. Unique case-insensitively (enforced by idx_tags_name_lower).';
COMMENT ON COLUMN tags.created_at IS 'Timestamp when this tag first appeared in the global pool';
