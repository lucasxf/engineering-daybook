-- V5__add_poks_created_at_index.sql
-- Add index on (user_id, created_at DESC) for optimized sorting by creation date

-- Index for active POKs sorted by creation date (ascending/descending supported)
CREATE INDEX idx_poks_user_id_created_at
    ON poks (user_id, created_at DESC)
    WHERE deleted_at IS NULL;

-- Comment
COMMENT ON INDEX idx_poks_user_id_created_at IS 'Optimizes queries sorting POKs by creation date for a specific user (excludes soft-deleted)';
