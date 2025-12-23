import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, generateIdempotencyKey } from '@/lib/api-client';
import type { Transaction } from '@/types';

async function fetchTransactions(loanId: string): Promise<Transaction[]> {
  return api.get<Transaction[]>(`/api/transactions?loanId=${loanId}`);
}

interface CreateTransactionData {
  loan_id: string;
  type: string;
  amount: number;
  principal_amount?: number;
  interest_amount?: number;
  escrow_amount?: number;
  description?: string;
  reference_number?: string;
}

async function createTransaction(data: CreateTransactionData): Promise<Transaction> {
  // Generate idempotency key to prevent duplicate transactions
  const idempotencyKey = generateIdempotencyKey();

  return api.post<Transaction>('/api/transactions', data, {
    idempotencyKey,
  });
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











