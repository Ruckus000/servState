/**
 * Company Settings Types
 * Database model and application configuration shapes
 */

/**
 * Database row shape for company_settings table
 */
export interface CompanySettings {
  id: string;
  company_name: string;
  company_tagline: string | null;
  contact_email: string;
  contact_phone: string;
  wire_bank_name: string | null;
  wire_routing_number: string | null;
  wire_account_number: string | null;
  wire_account_name: string | null;
  fee_recording: number;
  fee_payoff_processing: number;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Application configuration shape used by existing code
 * Transformed from database row for convenience
 */
export interface CompanyConfig {
  name: string;
  tagline: string;
  email: string;
  phone: string;
  wire: {
    bankName: string;
    routingNumber: string;
    accountNumber: string;
    accountName: string;
  };
  fees: {
    recording: number;
    payoffProcessing: number;
  };
}

/**
 * Update payload for company settings API
 */
export interface CompanySettingsUpdate {
  company_name: string;
  company_tagline?: string | null;
  contact_email: string;
  contact_phone: string;
  wire_bank_name?: string | null;
  wire_routing_number?: string | null;
  wire_account_number?: string | null;
  wire_account_name?: string | null;
  fee_recording: number;
  fee_payoff_processing: number;
}
