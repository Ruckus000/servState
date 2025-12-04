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

interface UserSelectProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
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

export function UserSelect({ value, onChange, required }: UserSelectProps) {
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  return (
    <div className="space-y-2.5">
      <Label htmlFor="user-select" className="text-sm font-medium text-slate-700 dark:text-slate-300">
        Assigned To {required && <span className="text-red-500">*</span>}
      </Label>
      {isLoading ? (
        <div className="flex items-center justify-center h-11 border rounded-md bg-white dark:bg-slate-800">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger id="user-select" className="h-11 text-base bg-white dark:bg-slate-800">
            <SelectValue placeholder="Select a user" />
          </SelectTrigger>
          <SelectContent>
            {users?.map((user) => (
              <SelectItem key={user.id} value={user.id} className="text-base">
                {user.name} ({user.email})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
