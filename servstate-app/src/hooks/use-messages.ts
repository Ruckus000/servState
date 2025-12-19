import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { Message } from '@/types';

async function fetchMessages(loanId: string): Promise<Message[]> {
  return api.get<Message[]>(`/api/messages?loanId=${loanId}`);
}

interface SendMessageData {
  loan_id: string;
  subject: string;
  content: string;
}

async function sendMessage(data: SendMessageData): Promise<Message> {
  return api.post<Message>('/api/messages', data);
}

async function markMessageRead(id: string): Promise<Message> {
  return api.patch<Message>(`/api/messages/${id}`);
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










