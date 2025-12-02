import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Correspondence } from '@/types';

async function fetchCorrespondence(loanId: string): Promise<Correspondence[]> {
  const response = await fetch(`/api/correspondence?loanId=${loanId}`);
  if (!response.ok) throw new Error('Failed to fetch correspondence');
  return response.json();
}

async function createCorrespondence(data: any): Promise<Correspondence> {
  const response = await fetch('/api/correspondence', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create correspondence');
  }
  return response.json();
}

export function useCorrespondence(loanId: string) {
  return useQuery({
    queryKey: ['correspondence', loanId],
    queryFn: () => fetchCorrespondence(loanId),
    enabled: !!loanId,
  });
}

export function useCreateCorrespondence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCorrespondence,
    onSuccess: (_, variables) => {
      toast.success('Correspondence logged successfully');
      queryClient.invalidateQueries({ queryKey: ['correspondence', variables.loan_id] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to log correspondence');
    },
  });
}

