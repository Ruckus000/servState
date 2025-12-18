/**
 * Document Service
 *
 * Shared service layer for document generation and saving.
 * Handles common patterns: authentication, authorization, rate limiting,
 * idempotency, database transactions, and S3 uploads.
 */

import { sql } from './db';
import { logAudit } from './audit';
import { uploadBuffer, type UploadBufferResult } from './s3';
import { calculateRetentionDate } from './retention';
import type {
  Document,
  DocumentType,
  DocumentStatus,
  DocumentGenerationParams,
} from '@/types/document';

// ============================================
// Rate Limiting
// ============================================

// Rate limit: 10 document generations per loan per hour
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX_REQUESTS = 10;

// In-memory rate limit store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

/**
 * Check if document generation is rate limited for a loan
 * @returns true if rate limited, false if allowed
 */
export function isRateLimited(loanId: string): boolean {
  const key = `doc-gen:${loanId}`;
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    // First request or window expired
    rateLimitStore.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  entry.count++;
  return false;
}

/**
 * Get rate limit info for a loan
 */
export function getRateLimitInfo(loanId: string): { remaining: number; resetAt: number } {
  const key = `doc-gen:${loanId}`;
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    return { remaining: RATE_LIMIT_MAX_REQUESTS, resetAt: now + RATE_LIMIT_WINDOW_MS };
  }

  return {
    remaining: Math.max(0, RATE_LIMIT_MAX_REQUESTS - entry.count),
    resetAt: entry.resetAt,
  };
}

// ============================================
// Idempotency
// ============================================

/**
 * Generate a 5-minute window idempotency key
 * Format: {loanId}-{docType}-{params hash}-{5-min-bucket}
 */
export function generateIdempotencyKey(
  loanId: string,
  docType: string,
  params: Record<string, string>
): string {
  // 5-minute bucket (300000ms)
  const bucket = Math.floor(Date.now() / 300000);

  // Sort params for consistent hash
  const sortedParams = Object.keys(params)
    .sort()
    .map((k) => `${k}:${params[k]}`)
    .join('-');

  return `${loanId}-${docType}-${sortedParams}-${bucket}`;
}

/**
 * Check for existing document with same idempotency key
 * Only returns successfully uploaded documents
 */
export async function findExistingDocument(
  idempotencyKey: string
): Promise<Document | null> {
  const existing = await sql`
    SELECT * FROM documents
    WHERE idempotency_key = ${idempotencyKey}
    AND status = 'uploaded'
    LIMIT 1
  `;

  if (existing.length === 0) {
    return null;
  }

  return normalizeDocument(existing[0] as Record<string, unknown>);
}

// ============================================
// Document Operations
// ============================================

export interface CreateDocumentParams {
  loanId: string;
  name: string;
  type: DocumentType;
  generatedBy: string;
  generationParams: DocumentGenerationParams;
  idempotencyKey: string;
}

/**
 * Create a document record with pending status (before S3 upload)
 */
export async function createPendingDocument(
  params: CreateDocumentParams
): Promise<Document> {
  const retentionUntil = calculateRetentionDate();
  const today = new Date().toISOString().split('T')[0];

  const result = await sql`
    INSERT INTO documents (
      loan_id,
      name,
      type,
      date,
      size,
      storage_path,
      status,
      idempotency_key,
      generated_by,
      generation_params,
      retention_until
    ) VALUES (
      ${params.loanId},
      ${params.name},
      ${params.type},
      ${today},
      '0 KB',
      NULL,
      'pending',
      ${params.idempotencyKey},
      ${params.generatedBy},
      ${JSON.stringify(params.generationParams)},
      ${retentionUntil}
    )
    RETURNING *
  `;

  return normalizeDocument(result[0] as Record<string, unknown>);
}

/**
 * Update document after successful S3 upload
 */
export async function markDocumentUploaded(
  documentId: string,
  storagePath: string,
  sizeBytes: number
): Promise<Document> {
  const sizeFormatted = formatFileSize(sizeBytes);

  const result = await sql`
    UPDATE documents
    SET
      status = 'uploaded',
      storage_path = ${storagePath},
      size = ${sizeFormatted}
    WHERE id = ${documentId}
    RETURNING *
  `;

  if (result.length === 0) {
    throw new Error(`Document not found: ${documentId}`);
  }

  return normalizeDocument(result[0] as Record<string, unknown>);
}

/**
 * Mark document as failed upload
 */
export async function markDocumentUploadFailed(
  documentId: string,
  error?: string
): Promise<void> {
  await sql`
    UPDATE documents
    SET status = 'upload_failed'
    WHERE id = ${documentId}
  `;

  // Log the failure for debugging
  console.error(`[DocumentService] Upload failed for document ${documentId}:`, error);
}

/**
 * Soft delete a document (set deleted_at)
 * Will fail if document is in retention period (trigger enforced)
 */
export async function softDeleteDocument(documentId: string): Promise<Document> {
  const result = await sql`
    UPDATE documents
    SET deleted_at = NOW()
    WHERE id = ${documentId}
    AND deleted_at IS NULL
    RETURNING *
  `;

  if (result.length === 0) {
    throw new Error(`Document not found or already deleted: ${documentId}`);
  }

  return normalizeDocument(result[0] as Record<string, unknown>);
}

