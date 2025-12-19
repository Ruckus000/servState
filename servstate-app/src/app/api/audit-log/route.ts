import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { sql } from '@/lib/db';
import { errorResponse, successResponse, validateLoanAccess } from '@/lib/api-helpers';

/**
 * GET /api/audit-log?loanId=...
 * List audit entries (servicer only)
 * Security: Requires loanId and validates access to prevent cross-loan data exposure
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }

    const { user } = session;

    // Only servicers and admins can access audit log
    if (user.role !== 'servicer' && user.role !== 'admin') {
      return errorResponse('Forbidden', 403);
    }

    const { searchParams } = new URL(request.url);
    const loanId = searchParams.get('loanId');

    // Require loanId for security - prevents fetching all audit logs
    if (!loanId) {
      return errorResponse('loanId parameter is required', 400);
    }

    // Validate loan access
    const hasAccess = await validateLoanAccess(user.id, loanId, user.role);
    if (!hasAccess) {
      return errorResponse('Forbidden', 403);
    }

    const auditLogs = await sql`
      SELECT * FROM audit_log
      WHERE loan_id = ${loanId}
      ORDER BY performed_at DESC
      LIMIT 100
    `;

    return successResponse(auditLogs);
  } catch (error) {
    console.error('Error fetching audit log:', error);
    return errorResponse('Failed to fetch audit log', 500);
  }
}










