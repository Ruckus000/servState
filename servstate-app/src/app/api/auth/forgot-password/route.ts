import { NextRequest } from 'next/server';
import { randomBytes, createHash } from 'crypto';
import { sql } from '@/lib/db';
import { sendPasswordResetEmail } from '@/lib/email';
import { errorResponse, successResponse, createAuditLogEntry } from '@/lib/api-helpers';
import { checkAuthRateLimit, getClientIp } from '@/lib/rate-limit';
import { z } from 'zod';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

/**
 * POST /api/auth/forgot-password
 * Initiates password reset flow
 * Security: Rate limited, doesn't reveal if email exists
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limit password reset requests by IP
    const ip = getClientIp(request.headers);
    const { success, reset } = await checkAuthRateLimit(`reset:${ip}`);

    if (!success) {
      const retryAfter = Math.ceil((reset - Date.now()) / 1000);
      return errorResponse(
        `Too many requests. Please try again in ${retryAfter} seconds.`,
        429
      );
    }

    const body = await request.json();

    // Validate input
    const validation = forgotPasswordSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse('Invalid email address', 400);
    }

    const { email } = validation.data;

    // Find user (don't reveal if email exists in response)
    const users = await sql`
      SELECT id, name, email FROM users WHERE email = ${email.toLowerCase()}
    `;

    if (users.length > 0) {
      const user = users[0];

      // Invalidate any existing reset tokens for this user
      await sql`
        UPDATE password_reset_tokens
        SET used = true
        WHERE user_id = ${user.id} AND used = false
      `;

      // Generate secure token
      const token = randomBytes(32).toString('hex');
      const tokenHash = createHash('sha256').update(token).digest('hex');
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

      // Store hashed token
      await sql`
        INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
        VALUES (${user.id}, ${tokenHash}, ${expiresAt})
      `;

      // Send email with plaintext token
      await sendPasswordResetEmail(user.email, token, user.name);

      // Audit log
      await createAuditLogEntry({
        loanId: null,
        actionType: 'PASSWORD_RESET_REQUESTED',
        category: 'SECURITY',
        description: `Password reset requested for user ${user.email}`,
        performedBy: user.id,
        details: { ip },
      });
    }

    // Always return success (don't reveal if email exists)
    return successResponse({
      message: 'If an account exists with that email, a reset link has been sent.',
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return errorResponse('Failed to process request', 500);
  }
}
