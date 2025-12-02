import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { generatePresignedUploadUrl } from '@/lib/s3';
import { errorResponse, successResponse } from '@/lib/api-helpers';

// Allowed MIME types for avatar uploads (images only)
const ALLOWED_AVATAR_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
] as const;

const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Generate S3 key for an avatar
 * Pattern: avatars/{user_id}/{timestamp}.{ext}
 */
function generateAvatarKey(userId: string, contentType: string): string {
  const timestamp = Date.now();
  const extension = contentType.split('/')[1]; // e.g., 'jpeg' from 'image/jpeg'
  return `avatars/${userId}/${timestamp}.${extension}`;
}

/**
 * POST /api/user/avatar/presign
 * Generate presigned URL for avatar upload
 *
 * Request body:
 * {
 *   "contentType": "image/jpeg",
 *   "fileSize": 12345
 * }
 *
 * Response:
 * {
 *   "url": "https://...",
 *   "key": "avatars/user-id/timestamp.jpg",
 *   "expiresIn": 300
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }

    const { user } = session;
    const body = await request.json();

    const { contentType, fileSize } = body;

    // Validate content type
    if (!contentType || !ALLOWED_AVATAR_TYPES.includes(contentType)) {
      return errorResponse(
        `Invalid content type. Allowed types: ${ALLOWED_AVATAR_TYPES.join(', ')}`,
        400
      );
    }

    // Validate file size
    if (!fileSize || fileSize <= 0 || fileSize > MAX_AVATAR_SIZE) {
      return errorResponse(
        `Invalid file size. Maximum size: ${MAX_AVATAR_SIZE / 1024 / 1024}MB`,
        400
      );
    }

    // Generate S3 key
    const key = generateAvatarKey(user.id, contentType);

    // Generate presigned upload URL
    const presignedUrl = await generatePresignedUploadUrl(
      key,
      contentType,
      fileSize
    );

    // Return presigned URL and key
    // Client should:
    // 1. PUT file to presigned URL
    // 2. Then PUT to /api/user/profile with avatar_url = key
    return successResponse({
      ...presignedUrl,
      avatarUrl: `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
    });
  } catch (error) {
    console.error('Error generating avatar presigned URL:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate upload URL';
    return errorResponse(errorMessage, 500);
  }
}
