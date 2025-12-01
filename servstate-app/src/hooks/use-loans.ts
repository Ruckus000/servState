import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Loan } from '@/types';

async function fetchLoans(status?: string): Promise<Loan[]> {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  
  const response = await fetch(`/api/loans?${params}`);
  if (!response.ok) throw new Error('Failed to fetch loans');
  return response.json();
}

async function fetchLoan(id: string): Promise<Loan> {
  const response = await fetch(`/api/loans/${id}`);
  if (!response.ok) throw new Error('Failed to fetch loan');
  return response.json();
}

async function updateLoan(id: string, data: Partial<Loan>): Promise<Loan> {
  const response = await fetch(`/api/loans/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update loan');
  return response.json();
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

