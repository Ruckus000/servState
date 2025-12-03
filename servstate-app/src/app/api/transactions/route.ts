import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { sql } from '@/lib/db';
import { errorResponse, successResponse, validateLoanAccess, createAuditLogEntry, requireCsrf } from '@/lib/api-helpers';
import { transactionCreateSchema } from '@/lib/schemas';

/**
 * GET /api/transactions?loanId=...
 * List transactions for a loan
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }

    const { searchParams } = new URL(request.url);
    const loanId = searchParams.get('loanId');

    if (!loanId) {
      return errorResponse('loanId is required', 400);
    }

    const { user } = session;

    // Check access
    const hasAccess = await validateLoanAccess(user.id, loanId, user.role);
    if (!hasAccess) {
      return errorResponse('Forbidden', 403);
    }

    const transactions = await sql`
      SELECT * FROM transactions 
      WHERE loan_id = ${loanId}
      ORDER BY date DESC
    `;

    return successResponse(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return errorResponse('Failed to fetch transactions', 500);
  }
}

/**
 * POST /api/transactions
 * Create a new transaction (servicer only)
 * Security: Requires CSRF token and idempotency key
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }

    const { user } = session;

    // CSRF protection for state-changing operation
    const csrfError = requireCsrf(request, user.id);
    if (csrfError) {
      return csrfError;
    }

    // Only servicers can create transactions
    if (user.role !== 'servicer' && user.role !== 'admin') {
      return errorResponse('Forbidden', 403);
    }

    // Require idempotency key to prevent duplicate transactions
    const idempotencyKey = request.headers.get('idempotency-key');
    if (!idempotencyKey) {
      return errorResponse('Idempotency-Key header is required for transactions', 400);
    }

    // Check for existing transaction with this idempotency key
    const existing = await sql`
      SELECT * FROM transactions WHERE idempotency_key = ${idempotencyKey}
    `;

    if (existing.length > 0) {
      // Return existing transaction (idempotent response)
      return successResponse(existing[0], 200);
    }

    const body = await request.json();

    // Validate input
    const validation = transactionCreateSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse('Invalid input: ' + validation.error.message, 400);
    }

    const data = validation.data;

    // Verify loan exists
    const loans = await sql`
      SELECT id FROM loans WHERE id = ${data.loan_id}
    `;

    if (loans.length === 0) {
      return errorResponse('Loan not found', 404);
    }

    // Insert transaction with idempotency key
    const result = await sql`
      INSERT INTO transactions (
        loan_id,
        date,
        type,
        amount,
        principal_amount,
        interest_amount,
        escrow_amount,
        status,
        description,
        reference_number,
        idempotency_key
      ) VALUES (
        ${data.loan_id},
        NOW(),
        ${data.type},
        ${data.amount},
        ${data.principal_amount || null},
        ${data.interest_amount || null},
        ${data.escrow_amount || null},
        'completed',
        ${data.description || null},
        ${data.reference_number || null},
        ${idempotencyKey}
      )
      RETURNING *
    `;

    const transaction = result[0];

    // Create audit log entry
    await createAuditLogEntry({
      loanId: data.loan_id,
      actionType: 'transaction_created',
      category: 'payment',
      description: `${data.type} transaction created: ${data.amount}`,
      performedBy: user.name,
      details: {
        transaction_id: transaction.id,
        type: data.type,
        amount: data.amount,
        idempotency_key: idempotencyKey,
      },
      referenceId: transaction.reference_number,
    });

    // Update loan principal if this is a payment
    if (data.type === 'Payment' && data.principal_amount) {
      await sql`
        UPDATE loans
        SET
          current_principal = current_principal - ${data.principal_amount},
          payments_made = payments_made + 1,
          updated_at = NOW()
        WHERE id = ${data.loan_id}
      `;
    }

    return successResponse(transaction, 201);
  } catch (error) {
    console.error('Error creating transaction:', error);
    return errorResponse('Failed to create transaction', 500);
  }
}



