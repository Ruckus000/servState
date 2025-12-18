import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock dependencies before importing the module
vi.mock('@/lib/db', () => ({
  sql: vi.fn(),
}));

vi.mock('@/lib/audit', () => ({
  logAudit: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/s3', () => ({
  uploadBuffer: vi.fn().mockResolvedValue({
    key: 'test-loan/documents/test-uuid-filename.pdf',
    size: 1024,
  }),
}));

vi.mock('@/lib/retention', () => ({
  calculateRetentionDate: vi.fn().mockReturnValue('2032-12-10'),
}));

import {
  generateIdempotencyKey,
  isRateLimited,
  getRateLimitInfo,
  RateLimitError,
  RetentionPeriodError,
} from '@/lib/document-service';

describe('Document Service Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('generateIdempotencyKey', () => {
    it('should generate key with loan ID, doc type, and params', () => {
      const key = generateIdempotencyKey('loan-123', 'payoff', {
        goodThroughDate: '2025-01-15',
      });

      expect(key).toContain('loan-123');
      expect(key).toContain('payoff');
      expect(key).toContain('goodThroughDate:2025-01-15');
    });

    it('should sort params alphabetically for consistent hash', () => {
      const key1 = generateIdempotencyKey('loan-123', 'history', {
        fromDate: '2025-01-01',
        toDate: '2025-01-15',
      });

      const key2 = generateIdempotencyKey('loan-123', 'history', {
        toDate: '2025-01-15',
        fromDate: '2025-01-01',
      });

      // Keys should be identical regardless of param order
      expect(key1).toBe(key2);
    });

    it('should include 5-minute bucket in key', () => {
      const key = generateIdempotencyKey('loan-123', 'payoff', {
        goodThroughDate: '2025-01-15',
      });

      // Key should end with a number (the bucket)
      expect(key).toMatch(/-\d+$/);
    });

    it('should handle empty params', () => {
      const key = generateIdempotencyKey('loan-123', 'custom', {});

      expect(key).toContain('loan-123');
      expect(key).toContain('custom');
    });
  });

  describe('Rate Limiting', () => {
    it('should allow first request', () => {
      const uniqueLoanId = `rate-test-${Date.now()}-1`;
      expect(isRateLimited(uniqueLoanId)).toBe(false);
    });

    it('should track request count', () => {
      const uniqueLoanId = `rate-test-${Date.now()}-2`;

      // Make first request
      isRateLimited(uniqueLoanId);

      const info = getRateLimitInfo(uniqueLoanId);
      expect(info.remaining).toBe(9); // 10 max - 1 used
    });

    it('should rate limit after max requests', () => {
      const uniqueLoanId = `rate-test-${Date.now()}-3`;

      // Make 10 requests (max allowed)
      for (let i = 0; i < 10; i++) {
        isRateLimited(uniqueLoanId);
      }

      // 11th request should be rate limited
      expect(isRateLimited(uniqueLoanId)).toBe(true);
    });

    it('should return correct remaining count', () => {
      const uniqueLoanId = `rate-test-${Date.now()}-4`;

      // Make 5 requests
      for (let i = 0; i < 5; i++) {
        isRateLimited(uniqueLoanId);
      }

      const info = getRateLimitInfo(uniqueLoanId);
      expect(info.remaining).toBe(5); // 10 - 5
    });

    it('should return reset time in the future', () => {
      const uniqueLoanId = `rate-test-${Date.now()}-5`;
      isRateLimited(uniqueLoanId);

      const info = getRateLimitInfo(uniqueLoanId);
      expect(info.resetAt).toBeGreaterThan(Date.now());
    });

    it('should return max remaining for new loan', () => {
      const uniqueLoanId = `rate-test-${Date.now()}-6`;

      const info = getRateLimitInfo(uniqueLoanId);
      expect(info.remaining).toBe(10);
    });
  });

  describe('Error Classes', () => {
    it('should create RateLimitError with correct properties', () => {
      const resetAt = Date.now() + 3600000;
      const error = new RateLimitError('Rate limit exceeded', resetAt);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(RateLimitError);
      expect(error.name).toBe('RateLimitError');
      expect(error.message).toBe('Rate limit exceeded');
      expect(error.resetAt).toBe(resetAt);
    });

    it('should create RetentionPeriodError with correct properties', () => {
      const retentionUntil = '2032-01-15';
      const error = new RetentionPeriodError('Document in retention', retentionUntil);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(RetentionPeriodError);
      expect(error.name).toBe('RetentionPeriodError');
      expect(error.message).toBe('Document in retention');
      expect(error.retentionUntil).toBe(retentionUntil);
    });
  });

  describe('Document Type Validation', () => {
    it('should support payoff generation params format', () => {
      const params = {
        type: 'payoff' as const,
        goodThroughDate: '2025-12-31',
        loanId: 'loan-123',
      };

      const key = generateIdempotencyKey(params.loanId, params.type, {
        goodThroughDate: params.goodThroughDate,
      });

      expect(key).toContain('payoff');
      expect(key).toContain('goodThroughDate:2025-12-31');
    });

    it('should support payment history generation params format', () => {
      const params = {
        type: 'payment_history' as const,
        fromDate: '2025-01-01',
        toDate: '2025-12-31',
        loanId: 'loan-123',
      };

      const key = generateIdempotencyKey(params.loanId, params.type, {
        fromDate: params.fromDate,
        toDate: params.toDate,
      });

      expect(key).toContain('payment_history');
      expect(key).toContain('fromDate:2025-01-01');
      expect(key).toContain('toDate:2025-12-31');
    });
  });
});
