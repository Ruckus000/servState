-- Migration: 009_document_save_feature
-- Description: Add document save feature with compliance triggers for generated documents
-- Date: 2025-12-09

-- ============================================
-- Add columns to documents table
-- ============================================

-- Document upload status for tracking async S3 uploads
ALTER TABLE documents ADD COLUMN IF NOT EXISTS status VARCHAR(20)
  DEFAULT 'uploaded' CHECK (status IN ('pending', 'uploaded', 'upload_failed'));

-- Idempotency key for preventing duplicate document generation (5-minute windows)
ALTER TABLE documents ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(100) UNIQUE;

-- Track who generated the document (for system-generated docs)
ALTER TABLE documents ADD COLUMN IF NOT EXISTS generated_by UUID REFERENCES users(id);

-- Store generation parameters for audit trail (e.g., goodThroughDate for payoff)
ALTER TABLE documents ADD COLUMN IF NOT EXISTS generation_params JSONB;

-- Retention period end date (compliance: 7 years for mortgage docs)
ALTER TABLE documents ADD COLUMN IF NOT EXISTS retention_until DATE;

-- ============================================
-- Indexes for performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_idempotency ON documents(idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_documents_generated_by ON documents(generated_by) WHERE generated_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_documents_retention_until ON documents(retention_until) WHERE retention_until IS NOT NULL;

-- ============================================
-- COMPLIANCE: Prevent deletion before retention expires
-- ============================================

CREATE OR REPLACE FUNCTION prevent_premature_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Only check when setting deleted_at (soft delete)
  IF NEW.deleted_at IS NOT NULL
     AND OLD.deleted_at IS NULL
     AND OLD.retention_until IS NOT NULL
     AND OLD.retention_until > NOW() THEN
    RAISE EXCEPTION 'Document is in retention period until %. Cannot delete before retention expires.', OLD.retention_until;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists, then create
DROP TRIGGER IF EXISTS enforce_retention_period ON documents;
CREATE TRIGGER enforce_retention_period
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION prevent_premature_delete();

-- ============================================
-- COMPLIANCE: Prevent generation_params modification
-- ============================================

CREATE OR REPLACE FUNCTION prevent_generation_params_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow changes only if document is being soft-deleted
  IF NEW.generation_params IS DISTINCT FROM OLD.generation_params
     AND NEW.deleted_at IS NULL THEN
    RAISE EXCEPTION 'Document generation parameters cannot be modified after creation';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists, then create
DROP TRIGGER IF EXISTS prevent_params_modification ON documents;
CREATE TRIGGER prevent_params_modification
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION prevent_generation_params_change();

-- ============================================
-- FIX: Change CASCADE to RESTRICT
-- Prevents bypassing retention by deleting parent loan
-- ============================================

-- First, check and drop existing constraint
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_loan_id_fkey;

-- Recreate with RESTRICT to prevent accidental cascade deletes
ALTER TABLE documents ADD CONSTRAINT documents_loan_id_fkey
  FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE RESTRICT;

-- ============================================
-- COMPLIANCE: Prevent hard deletes
-- All document deletions must use soft delete (set deleted_at)
-- ============================================

CREATE OR REPLACE FUNCTION prevent_hard_delete()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Hard deletes not allowed on documents table. Use soft delete by setting deleted_at column.';
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists, then create
DROP TRIGGER IF EXISTS no_hard_deletes ON documents;
CREATE TRIGGER no_hard_deletes
  BEFORE DELETE ON documents
  FOR EACH ROW EXECUTE FUNCTION prevent_hard_delete();

-- ============================================
-- Add comments for documentation
-- ============================================

COMMENT ON COLUMN documents.status IS 'Upload status: pending (DB created, S3 pending), uploaded (complete), upload_failed (S3 failed)';
COMMENT ON COLUMN documents.idempotency_key IS '5-minute window key to prevent duplicate document generation';
COMMENT ON COLUMN documents.generated_by IS 'User ID who generated the document (NULL for uploaded documents)';
COMMENT ON COLUMN documents.generation_params IS 'Immutable parameters used to generate the document (for audit trail)';
COMMENT ON COLUMN documents.retention_until IS 'Retention period end date. Document cannot be soft-deleted before this date.';

COMMENT ON TRIGGER enforce_retention_period ON documents IS 'Prevents soft-deletion of documents before retention period expires';
COMMENT ON TRIGGER prevent_params_modification ON documents IS 'Prevents modification of generation_params after document creation';
COMMENT ON TRIGGER no_hard_deletes ON documents IS 'Enforces soft-delete pattern - all deletes must use deleted_at column';
