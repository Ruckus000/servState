-- Migration: 008_audit_log_constraints
-- Description: Normalize audit log data and add constraints for valid action types and categories
-- Date: 2025-12-08

-- Step 1: Normalize historical data (lowercase and snake_case)
-- Normalize categories
UPDATE audit_log SET category = 'security' WHERE UPPER(category) = 'SECURITY';
UPDATE audit_log SET category = 'internal' WHERE UPPER(category) = 'SETTINGS' OR category = 'documentation';
UPDATE audit_log SET category = 'lifecycle' WHERE category = 'loan';
UPDATE audit_log SET category = LOWER(category) WHERE category != LOWER(category);

-- Normalize action types (uppercase to snake_case)
UPDATE audit_log SET action_type = 'login_success' WHERE action_type = 'LOGIN_SUCCESS';
UPDATE audit_log SET action_type = 'login_failed' WHERE action_type = 'LOGIN_FAILED';
UPDATE audit_log SET action_type = 'logout' WHERE action_type = 'LOGOUT';
UPDATE audit_log SET action_type = 'password_reset_requested' WHERE action_type = 'PASSWORD_RESET_REQUESTED';
UPDATE audit_log SET action_type = 'password_reset_completed' WHERE action_type = 'PASSWORD_RESET_COMPLETED';

-- Step 2: Add CHECK constraint for valid categories
ALTER TABLE audit_log
ADD CONSTRAINT audit_log_category_check
CHECK (category IN (
  'payment',
  'account',
  'escrow',
  'communication',
  'document',
  'lifecycle',
  'compliance',
  'insurance',
  'collections',
  'internal',
  'security'
));

-- Step 3: Add CHECK constraint for valid action types
-- Note: This is a comprehensive list that can be extended via ALTER if needed
ALTER TABLE audit_log
ADD CONSTRAINT audit_log_action_type_check
CHECK (action_type IN (
  -- Payment actions
  'payment_received', 'payment_phone', 'payment_reversed', 'payment_nsf',
  'late_fee_assessed', 'late_fee_waived',
  -- Account changes
  'name_change', 'address_change', 'phone_change', 'email_change',
  'bank_account_added', 'bank_account_removed', 'card_added', 'card_removed',
  -- Escrow actions
  'escrow_analysis', 'escrow_disbursement', 'escrow_shortage', 'escrow_surplus',
  'tax_disbursement', 'insurance_disbursement',
  -- Communication
  'call_inbound', 'call_outbound', 'letter_sent', 'email_sent', 'sms_sent', 'message_sent',
  -- Documents
  'document_uploaded', 'document_requested', 'document_generated', 'statement_generated',
  'document_upload_initiated', 'document_upload_completed', 'document_accessed',
  -- Loan lifecycle
  'loan_boarded', 'loan_modification', 'forbearance_start', 'forbearance_end',
  'loan_paid_off', 'loan_sold', 'loan_transferred', 'interest_rate_change', 'loan_updated',
  -- Compliance/Legal
  'bankruptcy_filed', 'bankruptcy_discharged', 'foreclosure_initiated', 'foreclosure_cancelled',
  -- Insurance
  'insurance_lapse', 'insurance_force_placed', 'insurance_updated',
  -- Collections
  'payment_plan_created', 'payment_plan_completed', 'payment_plan_cancelled', 'collections_assigned',
  -- Internal
  'note_added', 'note_created', 'task_created', 'task_completed',
  'task_status_changed', 'task_assigned', 'task_updated', 'status_change',
  'correspondence_logged',
  -- Security/Auth
  'login_success', 'login_failed', 'logout', 'password_reset_requested', 'password_reset_completed',
  -- Admin
  'company_settings_updated',
  -- Transactions
  'transaction_created'
));

-- Step 4: Add additional indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_audit_log_action_type ON audit_log(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_log_category ON audit_log(category);
CREATE INDEX IF NOT EXISTS idx_audit_log_loan_id_performed_at ON audit_log(loan_id, performed_at DESC);

-- Step 5: Add ip_address column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_log' AND column_name = 'ip_address'
  ) THEN
    ALTER TABLE audit_log ADD COLUMN ip_address VARCHAR(45);
  END IF;
END $$;

-- Add comment for documentation
COMMENT ON TABLE audit_log IS 'Immutable audit trail for compliance. Records cannot be modified or deleted. Action types and categories are validated via CHECK constraints.';
