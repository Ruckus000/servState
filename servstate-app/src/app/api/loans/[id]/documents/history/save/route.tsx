import { NextRequest } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { auth } from '@/lib/auth';
import { sql } from '@/lib/db';
import { errorResponse, successResponse, validateLoanAccess, requireCsrf } from '@/lib/api-helpers';
import { normalizeLoan } from '@/lib/normalize';
import { calculateTransactionTotals } from '@/lib/payoff-calculator';
import { getCompanyConfig } from '@/lib/company-config';
import { PaymentHistory } from '@/components/pdf/payment-history';
import {
  saveDocument,
  RateLimitError,
  getRateLimitInfo,
} from '@/lib/document-service';
import { paymentHistorySaveSchema } from '@/lib/schemas';
import type { Loan } from '@/types/loan';
import type { Transaction } from '@/types/transaction';
import type { PaymentHistoryGenerationParams } from '@/types/document';

/**
 * POST /api/loans/[id]/documents/history/save
 * Generate and save a payment history PDF to documents
 *
 * CRITICAL: Server regenerates PDF from parameters.
 * Never accepts PDF blob from client.
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

    // 4. Parse and validate request body
    const body = await request.json();
    const validation = paymentHistorySaveSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse('Invalid input: ' + validation.error.message, 400);
    }

    const { fromDate, toDate, regenerate } = validation.data;

    // 5. Fetch loan from database
    const loans = await sql`
      SELECT * FROM loans WHERE id = ${loanId}
    `;

    if (loans.length === 0) {
      return errorResponse('Loan not found', 404);
    }

    const loan = normalizeLoan(loans[0] as Record<string, unknown>) as Loan;

    // 6. Define generation params for idempotency and audit
    const generationParams: PaymentHistoryGenerationParams = {
      type: 'payment_history',
      fromDate,
      toDate,
      loanId,
    };

    // 7. Save document using document service
    const result = await saveDocument({
      loanId,
      documentName: `payment-history-${loan.loan_number}-${fromDate}-to-${toDate}.pdf`,
      documentType: 'Statement',
      generationParams,
      userId: user.id,
      userName: user.name,
      regenerate,
      generatePdf: async () => {
        // Fetch transactions within date range
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

        // Calculate totals
        const totals = calculateTransactionTotals(transactions);

        // Fetch company config for PDF header/footer
        const config = await getCompanyConfig();

        // Generate PDF
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

        return Buffer.from(pdfBuffer);
      },
    });

    // 8. Return success response
    return successResponse({
      document: result.document,
      isExisting: result.isExisting,
    });
  } catch (error) {
    console.error('Error saving payment history:', error);

    // Handle rate limit error
    if (error instanceof RateLimitError) {
      const response = errorResponse(error.message, 429);
      response.headers.set('X-RateLimit-Reset', error.resetAt.toString());
      return response;
    }

    // Handle retention period error (from DB trigger)
    if (error instanceof Error && error.message.includes('retention period')) {
      return errorResponse(error.message, 409);
    }

    return errorResponse('Failed to save payment history', 500);
  }
}

/**
 * GET /api/loans/[id]/documents/history/save
 * Get rate limit info for document generation
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }

    const { id: loanId } = await params;
    const info = getRateLimitInfo(loanId);

    return successResponse({
      remaining: info.remaining,
      resetAt: info.resetAt,
      limit: 10,
      windowMinutes: 60,
    });
  } catch (error) {
    console.error('Error getting rate limit info:', error);
    return errorResponse('Failed to get rate limit info', 500);
  }
}
