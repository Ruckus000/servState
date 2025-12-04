import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { LoanCombobox } from './loan-combobox';
import { UserSelect } from './user-select';
import { useCreateTask } from '@/hooks/use-tasks';
import { TASK_TYPES, TASK_CATEGORIES, TASK_PRIORITIES } from '@/types/task';
import { Loader2, AlertCircle } from 'lucide-react';
import type { TaskType, TaskCategory, TaskPriority } from '@/types/task';

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddTaskDialog({ open, onOpenChange }: AddTaskDialogProps) {
  const [loanId, setLoanId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TaskType | ''>('');
  const [category, setCategory] = useState<TaskCategory | ''>('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [dueDateError, setDueDateError] = useState<string | null>(null);

  const MAX_TITLE_LENGTH = 200;
  const MAX_DESCRIPTION_LENGTH = 2000;

  const createTask = useCreateTask();

  const resetForm = () => {
    setLoanId('');
    setTitle('');
    setDescription('');
    setType('');
    setCategory('');
    setPriority('medium');
    setAssignedTo('');
    setDueDate('');
    setFormError(null);
    setIsDirty(false);
    setTitleError(null);
    setDueDateError(null);
  };

  // Title validation handler
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTitle(value);
    setIsDirty(true);

    if (value.length > MAX_TITLE_LENGTH) {
      setTitleError(`Title must be ${MAX_TITLE_LENGTH} characters or less`);
    } else if (value.trim().length === 0 && value.length > 0) {
      setTitleError('Title cannot be empty or just whitespace');
    } else {
      setTitleError(null);
    }
  };

  // Due date validation handler
  const handleDueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDueDate(value);
    setIsDirty(true);

    if (value) {
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        setDueDateError('Due date cannot be in the past');
      } else {
        setDueDateError(null);
      }
    } else {
      setDueDateError(null);
    }
  };

  // Handle dialog close with unsaved changes warning
  const handleOpenChange = (open: boolean) => {
    if (!open && isDirty) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to close?'
      );
      if (!confirmed) return;
    }
    onOpenChange(open);
  };

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      // Use a timeout to allow the dialog animation to complete
      const timer = setTimeout(resetForm, 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!loanId || !title || !type || !category) {
      return;
    }

    // Clear any previous errors
    setFormError(null);

    createTask.mutate(
      {
        loan_id: loanId,
        title,
        description,
        type,
        category,
        priority,
        assigned_to: assignedTo || undefined,
        due_date: dueDate || undefined,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
        onError: (error: Error) => {
          setFormError(error.message || 'Failed to create task. Please try again.');
        },
      }
    );
  };

  const isValid = !!(
    loanId &&
    title &&
    !titleError &&
    !dueDateError &&
    type &&
    category
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-4xl bg-slate-50/50 dark:bg-slate-900/50">
        <DialogHeader className="pb-6 border-b border-slate-200/60 dark:border-slate-700/60">
          <DialogTitle className="text-2xl font-semibold tracking-tight">
            Create New Task
          </DialogTitle>
          <DialogDescription className="text-base text-slate-600 dark:text-slate-400 mt-1.5">
            Add a new servicing task to the system
          </DialogDescription>
        </DialogHeader>

        {/* Error Display */}
        {formError && (
          <div
            className="flex items-start gap-3 p-4 mt-6 border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800 rounded-lg"
            role="alert"
            aria-live="assertive"
          >
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800 dark:text-red-400">Error creating task</p>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">{formError}</p>
            </div>
          </div>
        )}

        {/* Success announcement for screen readers */}
        <div role="status" aria-live="polite" className="sr-only">
          {createTask.isSuccess && "Task created successfully"}
        </div>

        <form onSubmit={handleSubmit} className={formError ? "pt-4" : "pt-6"}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
            {/* LEFT COLUMN - Primary Task Info */}
            <div className="space-y-6">
              {/* Loan Select */}
              <LoanCombobox
                value={loanId}
                onChange={(value) => {
                  setLoanId(value);
                  setIsDirty(true);
                }}
                required
              />

              {/* Title */}
              <div className="space-y-2.5">
                <Label htmlFor="title" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Task Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={handleTitleChange}
                  placeholder="e.g., Follow up on payment plan"
                  className="h-11 text-base bg-white dark:bg-slate-800"
                  maxLength={MAX_TITLE_LENGTH}
                  aria-required="true"
                  aria-invalid={!!titleError}
                  aria-describedby={titleError ? "title-error" : undefined}
                  required
                />
                {titleError && (
                  <p id="title-error" role="alert" className="text-sm text-red-600 dark:text-red-400">
                    {titleError}
                  </p>
                )}
                {!titleError && title.length > 0 && (
                  <p className="text-xs text-slate-500">
                    {title.length}/{MAX_TITLE_LENGTH}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2.5">
                <Label htmlFor="description" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="Provide additional details about this task..."
                  rows={5}
                  maxLength={MAX_DESCRIPTION_LENGTH}
                  className="text-base bg-white dark:bg-slate-800 resize-none"
                />
                {description.length > 0 && (
                  <p className="text-xs text-slate-500">
                    {description.length}/{MAX_DESCRIPTION_LENGTH}
                  </p>
                )}
              </div>

              {/* Due Date */}
              <div className="space-y-2.5">
                <Label htmlFor="due-date" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Due Date
                </Label>
                <Input
                  id="due-date"
                  type="date"
                  value={dueDate}
                  onChange={handleDueDateChange}
                  className="h-11 text-base bg-white dark:bg-slate-800"
                  aria-invalid={!!dueDateError}
                  aria-describedby={dueDateError ? "due-date-error" : undefined}
                />
                {dueDateError && (
                  <p id="due-date-error" role="alert" className="text-sm text-red-600 dark:text-red-400">
                    {dueDateError}
                  </p>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN - Task Classification */}
            <div className="space-y-6">
              {/* Task Type */}
              <div className="space-y-2.5">
                <Label htmlFor="type-select" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Task Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={type}
                  onValueChange={(value) => {
                    setType(value as TaskType);
                    setIsDirty(true);
                  }}
                >
                  <SelectTrigger id="type-select" className="h-11 text-base bg-white dark:bg-slate-800">
                    <SelectValue placeholder="Select task type" />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_TYPES.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-base">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category */}
              <div className="space-y-2.5">
                <Label htmlFor="category-select" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Category <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={category}
                  onValueChange={(value) => {
                    setCategory(value as TaskCategory);
                    setIsDirty(true);
                  }}
                >
                  <SelectTrigger id="category-select" className="h-11 text-base bg-white dark:bg-slate-800">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_CATEGORIES.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-base">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Priority */}
              <div className="space-y-2.5">
                <Label htmlFor="priority-select" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Priority
                </Label>
                <Select value={priority} onValueChange={(value) => setPriority(value as TaskPriority)}>
                  <SelectTrigger id="priority-select" className="h-11 text-base bg-white dark:bg-slate-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_PRIORITIES.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-base">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Assigned To */}
              <UserSelect
                value={assignedTo}
                onChange={(value) => {
                  setAssignedTo(value);
                  setIsDirty(true);
                }}
              />
            </div>
          </div>

          <DialogFooter className="mt-8 pt-6 border-t border-slate-200/60 dark:border-slate-700/60">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} className="h-11 px-6 text-base">
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid || createTask.isPending} className="h-11 px-6 text-base">
              {createTask.isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              Create Task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
