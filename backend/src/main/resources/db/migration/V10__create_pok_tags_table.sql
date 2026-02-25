-- V10__create_pok_tags_table.sql
-- POK–tag assignments, carrying the source of the assignment

CREATE TABLE pok_tags (
    id      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pok_id  UUID NOT NULL REFERENCES poks(id) ON DELETE CASCADE,
    tag_id  UUID NOT NULL REFERENCES tags(id) ON DELETE RESTRICT,
    source  VARCHAR(10) NOT NULL CHECK (source IN ('MANUAL', 'AI', 'AI_EDITED'))
);

-- A tag should only be assigned once per POK
CREATE UNIQUE INDEX idx_pok_tags_pok_tag ON pok_tags (pok_id, tag_id);

-- Efficient lookup of all POKs for a given tag (feed filtering)
CREATE INDEX idx_pok_tags_tag_id ON pok_tags (tag_id);

-- Comments
COMMENT ON TABLE pok_tags IS 'Assignments between POKs and tags. Carries provenance via source column.';
COMMENT ON COLUMN pok_tags.pok_id IS 'FK to poks.id — ON DELETE CASCADE: removing a POK clears its tag assignments';
COMMENT ON COLUMN pok_tags.tag_id IS 'FK to tags.id — ON DELETE RESTRICT: tags must be explicitly managed before removal';
COMMENT ON COLUMN pok_tags.source IS 'How the tag was assigned: MANUAL (user action), AI (unmodified AI approval), AI_EDITED (user edited AI suggestion before approving)';
