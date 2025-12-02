import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

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

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

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
    // Optional: Add metadata
    Metadata: {
      'upload-timestamp': Date.now().toString(),
    },
  });

  const url = await getSignedUrl(s3Client, command, {
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
