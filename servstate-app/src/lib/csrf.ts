import { randomBytes, createHmac, timingSafeEqual } from 'crypto';

const CSRF_SECRET = process.env.NEXTAUTH_SECRET!;

/**
 * Generate a CSRF token tied to a session ID
 * Format: token:hmac where hmac validates the token was generated for this session
 */
export function generateCsrfToken(sessionId: string): string {
  const token = randomBytes(32).toString('hex');
  const hmac = createHmac('sha256', CSRF_SECRET)
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

  const expectedHmac = createHmac('sha256', CSRF_SECRET)
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
