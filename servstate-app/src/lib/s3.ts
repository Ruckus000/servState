import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

// Type definitions
export interface PresignedUploadUrl {
  url: string;
  key: string;
  expiresIn: number;
}

export interface PresignedDownloadUrl {
  url: string;
  expiresIn: number;
}

// Allowed MIME types for document uploads
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/tiff',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
] as const;

// Configuration constants
const UPLOAD_EXPIRATION = 300; // 5 minutes
const DOWNLOAD_EXPIRATION = 3600; // 1 hour
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

// #region agent log
fetch('http://127.0.0.1:7242/ingest/87f2cbbe-a1e1-4b67-90f7-00fcfc8f0474', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 's3.ts:34', message: 'S3Client init - env vars check', data: { accessKeyIdPrefix: process.env.AWS_ACCESS_KEY_ID?.substring(0, 4) || 'UNDEFINED', accessKeyIdLength: process.env.AWS_ACCESS_KEY_ID?.length || 0, secretKeyPrefix: process.env.AWS_SECRET_ACCESS_KEY?.substring(0, 4) || 'UNDEFINED', secretKeyLength: process.env.AWS_SECRET_ACCESS_KEY?.length || 0, hasSessionToken: !!process.env.AWS_SESSION_TOKEN, sessionTokenPrefix: process.env.AWS_SESSION_TOKEN?.substring(0, 10) || 'UNDEFINED', region: process.env.AWS_REGION || 'UNDEFINED' }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
// #endregion agent log

// Initialize S3 client
// Only pass explicit credentials if env vars are defined, otherwise let SDK use default chain
// The default chain checks env vars first, then ~/.aws/credentials
const s3ClientConfig: {
  region: string;
  credentials?: {
    accessKeyId: string;
    secretAccessKey: string;
  };
} = {
  region: process.env.AWS_REGION || 'us-east-1',
};

// Only add credentials if both are defined (prevents SDK from ignoring undefined values)
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  s3ClientConfig.credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  };
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/87f2cbbe-a1e1-4b67-90f7-00fcfc8f0474', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 's3.ts:45', message: 'Using explicit credentials from env vars', data: { accessKeyIdPrefix: process.env.AWS_ACCESS_KEY_ID.substring(0, 4) }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
  // #endregion agent log
} else {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/87f2cbbe-a1e1-4b67-90f7-00fcfc8f0474', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 's3.ts:50', message: 'Env vars not found, SDK will use default credential chain', data: { hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID, hasSecret: !!process.env.AWS_SECRET_ACCESS_KEY }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
  // #endregion agent log
}

const s3Client = new S3Client(s3ClientConfig);

// #region agent log
(async () => { try { const creds = await s3Client.config.credentials(); fetch('http://127.0.0.1:7242/ingest/87f2cbbe-a1e1-4b67-90f7-00fcfc8f0474', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 's3.ts:42', message: 'S3Client resolved credentials', data: { resolvedAccessKeyPrefix: creds?.accessKeyId?.substring(0, 4) || 'UNDEFINED', resolvedAccessKeyLength: creds?.accessKeyId?.length || 0, hasSecret: !!creds?.secretAccessKey, hasSessionToken: !!creds?.sessionToken }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' }) }).catch(() => { }); } catch (e) { fetch('http://127.0.0.1:7242/ingest/87f2cbbe-a1e1-4b67-90f7-00fcfc8f0474', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 's3.ts:42', message: 'S3Client credential resolution error', data: { error: String(e) }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' }) }).catch(() => { }); } })();
// #endregion agent log

const BUCKET_NAME = process.env.AWS_S3_BUCKET!;

/**
 * Sanitize filename for S3 key
 * - Lowercase
 * - Replace spaces with hyphens
 * - Remove special characters except: - _ .
 * - Limit to 100 characters
 */
function sanitizeFilename(filename: string): string {
  const sanitized = filename
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-_.]/g, '')
    .slice(0, 100);

  return sanitized || 'document'; // Fallback if all chars removed
}

/**
 * Generate S3 key for a document
 * Pattern: documents/{loan_id}/{timestamp}-{sanitized_filename}
 */
export function generateDocumentKey(loanId: string, filename: string): string {
  const timestamp = Date.now();
  const sanitizedName = sanitizeFilename(filename);
  return `documents/${loanId}/${timestamp}-${sanitizedName}`;
}

/**
 * Validate Content-Type against whitelist
 */
export function isValidContentType(contentType: string): boolean {
  return ALLOWED_MIME_TYPES.includes(contentType as any);
}

/**
 * Validate file size
 */
export function isValidFileSize(sizeBytes: number): boolean {
  return sizeBytes > 0 && sizeBytes <= MAX_FILE_SIZE;
}

/**
 * Generate presigned PUT URL for document upload
 *
 * @param key - S3 key for the object
 * @param contentType - MIME type of the file
 * @param fileSizeBytes - Size of file in bytes (for validation)
 * @returns Presigned upload URL and metadata
 */
export async function generatePresignedUploadUrl(
  key: string,
  contentType: string,
  fileSizeBytes: number
): Promise<PresignedUploadUrl> {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/87f2cbbe-a1e1-4b67-90f7-00fcfc8f0474', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 's3.ts:94', message: 'generatePresignedUploadUrl entry', data: { key, contentType, fileSizeBytes, envAccessKeyPrefix: process.env.AWS_ACCESS_KEY_ID?.substring(0, 4) || 'UNDEFINED' }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'C' }) }).catch(() => { });
  // #endregion agent log

  // Validate inputs
  if (!isValidContentType(contentType)) {
    throw new Error(`Invalid content type: ${contentType}`);
  }

  if (!isValidFileSize(fileSizeBytes)) {
    throw new Error(`Invalid file size: ${fileSizeBytes} bytes (max ${MAX_FILE_SIZE})`);
  }

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
    // Server-side encryption for compliance
    ServerSideEncryption: 'AES256',
    // Optional: Add metadata
    Metadata: {
      'upload-timestamp': Date.now().toString(),
    },
  });

  // #region agent log
  let url;
  try {
    url = await getSignedUrl(s3Client, command, {
      expiresIn: UPLOAD_EXPIRATION,
    });
    fetch('http://127.0.0.1:7242/ingest/87f2cbbe-a1e1-4b67-90f7-00fcfc8f0474', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 's3.ts:132', message: 'getSignedUrl success', data: { urlPrefix: url.substring(0, 50) }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'C' }) }).catch(() => { });
  } catch (e: any) {
    fetch('http://127.0.0.1:7242/ingest/87f2cbbe-a1e1-4b67-90f7-00fcfc8f0474', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 's3.ts:132', message: 'getSignedUrl error', data: { error: String(e), errorMessage: e?.message, errorCode: e?.Code, errorAccessKeyId: e?.AccessKeyId?.substring(0, 4) }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'C' }) }).catch(() => { });
    throw e;
  }
  // #endregion agent log

  return {
    url,
    key,
    expiresIn: UPLOAD_EXPIRATION,
  };
}

