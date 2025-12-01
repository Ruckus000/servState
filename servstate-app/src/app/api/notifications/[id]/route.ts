import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { sql } from '@/lib/db';
import { errorResponse, successResponse } from '@/lib/api-helpers';

/**
 * PATCH /api/notifications/[id]
 * Mark notification as read
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

    const { id: notificationId } = await params;

    const result = await sql`
      UPDATE notifications 
      SET read = true
      WHERE id = ${notificationId}
      RETURNING *
    `;

    if (result.length === 0) {
      return errorResponse('Notification not found', 404);
    }

    return successResponse(result[0]);
  } catch (error) {
    console.error('Error updating notification:', error);
    return errorResponse('Failed to update notification', 500);
  }
}

