export type AuditActionType =
  // Payment actions
  | 'payment_received'
  | 'payment_phone'
  | 'payment_reversed'
  | 'payment_nsf'
  | 'late_fee_assessed'
  | 'late_fee_waived'
  // Account changes
  | 'name_change'
  | 'address_change'
  | 'phone_change'
  | 'email_change'
  | 'bank_account_added'
  | 'bank_account_removed'
  | 'card_added'
  | 'card_removed'
  // Escrow actions
  | 'escrow_analysis'
  | 'escrow_disbursement'
  | 'escrow_shortage'
  | 'escrow_surplus'
  | 'tax_disbursement'
  | 'insurance_disbursement'
  // Communication
  | 'call_inbound'
  | 'call_outbound'
  | 'letter_sent'
  | 'email_sent'
  | 'sms_sent'
  // Documents
  | 'document_uploaded'
  | 'document_requested'
  | 'document_generated'
  | 'statement_generated'
  // Loan lifecycle
  | 'loan_boarded'
  | 'loan_modification'
  | 'forbearance_start'
  | 'forbearance_end'
  | 'loan_paid_off'
  | 'loan_sold'
  | 'loan_transferred'
  | 'interest_rate_change'
  // Compliance/Legal
  | 'bankruptcy_filed'
  | 'bankruptcy_discharged'
  | 'foreclosure_initiated'
  | 'foreclosure_cancelled'
  // Insurance
  | 'insurance_lapse'
  | 'insurance_force_placed'
  | 'insurance_updated'
  // Collections
  | 'payment_plan_created'
  | 'payment_plan_completed'
  | 'payment_plan_cancelled'
  | 'collections_assigned'
  // Internal
  | 'note_added'
  | 'task_created'
  | 'task_completed'
  | 'status_change';

export type AuditActionCategory =
  | 'payment'
  | 'account'
  | 'escrow'
  | 'communication'
  | 'document'
  | 'lifecycle'
  | 'compliance'
  | 'insurance'
  | 'collections'
  | 'internal';

export interface AuditLogEntry {
  id: string;
  loan_id: string;
  action_type: AuditActionType;
  category: AuditActionCategory;
  description: string;
  details?: Record<string, unknown>;
  performed_by: string;
  performed_at: string;
  ip_address?: string;
  reference_id?: string;
}

// Helper to get category from action type
export function getActionCategory(actionType: AuditActionType): AuditActionCategory {
  const categoryMap: Record<AuditActionType, AuditActionCategory> = {
    payment_received: 'payment',
    payment_phone: 'payment',
    payment_reversed: 'payment',
    payment_nsf: 'payment',
    late_fee_assessed: 'payment',
    late_fee_waived: 'payment',
    name_change: 'account',
    address_change: 'account',
    phone_change: 'account',
    email_change: 'account',
    bank_account_added: 'account',
    bank_account_removed: 'account',
    card_added: 'account',
    card_removed: 'account',
    escrow_analysis: 'escrow',
    escrow_disbursement: 'escrow',
    escrow_shortage: 'escrow',
    escrow_surplus: 'escrow',
    tax_disbursement: 'escrow',
    insurance_disbursement: 'escrow',
    call_inbound: 'communication',
    call_outbound: 'communication',
    letter_sent: 'communication',
    email_sent: 'communication',
    sms_sent: 'communication',
    document_uploaded: 'document',
    document_requested: 'document',
    document_generated: 'document',
    statement_generated: 'document',
    loan_boarded: 'lifecycle',
    loan_modification: 'lifecycle',
    forbearance_start: 'lifecycle',
    forbearance_end: 'lifecycle',
    loan_paid_off: 'lifecycle',
    loan_sold: 'lifecycle',
    loan_transferred: 'lifecycle',
    interest_rate_change: 'lifecycle',
    bankruptcy_filed: 'compliance',
    bankruptcy_discharged: 'compliance',
    foreclosure_initiated: 'compliance',
    foreclosure_cancelled: 'compliance',
    insurance_lapse: 'insurance',
    insurance_force_placed: 'insurance',
    insurance_updated: 'insurance',
    payment_plan_created: 'collections',
    payment_plan_completed: 'collections',
    payment_plan_cancelled: 'collections',
    collections_assigned: 'collections',
    note_added: 'internal',
    task_created: 'internal',
    task_completed: 'internal',
    status_change: 'internal',
  };
  return categoryMap[actionType];
}

// Human-readable labels
export const actionTypeLabels: Record<AuditActionType, string> = {
  payment_received: 'Payment Received',
  payment_phone: 'Payment (Phone)',
  payment_reversed: 'Payment Reversed',
  payment_nsf: 'NSF Payment',
  late_fee_assessed: 'Late Fee Assessed',
  late_fee_waived: 'Late Fee Waived',
  name_change: 'Name Change',
  address_change: 'Address Change',
  phone_change: 'Phone Change',
  email_change: 'Email Change',
  bank_account_added: 'Bank Account Added',
  bank_account_removed: 'Bank Account Removed',
  card_added: 'Card Added',
  card_removed: 'Card Removed',
  escrow_analysis: 'Escrow Analysis',
  escrow_disbursement: 'Escrow Disbursement',
  escrow_shortage: 'Escrow Shortage',
  escrow_surplus: 'Escrow Surplus',
  tax_disbursement: 'Tax Disbursement',
  insurance_disbursement: 'Insurance Disbursement',
  call_inbound: 'Inbound Call',
  call_outbound: 'Outbound Call',
  letter_sent: 'Letter Sent',
  email_sent: 'Email Sent',
  sms_sent: 'SMS Sent',
  document_uploaded: 'Document Uploaded',
  document_requested: 'Document Requested',
  document_generated: 'Document Generated',
  statement_generated: 'Statement Generated',
  loan_boarded: 'Loan Boarded',
  loan_modification: 'Loan Modification',
  forbearance_start: 'Forbearance Started',
  forbearance_end: 'Forbearance Ended',
  loan_paid_off: 'Loan Paid Off',
  loan_sold: 'Loan Sold',
  loan_transferred: 'Loan Transferred',
  interest_rate_change: 'Interest Rate Change',
  bankruptcy_filed: 'Bankruptcy Filed',
  bankruptcy_discharged: 'Bankruptcy Discharged',
  foreclosure_initiated: 'Foreclosure Initiated',
  foreclosure_cancelled: 'Foreclosure Cancelled',
  insurance_lapse: 'Insurance Lapse',
  insurance_force_placed: 'Insurance Force Placed',
  insurance_updated: 'Insurance Updated',
  payment_plan_created: 'Payment Plan Created',
  payment_plan_completed: 'Payment Plan Completed',
  payment_plan_cancelled: 'Payment Plan Cancelled',
  collections_assigned: 'Collections Assigned',
  note_added: 'Note Added',
  task_created: 'Task Created',
  task_completed: 'Task Completed',
  status_change: 'Status Change',
};

export const categoryLabels: Record<AuditActionCategory, string> = {
  payment: 'Payments',
  account: 'Account Changes',
  escrow: 'Escrow',
  communication: 'Communications',
  document: 'Documents',
  lifecycle: 'Loan Lifecycle',
  compliance: 'Compliance',
  insurance: 'Insurance',
  collections: 'Collections',
  internal: 'Internal',
};
