import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { sql } from '@/lib/db';
import { errorResponse, successResponse } from '@/lib/api-helpers';
import { notificationCreateSchema } from '@/lib/schemas';

/**
 * GET /api/notifications
 * Get user's notifications
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }

    const { user } = session;

    // Get notifications for this user's role
    const notifications = await sql`
      SELECT * FROM notifications 
      WHERE (user_id = ${user.id} OR role = ${user.role} OR role = 'both')
      ORDER BY date DESC
      LIMIT 50
    `;

    return successResponse(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return errorResponse('Failed to fetch notifications', 500);
  }
}

/**
 * POST /api/notifications
 * Create notification (system/servicer)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }

    const { user } = session;

    // Only servicers can create notifications
    if (user.role !== 'servicer' && user.role !== 'admin') {
      return errorResponse('Forbidden', 403);
    }

    const body = await request.json();

    // Validate input
    const validation = notificationCreateSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse('Invalid input: ' + validation.error.message, 400);
    }

    const data = validation.data;

    // Insert notification
    const result = await sql`
      INSERT INTO notifications (
        loan_id,
        user_id,
        type,
        title,
        message,
        priority,
        role,
        link,
        read,
        date
      ) VALUES (
        ${data.loan_id || null},
        ${data.user_id},
        ${data.type},
        ${data.title},
        ${data.message},
        ${data.priority},
        ${data.role},
        ${data.link || null},
        false,
        NOW()
      )
      RETURNING *
    `;

    return successResponse(result[0], 201);
  } catch (error) {
    console.error('Error creating notification:', error);
    return errorResponse('Failed to create notification', 500);
  }
}

