import { Resend } from 'resend';
import { isEmailEnabled } from './env';

/**
 * Email service using Resend
 * Provides email sending capabilities for password reset and notifications
 */

// Lazy initialization of Resend client
let resend: Resend | null = null;

function getResendClient(): Resend | null {
  if (!isEmailEnabled()) {
    return null;
  }

  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }

  return resend;
}

/**
 * Send a password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  userName: string
): Promise<{ success: boolean; error?: string }> {
  const client = getResendClient();

  if (!client) {
    console.warn('Email service not configured. Skipping password reset email.');
    // In development, log the reset link
    if (process.env.NODE_ENV === 'development') {
      const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
      console.log(`[DEV] Password reset link for ${email}: ${resetUrl}`);
    }
    return { success: true }; // Return success in dev without actually sending
  }

  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;
  const fromEmail = process.env.EMAIL_FROM || 'noreply@servstate.com';

  try {
    const { error } = await client.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Reset Your ServState Password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1a1a1a; margin-bottom: 10px;">ServState</h1>
            <p style="color: #666;">Mortgage Servicing Platform</p>
          </div>

          <h2 style="color: #1a1a1a;">Password Reset Request</h2>

          <p>Hi ${userName},</p>

          <p>You requested to reset your password for your ServState account. Click the button below to set a new password:</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="display: inline-block; background-color: #0070f3; color: white; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: 600;">
              Reset Password
            </a>
          </div>

          <p style="color: #666; font-size: 14px;">
            This link will expire in 30 minutes for security reasons.
          </p>

          <p style="color: #666; font-size: 14px;">
            If you didn't request this password reset, please ignore this email or contact support if you have concerns.
          </p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

          <p style="color: #999; font-size: 12px; text-align: center;">
            This email was sent by ServState. Please do not reply to this email.
          </p>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Failed to send password reset email:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send a notification email
 */
export async function sendNotificationEmail(
  email: string,
  subject: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  const client = getResendClient();

  if (!client) {
    console.warn('Email service not configured. Skipping notification email.');
    return { success: true };
  }

  const fromEmail = process.env.EMAIL_FROM || 'noreply@servstate.com';

  try {
    const { error } = await client.emails.send({
      from: fromEmail,
      to: email,
      subject: `ServState: ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1a1a1a; margin-bottom: 10px;">ServState</h1>
          </div>

          <h2 style="color: #1a1a1a;">${subject}</h2>

          <div style="margin: 20px 0;">
            ${message}
          </div>

          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

          <p style="color: #999; font-size: 12px; text-align: center;">
            This email was sent by ServState. Please do not reply to this email.
          </p>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Failed to send notification email:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending notification email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
