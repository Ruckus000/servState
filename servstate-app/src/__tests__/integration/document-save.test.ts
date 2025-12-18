import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

/**
 * Integration tests for the complete document save flow.
 * These tests verify the full workflow: DB insert → S3 upload → DB update.
 *
 * IMPORTANT: These tests run against real Neon DB and S3.
 * Test data is cleaned up after tests.
 */

// Skip if credentials not set
const skipIntegration =
  !process.env.DATABASE_URL ||
  !process.env.AWS_ACCESS_KEY_ID ||
  !process.env.AWS_SECRET_ACCESS_KEY;

// Dynamic imports to avoid module load errors when env vars are not set
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let sql: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let saveDocument: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let generateIdempotencyKey: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let findExistingDocument: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let isRateLimited: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let getRateLimitInfo: any;

const testPrefix = `test-${Date.now()}`;
const createdDocumentIds: string[] = [];
const createdS3Keys: string[] = [];

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

describe.skipIf(skipIntegration)('Document Save Integration', () => {
  let testLoanId: string | null = null;
  let testUserId: string | null = null;

  beforeAll(async () => {
    // Dynamic imports to avoid errors when env vars are not set
    const db = await import('@/lib/db');
    sql = db.sql;

    const docService = await import('@/lib/document-service');
    saveDocument = docService.saveDocument;
    generateIdempotencyKey = docService.generateIdempotencyKey;
    findExistingDocument = docService.findExistingDocument;
    isRateLimited = docService.isRateLimited;
    getRateLimitInfo = docService.getRateLimitInfo;

    // Find a test loan and user to use
    const loans = await sql`SELECT id FROM loans LIMIT 1`;
    if (loans.length > 0) {
      testLoanId = loans[0].id as string;
    }

    const users = await sql`SELECT id, name FROM users LIMIT 1`;
    if (users.length > 0) {
      testUserId = users[0].id as string;
    }
  });

  afterAll(async () => {
    // Clean up test documents from DB
    for (const docId of createdDocumentIds) {
      try {
        // Remove retention so we can soft delete
        await sql`UPDATE documents SET retention_until = NULL WHERE id = ${docId}`;
        await sql`UPDATE documents SET deleted_at = NOW() WHERE id = ${docId}`;
      } catch {
        // Ignore cleanup errors
      }
    }

    // Clean up test files from S3
    if (s3Client) {
      for (const key of createdS3Keys) {
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
    }
  });

  describe('Idempotency Key Generation', () => {
    it('should generate consistent keys for same parameters', () => {
      const loanId = 'loan-123';
      const docType = 'payoff';
      const params = { goodThroughDate: '2025-01-15' };

      const key1 = generateIdempotencyKey(loanId, docType, params);
      const key2 = generateIdempotencyKey(loanId, docType, params);

      // Within same 5-minute window, keys should be identical
      expect(key1).toBe(key2);
    });

    it('should generate different keys for different parameters', () => {
      const loanId = 'loan-123';
      const docType = 'payoff';

      const key1 = generateIdempotencyKey(loanId, docType, { goodThroughDate: '2025-01-15' });
      const key2 = generateIdempotencyKey(loanId, docType, { goodThroughDate: '2025-01-16' });

      expect(key1).not.toBe(key2);
    });

    it('should generate different keys for different document types', () => {
      const loanId = 'loan-123';
      const params = { fromDate: '2025-01-01', toDate: '2025-01-15' };

      const key1 = generateIdempotencyKey(loanId, 'payoff', params);
      const key2 = generateIdempotencyKey(loanId, 'payment_history', params);

      expect(key1).not.toBe(key2);
    });
  });

  describe('Rate Limiting', () => {
    it('should not rate limit first request', () => {
      const testLoan = `rate-limit-test-${Date.now()}`;
      expect(isRateLimited(testLoan)).toBe(false);
    });

    it('should track remaining requests', () => {
      const testLoan = `rate-limit-track-${Date.now()}`;

      // First request
      isRateLimited(testLoan);
      const info = getRateLimitInfo(testLoan);

      expect(info.remaining).toBe(9); // 10 - 1
      expect(info.resetAt).toBeGreaterThan(Date.now());
    });
  });

  describe('Full Save Flow', () => {
    it('should save a document with correct sequence', async () => {
      // Skip if no test data available (checked at runtime, not module load)
      if (!testLoanId || !testUserId) {
        console.log('Skipping: no test loan/user data available');
        return;
      }

      const documentName = `${testPrefix}-payoff-statement.pdf`;

      const result = await saveDocument({
        loanId: testLoanId,
        documentName,
        documentType: 'Statement',
        generationParams: {
          type: 'payoff',
          goodThroughDate: '2025-12-31',
          loanId: testLoanId!,
        },
        userId: testUserId!,
        userName: 'Test User',
        generatePdf: async () => Buffer.from('%PDF-1.4\nTest PDF content'),
      });

      // Track for cleanup
      createdDocumentIds.push(result.document.id);
      if (result.document.storage_path) {
        createdS3Keys.push(result.document.storage_path);
      }

      expect(result.isExisting).toBe(false);
      expect(result.document.id).toBeDefined();
      expect(result.document.name).toBe(documentName);
      expect(result.document.status).toBe('uploaded');
      expect(result.document.storage_path).toBeTruthy();
      expect(result.document.generated_by).toBe(testUserId);
      expect(result.document.generation_params).toBeDefined();
    });

    it('should return existing document within idempotency window', async () => {
      if (!testLoanId || !testUserId) {
        console.log('Skipping: no test loan/user data available');
        return;
      }

      const documentName = `${testPrefix}-idempotent-doc.pdf`;
      const goodThroughDate = '2025-12-25';

      // First save
      const result1 = await saveDocument({
        loanId: testLoanId,
        documentName,
        documentType: 'Statement',
        generationParams: {
          type: 'payoff',
          goodThroughDate,
          loanId: testLoanId,
        },
        userId: testUserId,
        userName: 'Test User',
        generatePdf: async () => Buffer.from('%PDF-1.4\nFirst PDF'),
      });

      createdDocumentIds.push(result1.document.id);
      if (result1.document.storage_path) {
        createdS3Keys.push(result1.document.storage_path);
      }

      // Second save with same params (within 5-minute window)
      const result2 = await saveDocument({
        loanId: testLoanId,
        documentName: `${testPrefix}-idempotent-doc-2.pdf`, // Different name
        documentType: 'Statement',
        generationParams: {
          type: 'payoff',
          goodThroughDate, // Same date
          loanId: testLoanId,
        },
        userId: testUserId,
        userName: 'Test User',
        generatePdf: async () => Buffer.from('%PDF-1.4\nSecond PDF'),
      });

      // Should return existing document
      expect(result2.isExisting).toBe(true);
      expect(result2.document.id).toBe(result1.document.id);
    });

    it('should bypass idempotency with regenerate flag', async () => {
      if (!testLoanId || !testUserId) {
        console.log('Skipping: no test loan/user data available');
        return;
      }

      const documentName = `${testPrefix}-regenerate-doc.pdf`;
      const goodThroughDate = '2025-12-20';

      // First save
      const result1 = await saveDocument({
        loanId: testLoanId,
        documentName,
        documentType: 'Statement',
        generationParams: {
          type: 'payoff',
          goodThroughDate,
          loanId: testLoanId,
        },
        userId: testUserId,
        userName: 'Test User',
        generatePdf: async () => Buffer.from('%PDF-1.4\nOriginal PDF'),
      });

      createdDocumentIds.push(result1.document.id);
      if (result1.document.storage_path) {
        createdS3Keys.push(result1.document.storage_path);
      }

      // Second save with regenerate=true
      const result2 = await saveDocument({
        loanId: testLoanId,
        documentName: `${testPrefix}-regenerate-doc-new.pdf`,
        documentType: 'Statement',
        generationParams: {
          type: 'payoff',
          goodThroughDate,
          loanId: testLoanId,
        },
        userId: testUserId,
        userName: 'Test User',
        regenerate: true, // Force regeneration
        generatePdf: async () => Buffer.from('%PDF-1.4\nRegenerated PDF'),
      });

      createdDocumentIds.push(result2.document.id);
      if (result2.document.storage_path) {
        createdS3Keys.push(result2.document.storage_path);
      }

      // Should create new document
      expect(result2.isExisting).toBe(false);
      expect(result2.document.id).not.toBe(result1.document.id);
    });
  });

  describe('findExistingDocument', () => {
    it('should return null for non-existent key', async () => {
      const result = await findExistingDocument('non-existent-key-12345');
      expect(result).toBeNull();
    });
  });
});
