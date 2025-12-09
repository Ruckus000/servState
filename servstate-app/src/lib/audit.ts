/**
 * Centralized audit logging helper with type safety, validation, and normalization
 */

import { sql } from './db';
import {
  AuditActionType,
  AuditActionCategory,
  getActionCategory,
} from '@/types/audit-log';

/**
 * Legacy category normalization map
 * Maps old/invalid category values to valid ones
 */
const LEGACY_CATEGORY_MAP: Record<string, AuditActionCategory> = {
  SECURITY: 'security',
  SETTINGS: 'internal',
  documentation: 'internal',
  loan: 'lifecycle',
};

/**
 * Legacy action type normalization map
 * Maps old/invalid action types to valid ones
 */
const LEGACY_ACTION_TYPE_MAP: Record<string, AuditActionType> = {
  LOGIN_SUCCESS: 'login_success',
  LOGIN_FAILED: 'login_failed',
  LOGOUT: 'logout',
  PASSWORD_RESET_REQUESTED: 'password_reset_requested',
};

/**
 * Set of valid action types for runtime validation
 */
const VALID_ACTION_TYPES = new Set<string>([
  // Payment actions
  'payment_received', 'payment_phone', 'payment_reversed', 'payment_nsf',
  'late_fee_assessed', 'late_fee_waived',
  // Account changes
  'name_change', 'address_change', 'phone_change', 'email_change',
  'bank_account_added', 'bank_account_removed', 'card_added', 'card_removed',
  // Escrow actions
  'escrow_analysis', 'escrow_disbursement', 'escrow_shortage', 'escrow_surplus',
  'tax_disbursement', 'insurance_disbursement',
  // Communication
  'call_inbound', 'call_outbound', 'letter_sent', 'email_sent', 'sms_sent', 'message_sent',
  // Documents
  'document_uploaded', 'document_requested', 'document_generated', 'statement_generated',
  'document_upload_initiated', 'document_upload_completed', 'document_accessed',
  // Loan lifecycle
  'loan_boarded', 'loan_modification', 'forbearance_start', 'forbearance_end',
  'loan_paid_off', 'loan_sold', 'loan_transferred', 'interest_rate_change', 'loan_updated',
  // Compliance/Legal
  'bankruptcy_filed', 'bankruptcy_discharged', 'foreclosure_initiated', 'foreclosure_cancelled',
  // Insurance
  'insurance_lapse', 'insurance_force_placed', 'insurance_updated',
  // Collections
  'payment_plan_created', 'payment_plan_completed', 'payment_plan_cancelled', 'collections_assigned',
  // Internal
  'note_added', 'note_created', 'task_created', 'task_completed',
  'task_status_changed', 'task_assigned', 'task_updated', 'status_change',
  // Security/Auth
  'login_success', 'login_failed', 'logout', 'password_reset_requested', 'password_reset_completed',
  // Admin
  'company_settings_updated',
  // Extended
  'transaction_created',
]);

/**
 * Set of valid categories for runtime validation
 */
const VALID_CATEGORIES = new Set<string>([
  'payment', 'account', 'escrow', 'communication', 'document',
  'lifecycle', 'compliance', 'insurance', 'collections', 'internal', 'security',
]);

/**
 * Fields to mask for PII protection in details
 */
const PII_FIELDS = new Set([
  'ssn', 'social_security', 'tax_id', 'ein',
  'password', 'password_hash', 'secret', 'token',
  'credit_card', 'card_number', 'cvv', 'cvc',
  'account_number', 'routing_number',
]);

/**
 * Mask PII fields in a details object
 */
function maskPiiFields(details: Record<string, unknown>): Record<string, unknown> {
  const masked: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(details)) {
    const lowerKey = key.toLowerCase();
    if (PII_FIELDS.has(lowerKey) || lowerKey.includes('password') || lowerKey.includes('secret')) {
      masked[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      masked[key] = maskPiiFields(value as Record<string, unknown>);
    } else {
      masked[key] = value;
    }
  }

  return masked;
}

/**
 * Normalize action type (handle legacy uppercase values)
 */
