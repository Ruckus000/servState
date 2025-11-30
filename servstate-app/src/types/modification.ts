export type ModificationType =
  | 'payment_plan'
  | 'contact_update'
  | 'autopay_setup'
  | 'forbearance'
  | 'rate_change'
  | 'term_extension';

export type ModificationStatus = 'pending' | 'active' | 'completed' | 'cancelled' | 'rejected';

export interface PaymentPlanDetails {
  reason: string;
  planType: string;
  duration: number;
  monthlyAmount: number;
  totalArrearage: number;
  catchUpAmount: number;
}

export interface ContactUpdateDetails {
  field: 'email' | 'phone' | 'address';
  oldValue: string;
  newValue: string;
  verified: boolean;
}

export interface AutopaySetupDetails {
  bankName: string;
  accountType: 'Checking' | 'Savings';
  paymentDay: number;
  amount: number;
}

export interface ForbearanceDetails {
  reason: string;
  duration: number;
  monthlyReduction: number;
  startDate: string;
  endDate: string;
}

export interface RateChangeDetails {
  oldRate: number;
  newRate: number;
  reason: string;
  effectiveDate: string;
}

export interface TermExtensionDetails {
  originalTerm: number;
  newTerm: number;
  reason: string;
}

export type ModificationDetails =
  | PaymentPlanDetails
  | ContactUpdateDetails
  | AutopaySetupDetails
  | ForbearanceDetails
  | RateChangeDetails
  | TermExtensionDetails;

export interface Modification {
  id: string;
  loan_id: string;
  type: ModificationType;
  status: ModificationStatus;
  created_by: string;
  created_date: string;
  effective_date: string;
  details: ModificationDetails;
}
