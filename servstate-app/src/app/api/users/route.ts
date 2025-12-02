import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { sql } from '@/lib/db';
import { errorResponse, successResponse } from '@/lib/api-helpers';

/**
 * GET /api/users
 * Get list of servicer/admin users (servicer/admin only)
 * Used to populate assignment dropdowns
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }

    const { user } = session;

    // Only servicers and admins can access user list
    if (user.role !== 'servicer' && user.role !== 'admin') {
      return errorResponse('Forbidden', 403);
    }

    // Fetch servicer and admin users with their profile information
    const users = await sql`
      SELECT
        u.id,
        u.name,
        u.email,
        u.role,
        p.department,
        p.employee_id
      FROM users u
      LEFT JOIN user_profiles p ON u.id = p.user_id
      WHERE u.role IN ('servicer', 'admin')
      ORDER BY u.name ASC
    `;

    return successResponse(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return errorResponse('Failed to fetch users', 500);
  }
}
