import { describe, it, expect, beforeAll, afterAll } from 'vitest';

/**
 * Integration tests for Neon database connection.
 * These tests verify real database connectivity and the compliance triggers.
 *
 * IMPORTANT: These tests run against the real Neon database.
 * Test data is prefixed with 'test-' and cleaned up after tests.
 */

// Skip integration tests if DATABASE_URL is not set
const skipIntegration = !process.env.DATABASE_URL;

// Dynamic import to avoid module load errors when DATABASE_URL is not set
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let sql: any;

describe.skipIf(skipIntegration)('Database Connection Integration', () => {
  const testPrefix = `test-${Date.now()}`;
  let testDocumentId: string | null = null;
  let testLoanId: string | null = null;

  beforeAll(async () => {
    // Dynamic import to avoid errors when DATABASE_URL is not set
    const db = await import('@/lib/db');
    sql = db.sql;
    // Find a test loan to use (or use hardcoded test loan ID)
    const loans = await sql`
      SELECT id FROM loans LIMIT 1
    `;
    if (loans.length > 0) {
      testLoanId = loans[0].id as string;
    }
  });

  afterAll(async () => {
    // Clean up test documents
    if (testDocumentId) {
      try {
        // Need to soft delete first due to hard delete trigger
        await sql`
          UPDATE documents SET deleted_at = NOW() WHERE id = ${testDocumentId}
        `;
      } catch {
        // Ignore cleanup errors
      }
    }
  });

  describe('Basic Connectivity', () => {
    it('should connect to Neon database', async () => {
      const result = await sql`SELECT 1 as test`;
      expect(result).toBeDefined();
      expect(result[0].test).toBe(1);
    });

    it('should query the documents table', async () => {
      const result = await sql`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'documents'
        ORDER BY ordinal_position
      `;
      expect(result.length).toBeGreaterThan(0);

      // Verify new columns exist
      const columnNames = result.map((r) => r.column_name);
      expect(columnNames).toContain('status');
      expect(columnNames).toContain('idempotency_key');
      expect(columnNames).toContain('retention_until');
      expect(columnNames).toContain('generated_by');
      expect(columnNames).toContain('generation_params');
    });
  });

  describe('Compliance Triggers', () => {
    it('should have prevent_premature_delete trigger', async () => {
      const result = await sql`
        SELECT trigger_name
        FROM information_schema.triggers
        WHERE event_object_table = 'documents'
        AND trigger_name = 'enforce_retention_period'
      `;
      expect(result.length).toBe(1);
    });

    it('should have prevent_hard_delete trigger', async () => {
      const result = await sql`
        SELECT trigger_name
        FROM information_schema.triggers
        WHERE event_object_table = 'documents'
        AND trigger_name = 'no_hard_deletes'
      `;
      expect(result.length).toBe(1);
    });

    it('should have prevent_generation_params_change trigger', async () => {
      const result = await sql`
        SELECT trigger_name
        FROM information_schema.triggers
        WHERE event_object_table = 'documents'
        AND trigger_name = 'prevent_params_modification'
      `;
      expect(result.length).toBe(1);
    });

    it.skipIf(!testLoanId)('should prevent hard deletes', async () => {
      // First create a test document
      const today = new Date().toISOString().split('T')[0];
      const insertResult = await sql`
        INSERT INTO documents (loan_id, name, type, date, size, status)
        VALUES (${testLoanId}, ${`${testPrefix}-test-doc`}, 'Statement', ${today}, '1 KB', 'uploaded')
        RETURNING id
      `;
      testDocumentId = insertResult[0].id as string;

      // Try to hard delete - should fail
      await expect(
        sql`DELETE FROM documents WHERE id = ${testDocumentId}`
      ).rejects.toThrow(/hard deletes not allowed/i);
    });

    it.skipIf(!testLoanId)('should enforce retention period on soft delete', async () => {
      // Create a dedicated test document for this test (not dependent on previous tests)
      const today = new Date().toISOString().split('T')[0];
      const retentionTestResult = await sql`
        INSERT INTO documents (loan_id, name, type, date, size, status)
        VALUES (${testLoanId}, ${`${testPrefix}-retention-doc`}, 'Statement', ${today}, '1 KB', 'uploaded')
        RETURNING id
      `;
      const retentionDocId = retentionTestResult[0].id as string;

      try {
        // Set retention_until to far future
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 7);

        await sql`
          UPDATE documents
          SET retention_until = ${futureDate.toISOString().split('T')[0]}
          WHERE id = ${retentionDocId}
        `;

        // Try to soft delete - should fail
        await expect(
          sql`UPDATE documents SET deleted_at = NOW() WHERE id = ${retentionDocId}`
        ).rejects.toThrow(/retention period/i);
      } finally {
        // Clean up: remove retention so we can delete
        await sql`
          UPDATE documents
          SET retention_until = NULL
          WHERE id = ${retentionDocId}
        `;
        await sql`
          UPDATE documents
          SET deleted_at = NOW()
          WHERE id = ${retentionDocId}
        `;
      }
    });
  });

  describe('Document Status Flow', () => {
    it.skipIf(!testLoanId)('should allow valid status values', async () => {
      const today = new Date().toISOString().split('T')[0];

      // Test pending status
      const result = await sql`
        INSERT INTO documents (loan_id, name, type, date, size, status)
        VALUES (${testLoanId}, ${`${testPrefix}-pending-doc`}, 'Statement', ${today}, '1 KB', 'pending')
        RETURNING status
      `;
      expect(result[0].status).toBe('pending');

      // Clean up
      const docId = (await sql`
        SELECT id FROM documents WHERE name = ${`${testPrefix}-pending-doc`}
      `)[0]?.id;

      if (docId) {
        await sql`UPDATE documents SET deleted_at = NOW() WHERE id = ${docId}`;
      }
    });

    it.skipIf(!testLoanId)('should reject invalid status values', async () => {
      const today = new Date().toISOString().split('T')[0];

      await expect(
        sql`
          INSERT INTO documents (loan_id, name, type, date, size, status)
          VALUES (${testLoanId}, ${`${testPrefix}-invalid-status`}, 'Statement', ${today}, '1 KB', 'invalid_status')
        `
      ).rejects.toThrow();
    });
  });

  describe('Idempotency Key', () => {
    it.skipIf(!testLoanId)('should enforce unique idempotency keys', async () => {
      const today = new Date().toISOString().split('T')[0];
      const idempotencyKey = `${testPrefix}-unique-key`;

      // First insert should succeed
      await sql`
        INSERT INTO documents (loan_id, name, type, date, size, status, idempotency_key)
        VALUES (${testLoanId}, ${`${testPrefix}-doc1`}, 'Statement', ${today}, '1 KB', 'uploaded', ${idempotencyKey})
      `;

      // Second insert with same key should fail
      await expect(
        sql`
          INSERT INTO documents (loan_id, name, type, date, size, status, idempotency_key)
          VALUES (${testLoanId}, ${`${testPrefix}-doc2`}, 'Statement', ${today}, '1 KB', 'uploaded', ${idempotencyKey})
        `
      ).rejects.toThrow(/unique/i);

      // Clean up
      const docId = (await sql`
        SELECT id FROM documents WHERE idempotency_key = ${idempotencyKey}
      `)[0]?.id;

      if (docId) {
        await sql`UPDATE documents SET deleted_at = NOW() WHERE id = ${docId}`;
      }
    });
  });
});
