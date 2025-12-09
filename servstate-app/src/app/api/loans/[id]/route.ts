import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { sql, query } from '@/lib/db';
import { errorResponse, successResponse, validateLoanAccess } from '@/lib/api-helpers';
import { logAudit, computeChangedFields } from '@/lib/audit';
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

    // Compute changed fields for audit log
    const changedFields = computeChangedFields(
      oldLoan as Record<string, unknown>,
      updates as Record<string, unknown>
    );

    // Create audit log entry (category auto-derived as 'lifecycle')
    await logAudit({
      loanId,
      actionType: 'loan_updated',
      description: `Loan information updated: ${changedFields.map(c => c.field).join(', ')}`,
      performedBy: user.name,
      details: {
        changed_fields: changedFields,
      },
    });

    return successResponse(updatedLoan);
  } catch (error) {
    console.error('Error updating loan:', error);
    return errorResponse('Failed to update loan', 500);
  }
}

/**
 * PATCH /api/loans/[id]
 * Partial update loan information (servicer only)
 * Supports editing borrower contact, escrow info, and payment details
 */
export async function PATCH(
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
    const values: unknown[] = [];
    let paramIndex = 1;

    // Existing fields
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
    // Borrower contact fields
    if (updates.email !== undefined) {
      updateFields.push(`email = $${paramIndex++}`);
      values.push(updates.email);
    }
    if (updates.phone !== undefined) {
      updateFields.push(`phone = $${paramIndex++}`);
      values.push(updates.phone);
    }
    if (updates.address !== undefined) {
      updateFields.push(`address = $${paramIndex++}`);
      values.push(updates.address);
    }
    // Escrow/tax/insurance fields
    if (updates.property_tax_annual !== undefined) {
      updateFields.push(`property_tax_annual = $${paramIndex++}`);
      values.push(updates.property_tax_annual);
    }
    if (updates.property_tax_exempt !== undefined) {
      updateFields.push(`property_tax_exempt = $${paramIndex++}`);
      values.push(updates.property_tax_exempt);
    }
    if (updates.hoi_annual !== undefined) {
      updateFields.push(`hoi_annual = $${paramIndex++}`);
      values.push(updates.hoi_annual);
    }
    if (updates.hoi_policy_number !== undefined) {
      updateFields.push(`hoi_policy_number = $${paramIndex++}`);
      values.push(updates.hoi_policy_number);
    }
    if (updates.hoi_expiration_date !== undefined) {
      updateFields.push(`hoi_expiration_date = $${paramIndex++}`);
      values.push(updates.hoi_expiration_date);
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

    // Compute changed fields for audit log
    const changedFields = computeChangedFields(
      oldLoan as Record<string, unknown>,
      updates as Record<string, unknown>
    );

    // Create audit log entry (category auto-derived as 'lifecycle')
    await logAudit({
      loanId,
      actionType: 'loan_updated',
      description: `Loan information updated: ${changedFields.map(c => c.field).join(', ')}`,
      performedBy: user.name,
      details: {
        changed_fields: changedFields,
      },
    });

    return successResponse(updatedLoan);
  } catch (error) {
    console.error('Error updating loan:', error);
    return errorResponse('Failed to update loan', 500);
  }
}







