-- Migration: 006_soft_delete
-- Description: Add soft delete columns for financial data retention compliance
-- Date: 2025-12-03

-- Add deleted_at column to transactions table
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Add deleted_at column to documents table
ALTER TABLE documents ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Create index for efficient filtering of active records
CREATE INDEX IF NOT EXISTS idx_transactions_deleted_at ON transactions(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_documents_deleted_at ON documents(deleted_at) WHERE deleted_at IS NULL;

-- Create view for active transactions (non-deleted)
CREATE OR REPLACE VIEW active_transactions AS
  SELECT * FROM transactions WHERE deleted_at IS NULL;

-- Create view for active documents (non-deleted)
CREATE OR REPLACE VIEW active_documents AS
  SELECT * FROM documents WHERE deleted_at IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN transactions.deleted_at IS 'Soft delete timestamp. NULL means active, non-NULL means deleted.';
COMMENT ON COLUMN documents.deleted_at IS 'Soft delete timestamp. NULL means active, non-NULL means deleted.';
COMMENT ON VIEW active_transactions IS 'View of non-deleted transactions for standard queries.';
COMMENT ON VIEW active_documents IS 'View of non-deleted documents for standard queries.';
