-- Milestone 6.1: Follow/unfollow mechanics
--
-- Composite primary key (follower_id, followed_id) — no surrogate key needed.
-- Hard delete on unfollow: no soft-delete column (follows have no content to preserve).
-- CHECK constraint prevents self-follows at the database level (mirrors service-level guard).
-- Index on followed_id enables efficient "who follows me" / follower-count queries.

CREATE TABLE follows (
    follower_id UUID NOT NULL REFERENCES users(id),
    followed_id UUID NOT NULL REFERENCES users(id),
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY (follower_id, followed_id),
    CONSTRAINT chk_no_self_follow CHECK (follower_id <> followed_id)
);

CREATE INDEX idx_follows_followed_id ON follows (followed_id);
