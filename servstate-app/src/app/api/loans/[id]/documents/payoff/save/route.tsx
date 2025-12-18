import { NextRequest } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { auth } from '@/lib/auth';
import { sql } from '@/lib/db';
import { errorResponse, successResponse, validateLoanAccess, requireCsrf } from '@/lib/api-helpers';
import { normalizeLoan } from '@/lib/normalize';
import { calculatePayoff } from '@/lib/payoff-calculator';
import { getCompanyConfig, isWireConfigured } from '@/lib/company-config';
import { PayoffStatement } from '@/components/pdf/payoff-statement';
import {
  saveDocument,
  RateLimitError,
  getRateLimitInfo,
} from '@/lib/document-service';
import { payoffSaveSchema } from '@/lib/schemas';
import type { Loan } from '@/types/loan';
import type { PayoffGenerationParams } from '@/types/document';

/**
 * POST /api/loans/[id]/documents/payoff/save
 * Generate and save a payoff statement PDF to documents
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
    const validation = payoffSaveSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse('Invalid input: ' + validation.error.message, 400);
    }

    const { goodThroughDate, regenerate } = validation.data;

    // 5. Fetch company config and validate wire instructions
    const config = await getCompanyConfig();
    if (!isWireConfigured(config)) {
      return errorResponse(
        'Wire instructions not configured. Please contact your administrator to complete company settings before generating payoff statements.',
        400
      );
    }

    // 6. Fetch loan from database (fresh data, not from client)
    const loans = await sql`
      SELECT * FROM loans WHERE id = ${loanId}
    `;

    if (loans.length === 0) {
      return errorResponse('Loan not found', 404);
    }

    const loan = normalizeLoan(loans[0] as Record<string, unknown>) as Loan;

    // 7. Define generation params for idempotency and audit
    const generationParams: PayoffGenerationParams = {
      type: 'payoff',
      goodThroughDate,
      loanId,
    };

    // 8. Save document using document service
    const result = await saveDocument({
      loanId,
      documentName: `payoff-${loan.loan_number}-${goodThroughDate}.pdf`,
      documentType: 'Statement',
      generationParams,
      userId: user.id,
      userName: user.name,
      regenerate,
      generatePdf: async () => {
        // Calculate payoff amount (using fees from company config)
        const payoffData = calculatePayoff(loan, goodThroughDate, config.fees);

        // Generate PDF
        const pdfBuffer = await renderToBuffer(
          <PayoffStatement
            loan={loan}
            payoffData={payoffData}
            generatedDate={new Date()}
            config={config}
          />
        );

        return Buffer.from(pdfBuffer);
      },
    });

    // 9. Return success response
    return successResponse({
      document: result.document,
      isExisting: result.isExisting,
    });
  } catch (error) {
    console.error('Error saving payoff statement:', error);

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

    return errorResponse('Failed to save payoff statement', 500);
  }
}

/**
 * GET /api/loans/[id]/documents/payoff/save
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
