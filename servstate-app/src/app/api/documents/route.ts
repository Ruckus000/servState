import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { sql } from '@/lib/db';
import { errorResponse, successResponse, validateLoanAccess, requireCsrf } from '@/lib/api-helpers';
import { logAudit } from '@/lib/audit';
import { documentUploadSchema } from '@/lib/schemas';
import {
  generateDocumentKey,
  generatePresignedUploadUrl,
  isValidContentType,
  isValidFileSize,
} from '@/lib/s3';
import { formatFileSize } from '@/lib/format';

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
      SELECT * FROM active_documents
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
 * Generate presigned upload URL and create document metadata
 *
 * Request body:
 * {
 *   loan_id: string (UUID)
 *   name: string (filename)
 *   type: DocumentType
 *   size: number (bytes)
 *   contentType: string (MIME type)
 * }
 *
 * Response:
 * {
 *   document: Document (metadata record)
 *   uploadUrl: string (presigned S3 PUT URL)
 *   expiresIn: number (seconds until URL expires)
 * }
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

    // Only servicers and admins can upload documents
    if (user.role !== 'servicer' && user.role !== 'admin') {
      return errorResponse('Forbidden: Only servicers can upload documents', 403);
    }

    const body = await request.json();

    // Validate request body
    const validation = documentUploadSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(
        `Validation error: ${validation.error.issues.map(e => e.message).join(', ')}`,
        400
      );
    }

    const { loan_id, name, type, size, contentType } = validation.data;

    // Check access to loan
    const hasAccess = await validateLoanAccess(user.id, loan_id, user.role);
    if (!hasAccess) {
      return errorResponse('Forbidden', 403);
    }

    // Validate content type and file size
    if (!isValidContentType(contentType)) {
      return errorResponse(
        'Invalid file type. Allowed types: PDF, JPEG, PNG, TIFF, DOC, DOCX, XLS, XLSX',
        400
      );
    }

    if (!isValidFileSize(size)) {
      return errorResponse('File size must be between 1 byte and 100MB', 400);
    }

    // Generate S3 key
    const s3Key = generateDocumentKey(loan_id, name);

    // Generate presigned upload URL
    const presignedUpload = await generatePresignedUploadUrl(
      s3Key,
      contentType,
      size
    );

    // Insert document metadata into database
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
        ${formatFileSize(size)},
        ${s3Key}
      )
      RETURNING *
    `;

    const document = result[0];

    // Create audit log entry (category auto-derived as 'document')
    await logAudit({
      loanId: loan_id,
      actionType: 'document_upload_initiated',
      description: `Document upload initiated: ${name}`,
      performedBy: user.name,
      details: {
        document_id: document.id,
        type,
        size: formatFileSize(size),
        content_type: contentType,
      },
    });

    return successResponse(
      {
        document,
        uploadUrl: presignedUpload.url,
        expiresIn: presignedUpload.expiresIn,
      },
      201
    );
  } catch (error) {
    console.error('Error creating document:', error);

    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('Invalid content type')) {
        return errorResponse(error.message, 400);
      }
      if (error.message.includes('Invalid file size')) {
        return errorResponse(error.message, 400);
      }
    }

    return errorResponse('Failed to create document upload', 500);
  }
}













