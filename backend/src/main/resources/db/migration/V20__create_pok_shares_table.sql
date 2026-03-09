-- V20: Create pok_shares table for the Re-Learning (Share) feature (Milestone 6.4)
--
-- A PokShare is a reference to another learner's PUBLIC learning, displayed
-- in the sharer's feed and profile with full attribution to the original author.
-- The original content is NEVER duplicated — only the reference is stored.
--
-- Key design decisions:
--   - ON DELETE CASCADE on original_pok_id: if the original POK is hard-deleted, shares disappear.
--     Soft-delete cascade is handled at the service layer (PokShareService.cascadeDeleteByOriginalPok).
--   - No updated_at: shares are immutable after creation. Unshare-and-reshare is the update mechanism.
--   - UNIQUE (original_pok_id, shared_by_user_id): one re-learning per learner per original POK.
--   - No original_author_id column: derived from poks.user_id join at query time to avoid denormalization.

CREATE TABLE pok_shares (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    original_pok_id     UUID NOT NULL REFERENCES poks(id) ON DELETE CASCADE,
    shared_by_user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    note                TEXT,
    visibility          VARCHAR(20) NOT NULL DEFAULT 'PUBLIC',
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE (original_pok_id, shared_by_user_id),
    CONSTRAINT chk_pok_shares_visibility CHECK (visibility IN ('PRIVATE', 'COLLEAGUES_ONLY', 'FOLLOWERS_ONLY', 'PUBLIC')),
    CONSTRAINT chk_pok_shares_note_length CHECK (note IS NULL OR char_length(note) <= 500)
);

CREATE INDEX idx_pok_shares_shared_by ON pok_shares (shared_by_user_id, created_at DESC);
CREATE INDEX idx_pok_shares_original ON pok_shares (original_pok_id);
