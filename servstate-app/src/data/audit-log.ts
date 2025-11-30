import {
  AuditLogEntry,
  AuditActionType,
  AuditActionCategory,
  getActionCategory,
} from '@/types/audit-log';

export const mockAuditLog: AuditLogEntry[] = [
  // Loan 1 - James Anderson - Active loan with good history
  {
    id: 'audit_1',
    loan_id: 'loan_1',
    action_type: 'loan_boarded',
    category: 'lifecycle',
    description: 'Loan boarded into servicing system',
    details: {
      original_principal: 350000,
      interest_rate: 0.065,
      term_months: 360,
      loan_type: 'Conventional',
    },
    performed_by: 'System',
    performed_at: '2022-06-01T09:00:00Z',
  },
  {
    id: 'audit_2',
    loan_id: 'loan_1',
    action_type: 'card_added',
    category: 'account',
    description: 'Payment card ending in 4242 added to account',
    details: { card_last_four: '4242', card_brand: 'visa' },
    performed_by: 'Admin User',
    performed_at: '2022-06-15T10:30:00Z',
  },
  {
    id: 'audit_3',
    loan_id: 'loan_1',
    action_type: 'payment_received',
    category: 'payment',
    description: 'Monthly payment of $2,762.24 received',
    details: {
      amount: 2762.24,
      principal: 497.20,
      interest: 1715.04,
      escrow: 550.0,
      method: 'ACH',
    },
    performed_by: 'System',
    performed_at: '2023-11-30T14:30:00Z',
    reference_id: 'txn_18',
  },
  {
    id: 'audit_4',
    loan_id: 'loan_1',
    action_type: 'escrow_analysis',
    category: 'escrow',
    description: 'Annual escrow analysis completed',
    details: {
      previous_monthly: 525.0,
      new_monthly: 550.0,
      shortage: 0,
      effective_date: '2024-01-01',
    },
    performed_by: 'System',
    performed_at: '2023-12-05T10:15:00Z',
  },
  {
    id: 'audit_5',
    loan_id: 'loan_1',
    action_type: 'tax_disbursement',
    category: 'escrow',
    description: 'Property tax disbursement to Springfield County',
    details: { amount: 1850.0, payee: 'Springfield County Tax Collector' },
    performed_by: 'System',
    performed_at: '2023-12-15T10:00:00Z',
  },
  {
    id: 'audit_6',
    loan_id: 'loan_1',
    action_type: 'statement_generated',
    category: 'document',
    description: 'December 2023 monthly statement generated',
    performed_by: 'System',
    performed_at: '2023-12-01T00:05:00Z',
  },
  {
    id: 'audit_7',
    loan_id: 'loan_1',
    action_type: 'email_sent',
    category: 'communication',
    description: 'Payment confirmation email sent',
    details: { template: 'payment_confirmation', recipient: 'j.anderson@example.com' },
    performed_by: 'System',
    performed_at: '2023-11-30T14:35:00Z',
  },
  {
    id: 'audit_8',
    loan_id: 'loan_1',
    action_type: 'card_added',
    category: 'account',
    description: 'Payment card ending in 8888 added to account',
    details: { card_last_four: '8888', card_brand: 'mastercard' },
    performed_by: 'Admin User',
    performed_at: '2023-09-20T14:15:00Z',
  },

  // Loan 2 - Michael Chen - Delinquent loan
  {
    id: 'audit_20',
    loan_id: 'loan_2',
    action_type: 'loan_boarded',
    category: 'lifecycle',
    description: 'Loan boarded into servicing system',
    details: {
      original_principal: 425000,
      interest_rate: 0.0575,
      term_months: 360,
      loan_type: 'FHA',
    },
    performed_by: 'System',
    performed_at: '2022-01-15T09:00:00Z',
  },
  {
    id: 'audit_21',
    loan_id: 'loan_2',
    action_type: 'payment_received',
    category: 'payment',
    description: 'Monthly payment of $2,950.75 received',
    details: { amount: 2950.75, method: 'ACH' },
    performed_by: 'System',
    performed_at: '2023-10-28T11:20:00Z',
    reference_id: 'txn_45',
  },
  {
    id: 'audit_22',
    loan_id: 'loan_2',
    action_type: 'status_change',
    category: 'internal',
    description: 'Loan status changed from Active to Delinquent',
    details: { previous_status: 'Active', new_status: 'Delinquent', days_past_due: 30 },
    performed_by: 'System',
    performed_at: '2023-12-15T00:05:00Z',
  },
  {
    id: 'audit_23',
    loan_id: 'loan_2',
    action_type: 'late_fee_assessed',
    category: 'payment',
    description: 'Late fee of $147.54 assessed (5% of payment)',
    details: { amount: 147.54, percentage: 5 },
    performed_by: 'System',
    performed_at: '2023-12-16T00:00:00Z',
  },
  {
    id: 'audit_24',
    loan_id: 'loan_2',
    action_type: 'call_outbound',
    category: 'communication',
    description: 'Collections call attempted - left voicemail',
    details: { duration: 45, outcome: 'voicemail', phone: '(555) 234-5678' },
    performed_by: 'Sarah Johnson',
    performed_at: '2023-12-18T14:30:00Z',
  },
  {
    id: 'audit_25',
    loan_id: 'loan_2',
    action_type: 'letter_sent',
    category: 'communication',
    description: 'First delinquency notice mailed',
    details: { template: 'delinquency_notice_30', tracking: 'USPS1234567890' },
    performed_by: 'System',
    performed_at: '2023-12-16T09:00:00Z',
  },
  {
    id: 'audit_26',
    loan_id: 'loan_2',
    action_type: 'call_outbound',
    category: 'communication',
    description: 'Collections call - spoke with borrower',
    details: {
      duration: 480,
      outcome: 'spoke',
      notes: 'Borrower stated temporary financial hardship due to job transition. Discussed payment plan options.',
    },
    performed_by: 'Sarah Johnson',
    performed_at: '2023-12-20T10:15:00Z',
  },
  {
    id: 'audit_27',
    loan_id: 'loan_2',
    action_type: 'payment_plan_created',
    category: 'collections',
    description: 'Payment plan established - 3 months',
    details: {
      monthly_amount: 3500.0,
      duration_months: 3,
      start_date: '2024-01-15',
      includes_past_due: true,
    },
    performed_by: 'Sarah Johnson',
    performed_at: '2023-12-20T10:45:00Z',
  },
  {
    id: 'audit_28',
    loan_id: 'loan_2',
    action_type: 'note_added',
    category: 'internal',
    description: 'Internal note added regarding payment plan',
    details: {
      note: 'Borrower cooperative. Recently started new job with higher salary. Payment plan should resolve delinquency by March 2024.',
    },
    performed_by: 'Sarah Johnson',
    performed_at: '2023-12-20T10:50:00Z',
  },
  {
    id: 'audit_29',
    loan_id: 'loan_2',
    action_type: 'task_created',
    category: 'internal',
    description: 'Follow-up task created for January payment',
    details: { due_date: '2024-01-16', assigned_to: 'Sarah Johnson' },
    performed_by: 'Sarah Johnson',
    performed_at: '2023-12-20T11:00:00Z',
  },

  // Loan 3 - Sarah Williams - Active loan with forbearance history
  {
    id: 'audit_40',
    loan_id: 'loan_3',
    action_type: 'loan_boarded',
    category: 'lifecycle',
    description: 'Loan boarded into servicing system',
    details: {
      original_principal: 520000,
      interest_rate: 0.055,
      term_months: 360,
      loan_type: 'VA',
    },
    performed_by: 'System',
    performed_at: '2021-09-01T09:00:00Z',
  },
  {
    id: 'audit_41',
    loan_id: 'loan_3',
    action_type: 'forbearance_start',
    category: 'lifecycle',
    description: 'COVID-19 forbearance plan initiated',
    details: { reason: 'COVID-19 hardship', duration_months: 6, end_date: '2022-06-01' },
    performed_by: 'Admin User',
    performed_at: '2021-12-01T14:00:00Z',
  },
  {
    id: 'audit_42',
    loan_id: 'loan_3',
    action_type: 'forbearance_end',
    category: 'lifecycle',
    description: 'Forbearance plan ended - borrower resumed payments',
    details: { deferred_amount: 18600.0 },
    performed_by: 'System',
    performed_at: '2022-06-01T00:00:00Z',
  },
  {
    id: 'audit_43',
    loan_id: 'loan_3',
    action_type: 'loan_modification',
    category: 'lifecycle',
    description: 'Loan modification completed - deferred amount added to principal',
    details: {
      modification_type: 'deferral',
      deferred_amount: 18600.0,
      new_principal: 515000.0,
    },
    performed_by: 'Admin User',
    performed_at: '2022-06-15T10:00:00Z',
  },
  {
    id: 'audit_44',
    loan_id: 'loan_3',
    action_type: 'insurance_updated',
    category: 'insurance',
    description: 'Homeowners insurance policy updated',
    details: {
      carrier: 'State Farm',
      policy_number: 'HO-789456123',
      coverage: 550000,
      expiry: '2024-09-01',
    },
    performed_by: 'System',
    performed_at: '2023-09-01T08:00:00Z',
  },
  {
    id: 'audit_45',
    loan_id: 'loan_3',
    action_type: 'document_uploaded',
    category: 'document',
    description: 'Proof of insurance uploaded by borrower',
    details: { document_type: 'insurance_declaration', file_name: 'insurance_2024.pdf' },
    performed_by: 'Sarah Williams (Borrower)',
    performed_at: '2023-12-20T13:00:00Z',
  },
  {
    id: 'audit_46',
    loan_id: 'loan_3',
    action_type: 'address_change',
    category: 'account',
    description: 'Mailing address updated',
    details: {
      previous: '456 Oak Avenue, Portland, OR 97201',
      new: '789 Pine Street, Portland, OR 97205',
    },
    performed_by: 'Admin User',
    performed_at: '2023-08-15T09:30:00Z',
  },

  // Loan 4 - Robert Martinez - Paid off loan
  {
    id: 'audit_60',
    loan_id: 'loan_4',
    action_type: 'loan_boarded',
    category: 'lifecycle',
    description: 'Loan boarded into servicing system',
    details: {
      original_principal: 195000,
      interest_rate: 0.0425,
      term_months: 180,
      loan_type: 'Conventional',
    },
    performed_by: 'System',
    performed_at: '2018-03-01T09:00:00Z',
  },
  {
    id: 'audit_61',
    loan_id: 'loan_4',
    action_type: 'payment_received',
    category: 'payment',
    description: 'Final payoff payment of $42,567.89 received',
    details: { amount: 42567.89, type: 'payoff', method: 'Wire Transfer' },
    performed_by: 'System',
    performed_at: '2023-11-15T11:00:00Z',
    reference_id: 'txn_payoff_4',
  },
  {
    id: 'audit_62',
    loan_id: 'loan_4',
    action_type: 'loan_paid_off',
    category: 'lifecycle',
    description: 'Loan paid in full - satisfaction recorded',
    details: {
      total_paid: 231456.78,
      payoff_date: '2023-11-15',
      early_payoff: true,
      months_early: 42,
    },
    performed_by: 'System',
    performed_at: '2023-11-15T11:05:00Z',
  },
  {
    id: 'audit_63',
    loan_id: 'loan_4',
    action_type: 'document_generated',
    category: 'document',
    description: 'Satisfaction of Mortgage document generated',
    details: { document_type: 'satisfaction_of_mortgage', recording_date: '2023-11-20' },
    performed_by: 'System',
    performed_at: '2023-11-15T11:10:00Z',
  },
  {
    id: 'audit_64',
    loan_id: 'loan_4',
    action_type: 'escrow_surplus',
    category: 'escrow',
    description: 'Escrow surplus refund check issued',
    details: { amount: 1234.56, check_number: '90123' },
    performed_by: 'System',
    performed_at: '2023-11-20T09:00:00Z',
  },

  // Loan 5 - Emily Thompson - Loan sold
  {
    id: 'audit_80',
    loan_id: 'loan_5',
    action_type: 'loan_boarded',
    category: 'lifecycle',
    description: 'Loan boarded into servicing system',
    details: {
      original_principal: 380000,
      interest_rate: 0.072,
      term_months: 360,
      loan_type: 'Jumbo',
    },
    performed_by: 'System',
    performed_at: '2023-01-15T09:00:00Z',
  },
  {
    id: 'audit_81',
    loan_id: 'loan_5',
    action_type: 'loan_sold',
    category: 'lifecycle',
    description: 'Loan sold to NewBank Mortgage LLC',
    details: {
      buyer: 'NewBank Mortgage LLC',
      sale_date: '2023-10-01',
      effective_date: '2023-11-01',
      servicing_retained: false,
    },
    performed_by: 'Admin User',
    performed_at: '2023-09-25T14:00:00Z',
  },
  {
    id: 'audit_82',
    loan_id: 'loan_5',
    action_type: 'loan_transferred',
    category: 'lifecycle',
    description: 'Servicing transferred to NewBank Mortgage LLC',
    details: {
      new_servicer: 'NewBank Mortgage LLC',
      new_loan_number: 'NB-2023-78945',
      effective_date: '2023-11-01',
    },
    performed_by: 'System',
    performed_at: '2023-11-01T00:00:00Z',
  },
  {
    id: 'audit_83',
    loan_id: 'loan_5',
    action_type: 'letter_sent',
    category: 'communication',
    description: 'Goodbye letter sent - servicing transfer notice',
    details: { template: 'servicing_transfer_notice', tracking: 'USPS9876543210' },
    performed_by: 'System',
    performed_at: '2023-10-15T09:00:00Z',
  },
];

