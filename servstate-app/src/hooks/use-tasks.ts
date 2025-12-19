import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import type { Task } from '@/types';
import type { AuditLogEntry } from '@/types/audit-log';

async function fetchTasks(loanId?: string): Promise<Task[]> {
  const params = loanId ? `?loanId=${loanId}` : '';
  return api.get<Task[]>(`/api/tasks${params}`);
}

async function fetchTask(id: string): Promise<Task> {
  return api.get<Task>(`/api/tasks/${id}`);
}

async function fetchTaskHistory(id: string): Promise<AuditLogEntry[]> {
  return api.get<AuditLogEntry[]>(`/api/tasks/${id}/history`);
}

interface CreateTaskData {
  loan_id?: string;
  title: string;
  description?: string;
  priority?: string;
  due_date?: string;
  assigned_to?: string;
  type?: string;
  category?: string;
}

async function createTask(data: CreateTaskData): Promise<Task> {
  return api.post<Task>('/api/tasks', data);
}

interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  due_date?: string;
  assigned_to?: string;
  type?: string;
  category?: string;
}

async function updateTask(id: string, data: UpdateTaskData): Promise<Task> {
  return api.put<Task>(`/api/tasks/${id}`, data);
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
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskData }) => updateTask(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      await queryClient.cancelQueries({ queryKey: ['task', id] });

      // Snapshot previous values
      const previousTasks = queryClient.getQueryData(['tasks']);
      const previousTask = queryClient.getQueryData(['task', id]);

      // Optimistically update tasks list
      queryClient.setQueryData(['tasks'], (old: Task[] | undefined) => {
        if (!old) return old;
        return old.map((task: Task) =>
          task.id === id ? { ...task, ...data } : task
        );
      });

      // Optimistically update single task
      queryClient.setQueryData(['task', id], (old: Task | undefined) => {
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










