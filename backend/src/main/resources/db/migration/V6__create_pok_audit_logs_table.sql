-- V6__create_pok_audit_logs_table.sql
-- Create pok_audit_logs table for immutable audit trail of POK changes

CREATE TABLE pok_audit_logs (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pok_id       UUID NOT NULL REFERENCES poks(id) ON DELETE RESTRICT,
    user_id      UUID NOT NULL,  -- Denormalized: avoids join, preserved even if user is deleted
    action       VARCHAR(10) NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE')),
    old_title    TEXT,           -- NULL on CREATE (no previous state)
    new_title    TEXT,           -- NULL on DELETE (no new state)
    old_content  TEXT,           -- NULL on CREATE
    new_content  TEXT,           -- NULL on DELETE
    occurred_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Index for efficient history queries (get all entries for a POK, most recent first)
CREATE INDEX idx_pok_audit_logs_pok_id_occurred_at
    ON pok_audit_logs (pok_id, occurred_at DESC);

-- Comments
COMMENT ON TABLE pok_audit_logs IS 'Immutable audit trail for all POK create/update/delete operations';
COMMENT ON COLUMN pok_audit_logs.pok_id IS 'FK to poks.id — ON DELETE RESTRICT prevents losing audit history if hard delete is added later';
COMMENT ON COLUMN pok_audit_logs.user_id IS 'Denormalized user ID — preserved even if user account is deleted';
COMMENT ON COLUMN pok_audit_logs.action IS 'Operation type: CREATE, UPDATE, or DELETE';
COMMENT ON COLUMN pok_audit_logs.old_title IS 'Title before the change (null for CREATE)';
COMMENT ON COLUMN pok_audit_logs.new_title IS 'Title after the change (null for DELETE)';
COMMENT ON COLUMN pok_audit_logs.old_content IS 'Content before the change (null for CREATE)';
COMMENT ON COLUMN pok_audit_logs.new_content IS 'Content after the change (null for DELETE)';
COMMENT ON COLUMN pok_audit_logs.occurred_at IS 'Timestamp of the operation — matches the POK timestamp (createdAt, updatedAt, or deletedAt)';
