import { NextRequest } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { auth } from '@/lib/auth';
import { sql } from '@/lib/db';
import { errorResponse, validateLoanAccess, createAuditLogEntry, requireCsrf } from '@/lib/api-helpers';
import { normalizeLoan } from '@/lib/normalize';
import { calculateTransactionTotals } from '@/lib/payoff-calculator';
import { getCompanyConfig } from '@/lib/company-config';
import { PaymentHistory } from '@/components/pdf/payment-history';
import type { Loan } from '@/types/loan';
import type { Transaction } from '@/types/transaction';

/**
 * POST /api/loans/[id]/documents/history
 * Generate a payment history PDF for a loan
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Check authentication
    const session = await auth();
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }

    const { id: loanId } = await params;
    const { user } = session;

    // 2. CSRF protection
    const csrfError = requireCsrf(request, user.id);
    if (csrfError) {
      return csrfError;
    }

    // 3. Validate loan access
    const hasAccess = await validateLoanAccess(user.id, loanId, user.role);
    if (!hasAccess) {
      return errorResponse('Forbidden', 403);
    }

    // 3. Get request body
    const body = await request.json();
    const { fromDate, toDate } = body;

    if (!fromDate || !toDate) {
      return errorResponse('From date and to date are required', 400);
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(fromDate) || !dateRegex.test(toDate)) {
      return errorResponse('Invalid date format. Use YYYY-MM-DD', 400);
    }

    // Validate date range
    const from = new Date(fromDate);
    const to = new Date(toDate);
    if (from > to) {
      return errorResponse('From date must be before to date', 400);
    }

    // 4. Fetch loan from database
    const loans = await sql`
      SELECT * FROM loans WHERE id = ${loanId}
    `;

    if (loans.length === 0) {
      return errorResponse('Loan not found', 404);
    }

    const loan = normalizeLoan(loans[0] as Record<string, unknown>) as Loan;

    // 5. Fetch transactions within date range
    const rawTransactions = await sql`
      SELECT * FROM transactions
      WHERE loan_id = ${loanId}
        AND date >= ${fromDate}
        AND date <= ${toDate}
      ORDER BY date DESC
    `;

    // Normalize transaction data
    const transactions: Transaction[] = rawTransactions.map((tx: Record<string, unknown>) => ({
      id: tx.id as string,
      loan_id: tx.loan_id as string,
      date: tx.date as string,
      type: tx.type as Transaction['type'],
      amount: Number(tx.amount),
      breakdown: tx.principal_amount || tx.interest_amount || tx.escrow_amount ? {
        principal: Number(tx.principal_amount || 0),
        interest: Number(tx.interest_amount || 0),
        escrow: Number(tx.escrow_amount || 0),
      } : undefined,
      status: tx.status as Transaction['status'],
      description: tx.description as string | undefined,
      reference_number: tx.reference_number as string | undefined,
    }));

    // 6. Calculate totals
    const totals = calculateTransactionTotals(transactions);

    // 7. Fetch company config for PDF header/footer
    const config = await getCompanyConfig();

    // 8. Generate PDF
    const pdfBuffer = await renderToBuffer(
      <PaymentHistory
        loan={loan}
        transactions={transactions}
        dateRange={{ from: fromDate, to: toDate }}
        totals={totals}
        generatedDate={new Date()}
        config={config}
      />
    );

    // 9. Create audit log entry
    await createAuditLogEntry({
      loanId,
      actionType: 'document_generated',
      category: 'document',
      description: `Payment history generated (${fromDate} to ${toDate})`,
      performedBy: user.name,
      details: {
        documentType: 'payment_history',
        dateRange: { from: fromDate, to: toDate },
        transactionCount: totals.transactionCount,
        totalPaid: totals.totalPaid,
      },
    });

    // 10. Return PDF as downloadable response
    // Convert Buffer to Uint8Array for Response compatibility
    const uint8Array = new Uint8Array(pdfBuffer);
    return new Response(uint8Array, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="payment-history-${loan.loan_number}-${fromDate}-to-${toDate}.pdf"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Error generating payment history:', error);
    return errorResponse('Failed to generate payment history', 500);
  }
}
