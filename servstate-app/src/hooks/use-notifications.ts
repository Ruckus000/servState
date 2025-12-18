import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { Notification } from '@/types';

async function fetchNotifications(): Promise<Notification[]> {
  return api.get<Notification[]>('/api/notifications');
}

async function markNotificationRead(id: string): Promise<Notification> {
  return api.patch<Notification>(`/api/notifications/${id}`);
}

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}









