import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Document } from '@/types';

async function fetchDocuments(loanId: string): Promise<Document[]> {
  const response = await fetch(`/api/documents?loanId=${loanId}`);
  if (!response.ok) throw new Error('Failed to fetch documents');
  return response.json();
}

async function createDocument(data: any): Promise<Document> {
  const response = await fetch('/api/documents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create document');
  return response.json();
}

export function useDocuments(loanId: string) {
  return useQuery({
    queryKey: ['documents', loanId],
    queryFn: () => fetchDocuments(loanId),
    enabled: !!loanId,
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createDocument,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documents', variables.loan_id] });
    },
  });
}

