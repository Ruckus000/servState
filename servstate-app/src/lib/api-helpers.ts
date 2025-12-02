import { NextResponse } from 'next/server';
import { sql } from './db';
import type { UserRole } from '@/types';

/**
 * Create a standardized API error response
 */
export function errorResponse(message: string, status: number = 400) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Create a standardized API success response
 */
export function successResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { status });
}

/**
 * Validate loan access for a user
 */
export async function validateLoanAccess(
  userId: string,
  loanId: string,
  userRole: UserRole
): Promise<boolean> {
  // Servicers and admins have access to all loans
  if (userRole === 'servicer' || userRole === 'admin') {
    return true;
  }

  // Borrowers can only access their own loan
  if (userRole === 'borrower') {
    const result = await sql`
      SELECT id FROM loans 
      WHERE id = ${loanId} AND borrower_id = ${userId}
    `;
    return result.length > 0;
  }

  return false;
}

/**
 * Create an audit log entry
 */
export async function createAuditLogEntry(params: {
  loanId: string | null;
  actionType: string;
  category: string;
  description: string;
  performedBy: string;
  details?: Record<string, any>;
  referenceId?: string;
}) {
  try {
    await sql`
      INSERT INTO audit_log (
        loan_id,
        action_type,
        category,
        description,
        performed_by,
        details,
        reference_id
      ) VALUES (
        ${params.loanId},
        ${params.actionType},
        ${params.category},
        ${params.description},
        ${params.performedBy},
        ${params.details ? JSON.stringify(params.details) : null},
        ${params.referenceId || null}
      )
    `;
  } catch (error) {
    console.error('Failed to create audit log entry:', error);
    // Don't throw - audit logging failures shouldn't break the main operation
  }
}


