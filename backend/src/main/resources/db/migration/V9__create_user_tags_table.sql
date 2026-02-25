-- V9__create_user_tags_table.sql
-- Per-user tag subscriptions with soft-delete support and color assignment

CREATE TABLE user_tags (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id    UUID NOT NULL,
    tag_id     UUID NOT NULL REFERENCES tags(id) ON DELETE RESTRICT,
    color      VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE  -- NULL = active; non-NULL = soft-deleted
);

-- A user should have at most one active subscription per tag
CREATE UNIQUE INDEX idx_user_tags_user_tag_active
    ON user_tags (user_id, tag_id)
    WHERE deleted_at IS NULL;

-- Efficient lookup of all active tags for a user (primary query path for tag list)
CREATE INDEX idx_user_tags_user_id_active
    ON user_tags (user_id)
    WHERE deleted_at IS NULL;

-- Comments
COMMENT ON TABLE user_tags IS 'Per-user tag subscriptions. Soft-delete allows rename and delete without removing global tag records.';
COMMENT ON COLUMN user_tags.user_id IS 'The user who owns this subscription';
COMMENT ON COLUMN user_tags.tag_id IS 'FK to tags.id — ON DELETE RESTRICT preserves history if tag cleanup is ever added';
COMMENT ON COLUMN user_tags.color IS 'Color assigned to this tag for this user, chosen randomly from a fixed palette at creation time';
COMMENT ON COLUMN user_tags.created_at IS 'When the user first subscribed to this tag';
COMMENT ON COLUMN user_tags.deleted_at IS 'NULL = active subscription; non-NULL = soft-deleted (rename or delete operation). Global tags.id record is never affected.';
