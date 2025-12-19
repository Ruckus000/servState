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

// Lazy initialization: Create S3Client on first use (after Next.js loads env vars)
let s3ClientInstance: S3Client | null = null;

function getS3Client(): S3Client {
  if (s3ClientInstance) {
    return s3ClientInstance;
  }

  // Validate required env vars
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error('AWS credentials not found in environment variables. Check .env.local file.');
  }

  if (!process.env.AWS_S3_BUCKET) {
    throw new Error('AWS_S3_BUCKET not found in environment variables');
  }

  // Build S3Client config with explicit credentials
  const s3ClientConfig = {
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  };

  s3ClientInstance = new S3Client(s3ClientConfig);
  return s3ClientInstance;
}

function getBucketName(): string {
  const bucket = process.env.AWS_S3_BUCKET;
  if (!bucket) {
    throw new Error('AWS_S3_BUCKET not found in environment variables');
  }
  return bucket;
}

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
  // Validate inputs
  if (!isValidContentType(contentType)) {
    throw new Error(`Invalid content type: ${contentType}`);
  }

  if (!isValidFileSize(fileSizeBytes)) {
    throw new Error(`Invalid file size: ${fileSizeBytes} bytes (max ${MAX_FILE_SIZE})`);
  }

  const command = new PutObjectCommand({
    Bucket: getBucketName(),
    Key: key,
    ContentType: contentType,
    // Server-side encryption for compliance
    ServerSideEncryption: 'AES256',
    // Optional: Add metadata
    Metadata: {
      'upload-timestamp': Date.now().toString(),
    },
  });

  const url = await getSignedUrl(getS3Client(), command, {
    expiresIn: UPLOAD_EXPIRATION,
  });

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
    Bucket: getBucketName(),
    Key: key,
    // Set Content-Disposition to trigger download with original filename
    ...(filename && {
      ResponseContentDisposition: `attachment; filename="${filename}"`,
    }),
  });

  const url = await getSignedUrl(getS3Client(), command, {
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
    Bucket: getBucketName(),
    Key: key,
  });

  await getS3Client().send(command);
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
  // Use UUID to prevent race conditions when same file is generated concurrently
  const uuid = randomUUID();
  const sanitizedName = sanitizeFilename(filename);
  const key = `documents/${loanId}/${uuid}-${sanitizedName}`;

  const command = new PutObjectCommand({
    Bucket: getBucketName(),
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

  await getS3Client().send(command);

  return {
    key,
    bucket: getBucketName(),
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