function normalizeActionType(actionType: string): AuditActionType {
  // Check legacy map first
  if (actionType in LEGACY_ACTION_TYPE_MAP) {
    return LEGACY_ACTION_TYPE_MAP[actionType];
  }

  // Convert to lowercase snake_case if not already
  const normalized = actionType.toLowerCase().replace(/-/g, '_');

  if (!VALID_ACTION_TYPES.has(normalized)) {
    console.warn(`[Audit] Unknown action type: ${actionType}, normalized to: ${normalized}`);
  }

  return normalized as AuditActionType;
}

/**
 * Normalize category (handle legacy values)
 */
function normalizeCategory(category: string): AuditActionCategory {
  // Check legacy map first
  if (category in LEGACY_CATEGORY_MAP) {
    return LEGACY_CATEGORY_MAP[category];
  }

  // Convert to lowercase
  const normalized = category.toLowerCase();

  if (!VALID_CATEGORIES.has(normalized)) {
    console.warn(`[Audit] Unknown category: ${category}, normalized to: ${normalized}`);
  }

  return normalized as AuditActionCategory;
}

/**
 * Parameters for logging an audit entry
 */
export interface LogAuditParams {
  /** Loan ID (null for non-loan-specific actions like auth events) */
  loanId: string | null;
  /** Action type (validated and normalized) */
  actionType: AuditActionType | string;
  /** Category (auto-derived from actionType if omitted) */
  category?: AuditActionCategory | string;
  /** Human-readable description */
  description: string;
  /** User who performed the action */
  performedBy: string;
  /** Additional details (PII will be masked) */
  details?: Record<string, unknown>;
  /** Reference ID for linking to related entities */
  referenceId?: string;
  /** Optional request ID for tracing */
  requestId?: string;
  /** Optional IP address */
  ipAddress?: string;
}

/**
 * Log an audit entry with validation, normalization, and PII masking
 *
 * @example
 * // Basic usage
 * await logAudit({
 *   loanId: '123',
 *   actionType: 'loan_updated',
 *   description: 'Updated loan interest rate',
 *   performedBy: 'John Doe',
 *   details: { changed_fields: [{ field: 'interest_rate', old: 0.065, new: 0.055 }] }
 * });
 */
export async function logAudit(params: LogAuditParams): Promise<void> {
  try {
    // Normalize action type
    const normalizedActionType = normalizeActionType(params.actionType);

    // Derive or normalize category
    let normalizedCategory: AuditActionCategory;
    if (params.category) {
      normalizedCategory = normalizeCategory(params.category);
    } else {
      // Auto-derive from action type
      normalizedCategory = getActionCategory(normalizedActionType);
    }

    // Mask PII in details
    const maskedDetails = params.details ? maskPiiFields(params.details) : null;

    // Add request ID and IP to details if provided
    const enrichedDetails = maskedDetails ? {
      ...maskedDetails,
      ...(params.requestId && { _request_id: params.requestId }),
    } : params.requestId ? { _request_id: params.requestId } : null;

    await sql`
      INSERT INTO audit_log (
        loan_id,
        action_type,
        category,
        description,
        performed_by,
        details,
        reference_id,
        ip_address
      ) VALUES (
        ${params.loanId},
        ${normalizedActionType},
        ${normalizedCategory},
        ${params.description},
        ${params.performedBy},
        ${enrichedDetails ? JSON.stringify(enrichedDetails) : null},
        ${params.referenceId || null},
        ${params.ipAddress || null}
      )
    `;
  } catch (error) {
    console.error('[Audit] Failed to create audit log entry:', error);
    // Don't throw - audit logging failures shouldn't break the main operation
  }
}

/**
 * Helper to compute changed fields for loan updates
 */
export function computeChangedFields<T extends Record<string, unknown>>(
  oldData: T,
  newData: Partial<T>,
  fieldsToCompare?: (keyof T)[]
): Array<{ field: string; old: unknown; new: unknown }> {
  const changes: Array<{ field: string; old: unknown; new: unknown }> = [];

  const keys = fieldsToCompare || (Object.keys(newData) as (keyof T)[]);

  for (const key of keys) {
    if (key in newData) {
      const oldValue = oldData[key];
      const newValue = newData[key];

      // Compare values (handle null/undefined and type coercion)
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes.push({
          field: String(key),
          old: oldValue,
          new: newValue,
        });
      }
    }
  }

  return changes;
}

/**
 * Legacy compatibility: re-export for gradual migration
 * @deprecated Use logAudit instead
 */
export const createAuditLogEntry = logAudit;
