export type LoanType = 'Conventional' | 'FHA' | 'VA' | 'USDA' | 'Jumbo';

export type LoanStatus = 'Active' | 'Delinquent' | 'Forbearance' | 'Paid Off' | 'Default';

export interface Loan {
  id: string;
  borrower_name: string;
  address: string;
  loan_number: string;
  loan_type: LoanType;
  original_principal: number;
  current_principal: number;
  interest_rate: number;
  monthly_pi: number;
  monthly_escrow: number;
  next_due_date: string;
  escrow_balance: number;
  status: LoanStatus;
  days_past_due?: number;
  email: string;
  phone: string;
  origination_date: string;
  term_months: number;
  payments_made: number;
}

export interface AmortizationEntry {
  month: number;
  date: string;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}
