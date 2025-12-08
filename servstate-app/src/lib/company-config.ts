/**
 * Company Configuration
 *
 * Fetches company settings from database with in-memory caching.
 * Used for PDF generation, emails, and other company-branded content.
 */

import { sql } from '@/lib/db';
import type { CompanyConfig, CompanySettings } from '@/types/company-settings';

// In-memory cache with TTL
let cachedConfig: CompanyConfig | null = null;
let cacheExpiry: number = 0;
const CACHE_TTL_MS = 60000; // 1 minute

/**
 * Default configuration (used if no database row exists)
 */
function getDefaultConfig(): CompanyConfig {
  return {
    name: 'ServState',
    tagline: 'Mortgage Servicing Solutions',
    email: 'support@servstate.com',
    phone: '(800) 555-0100',
    wire: {
      bankName: '',
      routingNumber: '',
      accountNumber: '',
      accountName: '',
    },
    fees: {
      recording: 75.0,
      payoffProcessing: 35.0,
    },
  };
}

/**
 * Fetch company configuration from database
 * Returns cached config if still valid, otherwise fetches from database
 */
export async function getCompanyConfig(): Promise<CompanyConfig> {
  // Return cached if valid
  if (cachedConfig && Date.now() < cacheExpiry) {
    return cachedConfig;
  }

  // Fetch from database
  const result = await sql`SELECT * FROM company_settings LIMIT 1`;

  if (result.length === 0) {
    return getDefaultConfig();
  }

  const settings = result[0] as unknown as CompanySettings;

  cachedConfig = {
    name: settings.company_name,
    tagline: settings.company_tagline || 'Mortgage Servicing Solutions',
    email: settings.contact_email,
    phone: settings.contact_phone,
    wire: {
      bankName: settings.wire_bank_name || '',
      routingNumber: settings.wire_routing_number || '',
      accountNumber: settings.wire_account_number || '',
      accountName: settings.wire_account_name || '',
    },
    fees: {
      recording: Number(settings.fee_recording),
      payoffProcessing: Number(settings.fee_payoff_processing),
    },
  };

  cacheExpiry = Date.now() + CACHE_TTL_MS;
  return cachedConfig;
}

/**
 * Invalidate the config cache
 * Call this after updating company settings
 */
export function invalidateConfigCache(): void {
  cachedConfig = null;
  cacheExpiry = 0;
}

/**
 * Check if wire instructions are fully configured
 * Use this before generating payoff statements
 */
export function isWireConfigured(config: CompanyConfig): boolean {
  return Boolean(
    config.wire.bankName &&
      config.wire.routingNumber &&
      config.wire.accountNumber &&
      config.wire.accountName
  );
}
