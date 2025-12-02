import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { sql } from '@/lib/db';
import { errorResponse, successResponse, createAuditLogEntry } from '@/lib/api-helpers';
import { noteCreateSchema } from '@/lib/schemas';

/**
 * GET /api/notes?loanId=...
 * List internal notes (servicer only)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }

    const { user } = session;

    // Only servicers can access notes
    if (user.role !== 'servicer' && user.role !== 'admin') {
      return errorResponse('Forbidden', 403);
    }

    const { searchParams } = new URL(request.url);
    const loanId = searchParams.get('loanId');

    if (!loanId) {
      return errorResponse('loanId is required', 400);
    }

    const notes = await sql`
      SELECT * FROM notes 
      WHERE loan_id = ${loanId}
      ORDER BY date DESC
    `;

    return successResponse(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    return errorResponse('Failed to fetch notes', 500);
  }
}

/**
 * POST /api/notes
 * Add a note (servicer only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }

    const { user } = session;

    // Only servicers can create notes
    if (user.role !== 'servicer' && user.role !== 'admin') {
      return errorResponse('Forbidden', 403);
    }

    const body = await request.json();

    // Validate input
    const validation = noteCreateSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse('Invalid input: ' + validation.error.message, 400);
    }

    const data = validation.data;

    // Insert note
    const result = await sql`
      INSERT INTO notes (
        loan_id,
        author,
        type,
        content,
        date
      ) VALUES (
        ${data.loan_id},
        ${user.name},
        ${data.type},
        ${data.content},
        NOW()
      )
      RETURNING *
    `;

    const note = result[0];

    // Create audit log entry
    await createAuditLogEntry({
      loanId: data.loan_id,
      actionType: 'note_created',
      category: 'documentation',
      description: `Note added: ${data.type}`,
      performedBy: user.name,
      details: {
        note_id: note.id,
        type: data.type,
      },
    });

    return successResponse(note, 201);
  } catch (error) {
    console.error('Error creating note:', error);
    return errorResponse('Failed to create note', 500);
  }
}


