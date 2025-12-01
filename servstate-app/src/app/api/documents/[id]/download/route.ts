import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { sql } from '@/lib/db';
import { errorResponse, validateLoanAccess } from '@/lib/api-helpers';

/**
 * GET /api/documents/[id]/download
 * Generate presigned URL for document download (S3 integration will be added later)
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

    const { id: documentId } = await params;
    const { user } = session;

    // Get document
    const documents = await sql`
      SELECT * FROM documents WHERE id = ${documentId}
    `;

    if (documents.length === 0) {
      return errorResponse('Document not found', 404);
    }

    const document = documents[0];

    // Check access to loan
    const hasAccess = await validateLoanAccess(user.id, document.loan_id, user.role);
    if (!hasAccess) {
      return errorResponse('Forbidden', 403);
    }

    // TODO: Generate presigned S3 URL when S3 is integrated
    // For now, return document metadata
    return errorResponse('S3 download not yet implemented', 501);
  } catch (error) {
    console.error('Error downloading document:', error);
    return errorResponse('Failed to download document', 500);
  }
}