/**
 * Restore a soft-deleted document
 */
export async function restoreDocument(documentId: string): Promise<Document> {
  const result = await sql`
    UPDATE documents
    SET deleted_at = NULL
    WHERE id = ${documentId}
    AND deleted_at IS NOT NULL
    RETURNING *
  `;

  if (result.length === 0) {
    throw new Error(`Document not found or not deleted: ${documentId}`);
  }

  return normalizeDocument(result[0] as Record<string, unknown>);
}

/**
 * Get a document by ID
 */
export async function getDocumentById(documentId: string): Promise<Document | null> {
  const result = await sql`
    SELECT * FROM documents WHERE id = ${documentId}
  `;

  if (result.length === 0) {
    return null;
  }

  return normalizeDocument(result[0] as Record<string, unknown>);
}

// ============================================
// Full Save Flow
// ============================================

export interface SaveDocumentParams {
  loanId: string;
  documentName: string;
  documentType: DocumentType;
  generationParams: DocumentGenerationParams;
  userId: string;
  userName: string;
  regenerate?: boolean;
  generatePdf: () => Promise<Buffer>;
}

export interface SaveDocumentResult {
  document: Document;
  isExisting: boolean;
}

/**
 * Complete document save flow with idempotency and proper sequence
 *
 * Sequence:
 * 1. Check rate limit
 * 2. Check idempotency (return existing if found and !regenerate)
 * 3. Create DB record (status=pending)
 * 4. Log audit entry
 * 5. Generate PDF
 * 6. Upload to S3
 * 7. Update DB record (status=uploaded)
 * 8. Return document
 */
export async function saveDocument(
  params: SaveDocumentParams
): Promise<SaveDocumentResult> {
  // 1. Check rate limit
  if (isRateLimited(params.loanId)) {
    const info = getRateLimitInfo(params.loanId);
    const resetIn = Math.ceil((info.resetAt - Date.now()) / 60000);
    throw new RateLimitError(
      `Rate limit exceeded. Try again in ${resetIn} minutes.`,
      info.resetAt
    );
  }

  // 2. Generate idempotency key and check for existing
  const idempotencyKey = generateIdempotencyKey(
    params.loanId,
    params.generationParams.type,
    params.generationParams as unknown as Record<string, string>
  );

  if (!params.regenerate) {
    const existing = await findExistingDocument(idempotencyKey);
    if (existing) {
      return { document: existing, isExisting: true };
    }
  }

  // 3. Create pending document record
  const pendingDoc = await createPendingDocument({
    loanId: params.loanId,
    name: params.documentName,
    type: params.documentType,
    generatedBy: params.userId,
    generationParams: params.generationParams,
    idempotencyKey,
  });

  // 4. Log audit entry
  await logAudit({
    loanId: params.loanId,
    actionType: 'document_generated',
    category: 'document',
    description: `${params.documentType} document saved: ${params.documentName}`,
    performedBy: params.userName,
    details: {
      documentId: pendingDoc.id,
      documentType: params.documentType,
      generationParams: params.generationParams,
    },
    referenceId: pendingDoc.id,
  });

  try {
    // 5. Generate PDF
    const pdfBuffer = await params.generatePdf();

    // 6. Upload to S3
    const uploadResult: UploadBufferResult = await uploadBuffer(
      params.loanId,
      params.documentName,
      pdfBuffer,
      'application/pdf',
      {
        'document-id': pendingDoc.id,
        'document-type': params.documentType,
      }
    );

    // 7. Update DB record
    const finalDoc = await markDocumentUploaded(
      pendingDoc.id,
      uploadResult.key,
      uploadResult.size
    );

    return { document: finalDoc, isExisting: false };
  } catch (error) {
    // Mark as failed and rethrow
    await markDocumentUploadFailed(
      pendingDoc.id,
      error instanceof Error ? error.message : 'Unknown error'
    );
    throw error;
  }
}

// ============================================
// Error Classes
// ============================================

export class RateLimitError extends Error {
  public readonly resetAt: number;

  constructor(message: string, resetAt: number) {
    super(message);
    this.name = 'RateLimitError';
    this.resetAt = resetAt;
  }
}

export class RetentionPeriodError extends Error {
  public readonly retentionUntil: string;

  constructor(message: string, retentionUntil: string) {
    super(message);
    this.name = 'RetentionPeriodError';
    this.retentionUntil = retentionUntil;
  }
}

// ============================================
// Helpers
// ============================================

/**
 * Normalize database row to Document type
 */
function normalizeDocument(row: Record<string, unknown>): Document {
  return {
    id: row.id as string,
    loan_id: row.loan_id as string,
    name: row.name as string,
    date: row.date as string,
    type: row.type as DocumentType,
    size: row.size as string,
    storage_path: row.storage_path as string | null,
    created_at: row.created_at as string | undefined,
    deleted_at: row.deleted_at as string | null,
    status: row.status as DocumentStatus | undefined,
    idempotency_key: row.idempotency_key as string | null,
    generated_by: row.generated_by as string | null,
    generation_params: row.generation_params as DocumentGenerationParams | null,
    retention_until: row.retention_until as string | null,
  };
}

/**
 * Format file size in human-readable format
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}
