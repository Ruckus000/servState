import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { sql } from '@/lib/db';
import { errorResponse, successResponse, validateLoanAccess, requireCsrf } from '@/lib/api-helpers';
import { logAudit } from '@/lib/audit';
import { messageCreateSchema } from '@/lib/schemas';

/**
 * GET /api/messages?loanId=...
 * Get messages for a loan
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }

    const { searchParams } = new URL(request.url);
    const loanId = searchParams.get('loanId');

    if (!loanId) {
      return errorResponse('loanId is required', 400);
    }

    const { user } = session;

    // Check access
    const hasAccess = await validateLoanAccess(user.id, loanId, user.role);
    if (!hasAccess) {
      return errorResponse('Forbidden', 403);
    }

    const messages = await sql`
      SELECT * FROM messages 
      WHERE loan_id = ${loanId}
      ORDER BY date DESC
    `;

    return successResponse(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return errorResponse('Failed to fetch messages', 500);
  }
}

/**
 * POST /api/messages
 * Send a new message
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }

    const { user } = session;

    // CSRF protection
    const csrfError = requireCsrf(request, user.id);
    if (csrfError) {
      return csrfError;
    }

    const body = await request.json();

    // Validate input
    const validation = messageCreateSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse('Invalid input: ' + validation.error.message, 400);
    }

    const data = validation.data;

    // Check access to loan
    const hasAccess = await validateLoanAccess(user.id, data.loan_id, user.role);
    if (!hasAccess) {
      return errorResponse('Forbidden', 403);
    }

    // Determine sender type
    const sender = user.role === 'borrower' ? 'borrower' : 'servicer';

    // Insert message
    const result = await sql`
      INSERT INTO messages (
        loan_id,
        sender,
        subject,
        content,
        read,
        date
      ) VALUES (
        ${data.loan_id},
        ${sender},
        ${data.subject},
        ${data.content},
        false,
        NOW()
      )
      RETURNING *
    `;

    const message = result[0];

    // Create audit log entry (category auto-derived as 'communication')
    await logAudit({
      loanId: data.loan_id,
      actionType: 'message_sent',
      description: `Message sent: ${data.subject}`,
      performedBy: user.name,
      details: {
        message_id: message.id,
        sender,
      },
    });

    return successResponse(message, 201);
  } catch (error) {
    console.error('Error creating message:', error);
    return errorResponse('Failed to create message', 500);
  }
}












