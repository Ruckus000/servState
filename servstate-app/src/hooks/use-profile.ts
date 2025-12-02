import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UserProfile, UpdateProfileRequest } from '@/types/profile';

async function fetchProfile(): Promise<UserProfile> {
  const response = await fetch('/api/user/profile');
  if (!response.ok) throw new Error('Failed to fetch profile');
  const data = await response.json();
  return data.data;
}

async function updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
  const response = await fetch('/api/user/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update profile');
  }
  const result = await response.json();
  return result.data;
}

async function generateAvatarPresignedUrl(
  contentType: string,
  fileSize: number
): Promise<{ url: string; key: string; avatarUrl: string; expiresIn: number }> {
  const response = await fetch('/api/user/avatar/presign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contentType, fileSize }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate upload URL');
  }
  const result = await response.json();
  return result.data;
}

async function uploadAvatarToS3(url: string, file: File): Promise<void> {
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
  const updateProfile = useUpdateProfile();

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
      await updateProfile.mutateAsync({ avatar_url: avatarUrl });

      return avatarUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
