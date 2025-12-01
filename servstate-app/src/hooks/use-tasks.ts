import { useQuery, useMutation, useQueryClient } from '@tantml:react-query';
import type { Task } from '@/types';

async function fetchTasks(loanId?: string): Promise<Task[]> {
  const params = loanId ? `?loanId=${loanId}` : '';
  const response = await fetch(`/api/tasks${params}`);
  if (!response.ok) throw new Error('Failed to fetch tasks');
  return response.json();
}

async function createTask(data: any): Promise<Task> {
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create task');
  return response.json();
}

async function updateTask(id: string, data: any): Promise<Task> {
  const response = await fetch(`/api/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update task');
  return response.json();
}

export function useTasks(loanId?: string) {
  return useQuery({
    queryKey: loanId ? ['tasks', loanId] : ['tasks'],
    queryFn: () => fetchTasks(loanId),
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createTask,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      if (variables.loan_id) {
        queryClient.invalidateQueries({ queryKey: ['tasks', variables.loan_id] });
      }
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

