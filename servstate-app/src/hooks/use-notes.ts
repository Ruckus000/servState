import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { Note } from '@/types';

async function fetchNotes(loanId: string): Promise<Note[]> {
  return api.get<Note[]>(`/api/notes?loanId=${loanId}`);
}

interface CreateNoteData {
  loan_id: string;
  content: string;
  is_internal?: boolean;
}

async function createNote(data: CreateNoteData): Promise<Note> {
  return api.post<Note>('/api/notes', data);
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










