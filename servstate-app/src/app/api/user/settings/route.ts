import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { sql } from '@/lib/db';
import { errorResponse, successResponse } from '@/lib/api-helpers';
import type { UserSettings } from '@/types/settings';

/**
 * GET /api/user/settings
 * Fetch current user's settings
 *
 * Response:
 * {
 *   "notifications": { ... },
 *   "communication": { ... },
 *   "preferences": { ... }
 * }
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }

    const { user } = session;

    // Fetch user settings
    const result = await sql<{ settings: UserSettings }[]>`
      SELECT settings
      FROM user_settings
      WHERE user_id = ${user.id}
    `;

    if (result.length === 0) {
      // Return empty settings if none exist yet
      return successResponse({
        notifications: {},
        communication: {},
        preferences: {},
      });
    }

    return successResponse(result[0].settings);
  } catch (error) {
    console.error('Error fetching user settings:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch settings';
    return errorResponse(errorMessage, 500);
  }
}

/**
 * PUT /api/user/settings
 * Update current user's settings
 *
 * Request body:
 * {
 *   "settings": {
 *     "notifications": { ... },
 *     "communication": { ... },
 *     "preferences": { ... }
 *   }
 * }
 *
 * The settings will be merged with existing settings (deep merge for top-level keys).
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }

    const { user } = session;
    const body = await request.json();

    const { settings } = body;

    if (!settings || typeof settings !== 'object') {
      return errorResponse('Invalid settings data', 400);
    }

    // Fetch existing settings
    const existing = await sql<{ settings: UserSettings }[]>`
      SELECT settings
      FROM user_settings
      WHERE user_id = ${user.id}
    `;

    // Merge new settings with existing settings
    const mergedSettings: UserSettings = {
      notifications: {
        ...(existing[0]?.settings?.notifications || {}),
        ...(settings.notifications || {}),
      },
      communication: {
        ...(existing[0]?.settings?.communication || {}),
        ...(settings.communication || {}),
      },
      preferences: {
        ...(existing[0]?.settings?.preferences || {}),
        ...(settings.preferences || {}),
      },
    };

    // Upsert settings
    const result = await sql<{ settings: UserSettings }[]>`
      INSERT INTO user_settings (user_id, settings, updated_at)
      VALUES (${user.id}, ${JSON.stringify(mergedSettings)}, NOW())
      ON CONFLICT (user_id)
      DO UPDATE SET
        settings = ${JSON.stringify(mergedSettings)},
        updated_at = NOW()
      RETURNING settings
    `;

    return successResponse(result[0].settings);
  } catch (error) {
    console.error('Error updating user settings:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update settings';
    return errorResponse(errorMessage, 500);
  }
}
