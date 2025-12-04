'use client';

import { cn } from '@/lib/utils';
import type { TaskPriority } from '@/types/task';

interface PriorityToggleProps {
  value: TaskPriority;
  onChange: (value: TaskPriority) => void;
}

const priorityConfig = {
  low: {
    label: 'Low',
    dot: 'bg-green-500',
    base: 'bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30',
    selected: 'ring-2 ring-green-500 ring-inset',
  },
  medium: {
    label: 'Medium',
    dot: 'bg-amber-500',
    base: 'bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/30',
    selected: 'ring-2 ring-amber-500 ring-inset',
  },
  high: {
    label: 'High',
    dot: 'bg-red-500',
    base: 'bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30',
    selected: 'ring-2 ring-red-500 ring-inset',
  },
} as const;

export function PriorityToggle({ value, onChange }: PriorityToggleProps) {
  return (
    <div className="flex gap-1.5" role="radiogroup" aria-label="Task priority">
      {(['low', 'medium', 'high'] as TaskPriority[]).map((priority) => {
        const config = priorityConfig[priority];
        const isSelected = value === priority;
        return (
          <button
            key={priority}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(priority)}
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-all',
              config.base,
              isSelected && config.selected
            )}
          >
            <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />
            {config.label}
          </button>
        );
      })}
    </div>
  );
}
