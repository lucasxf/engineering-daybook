-- Backfill display_name and canonicalise name for all existing tags.
--
-- Transformation rules:
--   display_name = REPLACE(name, ' ', '-')   — preserve original casing, spaces → dashes
--   name         = LOWER(REPLACE(name, ' ', '-'))  — canonical: lowercase + dashes
--
-- After this migration, name is always canonical lowercase+dashes, so the
-- case-insensitive functional index idx_tags_name_lower is redundant and is dropped.
-- A plain UNIQUE constraint on name provides the same uniqueness guarantee.

-- ============================================================
-- STEP 1: Dedup tags that normalise to the same canonical name
-- ============================================================
-- The old unique index was on LOWER(name) only, so space-vs-dash variants
-- (e.g. "machine learning" and "machine-learning") could coexist as separate
-- rows. After the bulk UPDATE both would become "machine-learning", violating
-- the new UNIQUE constraint. We resolve collisions before the UPDATE runs.

-- 1a. Elect a winner for each collision group: the tag with the minimum id.
CREATE TEMP TABLE tag_dedup_winners AS
SELECT LOWER(REPLACE(name, ' ', '-')) AS canonical,
       MIN(id)                        AS winner_id
FROM   tags
GROUP  BY LOWER(REPLACE(name, ' ', '-'))
HAVING COUNT(*) > 1;

-- 1b. Collect all loser rows: members of a collision group that are NOT the winner.
CREATE TEMP TABLE tag_dedup_losers AS
SELECT t.id   AS loser_id,
       w.winner_id
FROM   tags t
JOIN   tag_dedup_winners w ON LOWER(REPLACE(t.name, ' ', '-')) = w.canonical
WHERE  t.id <> w.winner_id;

-- ============================================================
-- STEP 2: Reassign pok_tags from loser → winner
-- ============================================================
-- Unique index: (pok_id, tag_id). We can only reassign a loser row when the
-- winner does not already appear in pok_tags for the same pok_id.

-- 2a. Reassign loser rows that have no conflicting winner row.
UPDATE pok_tags pt
SET    tag_id = l.winner_id
FROM   tag_dedup_losers l
WHERE  pt.tag_id = l.loser_id
  AND  NOT EXISTS (
           SELECT 1
           FROM   pok_tags conflict
           WHERE  conflict.pok_id = pt.pok_id
             AND  conflict.tag_id = l.winner_id
       );

-- 2b. Delete remaining loser rows where the winner already covers the pok.
DELETE FROM pok_tags pt
USING  tag_dedup_losers l
WHERE  pt.tag_id = l.loser_id;

-- ============================================================
-- STEP 3: Reassign user_tags from loser → winner
-- ============================================================
-- Partial unique index: (user_id, tag_id) WHERE deleted_at IS NULL.
-- Constraint only applies to active (non-soft-deleted) rows.

-- 3a. Reassign active loser rows where the user has no active winner subscription.
UPDATE user_tags ut
SET    tag_id = l.winner_id
FROM   tag_dedup_losers l
WHERE  ut.tag_id     = l.loser_id
  AND  ut.deleted_at IS NULL
  AND  NOT EXISTS (
           SELECT 1
           FROM   user_tags conflict
           WHERE  conflict.user_id    = ut.user_id
             AND  conflict.tag_id     = l.winner_id
             AND  conflict.deleted_at IS NULL
       );

-- 3b. Soft-delete any remaining active loser rows (user had both winner and loser).
UPDATE user_tags ut
SET    deleted_at = NOW()
FROM   tag_dedup_losers l
WHERE  ut.tag_id     = l.loser_id
  AND  ut.deleted_at IS NULL;

-- 3c. Reassign already-soft-deleted loser rows — no unique constraint applies here.
UPDATE user_tags ut
SET    tag_id = l.winner_id
FROM   tag_dedup_losers l
WHERE  ut.tag_id     = l.loser_id
  AND  ut.deleted_at IS NOT NULL;

-- ============================================================
-- STEP 4: Delete the now-dereferenced loser tags
-- ============================================================
DELETE FROM tags t
USING  tag_dedup_losers l
WHERE  t.id = l.loser_id;

-- ============================================================
-- STEP 5: Clean up temp tables
-- ============================================================
DROP TABLE tag_dedup_losers;
DROP TABLE tag_dedup_winners;

-- ============================================================
-- STEP 6: Bulk UPDATE — safe now that duplicates are resolved
-- ============================================================
UPDATE tags
SET display_name = REPLACE(name, ' ', '-'),
    name         = LOWER(REPLACE(name, ' ', '-'));

DROP INDEX IF EXISTS idx_tags_name_lower;

ALTER TABLE tags ADD CONSTRAINT tags_name_key UNIQUE (name);

-- Remove the temporary DEFAULT '' now that all rows have been backfilled.
ALTER TABLE tags ALTER COLUMN display_name DROP DEFAULT;
