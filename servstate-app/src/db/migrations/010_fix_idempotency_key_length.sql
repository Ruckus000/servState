-- Migration: 010_fix_idempotency_key_length
-- Fix: Increase idempotency_key column from VARCHAR(100) to VARCHAR(255)
-- Reason: Generated keys can exceed 100 chars with UUID + docType + params + bucket
-- Matches transactions table pattern from migration 004

ALTER TABLE documents ALTER COLUMN idempotency_key TYPE VARCHAR(255);
