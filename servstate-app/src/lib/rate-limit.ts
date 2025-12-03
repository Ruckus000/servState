import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { isRateLimitingEnabled } from './env';

/**
 * Rate limiting configuration using Upstash Redis
 * Provides sliding window rate limiting for different endpoint types
 */

// Lazy initialization of Redis client
let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (!isRateLimitingEnabled()) {
    return null;
  }

  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }

  return redis;
}

// Lazy initialization of rate limiters
let _authRateLimiter: Ratelimit | null = null;
let _apiRateLimiter: Ratelimit | null = null;
let _uploadRateLimiter: Ratelimit | null = null;

/**
 * Rate limiter for authentication endpoints
 * 5 attempts per 15 minutes per IP
 */
export function getAuthRateLimiter(): Ratelimit | null {
  const client = getRedis();
  if (!client) return null;

  if (!_authRateLimiter) {
    _authRateLimiter = new Ratelimit({
      redis: client,
      limiter: Ratelimit.slidingWindow(5, '15 m'),
      analytics: true,
      prefix: 'ratelimit:auth',
    });
  }

  return _authRateLimiter;
}

/**
 * Rate limiter for general API endpoints
 * 100 requests per minute per user
 */
export function getApiRateLimiter(): Ratelimit | null {
  const client = getRedis();
  if (!client) return null;

  if (!_apiRateLimiter) {
    _apiRateLimiter = new Ratelimit({
      redis: client,
      limiter: Ratelimit.slidingWindow(100, '1 m'),
      analytics: true,
      prefix: 'ratelimit:api',
    });
  }

  return _apiRateLimiter;
}

/**
 * Rate limiter for file upload endpoints
 * 20 uploads per hour per user
 */
export function getUploadRateLimiter(): Ratelimit | null {
  const client = getRedis();
  if (!client) return null;

  if (!_uploadRateLimiter) {
    _uploadRateLimiter = new Ratelimit({
      redis: client,
      limiter: Ratelimit.slidingWindow(20, '1 h'),
      analytics: true,
      prefix: 'ratelimit:upload',
    });
  }

  return _uploadRateLimiter;
}

/**
 * Check rate limit for an identifier
 * Returns success if rate limiting is disabled or within limits
 */
export async function checkAuthRateLimit(
  identifier: string
): Promise<{ success: boolean; remaining: number; reset: number }> {
  const limiter = getAuthRateLimiter();

  // If rate limiting is not configured, allow the request
  if (!limiter) {
    return { success: true, remaining: -1, reset: 0 };
  }

  const result = await limiter.limit(identifier);
  return {
    success: result.success,
    remaining: result.remaining,
    reset: result.reset,
  };
}

/**
 * Check API rate limit for an identifier
 */
export async function checkApiRateLimit(
  identifier: string
): Promise<{ success: boolean; remaining: number; reset: number }> {
  const limiter = getApiRateLimiter();

  if (!limiter) {
    return { success: true, remaining: -1, reset: 0 };
  }

  const result = await limiter.limit(identifier);
  return {
    success: result.success,
    remaining: result.remaining,
    reset: result.reset,
  };
}

/**
 * Check upload rate limit for an identifier
 */
export async function checkUploadRateLimit(
  identifier: string
): Promise<{ success: boolean; remaining: number; reset: number }> {
  const limiter = getUploadRateLimiter();

  if (!limiter) {
    return { success: true, remaining: -1, reset: 0 };
  }

  const result = await limiter.limit(identifier);
  return {
    success: result.success,
    remaining: result.remaining,
    reset: result.reset,
  };
}

/**
 * Get client IP from request headers
 */
export function getClientIp(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('x-real-ip') ||
    'unknown'
  );
}
