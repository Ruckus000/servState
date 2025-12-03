import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { Loan } from '@/types';

async function fetchLoans(status?: string): Promise<Loan[]> {
  const params = new URLSearchParams();
  if (status) params.append('status', status);

  return api.get<Loan[]>(`/api/loans?${params}`);
}

async function fetchLoan(id: string): Promise<Loan> {
  return api.get<Loan>(`/api/loans/${id}`);
}

async function updateLoan(id: string, data: Partial<Loan>): Promise<Loan> {
  return api.put<Loan>(`/api/loans/${id}`, data);
}

export function useLoans(status?: string) {
  return useQuery({
    queryKey: ['loans', status],
    queryFn: () => fetchLoans(status),
  });
}

export function useLoan(id: string) {
  return useQuery({
    queryKey: ['loans', id],
    queryFn: () => fetchLoan(id),
    enabled: !!id,
  });
}

export function useUpdateLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Loan> }) =>
      updateLoan(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['loans', variables.id] });
    },
  });
}
