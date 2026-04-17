-- Make theme and locale nullable so new users fall through to system/device defaults
-- on first launch. Existing rows retain their current values.
ALTER TABLE users
    ALTER COLUMN theme DROP NOT NULL,
    ALTER COLUMN theme DROP DEFAULT,
    ALTER COLUMN locale DROP NOT NULL,
    ALTER COLUMN locale DROP DEFAULT;
