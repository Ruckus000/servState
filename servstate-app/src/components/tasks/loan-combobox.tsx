import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Search } from 'lucide-react';

interface LoanComboboxProps {
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

export function LoanCombobox({ value, onChange, required }: LoanComboboxProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: loans, isLoading } = useQuery({
    queryKey: ['loans'],
    queryFn: fetchLoans,
  });

  // Filter loans based on search query
  const filteredLoans = useMemo(() => {
    if (!loans) return [];
    if (!searchQuery.trim()) return loans;

    const query = searchQuery.toLowerCase();
    return loans.filter(
      (loan) =>
        loan.loan_number.toLowerCase().includes(query) ||
        loan.borrower_name.toLowerCase().includes(query)
    );
  }, [loans, searchQuery]);

  // Find selected loan for display
  const selectedLoan = loans?.find((loan) => loan.id === value);

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
        <div className="space-y-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by loan number or borrower name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-11 text-base bg-white dark:bg-slate-800"
            />
          </div>

          {/* Select Dropdown */}
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger id="loan-select" className="h-11 text-base bg-white dark:bg-slate-800">
              <SelectValue
                placeholder="Select a loan"
              >
                {selectedLoan
                  ? `${selectedLoan.loan_number} - ${selectedLoan.borrower_name}`
                  : "Select a loan"
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {filteredLoans.length === 0 ? (
                <div className="py-6 text-center text-sm text-slate-500">
                  {searchQuery ? 'No loans found matching your search' : 'No loans available'}
                </div>
              ) : (
                filteredLoans.map((loan) => (
                  <SelectItem key={loan.id} value={loan.id} className="text-base">
                    {loan.loan_number} - {loan.borrower_name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>

          {/* Search Result Count */}
          {loans && searchQuery && (
            <p className="text-xs text-slate-500">
              {filteredLoans.length === 0
                ? 'No results'
                : `${filteredLoans.length} ${filteredLoans.length === 1 ? 'loan' : 'loans'} found`
              }
            </p>
          )}
        </div>
      )}
    </div>
  );
}
