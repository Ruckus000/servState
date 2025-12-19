import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { sql } from '@/lib/db';
import type { MessageRow } from '@/types/db';
import { errorResponse, successResponse, validateLoanAccess, requireCsrf } from '@/lib/api-helpers';

/**
 * PATCH /api/messages/[id]
 * Mark message as read
 * Security: Validates user has access to the message's loan before updating
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

    const { id: messageId } = await params;
    const { user } = session;

    // CSRF protection
    const csrfError = requireCsrf(request, user.id);
    if (csrfError) {
      return csrfError;
    }

    // First, fetch the message to verify access
    const message = await sql<Pick<MessageRow, 'id' | 'loan_id'>>`
      SELECT id, loan_id
      FROM messages
      WHERE id = ${messageId}
    `;

    if (message.length === 0) {
      return errorResponse('Message not found', 404);
    }

    // Validate user has access to the loan this message belongs to
    const hasAccess = await validateLoanAccess(
      user.id,
      message[0].loan_id,
      user.role
    );

    if (!hasAccess) {
      return errorResponse('Forbidden', 403);
    }

    // Update the message
    const result = await sql<MessageRow>`
      UPDATE messages
      SET read = true
      WHERE id = ${messageId}
      RETURNING *
    `;

    return successResponse(result[0]);
  } catch (error) {
    console.error('Error updating message:', error);
    return errorResponse('Failed to update message', 500);
  }
}










