import { useTaskHistory } from '@/hooks/use-tasks';
import { formatDate } from '@/lib/format';
import { actionTypeLabels } from '@/types/audit-log';
import { Loader2, CheckCircle, UserPlus, FileEdit, Plus, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskHistoryTimelineProps {
  taskId: string;
}

const actionIcons = {
  task_created: Plus,
  task_status_changed: CheckCircle,
  task_assigned: UserPlus,
  task_updated: FileEdit,
  task_completed: CheckCircle,
};

export function TaskHistoryTimeline({ taskId }: TaskHistoryTimelineProps) {
  const { data: history, isLoading, isError } = useTaskHistory(taskId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-sm text-muted-foreground py-4">
        Failed to load task history
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-4">
        No history available for this task
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold">Task History</h4>
      <div className="relative space-y-4">
        {/* Timeline line */}
        <div className="absolute left-4 top-2 bottom-2 w-px bg-border" />

        {/* History items */}
        {history.map((entry, index) => {
          const Icon = actionIcons[entry.action_type as keyof typeof actionIcons] || Circle;
          const isLast = index === history.length - 1;

          return (
            <div key={entry.id} className="relative flex gap-4 pl-2">
              {/* Icon */}
              <div
                className={cn(
                  'relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-background',
                  'bg-background'
                )}
              >
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>

              {/* Content */}
              <div className={cn('flex-1 pb-4', !isLast && 'border-b')}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {actionTypeLabels[entry.action_type]}
                    </p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {entry.description}
                    </p>

                    {/* Additional details */}
                    {entry.details && entry.action_type === 'task_status_changed' && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        {String(entry.details.old_status)} → {String(entry.details.new_status)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Metadata */}
                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{entry.performed_by}</span>
                  <span>•</span>
                  <span>{formatDate(entry.performed_at)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
