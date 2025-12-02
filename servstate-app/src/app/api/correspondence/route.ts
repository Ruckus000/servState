import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { sql } from '@/lib/db';
import { errorResponse, successResponse, validateLoanAccess, createAuditLogEntry } from '@/lib/api-helpers';
import { correspondenceCreateSchema } from '@/lib/schemas';

/**
 * GET /api/correspondence?loanId=...
 * Get correspondence records for a loan (calls, emails, letters, SMS)
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

    // Only servicers/admins can access correspondence logs
    if (user.role !== 'servicer' && user.role !== 'admin') {
      return errorResponse('Forbidden', 403);
    }

    const correspondence = await sql`
      SELECT * FROM correspondence
      WHERE loan_id = ${loanId}
      ORDER BY date DESC
    `;

    return successResponse(correspondence);
  } catch (error) {
    console.error('Error fetching correspondence:', error);
    return errorResponse('Failed to fetch correspondence', 500);
  }
}

/**
 * POST /api/correspondence
 * Log a new correspondence record (servicer only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }

    const { user } = session;

    // Only servicers can create correspondence records
    if (user.role !== 'servicer' && user.role !== 'admin') {
      return errorResponse('Forbidden', 403);
    }

    const body = await request.json();

    // Validate input
    const validation = correspondenceCreateSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse('Invalid input: ' + validation.error.message, 400);
    }

    const data = validation.data;

    // Verify loan exists
    const loans = await sql`
      SELECT id FROM loans WHERE id = ${data.loan_id}
    `;

    if (loans.length === 0) {
      return errorResponse('Loan not found', 404);
    }

    // Insert correspondence record
    const result = await sql`
      INSERT INTO correspondence (
        loan_id,
        type,
        direction,
        date,
        subject,
        outcome,
        duration,
        notes
      ) VALUES (
        ${data.loan_id},
        ${data.type},
        ${data.direction},
        ${data.date},
        ${data.subject || null},
        ${data.outcome || null},
        ${data.duration || null},
        ${data.notes || null}
      )
      RETURNING *
    `;

    const correspondence = result[0];

    // Create audit log entry
    await createAuditLogEntry({
      loanId: data.loan_id,
      actionType: 'correspondence_logged',
      category: 'communication',
      description: `${data.type} correspondence logged: ${data.direction}`,
      performedBy: user.name,
      details: {
        correspondence_id: correspondence.id,
        type: data.type,
        direction: data.direction,
        outcome: data.outcome,
      },
    });

    return successResponse(correspondence, 201);
  } catch (error) {
    console.error('Error creating correspondence:', error);
    return errorResponse('Failed to create correspondence', 500);
  }
}

