import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UserSettings, UpdateSettingsRequest } from '@/types/settings';

async function fetchSettings(): Promise<UserSettings> {
  const response = await fetch('/api/user/settings');
  if (!response.ok) throw new Error('Failed to fetch settings');
  const data = await response.json();
  return data.data;
}

async function updateSettings(settings: UserSettings): Promise<UserSettings> {
  const response = await fetch('/api/user/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ settings }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update settings');
  }
  const result = await response.json();
  return result.data;
}

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: UserSettings) => updateSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}
