import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import type { Correspondence } from '@/types';

interface CorrespondenceListResponse {
  data: Correspondence[];
}

interface CorrespondenceResponse {
  data: Correspondence;
}

async function fetchCorrespondence(loanId: string): Promise<Correspondence[]> {
  const response = await api.get<CorrespondenceListResponse>(
    `/api/correspondence?loanId=${loanId}`
  );
  return response.data;
}

async function createCorrespondence(data: any): Promise<Correspondence> {
  const response = await api.post<CorrespondenceResponse>('/api/correspondence', data);
  return response.data;
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
