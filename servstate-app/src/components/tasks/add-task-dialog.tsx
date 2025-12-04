import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { LoanSearchCombobox } from './loan-search-combobox';
import { UserSelect } from './user-select';
import { PriorityToggle } from './priority-toggle';
import { useCreateTask } from '@/hooks/use-tasks';
import { TASK_TYPES, TASK_CATEGORIES } from '@/types/task';
import { Loader2, AlertCircle, Plus, Calendar } from 'lucide-react';
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

  // No useEffect needed for form reset - handled by DialogContent onCloseAutoFocus

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

  // Format date for display
  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Input styling for consistency
  const inputClassName = "w-full h-9 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm placeholder:text-gray-400 hover:border-gray-300 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition-colors dark:bg-gray-800 dark:border-gray-700 dark:hover:border-gray-600 dark:focus:border-teal-500";

  const selectTriggerClassName = "h-9 text-sm bg-gray-50 border-gray-200 hover:border-gray-300 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:bg-gray-800 dark:border-gray-700";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-xl p-0 gap-0"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
        }}
        onCloseAutoFocus={() => {
          resetForm();
        }}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center">
              <Plus className="w-4 h-4 text-white" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">
                Create Task
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500 dark:text-gray-400">
                Add a new servicing task
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {formError && (
          <div
            className="flex items-start gap-3 p-3 mx-5 mt-3 border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800 rounded-lg"
            role="alert"
            aria-live="assertive"
          >
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-medium text-red-800 dark:text-red-400">Error creating task</p>
              <p className="text-xs text-red-700 dark:text-red-300 mt-0.5">{formError}</p>
            </div>
          </div>
        )}

        {/* Success announcement for screen readers */}
        <div role="status" aria-live="polite" className="sr-only">
          {createTask.isSuccess && "Task created successfully"}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-5 py-3">
            {/* Loan Row */}
            <div className="grid grid-cols-[90px_1fr] items-center gap-3 py-2.5 border-b border-gray-100 dark:border-gray-800">
              <Label className="text-[13px] font-medium text-gray-500 dark:text-gray-400">
                Loan <span className="text-red-400">*</span>
              </Label>
              <LoanSearchCombobox
                value={loanId}
                onChange={(value) => {
                  setLoanId(value);
                  setIsDirty(true);
                }}
                required
                hideLabel
              />
            </div>

            {/* Title Row */}
            <div className="grid grid-cols-[90px_1fr] items-start gap-3 py-2.5 border-b border-gray-100 dark:border-gray-800">
              <Label htmlFor="title" className="text-[13px] font-medium text-gray-500 dark:text-gray-400 pt-2">
                Title <span className="text-red-400">*</span>
              </Label>
              <div className="space-y-1">
                <Input
                  id="title"
                  value={title}
                  onChange={handleTitleChange}
                  placeholder="e.g., Follow up on payment plan"
                  className={inputClassName}
                  maxLength={MAX_TITLE_LENGTH}
                  aria-required="true"
                  aria-invalid={!!titleError}
                  aria-describedby={titleError ? "title-error" : undefined}
                  required
                />
                {titleError && (
                  <p id="title-error" role="alert" className="text-xs text-red-600 dark:text-red-400">
                    {titleError}
                  </p>
                )}
                {!titleError && title.length > 0 && (
                  <p className="text-xs text-gray-400">
                    {title.length}/{MAX_TITLE_LENGTH}
                  </p>
                )}
              </div>
            </div>

            {/* Description Row */}
            <div className="grid grid-cols-[90px_1fr] items-center gap-3 py-2.5 border-b border-gray-100 dark:border-gray-800">
              <Label htmlFor="description" className="text-[13px] font-medium text-gray-500 dark:text-gray-400">
                Description
              </Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setIsDirty(true);
                }}
                placeholder="Additional details..."
                className={inputClassName}
                maxLength={MAX_DESCRIPTION_LENGTH}
              />
            </div>

            {/* Type + Category Row */}
            <div className="grid grid-cols-[90px_1fr] items-center gap-3 py-2.5 border-b border-gray-100 dark:border-gray-800">
              <Label className="text-[13px] font-medium text-gray-500 dark:text-gray-400">
                Type <span className="text-red-400">*</span>
              </Label>
              <div className="flex gap-2">
                <Select
                  value={type}
                  onValueChange={(value) => {
                    setType(value as TaskType);
                    setIsDirty(true);
                  }}
                >
                  <SelectTrigger
                    aria-required="true"
                    className={selectTriggerClassName}
                  >
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_TYPES.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-sm">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={category}
                  onValueChange={(value) => {
                    setCategory(value as TaskCategory);
                    setIsDirty(true);
                  }}
                >
                  <SelectTrigger
                    aria-required="true"
                    className={selectTriggerClassName}
                  >
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_CATEGORIES.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-sm">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Priority + Due Date Row */}
            <div className="grid grid-cols-[90px_1fr] items-center gap-3 py-2.5 border-b border-gray-100 dark:border-gray-800">
              <Label className="text-[13px] font-medium text-gray-500 dark:text-gray-400">
                Priority
              </Label>
              <div className="flex items-center justify-between">
                <PriorityToggle
                  value={priority}
                  onChange={(value) => {
                    setPriority(value);
                    setIsDirty(true);
                  }}
                />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className={`h-8 px-3 text-sm ${dueDate ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}`}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      {dueDate ? formatDisplayDate(dueDate) : 'Due date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-3" align="end">
                    <div className="space-y-2">
                      <Input
                        type="date"
                        value={dueDate}
                        onChange={handleDueDateChange}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full"
                        aria-invalid={!!dueDateError}
                        aria-describedby={dueDateError ? "due-date-error" : undefined}
                      />
                      {dueDateError && (
                        <p id="due-date-error" role="alert" className="text-xs text-red-600 dark:text-red-400">
                          {dueDateError}
                        </p>
                      )}
                      {dueDate && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="w-full text-xs text-gray-500"
                          onClick={() => {
                            setDueDate('');
                            setDueDateError(null);
                          }}
                        >
                          Clear date
                        </Button>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Assignee Row */}
            <div className="grid grid-cols-[90px_1fr] items-center gap-3 py-2.5">
              <Label className="text-[13px] font-medium text-gray-500 dark:text-gray-400">
                Assignee
              </Label>
              <UserSelect
                value={assignedTo}
                onChange={(value) => {
                  setAssignedTo(value);
                  setIsDirty(true);
                }}
                hideLabel
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <span className="text-xs text-gray-400">
              <span className="text-red-400">*</span> Required
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleOpenChange(false)}
                className="h-9 px-4 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!isValid || createTask.isPending}
                className="h-9 px-5 text-sm font-medium text-white bg-teal-500 hover:bg-teal-600 disabled:opacity-50"
              >
                {createTask.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Task
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
