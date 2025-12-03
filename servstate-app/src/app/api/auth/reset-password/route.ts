import { NextRequest } from 'next/server';
import { createHash } from 'crypto';
import bcrypt from 'bcryptjs';
import { sql, transaction } from '@/lib/db';
import { errorResponse, successResponse, createAuditLogEntry } from '@/lib/api-helpers';
import { checkAuthRateLimit, getClientIp } from '@/lib/rate-limit';
import { z } from 'zod';

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

/**
 * POST /api/auth/reset-password
 * Completes password reset with token
 * Security: Rate limited, token validated, password hashed
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limit reset attempts by IP
    const ip = getClientIp(request.headers);
    const { success, reset } = await checkAuthRateLimit(`reset-complete:${ip}`);

    if (!success) {
      const retryAfter = Math.ceil((reset - Date.now()) / 1000);
      return errorResponse(
        `Too many requests. Please try again in ${retryAfter} seconds.`,
        429
      );
    }

    const body = await request.json();

    // Validate input
    const validation = resetPasswordSchema.safeParse(body);
    if (!validation.success) {
      const errors = validation.error.issues.map((e) => e.message).join(', ');
      return errorResponse(errors, 400);
    }

    const { token, password } = validation.data;

    // Hash the token to compare with stored hash
    const tokenHash = createHash('sha256').update(token).digest('hex');

    // Find valid token
    const tokens = await sql`
      SELECT prt.id, prt.user_id, prt.expires_at, prt.used, u.email
      FROM password_reset_tokens prt
      JOIN users u ON u.id = prt.user_id
      WHERE prt.token_hash = ${tokenHash}
    `;

    if (tokens.length === 0) {
      return errorResponse('Invalid or expired reset link', 400);
    }

    const resetToken = tokens[0];

    // Check if token is already used
    if (resetToken.used) {
      return errorResponse('This reset link has already been used', 400);
    }

    // Check if token is expired
    if (new Date(resetToken.expires_at) < new Date()) {
      return errorResponse('This reset link has expired', 400);
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 12);

    // Update user password and mark token as used in a single transaction
    await transaction(async (client) => {
      await client.query('UPDATE users SET password_hash = $1 WHERE id = $2', [
        passwordHash,
        resetToken.user_id,
      ]);
      await client.query('UPDATE password_reset_tokens SET used = true WHERE id = $1', [
        resetToken.id,
      ]);
    });

    // Audit log
    await createAuditLogEntry({
      loanId: null,
      actionType: 'PASSWORD_RESET_COMPLETED',
      category: 'SECURITY',
      description: `Password reset completed for user ${resetToken.email}`,
      performedBy: resetToken.user_id,
      details: { ip },
    });

    return successResponse({
      message: 'Password has been reset successfully. You can now log in with your new password.',
    });
  } catch (error) {
    console.error('Password reset completion error:', error);
    return errorResponse('Failed to reset password', 500);
  }
}
