'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Phone, Mail, Eye, Search, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import {
  getDelinquentLoans,
  mockLoans,
  getLastContactDate,
  getOutreachStatus,
  type OutreachStatus,
} from '@/data';
import { formatCurrency, formatDate } from '@/lib/format';
import type { LoanType } from '@/types';

// Filter state interface
interface DelinquencyFilters {
  search: string;
  loanType: LoanType | 'all';
  daysPastDue: { min: string; max: string };
  principalRange: { min: string; max: string };
  lastContact: 'all' | 'today' | '7days' | '30days' | '30plus' | 'never';
  outreachStatus: OutreachStatus | 'all';
}

const defaultFilters: DelinquencyFilters = {
  search: '',
  loanType: 'all',
  daysPastDue: { min: '', max: '' },
  principalRange: { min: '', max: '' },
  lastContact: 'all',
  outreachStatus: 'all',
};

// TODO: Filter persistence will be implemented with user account backend
// Filters should be saved to user preferences via Supabase when backend is connected

const loanTypes: LoanType[] = ['Conventional', 'FHA', 'VA', 'USDA', 'Jumbo'];

const lastContactOptions = [
  { value: 'all', label: 'All' },
  { value: 'today', label: 'Today' },
  { value: '7days', label: 'Last 7 days' },
  { value: '30days', label: 'Last 30 days' },
  { value: '30plus', label: '30+ days ago' },
  { value: 'never', label: 'Never contacted' },
];

const outreachStatusOptions = [
  { value: 'all', label: 'All' },
  { value: 'no_contact', label: 'No contact' },
  { value: 'voicemail', label: 'Voicemail left' },
  { value: 'spoke', label: 'Spoke with borrower' },
  { value: 'has_plan', label: 'Has payment plan' },
];

function checkLastContactFilter(
  lastContactDate: Date | null,
  filter: DelinquencyFilters['lastContact']
): boolean {
  if (filter === 'all') return true;
  if (filter === 'never') return lastContactDate === null;
  if (!lastContactDate) return false;

  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - lastContactDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  switch (filter) {
    case 'today':
      return diffDays === 0;
    case '7days':
      return diffDays <= 7;
    case '30days':
      return diffDays <= 30;
    case '30plus':
      return diffDays > 30;
    default:
      return true;
  }
}

