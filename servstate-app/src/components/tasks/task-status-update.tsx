import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useUpdateTask } from '@/hooks/use-tasks';
import type { TaskStatus } from '@/types/task';
import { Loader2 } from 'lucide-react';

interface TaskStatusUpdateProps {
  taskId: string;
  currentStatus: TaskStatus;
  onUpdate?: () => void;
}

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

export function TaskStatusUpdate({
  taskId,
  currentStatus,
  onUpdate,
}: TaskStatusUpdateProps) {
  const [status, setStatus] = useState<TaskStatus>(currentStatus);
  const updateTask = useUpdateTask();

  const handleUpdateStatus = () => {
    if (status === currentStatus) return;

    updateTask.mutate(
      { id: taskId, data: { status } },
      {
        onSuccess: () => {
          onUpdate?.();
        },
      }
    );
  };

  const hasChanges = status !== currentStatus;

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="status-select">Update Status</Label>
        <Select value={status} onValueChange={(value) => setStatus(value as TaskStatus)}>
          <SelectTrigger id="status-select" className="mt-2">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        onClick={handleUpdateStatus}
        disabled={!hasChanges || updateTask.isPending}
        className="w-full"
      >
        {updateTask.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Update Status
      </Button>
    </div>
  );
}
