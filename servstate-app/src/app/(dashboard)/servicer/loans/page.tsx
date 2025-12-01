'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable, type Column } from '@/components/shared/data-table';
import { useLoans } from '@/hooks/use-loans';
import { formatCurrency, formatPercent, formatDate } from '@/lib/format';
import type { Loan } from '@/types';

export default function ServicerLoansPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: loans, isLoading, error } = useLoans();

  const filteredLoans = useMemo(() => {
    if (!loans) return [];
    
    return loans.filter((loan) => {
      const matchesSearch =
        loan.borrower_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.loan_number.includes(searchTerm) ||
        loan.address.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || loan.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [loans, searchTerm, statusFilter]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Unable to load loans</h2>
          <p className="text-muted-foreground">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  const columns: Column<Loan>[] = [
    {
      key: 'loan_number',
      header: 'Loan #',
      sortable: true,
      render: (loan) => (
        <span className="font-mono text-sm">{loan.loan_number}</span>
      ),
    },
    {
      key: 'borrower_name',
      header: 'Borrower',
      sortable: true,
      render: (loan) => (
        <div>
          <p className="font-medium">{loan.borrower_name}</p>
          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
            {loan.address}
          </p>
        </div>
      ),
    },
    {
      key: 'loan_type',
      header: 'Type',
      render: (loan) => <Badge variant="secondary">{loan.loan_type}</Badge>,
    },
    {
      key: 'current_principal',
      header: 'Balance',
      sortable: true,
      render: (loan) => formatCurrency(loan.current_principal),
    },
    {
      key: 'interest_rate',
      header: 'Rate',
      sortable: true,
      render: (loan) => formatPercent(loan.interest_rate),
    },
    {
      key: 'next_due_date',
      header: 'Next Due',
      sortable: true,
      render: (loan) => formatDate(loan.next_due_date),
    },
    {
      key: 'status',
      header: 'Status',
      render: (loan) => (
        <Badge
          variant={loan.status === 'Active' ? 'default' : 'destructive'}
          className={loan.status === 'Active' ? 'bg-success text-success-foreground' : ''}
        >
          {loan.status}
          {loan.days_past_due && ` (${loan.days_past_due}d)`}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (loan) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/servicer/loans/${loan.id}`);
          }}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Loans"
        description={`Managing ${loans?.length || 0} loans in portfolio`}
      />

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, loan number, or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Delinquent">Delinquent</SelectItem>
            <SelectItem value="Forbearance">Forbearance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Loans Table */}
      <Card>
        <CardHeader>
          <CardTitle>Loan Portfolio</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredLoans}
            onRowClick={(loan) => router.push(`/servicer/loans/${loan.id}`)}
            emptyMessage="No loans found"
          />
        </CardContent>
      </Card>
    </div>
  );
}
