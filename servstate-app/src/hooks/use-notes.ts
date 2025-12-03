import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Note } from '@/types';

async function fetchNotes(loanId: string): Promise<Note[]> {
  const response = await fetch(`/api/notes?loanId=${loanId}`);
  if (!response.ok) throw new Error('Failed to fetch notes');
  return response.json();
}

async function createNote(data: any): Promise<Note> {
  const response = await fetch('/api/notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create note');
  return response.json();
}

export function useNotes(loanId: string) {
  return useQuery({
    queryKey: ['notes', loanId],
    queryFn: () => fetchNotes(loanId),
    enabled: !!loanId,
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createNote,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['notes', variables.loan_id] });
    },
  });
}



