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

interface LoanSelectProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

interface Loan {
  id: string;
  loan_number: string;
  borrower_name: string;
}

async function fetchLoans(): Promise<Loan[]> {
  const response = await fetch('/api/loans');
  if (!response.ok) throw new Error('Failed to fetch loans');
  return response.json();
}

export function LoanSelect({ value, onChange, required }: LoanSelectProps) {
  const { data: loans, isLoading } = useQuery({
    queryKey: ['loans'],
    queryFn: fetchLoans,
  });

  return (
    <div className="space-y-2.5">
      <Label htmlFor="loan-select" className="text-sm font-medium text-slate-700 dark:text-slate-300">
        Loan {required && <span className="text-red-500">*</span>}
      </Label>
      {isLoading ? (
        <div className="flex items-center justify-center h-11 border rounded-md bg-white dark:bg-slate-800">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger id="loan-select" className="h-11 text-base bg-white dark:bg-slate-800">
            <SelectValue placeholder="Select a loan" />
          </SelectTrigger>
          <SelectContent>
            {loans?.map((loan) => (
              <SelectItem key={loan.id} value={loan.id} className="text-base">
                {loan.loan_number} - {loan.borrower_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
