import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { UserSettings } from '@/types/settings';

interface SettingsResponse {
  data: UserSettings;
}

async function fetchSettings(): Promise<UserSettings> {
  const response = await api.get<SettingsResponse>('/api/user/settings');
  return response.data;
}

async function updateSettings(settings: UserSettings): Promise<UserSettings> {
  const response = await api.put<SettingsResponse>('/api/user/settings', { settings });
  return response.data;
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
