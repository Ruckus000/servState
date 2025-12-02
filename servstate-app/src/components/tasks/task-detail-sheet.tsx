import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { TaskInfoDisplay } from './task-info-display';
import { TaskStatusUpdate } from './task-status-update';
import { TaskHistoryTimeline } from './task-history-timeline';
import type { Task } from '@/types/task';

interface TaskDetailSheetProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskDetailSheet({ task, open, onOpenChange }: TaskDetailSheetProps) {
  if (!task) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Task Details</SheetTitle>
          <SheetDescription>
            View and update task information
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Task Information */}
          <TaskInfoDisplay task={task} />

          <Separator />

          {/* Status Update Section */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Update Status</h4>
            <TaskStatusUpdate taskId={task.id} currentStatus={task.status} />
          </div>

          <Separator />

          {/* History Timeline */}
          <TaskHistoryTimeline taskId={task.id} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
