export type TransactionType = 'Payment' | 'Escrow Disbursement' | 'Late Fee' | 'NSF Fee' | 'Adjustment' | 'Refund';

export type TransactionStatus = 'completed' | 'pending' | 'failed' | 'reversed';

export interface PaymentBreakdown {
  principal: number;
  interest: number;
  escrow: number;
}

export interface Transaction {
  id: string;
  loan_id: string;
  date: string;
  type: TransactionType;
  amount: number;
  breakdown?: PaymentBreakdown;
  status: TransactionStatus;
  description?: string;
  reference_number?: string;
}
