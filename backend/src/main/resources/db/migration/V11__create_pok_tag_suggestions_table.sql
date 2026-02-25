-- V11__create_pok_tag_suggestions_table.sql
-- AI-generated tag suggestions awaiting user decision

CREATE TABLE pok_tag_suggestions (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pok_id         UUID NOT NULL REFERENCES poks(id) ON DELETE CASCADE,
    user_id        UUID NOT NULL,
    suggested_name VARCHAR(100) NOT NULL,
    status         VARCHAR(10) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    created_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Efficient lookup of pending suggestions for a given POK (primary display path)
CREATE INDEX idx_pok_tag_suggestions_pok_status
    ON pok_tag_suggestions (pok_id, status);

-- Comments
COMMENT ON TABLE pok_tag_suggestions IS 'AI-generated tag suggestions awaiting user approval or rejection. Never auto-applied.';
COMMENT ON COLUMN pok_tag_suggestions.pok_id IS 'FK to poks.id — ON DELETE CASCADE: removing a POK clears its pending suggestions';
COMMENT ON COLUMN pok_tag_suggestions.user_id IS 'Owner of the POK — denormalized for ownership checks without a JOIN';
COMMENT ON COLUMN pok_tag_suggestions.suggested_name IS 'Tag name as suggested by the AI extraction pipeline';
COMMENT ON COLUMN pok_tag_suggestions.status IS 'PENDING = awaiting action; APPROVED = user approved (PokTag created); REJECTED = user dismissed';
COMMENT ON COLUMN pok_tag_suggestions.created_at IS 'When the AI generated this suggestion';
