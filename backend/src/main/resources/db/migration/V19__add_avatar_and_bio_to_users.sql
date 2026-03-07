-- Milestone 6.3: Learner Profile avatars and bios
--
-- avatar_url: public Supabase Storage URL for the 200x200 resized JPEG.
--             NULL means no avatar (UI shows initials placeholder).
-- bio:        Short personal description, max 200 chars.
--             No URLs allowed (enforced at service layer).

ALTER TABLE users
    ADD COLUMN avatar_url VARCHAR(500),
    ADD COLUMN bio        VARCHAR(200);
