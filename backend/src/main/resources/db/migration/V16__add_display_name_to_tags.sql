-- Add display_name column to tags table.
-- The display_name stores the user-facing label (spaces replaced by dashes, casing preserved).
-- The name column will be normalised to canonical lowercase+dashes form in V17.
ALTER TABLE tags ADD COLUMN display_name VARCHAR(100) NOT NULL DEFAULT '';
