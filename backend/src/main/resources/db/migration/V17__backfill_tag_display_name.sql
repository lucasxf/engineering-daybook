-- Backfill display_name and canonicalise name for all existing tags.
--
-- Transformation rules:
--   display_name = REPLACE(name, ' ', '-')   — preserve original casing, spaces → dashes
--   name         = LOWER(REPLACE(name, ' ', '-'))  — canonical: lowercase + dashes
--
-- After this migration, name is always canonical lowercase+dashes, so the
-- case-insensitive functional index idx_tags_name_lower is redundant and is dropped.
-- A plain UNIQUE constraint on name provides the same uniqueness guarantee.

UPDATE tags
SET display_name = REPLACE(name, ' ', '-'),
    name         = LOWER(REPLACE(name, ' ', '-'));

DROP INDEX IF EXISTS idx_tags_name_lower;

ALTER TABLE tags ADD CONSTRAINT tags_name_key UNIQUE (name);

-- Remove the temporary DEFAULT '' now that all rows have been backfilled.
ALTER TABLE tags ALTER COLUMN display_name DROP DEFAULT;
