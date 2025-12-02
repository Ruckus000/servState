import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { sql } from '@/lib/db';
import { errorResponse, successResponse } from '@/lib/api-helpers';
import type { AuditLogEntry } from '@/types/audit-log';

/**
 * GET /api/tasks/[id]/history
 * Get task history from audit log (servicer only)
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

    const { user } = session;

    // Only servicers can view task history
    if (user.role !== 'servicer' && user.role !== 'admin') {
      return errorResponse('Forbidden', 403);
    }

    const { id: taskId } = await params;

    // Fetch task history from audit log
    const history = await sql`
      SELECT *
      FROM audit_log
      WHERE reference_id = ${taskId}
        AND action_type IN (
          'task_created',
          'task_status_changed',
          'task_assigned',
          'task_updated',
          'task_completed'
        )
      ORDER BY performed_at DESC
    ` as AuditLogEntry[];

    return successResponse(history);
  } catch (error) {
    console.error('Error fetching task history:', error);
    return errorResponse('Failed to fetch task history', 500);
  }
}
