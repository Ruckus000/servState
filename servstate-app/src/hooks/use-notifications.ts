import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Notification } from '@/types';

async function fetchNotifications(): Promise<Notification[]> {
  const response = await fetch('/api/notifications');
  if (!response.ok) throw new Error('Failed to fetch notifications');
  return response.json();
}

async function markNotificationRead(id: string): Promise<Notification> {
  const response = await fetch(`/api/notifications/${id}`, {
    method: 'PATCH',
  });
  if (!response.ok) throw new Error('Failed to mark notification as read');
  return response.json();
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



