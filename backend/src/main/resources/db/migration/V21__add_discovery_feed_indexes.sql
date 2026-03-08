-- V21: Add indexes to support the Discovery Feed (Milestone 6.5)
--
-- 1. pg_trgm extension — enables trigram GIN indexes on text columns for
--    efficient ILIKE substring search in the learner search endpoint.
--
-- 2. Compound indexes on poks — optimise the UNION ALL feed query which
--    filters by follower→author relationship and orders by created_at DESC.
--
-- 3. Trigram GIN indexes on users.handle and users.display_name — make
--    substring ILIKE matching fast enough for interactive search.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Compound index for the "owned poks from followed learners" branch of the feed query.
-- Covers: JOIN on user_id, WHERE deleted_at IS NULL, ORDER BY created_at DESC.
CREATE INDEX IF NOT EXISTS idx_poks_user_id_created_at
    ON poks (user_id, created_at DESC)
    WHERE deleted_at IS NULL;

-- Compound index for visibility-scoped access (used in WHERE clause visibility filter).
CREATE INDEX IF NOT EXISTS idx_poks_visibility_user_id_created_at
    ON poks (visibility, user_id, created_at DESC)
    WHERE deleted_at IS NULL;

-- Trigram GIN index on users.handle for fast ILIKE search.
CREATE INDEX IF NOT EXISTS idx_users_handle_trgm
    ON users USING GIN (handle gin_trgm_ops);

-- Trigram GIN index on users.display_name for fast ILIKE search.
-- display_name is nullable — the index handles NULLs correctly (they are not indexed).
CREATE INDEX IF NOT EXISTS idx_users_display_name_trgm
    ON users USING GIN (display_name gin_trgm_ops);
