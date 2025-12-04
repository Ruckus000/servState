import { useQuery } from '@tanstack/react-query';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserSelectProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  hideLabel?: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

async function fetchUsers(): Promise<User[]> {
  const response = await fetch('/api/users');
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
}

export function UserSelect({ value, onChange, required, hideLabel }: UserSelectProps) {
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  const triggerClassName = hideLabel
    ? 'h-9 text-sm bg-gray-50 border-gray-200 hover:border-gray-300 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:bg-gray-800 dark:border-gray-700'
    : 'h-11 text-base bg-white dark:bg-slate-800';

  return (
    <div className={cn(!hideLabel && 'space-y-2.5')}>
      {!hideLabel && (
        <Label htmlFor="user-select" className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Assigned To {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      {isLoading ? (
        <div className={cn(
          'flex items-center justify-center border rounded-md',
          hideLabel
            ? 'h-9 bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
            : 'h-11 bg-white dark:bg-slate-800'
        )}>
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger id="user-select" className={triggerClassName}>
            <SelectValue placeholder="Select a user" />
          </SelectTrigger>
          <SelectContent>
            {users?.map((user) => (
              <SelectItem key={user.id} value={user.id} className={hideLabel ? 'text-sm' : 'text-base'}>
                {user.name} ({user.email})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
