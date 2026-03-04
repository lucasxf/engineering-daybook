ALTER TABLE users
    ADD COLUMN profile_visibility VARCHAR(20) NOT NULL DEFAULT 'PRIVATE';

CREATE INDEX idx_poks_user_visibility ON poks (user_id, visibility, deleted_at);
