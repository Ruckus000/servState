import type { Loan } from '@/types/loan';

/**
 * Normalize a loan row from the database.
 * PostgreSQL NUMERIC types are returned as strings by the Neon driver,
 * so we need to convert them to numbers for proper arithmetic operations.
 */
export function normalizeLoan(row: Record<string, unknown>): Loan {
  return {
    ...row,
    original_principal: Number(row.original_principal),
    current_principal: Number(row.current_principal),
    interest_rate: Number(row.interest_rate),
    monthly_pi: Number(row.monthly_pi),
    monthly_escrow: Number(row.monthly_escrow),
    escrow_balance: Number(row.escrow_balance),
    days_past_due: row.days_past_due ? Number(row.days_past_due) : 0,
    term_months: Number(row.term_months),
    payments_made: Number(row.payments_made),
  } as Loan;
}