// Helper functions
export function getAuditLogByLoanId(loanId: string): AuditLogEntry[] {
  return mockAuditLog
    .filter((entry) => entry.loan_id === loanId)
    .sort((a, b) => new Date(b.performed_at).getTime() - new Date(a.performed_at).getTime());
}

export function getAuditLogByType(
  loanId: string,
  actionType: AuditActionType
): AuditLogEntry[] {
  return getAuditLogByLoanId(loanId).filter((entry) => entry.action_type === actionType);
}

export function getAuditLogByCategory(
  loanId: string,
  category: AuditActionCategory
): AuditLogEntry[] {
  return getAuditLogByLoanId(loanId).filter((entry) => entry.category === category);
}

export function getAuditLogByDateRange(
  loanId: string,
  startDate: Date,
  endDate: Date
): AuditLogEntry[] {
  return getAuditLogByLoanId(loanId).filter((entry) => {
    const entryDate = new Date(entry.performed_at);
    return entryDate >= startDate && entryDate <= endDate;
  });
}

export function searchAuditLog(loanId: string, query: string): AuditLogEntry[] {
  const lowerQuery = query.toLowerCase();
  return getAuditLogByLoanId(loanId).filter(
    (entry) =>
      entry.description.toLowerCase().includes(lowerQuery) ||
      entry.performed_by.toLowerCase().includes(lowerQuery)
  );
}
