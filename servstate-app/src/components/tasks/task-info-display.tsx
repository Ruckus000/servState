import { Calendar, User, Tag, AlertCircle, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/format';
import type { Task } from '@/types/task';

interface TaskInfoDisplayProps {
  task: Task;
}

const priorityColors = {
  high: 'destructive',
  medium: 'default',
  low: 'secondary',
} as const;

const statusColors = {
  pending: 'secondary',
  in_progress: 'default',
  completed: 'outline',
} as const;

export function TaskInfoDisplay({ task }: TaskInfoDisplayProps) {
  return (
    <div className="space-y-4">
      {/* Title and Badges */}
      <div>
        <h3 className="text-lg font-semibold">{task.title}</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          <Badge variant={priorityColors[task.priority]}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
          </Badge>
          <Badge variant={statusColors[task.status]}>
            {task.status.replace('_', ' ').charAt(0).toUpperCase() +
             task.status.replace('_', ' ').slice(1)}
          </Badge>
          <Badge variant="outline">{task.category}</Badge>
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <div className="flex gap-3">
          <FileText className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
          <div>
            <p className="text-sm font-medium">Description</p>
            <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
          </div>
        </div>
      )}

      {/* Task Type */}
      <div className="flex gap-3">
        <Tag className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
        <div>
          <p className="text-sm font-medium">Task Type</p>
          <p className="text-sm text-muted-foreground mt-1">
            {task.type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
          </p>
        </div>
      </div>

      {/* Assigned To */}
      <div className="flex gap-3">
        <User className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
        <div>
          <p className="text-sm font-medium">Assigned To</p>
          <p className="text-sm text-muted-foreground mt-1">
            {task.assigned_to || 'Unassigned'}
          </p>
        </div>
      </div>

      {/* Due Date */}
      <div className="flex gap-3">
        <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
        <div>
          <p className="text-sm font-medium">Due Date</p>
          <p className="text-sm text-muted-foreground mt-1">
            {task.due_date ? formatDate(task.due_date) : 'No due date'}
          </p>
        </div>
      </div>

      {/* Loan Information */}
      <div className="flex gap-3">
        <AlertCircle className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
        <div>
          <p className="text-sm font-medium">Loan Information</p>
          <p className="text-sm text-muted-foreground mt-1">
            {task.borrower_name} - {task.loan_number}
          </p>
        </div>
      </div>
    </div>
  );
}
