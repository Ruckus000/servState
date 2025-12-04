import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { generateCsrfToken } from '@/lib/csrf';

/**
 * GET /api/csrf
 * Returns a CSRF token for the current session
 * Frontend should call this and include the token in state-changing requests
 *
 * Note: This is separate from NextAuth's built-in /api/auth/csrf endpoint.
 * NextAuth's CSRF is for login protection, this is for API request protection.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate CSRF token tied to user's session
    const token = generateCsrfToken(session.user.id);

    return NextResponse.json({ csrfToken: token });
  } catch (error) {
    console.error('CSRF token generation error:', error);
    return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 });
  }
}
