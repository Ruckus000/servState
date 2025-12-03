import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Message } from '@/types';

async function fetchMessages(loanId: string): Promise<Message[]> {
  const response = await fetch(`/api/messages?loanId=${loanId}`);
  if (!response.ok) throw new Error('Failed to fetch messages');
  return response.json();
}

async function sendMessage(data: any): Promise<Message> {
  const response = await fetch('/api/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to send message');
  return response.json();
}

async function markMessageRead(id: string): Promise<Message> {
  const response = await fetch(`/api/messages/${id}`, {
    method: 'PATCH',
  });
  if (!response.ok) throw new Error('Failed to mark message as read');
  return response.json();
}

export function useMessages(loanId: string) {
  return useQuery({
    queryKey: ['messages', loanId],
    queryFn: () => fetchMessages(loanId),
    enabled: !!loanId,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: sendMessage,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.loan_id] });
    },
  });
}

export function useMarkMessageRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: markMessageRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
}



