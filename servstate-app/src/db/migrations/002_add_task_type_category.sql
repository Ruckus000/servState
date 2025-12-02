-- Migration: Add type and category columns to tasks table
-- Created: 2025-12-01
-- Description: Adds task type and category fields as required columns with CHECK constraints

ALTER TABLE tasks
ADD COLUMN type VARCHAR(50) NOT NULL DEFAULT 'general_task',
ADD COLUMN category VARCHAR(50) NOT NULL DEFAULT 'General';

-- Add constraint for valid task types
ALTER TABLE tasks
ADD CONSTRAINT tasks_type_check
CHECK (type IN (
  'collections_call',
  'document_request',
  'escrow_analysis',
  'statement_generation',
  'payment_plan',
  'property_inspection',
  'tax_payment',
  'insurance_verification',
  'customer_inquiry',
  'autopay_setup',
  'compliance_review',
  'insurance_claim',
  'general_task'
));

-- Add constraint for valid task categories
ALTER TABLE tasks
ADD CONSTRAINT tasks_category_check
CHECK (category IN (
  'Collections',
  'Loss Mitigation',
  'Escrow Management',
  'Reporting',
  'Property Management',
  'Insurance',
  'Customer Service',
  'Payment Processing',
  'Compliance',
  'General'
));
