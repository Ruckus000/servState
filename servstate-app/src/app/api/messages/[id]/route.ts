import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { sql } from '@/lib/db';
import { errorResponse, successResponse } from '@/lib/api-helpers';

/**
 * PATCH /api/messages/[id]
 * Mark message as read
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

    const result = await sql`
      UPDATE messages 
      SET read = true
      WHERE id = ${messageId}
      RETURNING *
    `;

    if (result.length === 0) {
      return errorResponse('Message not found', 404);
    }

    return successResponse(result[0]);
  } catch (error) {
    console.error('Error updating message:', error);
    return errorResponse('Failed to update message', 500);
  }
}


