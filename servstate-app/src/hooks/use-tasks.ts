import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Task } from '@/types';
import type { AuditLogEntry } from '@/types/audit-log';

async function fetchTasks(loanId?: string): Promise<Task[]> {
  const params = loanId ? `?loanId=${loanId}` : '';
  const response = await fetch(`/api/tasks${params}`);
  if (!response.ok) throw new Error('Failed to fetch tasks');
  return response.json();
}

async function fetchTask(id: string): Promise<Task> {
  const response = await fetch(`/api/tasks/${id}`);
  if (!response.ok) throw new Error('Failed to fetch task');
  return response.json();
}

async function fetchTaskHistory(id: string): Promise<AuditLogEntry[]> {
  const response = await fetch(`/api/tasks/${id}/history`);
  if (!response.ok) throw new Error('Failed to fetch task history');
  return response.json();
}

async function createTask(data: any): Promise<Task> {
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create task');
  }
  return response.json();
}

async function updateTask(id: string, data: any): Promise<Task> {
  const response = await fetch(`/api/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update task');
  }
  return response.json();
}

export function useTasks(loanId?: string) {
  return useQuery({
    queryKey: loanId ? ['tasks', loanId] : ['tasks'],
    queryFn: () => fetchTasks(loanId),
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: ['task', id],
    queryFn: () => fetchTask(id),
    enabled: !!id,
  });
}

export function useTaskHistory(id: string) {
  return useQuery({
    queryKey: ['task-history', id],
    queryFn: () => fetchTaskHistory(id),
    enabled: !!id,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,
    onSuccess: (_, variables) => {
      toast.success('Task created successfully');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      if (variables.loan_id) {
        queryClient.invalidateQueries({ queryKey: ['tasks', variables.loan_id] });
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create task');
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateTask(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      await queryClient.cancelQueries({ queryKey: ['task', id] });

      // Snapshot previous values
      const previousTasks = queryClient.getQueryData(['tasks']);
      const previousTask = queryClient.getQueryData(['task', id]);

      // Optimistically update tasks list
      queryClient.setQueryData(['tasks'], (old: any) => {
        if (!old) return old;
        return old.map((task: Task) =>
          task.id === id ? { ...task, ...data } : task
        );
      });

      // Optimistically update single task
      queryClient.setQueryData(['task', id], (old: any) => {
        if (!old) return old;
        return { ...old, ...data };
      });

      return { previousTasks, previousTask };
    },
    onError: (error: Error, variables, context) => {
      // Rollback on error
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks);
      }
      if (context?.previousTask) {
        queryClient.setQueryData(['task', variables.id], context.previousTask);
      }
      toast.error(error.message || 'Failed to update task');
    },
    onSuccess: (data, variables) => {
      toast.success('Task updated successfully');
      // Invalidate to refetch and ensure consistency
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['task-history', variables.id] });
    },
  });
}



