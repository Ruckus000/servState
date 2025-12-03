import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { sql, query } from '@/lib/db';
import { errorResponse, successResponse, requireCsrf } from '@/lib/api-helpers';
import type { UserProfile, UpdateProfileRequest } from '@/types/profile';

/**
 * GET /api/user/profile
 * Get current user's profile
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }

    const { user } = session;

    // Get user profile
    const profiles = await sql`
      SELECT
        p.*,
        u.email as user_email,
        u.name as user_name,
        u.role as user_role,
        u.avatar as user_avatar
      FROM user_profiles p
      INNER JOIN users u ON p.user_id = u.id
      WHERE p.user_id = ${user.id}
    ` as UserProfile[];

    if (profiles.length === 0) {
      return errorResponse('Profile not found', 404);
    }

    return successResponse(profiles[0]);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return errorResponse('Failed to fetch profile', 500);
  }
}

/**
 * PUT /api/user/profile
 * Update current user's profile
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }

    const { user } = session;

    // CSRF protection
    const csrfError = requireCsrf(request, user.id);
    if (csrfError) {
      return csrfError;
    }

    const body: UpdateProfileRequest = await request.json();

    // Validate required fields
    if (body.first_name !== undefined && !body.first_name.trim()) {
      return errorResponse('First name is required', 400);
    }
    if (body.last_name !== undefined && !body.last_name.trim()) {
      return errorResponse('Last name is required', 400);
    }

    // Build update fields dynamically
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (body.first_name !== undefined) {
      updateFields.push(`first_name = $${paramIndex++}`);
      values.push(body.first_name);
    }
    if (body.last_name !== undefined) {
      updateFields.push(`last_name = $${paramIndex++}`);
      values.push(body.last_name);
    }
    if (body.phone !== undefined) {
      updateFields.push(`phone = $${paramIndex++}`);
      values.push(body.phone);
    }
    if (body.date_of_birth !== undefined) {
      updateFields.push(`date_of_birth = $${paramIndex++}`);
      values.push(body.date_of_birth);
    }
    if (body.street_address !== undefined) {
      updateFields.push(`street_address = $${paramIndex++}`);
      values.push(body.street_address);
    }
    if (body.city !== undefined) {
      updateFields.push(`city = $${paramIndex++}`);
      values.push(body.city);
    }
    if (body.state !== undefined) {
      updateFields.push(`state = $${paramIndex++}`);
      values.push(body.state);
    }
    if (body.zip_code !== undefined) {
      updateFields.push(`zip_code = $${paramIndex++}`);
      values.push(body.zip_code);
    }
    if (body.avatar_url !== undefined) {
      updateFields.push(`avatar_url = $${paramIndex++}`);
      values.push(body.avatar_url);
    }

    if (updateFields.length === 0) {
      return errorResponse('No fields to update', 400);
    }

    // Add updated_at
    updateFields.push(`updated_at = NOW()`);
    values.push(user.id);

    // Execute update using parameterized query (not tagged template due to dynamic fields)
    const queryText = `
      UPDATE user_profiles
      SET ${updateFields.join(', ')}
      WHERE user_id = $${paramIndex}
      RETURNING *
    `;

    const result = await query<UserProfile>(queryText, values);

    if (result.length === 0) {
      return errorResponse('Profile not found', 404);
    }

    return successResponse(result[0]);
  } catch (error) {
    console.error('Error updating user profile:', error);
    return errorResponse('Failed to update profile', 500);
  }
}
