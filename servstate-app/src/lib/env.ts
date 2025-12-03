import { z } from 'zod';

/**
 * Environment variable validation schema
 * Validates all required environment variables at startup
 */
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // NextAuth
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL').optional(),

  // AWS S3 (optional for development)
  AWS_ACCESS_KEY_ID: z.string().min(16).optional(),
  AWS_SECRET_ACCESS_KEY: z.string().min(32).optional(),
  AWS_REGION: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),

  // Upstash Redis (for rate limiting)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Resend (for emails)
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),
});

export type Env = z.infer<typeof envSchema>;

let validatedEnv: Env | null = null;

/**
 * Validates environment variables against the schema
 * Throws an error if required variables are missing
 */
export function validateEnv(): Env {
  if (validatedEnv) {
    return validatedEnv;
  }

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.format();
    console.error('❌ Environment validation failed:');
    console.error(JSON.stringify(errors, null, 2));

    // In development, warn but don't crash for optional vars
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Running in development mode with missing optional environment variables');
      // Return partial env for development
      validatedEnv = process.env as unknown as Env;
      return validatedEnv;
    }

    throw new Error('Missing required environment variables. Check the logs above.');
  }

  validatedEnv = result.data;
  return validatedEnv;
}

/**
 * Get a specific environment variable with type safety
 */
export function getEnv<K extends keyof Env>(key: K): Env[K] {
  const env = validateEnv();
  return env[key];
}

/**
 * Check if rate limiting is configured
 */
export function isRateLimitingEnabled(): boolean {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

/**
 * Check if email sending is configured
 */
export function isEmailEnabled(): boolean {
  return !!process.env.RESEND_API_KEY;
}
