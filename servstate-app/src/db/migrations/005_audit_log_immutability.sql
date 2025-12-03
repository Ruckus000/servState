-- Migration: 005_audit_log_immutability
-- Description: Prevent updates and deletes on audit_log table for compliance
-- Date: 2025-12-03

-- Create function to prevent audit log modifications
CREATE OR REPLACE FUNCTION prevent_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Audit log records cannot be modified or deleted';
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce immutability on UPDATE
CREATE TRIGGER audit_log_prevent_update
  BEFORE UPDATE ON audit_log
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_modification();

-- Create trigger to enforce immutability on DELETE
CREATE TRIGGER audit_log_prevent_delete
  BEFORE DELETE ON audit_log
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_modification();

-- Add comment for documentation
COMMENT ON TABLE audit_log IS 'Immutable audit trail for compliance. Records cannot be modified or deleted.';
