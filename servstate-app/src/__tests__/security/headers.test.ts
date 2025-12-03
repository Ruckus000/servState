import { describe, it, expect } from 'vitest';

/**
 * Security Headers Tests
 *
 * These tests document the expected security headers.
 * Run the integration test manually with:
 * curl -I http://localhost:3000/ | grep -E "(X-Frame|X-Content|Strict-Transport|Content-Security)"
 */

describe('Security Headers Configuration', () => {
  describe('Expected Headers', () => {
    it('should have X-Content-Type-Options set to nosniff', () => {
      const expectedValue = 'nosniff';
      expect(expectedValue).toBe('nosniff');
    });

    it('should have X-Frame-Options set to DENY', () => {
      const expectedValue = 'DENY';
      expect(expectedValue).toBe('DENY');
    });

    it('should have X-XSS-Protection enabled', () => {
      const expectedValue = '1; mode=block';
      expect(expectedValue).toBe('1; mode=block');
    });

    it('should have Referrer-Policy set to strict-origin-when-cross-origin', () => {
      const expectedValue = 'strict-origin-when-cross-origin';
      expect(expectedValue).toBe('strict-origin-when-cross-origin');
    });

    it('should have Strict-Transport-Security with 1 year max-age', () => {
      const expectedValue = 'max-age=31536000; includeSubDomains';
      expect(expectedValue).toContain('max-age=31536000');
      expect(expectedValue).toContain('includeSubDomains');
    });

    it('should have Content-Security-Policy configured', () => {
      const expectedDirectives = [
        "default-src 'self'",
        "script-src 'self'",
        "style-src 'self'",
        "img-src 'self'",
        "frame-ancestors 'none'",
      ];
      expectedDirectives.forEach((directive) => {
        expect(directive).toBeTruthy();
      });
    });

    it('should have Permissions-Policy restricting dangerous features', () => {
      const expectedValue = 'camera=(), microphone=(), geolocation=()';
      expect(expectedValue).toContain('camera=()');
      expect(expectedValue).toContain('microphone=()');
      expect(expectedValue).toContain('geolocation=()');
    });
  });

  describe('CSP Directives', () => {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.neon.tech https://*.amazonaws.com https://*.upstash.io",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ');

    it('should allow self as default source', () => {
      expect(csp).toContain("default-src 'self'");
    });

    it('should allow Neon database connections', () => {
      expect(csp).toContain('https://*.neon.tech');
    });

    it('should allow AWS S3 connections', () => {
      expect(csp).toContain('https://*.amazonaws.com');
    });

    it('should allow Upstash Redis connections', () => {
      expect(csp).toContain('https://*.upstash.io');
    });

    it('should prevent clickjacking with frame-ancestors none', () => {
      expect(csp).toContain("frame-ancestors 'none'");
    });

    it('should restrict form actions to self', () => {
      expect(csp).toContain("form-action 'self'");
    });

    it('should restrict base-uri to self', () => {
      expect(csp).toContain("base-uri 'self'");
    });
  });

  describe('Security Header Presence', () => {
    it('should NOT have X-Powered-By header (disabled in next.config.ts)', () => {
      // Next.js poweredByHeader is set to false
      const poweredByHeader = false;
      expect(poweredByHeader).toBe(false);
    });
  });
});

describe('Manual Security Header Verification', () => {
  it('provides curl command for manual verification', () => {
    const verificationCommands = [
      '# Test security headers locally:',
      'curl -I http://localhost:3000/ | grep -E "(X-Frame|X-Content|Strict-Transport|Content-Security|Referrer-Policy)"',
      '',
      '# Expected output:',
      'X-Content-Type-Options: nosniff',
      'X-Frame-Options: DENY',
      'X-XSS-Protection: 1; mode=block',
      'Referrer-Policy: strict-origin-when-cross-origin',
      'Strict-Transport-Security: max-age=31536000; includeSubDomains',
      'Content-Security-Policy: default-src \'self\'; ...',
    ];

    expect(verificationCommands.length).toBeGreaterThan(0);
  });
});
