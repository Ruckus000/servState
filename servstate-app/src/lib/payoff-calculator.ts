import type { Loan } from '@/types/loan';
import type { PayoffData } from '@/components/pdf/payoff-statement';

/**
 * Fee configuration for payoff calculations
 */
export interface PayoffFees {
  recording: number;
  payoffProcessing: number;
}

/**
 * Calculate the number of days between two dates
 */
function daysBetween(startDate: Date, endDate: Date): number {
  const oneDay = 24 * 60 * 60 * 1000; // hours * minutes * seconds * milliseconds
  const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
  return Math.round((end.getTime() - start.getTime()) / oneDay);
}

/**
 * Calculate the payoff amount for a loan
 *
 * This implements a simplified payoff calculation:
 * - Accrued interest from today through the good-through date
 * - Escrow credit if borrower has a positive balance
 * - Configurable fees (recording fee, payoff processing fee)
 *
 * Note: In a production system, this would need to account for:
 * - Last payment date and any accrued interest from that date
 * - Any late fees or other outstanding charges
 * - Suspense accounts and unapplied funds
 * - State-specific regulations on payoff quotes
 *
 * @param loan - The loan to calculate payoff for
 * @param goodThroughDate - The date through which the payoff is valid (YYYY-MM-DD)
 * @param fees - Fee configuration from company settings
 */
export function calculatePayoff(
  loan: Loan,
  goodThroughDate: string,
  fees: PayoffFees
): PayoffData {
  const today = new Date();
  const goodThrough = new Date(goodThroughDate);

  // Calculate days from today to good-through date
  const days = daysBetween(today, goodThrough);

  // Daily interest rate = annual rate / 365
  // Note: Some lenders use 360-day year (banker's year), adjust if needed
  const dailyRate = loan.interest_rate / 365;

  // Per diem interest amount
  const perDiem = loan.current_principal * dailyRate;

  // Accrued interest = principal × daily rate × number of days
  // We add 1 to include the good-through date itself
  const accruedInterest = perDiem * Math.max(days, 0);

  // Escrow credit - return to borrower if they have a positive balance
  // Negative amount because it reduces the payoff
  const escrowCredit = loan.escrow_balance > 0 ? -loan.escrow_balance : 0;

  // Get fees from parameter
  const recordingFee = fees.recording;
  const payoffFee = fees.payoffProcessing;

  // Calculate total payoff amount
  const totalPayoff =
    loan.current_principal +
    accruedInterest +
    escrowCredit +
    recordingFee +
    payoffFee;

  return {
    principalBalance: loan.current_principal,
    accruedInterest: Math.round(accruedInterest * 100) / 100, // Round to cents
    escrowCredit,
    recordingFee,
    payoffFee,
    totalPayoff: Math.round(totalPayoff * 100) / 100, // Round to cents
    perDiem: Math.round(perDiem * 100) / 100, // Round to cents
    goodThroughDate,
  };
}

/**
 * Calculate totals from a list of transactions
 */
export function calculateTransactionTotals(transactions: Array<{
  amount: number;
  breakdown?: {
    principal: number;
    interest: number;
    escrow: number;
  };
}>) {
  let totalPaid = 0;
  let principalPaid = 0;
  let interestPaid = 0;
  let escrowPaid = 0;

  for (const tx of transactions) {
    // Only count positive amounts (payments, not fees or adjustments)
    if (tx.amount > 0) {
      totalPaid += tx.amount;
    }

    if (tx.breakdown) {
      principalPaid += tx.breakdown.principal || 0;
      interestPaid += tx.breakdown.interest || 0;
      escrowPaid += tx.breakdown.escrow || 0;
    }
  }

  return {
    totalPaid: Math.round(totalPaid * 100) / 100,
    principalPaid: Math.round(principalPaid * 100) / 100,
    interestPaid: Math.round(interestPaid * 100) / 100,
    escrowPaid: Math.round(escrowPaid * 100) / 100,
    transactionCount: transactions.length,
  };
}
