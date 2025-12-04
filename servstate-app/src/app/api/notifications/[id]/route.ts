import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { sql } from '@/lib/db';
import { errorResponse, successResponse, requireCsrf } from '@/lib/api-helpers';

/**
 * PATCH /api/notifications/[id]
 * Mark notification as read
 * Security: Validates user owns the notification or is a servicer/admin
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
    const { user } = session;

    // CSRF protection
    const csrfError = requireCsrf(request, user.id);
    if (csrfError) {
      return csrfError;
    }

    // First, fetch the notification to verify ownership
    const notification = await sql`
      SELECT id, user_id
      FROM notifications
      WHERE id = ${notificationId}
    `;

    if (notification.length === 0) {
      return errorResponse('Notification not found', 404);
    }

    // Users can only mark their own notifications as read
    // Servicers and admins can mark any notification as read
    const isOwner = notification[0].user_id === user.id;
    const isPrivileged = user.role === 'servicer' || user.role === 'admin';

    if (!isOwner && !isPrivileged) {
      return errorResponse('Forbidden', 403);
    }

    // Update the notification
    const result = await sql`
      UPDATE notifications
      SET read = true
      WHERE id = ${notificationId}
      RETURNING *
    `;

    return successResponse(result[0]);
  } catch (error) {
    console.error('Error updating notification:', error);
    return errorResponse('Failed to update notification', 500);
  }
}