export default function DelinquencyPage() {
  const router = useRouter();
  const delinquentLoans = getDelinquentLoans();
  const [filters, setFilters] = useState<DelinquencyFilters>(defaultFilters);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      filters.search !== '' ||
      filters.loanType !== 'all' ||
      filters.daysPastDue.min !== '' ||
      filters.daysPastDue.max !== '' ||
      filters.principalRange.min !== '' ||
      filters.principalRange.max !== '' ||
      filters.lastContact !== 'all' ||
      filters.outreachStatus !== 'all'
    );
  }, [filters]);

  // Filter the delinquent loans
  const filteredLoans = useMemo(() => {
    return delinquentLoans.filter((loan) => {
      // Search filter
      const matchesSearch =
        !filters.search ||
        loan.borrower_name.toLowerCase().includes(filters.search.toLowerCase()) ||
        loan.loan_number.includes(filters.search) ||
        loan.address.toLowerCase().includes(filters.search.toLowerCase());

      // Loan type filter
      const matchesLoanType =
        filters.loanType === 'all' || loan.loan_type === filters.loanType;

      // Days past due range
      const dpd = loan.days_past_due || 0;
      const dpdMin = filters.daysPastDue.min ? parseInt(filters.daysPastDue.min, 10) : null;
      const dpdMax = filters.daysPastDue.max ? parseInt(filters.daysPastDue.max, 10) : null;
      const matchesDPD =
        (dpdMin === null || dpd >= dpdMin) && (dpdMax === null || dpd <= dpdMax);

      // Principal range
      const principalMin = filters.principalRange.min
        ? parseFloat(filters.principalRange.min)
        : null;
      const principalMax = filters.principalRange.max
        ? parseFloat(filters.principalRange.max)
        : null;
      const matchesPrincipal =
        (principalMin === null || loan.current_principal >= principalMin) &&
        (principalMax === null || loan.current_principal <= principalMax);

      // Last contact filter
      const lastContact = getLastContactDate(loan.id);
      const matchesLastContact = checkLastContactFilter(lastContact, filters.lastContact);

      // Outreach status filter
      const outreachStatus = getOutreachStatus(loan.id);
      const matchesOutreach =
        filters.outreachStatus === 'all' || outreachStatus === filters.outreachStatus;

      return (
        matchesSearch &&
        matchesLoanType &&
        matchesDPD &&
        matchesPrincipal &&
        matchesLastContact &&
        matchesOutreach
      );
    });
  }, [delinquentLoans, filters]);

  // Calculate stats based on filtered results
  const totalDelinquentAmount = filteredLoans.reduce(
    (sum, loan) => sum + loan.monthly_pi + loan.monthly_escrow,
    0
  );

  const averageDaysPastDue =
    filteredLoans.length > 0
      ? Math.round(
          filteredLoans.reduce((sum, loan) => sum + (loan.days_past_due || 0), 0) /
            filteredLoans.length
        )
      : 0;

  const clearFilters = () => {
    setFilters(defaultFilters);
  };

  const updateFilter = <K extends keyof DelinquencyFilters>(
    key: K,
    value: DelinquencyFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Delinquency Management"
        description="Track and manage delinquent loans"
      />

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Delinquent Loans"
          value={filteredLoans.length}
          subtitle={`of ${delinquentLoans.length} total`}
          icon={AlertTriangle}
          variant="destructive"
        />
        <StatCard
          title="Delinquency Rate"
          value={`${((filteredLoans.length / Math.max(mockLoans.length, 1)) * 100).toFixed(1)}%`}
          subtitle="of portfolio"
          icon={AlertTriangle}
          variant="warning"
        />
        <StatCard
          title="Total Amount Due"
          value={formatCurrency(totalDelinquentAmount)}
          subtitle="Monthly payments owed"
          icon={AlertTriangle}
          variant="destructive"
        />
        <StatCard
          title="Avg Days Past Due"
          value={averageDaysPastDue}
          subtitle="days on average"
          icon={AlertTriangle}
          variant="warning"
        />
      </div>

      {/* Filters Card */}
      <Card>
        <CardContent className="p-4 space-y-4">
          {/* Row 1: Search, Loan Type, Clear All */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name, loan #, or address..."
                  value={filters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="w-full sm:w-[180px]">
              <Select
                value={filters.loanType}
                onValueChange={(value) => updateFilter('loanType', value as LoanType | 'all')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Loan Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Loan Types</SelectItem>
                  {loanTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters} className="shrink-0">
                <X className="mr-2 h-4 w-4" />
                Clear All
              </Button>
            )}
          </div>

          {/* Row 2: Range filters and dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Days Past Due Range */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Days Past Due</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.daysPastDue.min}
                  onChange={(e) =>
                    updateFilter('daysPastDue', { ...filters.daysPastDue, min: e.target.value })
                  }
                  className="w-[100px]"
                />
                <span className="text-muted-foreground">–</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.daysPastDue.max}
                  onChange={(e) =>
                    updateFilter('daysPastDue', { ...filters.daysPastDue, max: e.target.value })
                  }
                  className="w-[100px]"
                />
              </div>
            </div>

            {/* Principal Range */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Principal Range ($)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.principalRange.min}
                  onChange={(e) =>
                    updateFilter('principalRange', {
                      ...filters.principalRange,
                      min: e.target.value,
                    })
                  }
                  className="w-[100px]"
                />
                <span className="text-muted-foreground">–</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.principalRange.max}
                  onChange={(e) =>
                    updateFilter('principalRange', {
                      ...filters.principalRange,
                      max: e.target.value,
                    })
                  }
                  className="w-[100px]"
                />
              </div>
            </div>

            {/* Last Contact */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Last Contact</Label>
              <Select
                value={filters.lastContact}
                onValueChange={(value) =>
                  updateFilter('lastContact', value as DelinquencyFilters['lastContact'])
                }
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Last Contact" />
                </SelectTrigger>
                <SelectContent>
                  {lastContactOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Outreach Status */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Outreach Status</Label>
              <Select
                value={filters.outreachStatus}
                onValueChange={(value) =>
                  updateFilter('outreachStatus', value as OutreachStatus | 'all')
                }
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Outreach Status" />
                </SelectTrigger>
                <SelectContent>
                  {outreachStatusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Showing {filteredLoans.length} of {delinquentLoans.length} delinquent accounts
      </p>

      {/* Delinquent Loans List */}
      <Card>
        <CardHeader>
          <CardTitle>Delinquent Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredLoans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                <AlertTriangle className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium">
                {hasActiveFilters ? 'No matching accounts' : 'No Delinquent Loans'}
              </p>
              <p className="text-sm text-muted-foreground">
                {hasActiveFilters
                  ? 'Try adjusting your filters'
                  : 'All loans are current'}
              </p>
              {hasActiveFilters && (
                <Button variant="outline" className="mt-4" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLoans.map((loan) => {
                const outreachStatus = getOutreachStatus(loan.id);
                const lastContact = getLastContactDate(loan.id);

                return (
                  <div
                    key={loan.id}
                    className="rounded-lg border border-destructive/20 bg-destructive/5 p-4"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 shrink-0">
                          <AlertTriangle className="h-6 w-6 text-destructive" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold">{loan.borrower_name}</p>
                            <Badge variant="destructive">
                              {loan.days_past_due} days past due
                            </Badge>
                            {outreachStatus === 'has_plan' && (
                              <Badge variant="secondary" className="bg-success/10 text-success">
                                Has Payment Plan
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Loan #{loan.loan_number} - {loan.loan_type}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {loan.address}
                          </p>
                          {lastContact && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Last contact: {formatDate(lastContact.toISOString())}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-left lg:text-right shrink-0">
                        <p className="text-lg font-bold text-destructive">
                          {formatCurrency(loan.monthly_pi + loan.monthly_escrow)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Due {formatDate(loan.next_due_date)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Principal: {formatCurrency(loan.current_principal)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-destructive/20 pt-4">
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {loan.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {loan.phone}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm">
                          <Phone className="mr-2 h-4 w-4" />
                          Call
                        </Button>
                        <Button variant="outline" size="sm">
                          <Mail className="mr-2 h-4 w-4" />
                          Email
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => router.push(`/servicer/loans/${loan.id}`)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
