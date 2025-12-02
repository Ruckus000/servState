import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Transaction } from '@/types';

async function fetchTransactions(loanId: string): Promise<Transaction[]> {
  const response = await fetch(`/api/transactions?loanId=${loanId}`);
  if (!response.ok) throw new Error('Failed to fetch transactions');
  return response.json();
}

async function createTransaction(data: any): Promise<Transaction> {
  const response = await fetch('/api/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create transaction');
  return response.json();
}

export function useTransactions(loanId: string) {
  return useQuery({
    queryKey: ['transactions', loanId],
    queryFn: () => fetchTransactions(loanId),
    enabled: !!loanId,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createTransaction,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transactions', variables.loan_id] });
      queryClient.invalidateQueries({ queryKey: ['loans', variables.loan_id] });
    },
  });
}


