import { randomBytes, createHmac, timingSafeEqual } from 'crypto';

function getSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error(
      'NEXTAUTH_SECRET environment variable is not set. ' +
      'Generate one with: openssl rand -base64 32'
    );
  }
  return secret;
}

// Lazy initialization - secret is only retrieved when first needed at runtime
// This prevents build-time errors when NEXTAUTH_SECRET isn't available
let _csrfSecret: string | null = null;

function getCsrfSecret(): string {
  if (_csrfSecret) return _csrfSecret;

  // Skip during build time - these functions should only be called at runtime
  if (process.env.NEXT_PHASE === 'phase-production-build' ||
    (process.env.VERCEL === '1' && process.env.CI === '1')) {
    throw new Error('CSRF operations cannot be performed during build time');
  }

  _csrfSecret = getSecret();
  return _csrfSecret;
}

/**
 * Generate a CSRF token tied to a session ID
 * Format: token:hmac where hmac validates the token was generated for this session
 */
export function generateCsrfToken(sessionId: string): string {
  const token = randomBytes(32).toString('hex');
  const hmac = createHmac('sha256', getCsrfSecret())
    .update(`${sessionId}:${token}`)
    .digest('hex');
  return `${token}:${hmac}`;
}

/**
 * Validate a CSRF token against a session ID
 * Uses timing-safe comparison to prevent timing attacks
 */
export function validateCsrfToken(token: string, sessionId: string): boolean {
  if (!token || !sessionId) {
    return false;
  }

  const parts = token.split(':');
  if (parts.length !== 2) {
    return false;
  }

  const [tokenPart, hmacPart] = parts;

  if (!tokenPart || !hmacPart) {
    return false;
  }

  const expectedHmac = createHmac('sha256', getCsrfSecret())
    .update(`${sessionId}:${tokenPart}`)
    .digest('hex');

  // Use timing-safe comparison to prevent timing attacks
  try {
    const hmacBuffer = Buffer.from(hmacPart, 'hex');
    const expectedBuffer = Buffer.from(expectedHmac, 'hex');

    if (hmacBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return timingSafeEqual(hmacBuffer, expectedBuffer);
  } catch {
    return false;
  }
}

/**
 * Generate a unique idempotency key for transactions
 * Format: timestamp-randomBytes
 */
export function generateIdempotencyKey(): string {
  const timestamp = Date.now().toString(36);
  const random = randomBytes(16).toString('hex');
  return `${timestamp}-${random}`;
}