/**
 * Generate presigned GET URL for document download
 *
 * @param key - S3 key for the object
 * @param filename - Optional filename for Content-Disposition header
 * @returns Presigned download URL
 */
export async function generatePresignedDownloadUrl(
  key: string,
  filename?: string
): Promise<PresignedDownloadUrl> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    // Set Content-Disposition to trigger download with original filename
    ...(filename && {
      ResponseContentDisposition: `attachment; filename="${filename}"`,
    }),
  });

  const url = await getSignedUrl(s3Client, command, {
    expiresIn: DOWNLOAD_EXPIRATION,
  });

  return {
    url,
    expiresIn: DOWNLOAD_EXPIRATION,
  };
}

/**
 * Delete object from S3
 * Used for cleanup when document metadata is deleted
 *
 * @param key - S3 key to delete
 */
export async function deleteObject(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
}

export interface UploadBufferResult {
  key: string;
  bucket: string;
  size: number;
}

/**
 * Upload a buffer directly to S3 (for server-generated documents)
 * Uses UUID in key to prevent race conditions
 *
 * @param loanId - Loan ID for organizing documents
 * @param filename - Human-readable filename
 * @param buffer - File contents as Buffer
 * @param contentType - MIME type (defaults to application/pdf)
 * @param metadata - Optional metadata for audit trail
 * @returns Upload result with S3 key
 */
export async function uploadBuffer(
  loanId: string,
  filename: string,
  buffer: Buffer,
  contentType: string = 'application/pdf',
  metadata?: Record<string, string>
): Promise<UploadBufferResult> {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/87f2cbbe-a1e1-4b67-90f7-00fcfc8f0474', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 's3.ts:193', message: 'uploadBuffer entry', data: { loanId, filename, contentType, bufferSize: buffer.length, envAccessKeyPrefix: process.env.AWS_ACCESS_KEY_ID?.substring(0, 4) || 'UNDEFINED' }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'D' }) }).catch(() => { });
  // #endregion agent log

  // Use UUID to prevent race conditions when same file is generated concurrently
  const uuid = randomUUID();
  const sanitizedName = sanitizeFilename(filename);
  const key = `documents/${loanId}/${uuid}-${sanitizedName}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    // Server-side encryption for compliance
    ServerSideEncryption: 'AES256',
    // Metadata for audit trail
    Metadata: {
      'upload-timestamp': Date.now().toString(),
      'generated-by': 'system',
      ...metadata,
    },
  });

  // #region agent log
  try {
    await s3Client.send(command);
    fetch('http://127.0.0.1:7242/ingest/87f2cbbe-a1e1-4b67-90f7-00fcfc8f0474', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 's3.ts:245', message: 's3Client.send success', data: { key }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'D' }) }).catch(() => { });
  } catch (e: any) {
    fetch('http://127.0.0.1:7242/ingest/87f2cbbe-a1e1-4b67-90f7-00fcfc8f0474', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 's3.ts:245', message: 's3Client.send error', data: { error: String(e), errorMessage: e?.message, errorCode: e?.Code, errorAccessKeyId: e?.AccessKeyId?.substring(0, 4) }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'D' }) }).catch(() => { });
    throw e;
  }
  // #endregion agent log

  return {
    key,
    bucket: BUCKET_NAME,
    size: buffer.length,
  };
}

/**
 * Extract filename from S3 key
 * Key format: documents/{loan_id}/{timestamp}-{filename}
 */
export function extractFilenameFromKey(key: string): string {
  const parts = key.split('/');
  const lastPart = parts[parts.length - 1];
  // Remove timestamp prefix (assumes format: {timestamp}-{filename})
  const match = lastPart.match(/^\d+-(.+)$/);
  return match ? match[1] : lastPart;
}

// Export constants for use in validation schemas
export { ALLOWED_MIME_TYPES, MAX_FILE_SIZE };
