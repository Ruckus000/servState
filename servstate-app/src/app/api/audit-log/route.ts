import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { sql } from '@/lib/db';
import { errorResponse, successResponse } from '@/lib/api-helpers';

/**
 * GET /api/audit-log?loanId=...
 * List audit entries (servicer only)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }

    const { user } = session;

    // Only servicers can access audit log
    if (user.role !== 'servicer' && user.role !== 'admin') {
      return errorResponse('Forbidden', 403);
    }

    const { searchParams } = new URL(request.url);
    const loanId = searchParams.get('loanId');

    let auditLogs;
    if (loanId) {
      auditLogs = await sql`
        SELECT * FROM audit_log 
        WHERE loan_id = ${loanId}
        ORDER BY performed_at DESC
        LIMIT 100
      `;
    } else {
      auditLogs = await sql`
        SELECT * FROM audit_log 
        ORDER BY performed_at DESC
        LIMIT 100
      `;
    }

    return successResponse(auditLogs);
  } catch (error) {
    console.error('Error fetching audit log:', error);
    return errorResponse('Failed to fetch audit log', 500);
  }
}


