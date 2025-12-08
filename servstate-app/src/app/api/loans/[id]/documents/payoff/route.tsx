import { NextRequest } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { auth } from '@/lib/auth';
import { sql } from '@/lib/db';
import { errorResponse, validateLoanAccess, createAuditLogEntry, requireCsrf } from '@/lib/api-helpers';
import { normalizeLoan } from '@/lib/normalize';
import { calculatePayoff } from '@/lib/payoff-calculator';
import { getCompanyConfig, isWireConfigured } from '@/lib/company-config';
import { PayoffStatement } from '@/components/pdf/payoff-statement';
import type { Loan } from '@/types/loan';

/**
 * POST /api/loans/[id]/documents/payoff
 * Generate a payoff statement PDF for a loan
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
    const { goodThroughDate } = body;

    if (!goodThroughDate) {
      return errorResponse('Good through date is required', 400);
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(goodThroughDate)) {
      return errorResponse('Invalid date format. Use YYYY-MM-DD', 400);
    }

    // Validate date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const goodThrough = new Date(goodThroughDate);
    if (goodThrough < today) {
      return errorResponse('Good through date cannot be in the past', 400);
    }

    // 4. Fetch company config and validate wire instructions
    const config = await getCompanyConfig();
    if (!isWireConfigured(config)) {
      return errorResponse(
        'Wire instructions not configured. Please contact your administrator to complete company settings before generating payoff statements.',
        400
      );
    }

    // 5. Fetch loan from database (fresh data, not from client)
    const loans = await sql`
      SELECT * FROM loans WHERE id = ${loanId}
    `;

    if (loans.length === 0) {
      return errorResponse('Loan not found', 404);
    }

    const loan = normalizeLoan(loans[0] as Record<string, unknown>) as Loan;

    // 6. Calculate payoff amount (using fees from company config)
    const payoffData = calculatePayoff(loan, goodThroughDate, config.fees);

    // 7. Generate PDF
    const pdfBuffer = await renderToBuffer(
      <PayoffStatement
        loan={loan}
        payoffData={payoffData}
        generatedDate={new Date()}
        config={config}
      />
    );

    // 8. Create audit log entry
    await createAuditLogEntry({
      loanId,
      actionType: 'document_generated',
      category: 'document',
      description: `Payoff statement generated (good through ${goodThroughDate})`,
      performedBy: user.name,
      details: {
        documentType: 'payoff_statement',
        goodThroughDate,
        payoffAmount: payoffData.totalPayoff,
      },
    });

    // 9. Return PDF as downloadable response
    // Convert Buffer to Uint8Array for Response compatibility
    const uint8Array = new Uint8Array(pdfBuffer);
    return new Response(uint8Array, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="payoff-${loan.loan_number}-${goodThroughDate}.pdf"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Error generating payoff statement:', error);
    return errorResponse('Failed to generate payoff statement', 500);
  }
}
