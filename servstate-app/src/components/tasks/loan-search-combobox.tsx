'use client';

import { useState } from 'react';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useSearchLoans } from '@/hooks/use-loans';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';

interface LoanSearchComboboxProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  hideLabel?: boolean;
}

interface Loan {
  id: string;
  loan_number: string;
  borrower_name: string;
  address: string;
}

export function LoanSearchCombobox({
  value,
  onChange,
  required,
  hideLabel,
}: LoanSearchComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Fetch loans when:
  // - Popover is open AND search has 2+ characters (active search)
  // - OR popover is open AND search is empty (show recent loans)
  const shouldFetch = open && (debouncedSearch.length >= 2 || debouncedSearch.length === 0);
  const { data: loans, isLoading, error, refetch } = useSearchLoans(debouncedSearch, undefined, shouldFetch);

  // Find selected loan for display
  const selectedLoan = loans?.find((loan) => loan.id === value);

  return (
    <div className={cn(!hideLabel && 'space-y-2.5')}>
      {!hideLabel && (
        <Label
          htmlFor="loan-combobox"
          className="text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Loan {required && <span className="text-red-500">*</span>}
        </Label>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="loan-combobox"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-required={required}
            className={cn(
              'w-full justify-between',
              hideLabel
                ? 'h-9 text-sm bg-gray-50 border-gray-200 hover:border-gray-300 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:bg-gray-800 dark:border-gray-700'
                : 'h-11 text-base bg-white dark:bg-slate-800'
            )}
          >
            {selectedLoan ? (
              <span className="truncate">
                {selectedLoan.loan_number} - {selectedLoan.borrower_name}
              </span>
            ) : (
              <span className="text-muted-foreground">Search for a loan...</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search by loan number, borrower, or address..."
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              {isLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">
                    {searchQuery.length === 0 ? 'Loading loans...' : 'Searching...'}
                  </span>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-6 px-4">
                  <p className="text-sm text-red-600 dark:text-red-400 mb-3 text-center">
                    Failed to load loans. Please try again.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetch()}
                    className="text-xs"
                  >
                    Retry
                  </Button>
                </div>
              ) : searchQuery.length === 1 ? (
                <CommandEmpty>Type at least 2 characters to search</CommandEmpty>
              ) : !loans || loans.length === 0 ? (
                <CommandEmpty>
                  {searchQuery.length === 0 ? 'No loans available' : 'No loans found'}
                </CommandEmpty>
              ) : (
                <CommandGroup heading={searchQuery.length === 0 ? 'Recent Loans' : undefined}>
                  {loans.map((loan) => (
                    <CommandItem
                      key={loan.id}
                      value={loan.id}
                      onSelect={(currentValue) => {
                        onChange(currentValue === value ? '' : currentValue);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === loan.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{loan.loan_number}</span>
                        <span className="text-xs text-muted-foreground">
                          {loan.borrower_name} • {loan.address}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Screen reader status */}
      <div className="sr-only" role="status" aria-live="polite">
        {isLoading && (searchQuery.length === 0 ? 'Loading recent loans' : 'Loading search results')}
        {!isLoading && loans && `${loans.length} ${searchQuery.length === 0 ? 'recent loans' : 'loans found'}`}
      </div>
    </div>
  );
}
