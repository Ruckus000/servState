-- Company Settings Table
-- Dependencies: update_updated_at_column() function from schema.sql
-- Purpose: Single-row tenant configuration for company info, wire instructions, and fees

CREATE TABLE IF NOT EXISTS company_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Company identity
  company_name VARCHAR(255) NOT NULL DEFAULT 'ServState',
  company_tagline VARCHAR(255) DEFAULT 'Mortgage Servicing Solutions',

  -- Contact information
  contact_email VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(50) NOT NULL,

  -- Wire transfer instructions (sensitive - admin/servicer only)
  wire_bank_name VARCHAR(255),
  wire_routing_number VARCHAR(20),
  wire_account_number VARCHAR(50),
  wire_account_name VARCHAR(255),

  -- Configurable fees
  fee_recording NUMERIC(10, 2) DEFAULT 75.00,
  fee_payoff_processing NUMERIC(10, 2) DEFAULT 35.00,

  -- Audit fields
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Singleton constraint: ensures only one row can exist
CREATE UNIQUE INDEX IF NOT EXISTS company_settings_singleton
  ON company_settings ((true));

-- Auto-update timestamp trigger (uses existing function from schema.sql)
CREATE TRIGGER update_company_settings_updated_at
  BEFORE UPDATE ON company_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default row with placeholder values
INSERT INTO company_settings (
  company_name,
  company_tagline,
  contact_email,
  contact_phone
) VALUES (
  'ServState',
  'Mortgage Servicing Solutions',
  'support@servstate.com',
  '(800) 555-0100'
) ON CONFLICT DO NOTHING;
