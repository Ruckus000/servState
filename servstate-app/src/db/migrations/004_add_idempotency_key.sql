-- Migration: Add idempotency_key column to transactions table
-- Purpose: Prevent duplicate transactions by requiring unique idempotency keys
-- Run this migration in your Neon database console

-- Add idempotency_key column with unique constraint
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(255) UNIQUE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_transactions_idempotency_key ON transactions(idempotency_key);

-- Note: Existing transactions will have NULL idempotency_key
-- This is acceptable as new transactions will require it
