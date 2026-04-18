ALTER TABLE users
  ADD COLUMN apple_sub VARCHAR(255) NULL;

CREATE UNIQUE INDEX users_apple_sub_unique
  ON users (apple_sub)
  WHERE apple_sub IS NOT NULL;
