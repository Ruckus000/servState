import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { sql } from '@/lib/db';
import { errorResponse, successResponse, validateLoanAccess, createAuditLogEntry } from '@/lib/api-helpers';

/**
 * GET /api/documents?loanId=...
 * List document metadata for a loan
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

    const documents = await sql`
      SELECT * FROM documents 
      WHERE loan_id = ${loanId}
      ORDER BY date DESC
    `;

    return successResponse(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return errorResponse('Failed to fetch documents', 500);
  }
}

/**
 * POST /api/documents
 * Create document metadata (S3 upload will be added later)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }

    const { user } = session;
    const body = await request.json();

    const { loan_id, name, type, size, storage_path } = body;

    if (!loan_id || !name || !type) {
      return errorResponse('loan_id, name, and type are required', 400);
    }

    // Check access to loan
    const hasAccess = await validateLoanAccess(user.id, loan_id, user.role);
    if (!hasAccess) {
      return errorResponse('Forbidden', 403);
    }

    // Insert document metadata
    const result = await sql`
      INSERT INTO documents (
        loan_id,
        name,
        type,
        date,
        size,
        storage_path
      ) VALUES (
        ${loan_id},
        ${name},
        ${type},
        NOW(),
        ${size || null},
        ${storage_path || null}
      )
      RETURNING *
    `;

    const document = result[0];

    // Create audit log entry
    await createAuditLogEntry({
      loanId: loan_id,
      actionType: 'document_uploaded',
      category: 'document',
      description: `Document uploaded: ${name}`,
      performedBy: user.name,
      details: {
        document_id: document.id,
        type,
      },
    });

    return successResponse(document, 201);
  } catch (error) {
    console.error('Error creating document:', error);
    return errorResponse('Failed to create document', 500);
  }
}

