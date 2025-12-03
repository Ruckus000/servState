import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { UserProfile, UpdateProfileRequest } from '@/types/profile';

interface ProfileResponse {
  data: UserProfile;
}

interface AvatarPresignResponse {
  data: { url: string; key: string; avatarUrl: string; expiresIn: number };
}

async function fetchProfile(): Promise<UserProfile> {
  const response = await api.get<ProfileResponse>('/api/user/profile');
  return response.data;
}

async function updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
  const response = await api.put<ProfileResponse>('/api/user/profile', data);
  return response.data;
}

async function generateAvatarPresignedUrl(
  contentType: string,
  fileSize: number
): Promise<{ url: string; key: string; avatarUrl: string; expiresIn: number }> {
  const response = await api.post<AvatarPresignResponse>('/api/user/avatar/presign', {
    contentType,
    fileSize,
  });
  return response.data;
}

async function uploadAvatarToS3(url: string, file: File): Promise<void> {
  // Direct S3 upload - no CSRF needed as this goes to AWS, not our API
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type,
    },
    body: file,
  });
  if (!response.ok) {
    throw new Error('Failed to upload avatar to S3');
  }
}

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useAvatarUpload() {
  const queryClient = useQueryClient();
  const updateProfileMutation = useUpdateProfile();

  return useMutation({
    mutationFn: async (file: File) => {
      // Step 1: Get presigned URL
      const { url, avatarUrl } = await generateAvatarPresignedUrl(
        file.type,
        file.size
      );

      // Step 2: Upload file to S3
      await uploadAvatarToS3(url, file);

      // Step 3: Update profile with new avatar URL
      await updateProfileMutation.mutateAsync({ avatar_url: avatarUrl });

      return avatarUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
