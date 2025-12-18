import { describe, it, expect, afterAll } from 'vitest';
import { S3Client, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { uploadBuffer, generatePresignedDownloadUrl } from '@/lib/s3';

/**
 * Integration tests for AWS S3 connection.
 * These tests verify real S3 connectivity and the uploadBuffer function.
 *
 * IMPORTANT: These tests run against the real S3 bucket.
 * Test files are prefixed with 'test/' and cleaned up after tests.
 */

// Skip integration tests if S3 credentials are not set
const skipIntegration = !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY;

// Test loan ID and prefix for cleanup
const TEST_LOAN_ID = 'test-loan-id';
const testKeys: string[] = [];

// S3 client for cleanup
const s3Client = skipIntegration
  ? null
  : new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

describe.skipIf(skipIntegration)('S3 Connection Integration', () => {
  afterAll(async () => {
    // Clean up test files
    if (!s3Client) return;

    for (const key of testKeys) {
      try {
        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME!,
            Key: key,
          })
        );
      } catch {
        // Ignore cleanup errors
      }
    }
  });

  describe('uploadBuffer', () => {
    it('should upload a buffer to S3', async () => {
      const testContent = 'Test document content ' + Date.now();
      const buffer = Buffer.from(testContent);
      const filename = `test-upload-${Date.now()}.txt`;

      const result = await uploadBuffer(TEST_LOAN_ID, filename, buffer, 'text/plain', {
        'test-marker': 'integration-test',
      });

      // Track for cleanup
      testKeys.push(result.key);

      expect(result.key).toContain(TEST_LOAN_ID);
      expect(result.key).toContain('.txt');
      expect(result.size).toBe(buffer.length);

      // Verify the file exists in S3
      const headCommand = new HeadObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: result.key,
      });

      const headResult = await s3Client!.send(headCommand);
      expect(headResult.ContentLength).toBe(buffer.length);
      expect(headResult.ContentType).toBe('text/plain');
    });

    it('should upload a PDF buffer', async () => {
      // Simple PDF content (minimal valid PDF)
      const pdfContent = Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF');
      const filename = `test-document-${Date.now()}.pdf`;

      const result = await uploadBuffer(TEST_LOAN_ID, filename, pdfContent, 'application/pdf');

      testKeys.push(result.key);

      expect(result.key).toContain('.pdf');
      expect(result.size).toBe(pdfContent.length);
    });

    it('should generate unique keys for same filename', async () => {
      const buffer = Buffer.from('Test content');
      const filename = 'same-name.txt';

      const result1 = await uploadBuffer(TEST_LOAN_ID, filename, buffer, 'text/plain');
      const result2 = await uploadBuffer(TEST_LOAN_ID, filename, buffer, 'text/plain');

      testKeys.push(result1.key, result2.key);

      // Keys should be different due to UUID
      expect(result1.key).not.toBe(result2.key);
    });
  });

  describe('getPresignedDownloadUrl', () => {
    it('should generate a presigned download URL', async () => {
      // First upload a file
      const buffer = Buffer.from('Download test content');
      const filename = `test-download-${Date.now()}.txt`;

      const uploadResult = await uploadBuffer(TEST_LOAN_ID, filename, buffer, 'text/plain');
      testKeys.push(uploadResult.key);

      // Get presigned URL
      const { url, expiresIn } = await generatePresignedDownloadUrl(uploadResult.key, filename);

      expect(url).toContain('https://');
      expect(url).toContain(process.env.AWS_S3_BUCKET_NAME);
      expect(expiresIn).toBe(3600); // Default expiry

      // Verify the URL is accessible (basic check)
      const response = await fetch(url, { method: 'HEAD' });
      expect(response.ok).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle empty buffer gracefully', async () => {
      const emptyBuffer = Buffer.from('');
      const filename = `test-empty-${Date.now()}.txt`;

      // Should still upload (empty files are valid)
      const result = await uploadBuffer(TEST_LOAN_ID, filename, emptyBuffer, 'text/plain');
      testKeys.push(result.key);

      expect(result.size).toBe(0);
    });
  });
});
