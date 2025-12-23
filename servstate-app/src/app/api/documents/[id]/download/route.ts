import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { sql } from '@/lib/db';
import type { DocumentRow } from '@/types/db';
import { errorResponse, successResponse, validateLoanAccess } from '@/lib/api-helpers';
import { logAudit } from '@/lib/audit';
import { generatePresignedDownloadUrl, extractFilenameFromKey } from '@/lib/s3';

/**
 * GET /api/documents/[id]/download
 * Generate presigned URL for document download
 *
 * Response:
 * {
 *   downloadUrl: string (presigned S3 GET URL)
 *   expiresIn: number (seconds until URL expires)
 *   filename: string (original filename for download)
 * }
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

    // Get document metadata
    const documents = await sql<DocumentRow>`
      SELECT * FROM active_documents WHERE id = ${documentId}
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

    // Validate storage_path exists
    if (!document.storage_path) {
      return errorResponse('Document not yet uploaded to storage', 404);
    }

    // Extract original filename from S3 key or use document name
    const filename = extractFilenameFromKey(document.storage_path) || document.name;

    // Generate presigned download URL
    const presignedDownload = await generatePresignedDownloadUrl(
      document.storage_path,
      filename
    );

    // Log document access (category auto-derived as 'document')
    await logAudit({
      loanId: document.loan_id,
      actionType: 'document_accessed',
      description: `Document downloaded: ${document.name}`,
      performedBy: user.name,
      details: {
        document_id: documentId,
        document_type: document.type,
        filename,
      },
      referenceId: documentId,
    });

    return successResponse({
      downloadUrl: presignedDownload.url,
      expiresIn: presignedDownload.expiresIn,
      filename,
    });
  } catch (error) {
    console.error('Error generating download URL:', error);

    if (error instanceof Error) {
      // AWS SDK errors
      if (error.name === 'NoSuchKey') {
        return errorResponse('Document file not found in storage', 404);
      }
      if (error.name === 'AccessDenied') {
        return errorResponse('Storage access denied', 500);
      }
    }

    return errorResponse('Failed to generate download URL', 500);
  }
}














