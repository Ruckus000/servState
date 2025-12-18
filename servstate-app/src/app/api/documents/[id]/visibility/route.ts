import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { errorResponse, successResponse, validateLoanAccess, requireCsrf } from '@/lib/api-helpers';
import { logAudit } from '@/lib/audit';
import {
  getDocumentById,
  softDeleteDocument,
  restoreDocument,
} from '@/lib/document-service';
import { documentVisibilitySchema } from '@/lib/schemas';

/**
 * PATCH /api/documents/[id]/visibility
 * Soft delete or restore a document
 *
 * Body: { visible: boolean }
 * - visible: false = soft delete (hide document)
 * - visible: true = restore (unhide document)
 *
 * Note: Documents in retention period cannot be soft-deleted
 * (enforced by database trigger)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Check authentication
    const session = await auth();
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }

    const { id: documentId } = await params;
    const { user } = session;

    // 2. CSRF protection
    const csrfError = requireCsrf(request, user.id);
    if (csrfError) {
      return csrfError;
    }

    // 3. Only servicers and admins can archive/restore documents
    if (user.role !== 'servicer' && user.role !== 'admin') {
      return errorResponse('Only servicers and admins can archive documents', 403);
    }

    // 4. Parse and validate request body
    const body = await request.json();
    const validation = documentVisibilitySchema.safeParse(body);

    if (!validation.success) {
      return errorResponse('Invalid input: ' + validation.error.message, 400);
    }

    const { visible } = validation.data;

    // 5. Fetch document to validate access
    const document = await getDocumentById(documentId);

    if (!document) {
      return errorResponse('Document not found', 404);
    }

    // 6. Validate loan access (servicers/admins have access, but verify anyway)
    const hasAccess = await validateLoanAccess(user.id, document.loan_id, user.role);
    if (!hasAccess) {
      return errorResponse('Forbidden', 403);
    }

    // 7. Perform soft delete or restore
    let updatedDocument;
    let actionType: string;
    let description: string;

    if (visible) {
      // Restore document
      if (!document.deleted_at) {
        return errorResponse('Document is not archived', 400);
      }
      updatedDocument = await restoreDocument(documentId);
      actionType = 'document_restored';
      description = `Document restored: ${document.name}`;
    } else {
      // Soft delete document
      if (document.deleted_at) {
        return errorResponse('Document is already archived', 400);
      }

      try {
        updatedDocument = await softDeleteDocument(documentId);
        actionType = 'document_archived';
        description = `Document archived: ${document.name}`;
      } catch (error) {
        // Handle retention period error from DB trigger
        if (error instanceof Error && error.message.includes('retention period')) {
          const match = error.message.match(/until (\d{4}-\d{2}-\d{2})/);
          const retentionUntil = match ? match[1] : document.retention_until;
          return errorResponse(
            `Cannot archive document during retention period. Retention expires: ${retentionUntil}`,
            409
          );
        }
        throw error;
      }
    }

    // 8. Log audit entry
    await logAudit({
      loanId: document.loan_id,
      actionType,
      category: 'document',
      description,
      performedBy: user.name,
      details: {
        documentId,
        documentName: document.name,
        documentType: document.type,
        action: visible ? 'restore' : 'archive',
      },
      referenceId: documentId,
    });

    // 9. Return success response
    return successResponse({
      document: updatedDocument,
      action: visible ? 'restored' : 'archived',
    });
  } catch (error) {
    console.error('Error updating document visibility:', error);

    return errorResponse('Failed to update document visibility', 500);
  }
}

/**
 * GET /api/documents/[id]/visibility
 * Get document visibility status
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

    // Fetch document
    const document = await getDocumentById(documentId);

    if (!document) {
      return errorResponse('Document not found', 404);
    }

    // Validate loan access
    const hasAccess = await validateLoanAccess(user.id, document.loan_id, user.role);
    if (!hasAccess) {
      return errorResponse('Forbidden', 403);
    }

    return successResponse({
      documentId,
      visible: !document.deleted_at,
      deletedAt: document.deleted_at,
      retentionUntil: document.retention_until,
      canArchive: !document.retention_until ||
        new Date(document.retention_until) <= new Date(),
    });
  } catch (error) {
    console.error('Error getting document visibility:', error);
    return errorResponse('Failed to get document visibility', 500);
  }
}
