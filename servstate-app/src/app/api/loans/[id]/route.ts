import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { sql, query } from '@/lib/db';
import { errorResponse, successResponse, validateLoanAccess, createAuditLogEntry } from '@/lib/api-helpers';
import { loanUpdateSchema } from '@/lib/schemas';
import { normalizeLoan } from '@/lib/normalize';
import type { Loan } from '@/types/loan';

/**
 * GET /api/loans/[id]
 * Get single loan details with authorization check
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
    const { user } = session;

    // Check access
    const hasAccess = await validateLoanAccess(user.id, loanId, user.role);
    if (!hasAccess) {
      return errorResponse('Forbidden', 403);
    }

    const loans = await sql`
      SELECT * FROM loans WHERE id = ${loanId}
    `;

    if (loans.length === 0) {
      return errorResponse('Loan not found', 404);
    }

    // Normalize numeric fields (PostgreSQL NUMERIC comes as strings)
    return successResponse(normalizeLoan(loans[0] as Record<string, unknown>));
  } catch (error) {
    console.error('Error fetching loan:', error);
    return errorResponse('Failed to fetch loan', 500);
  }
}

/**
 * PUT /api/loans/[id]
 * Update loan information (servicer only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }

    const { user } = session;

    // Only servicers can update loans
    if (user.role !== 'servicer' && user.role !== 'admin') {
      return errorResponse('Forbidden', 403);
    }

    const { id: loanId } = await params;
    const body = await request.json();

    // Validate input
    const validation = loanUpdateSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse('Invalid input: ' + validation.error.message, 400);
    }

    const updates = validation.data;

    // Check if loan exists
    const existingLoans = await sql`
      SELECT * FROM loans WHERE id = ${loanId}
    `;

    if (existingLoans.length === 0) {
      return errorResponse('Loan not found', 404);
    }

    const oldLoan = existingLoans[0];

    // Build update query dynamically
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.status !== undefined) {
      updateFields.push(`status = $${paramIndex++}`);
      values.push(updates.status);
    }
    if (updates.days_past_due !== undefined) {
      updateFields.push(`days_past_due = $${paramIndex++}`);
      values.push(updates.days_past_due);
    }
    if (updates.monthly_escrow !== undefined) {
      updateFields.push(`monthly_escrow = $${paramIndex++}`);
      values.push(updates.monthly_escrow);
    }
    if (updates.escrow_balance !== undefined) {
      updateFields.push(`escrow_balance = $${paramIndex++}`);
      values.push(updates.escrow_balance);
    }
    if (updates.next_due_date !== undefined) {
      updateFields.push(`next_due_date = $${paramIndex++}`);
      values.push(updates.next_due_date);
    }

    if (updateFields.length === 0) {
      return errorResponse('No fields to update', 400);
    }

    // Add updated_at
    updateFields.push(`updated_at = NOW()`);
    values.push(loanId);

    // Execute update (using raw query due to dynamic fields)
    const queryText = `UPDATE loans SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await query<Loan>(queryText, values);

    // Normalize numeric fields (PostgreSQL NUMERIC comes as strings)
    const updatedLoan = normalizeLoan(result[0] as unknown as Record<string, unknown>);

    // Create audit log entry
    await createAuditLogEntry({
      loanId,
      actionType: 'loan_updated',
      category: 'loan',
      description: `Loan information updated`,
      performedBy: user.name,
      details: {
        changes: updates,
        previous: oldLoan,
      },
    });

    return successResponse(updatedLoan);
  } catch (error) {
    console.error('Error updating loan:', error);
    return errorResponse('Failed to update loan', 500);
  }
}


