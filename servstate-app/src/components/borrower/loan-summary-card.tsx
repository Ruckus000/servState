'use client';

import { Calendar, DollarSign, Percent, Home } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, formatPercent, formatDate } from '@/lib/format';
import type { Loan } from '@/types';

interface LoanSummaryCardProps {
  loan: Loan;
}

export function LoanSummaryCard({ loan }: LoanSummaryCardProps) {
  const paidOff = loan.original_principal - loan.current_principal;
  const progressPercent = (paidOff / loan.original_principal) * 100;
  const monthlyPayment = loan.monthly_pi + loan.monthly_escrow;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Loan Summary</CardTitle>
          <Badge
            variant={loan.status === 'Active' ? 'default' : 'destructive'}
            className={loan.status === 'Active' ? 'bg-success text-success-foreground' : ''}
          >
            {loan.status}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Loan #{loan.loan_number} - {loan.loan_type}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Property Address */}
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Home className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">Property Address</p>
            <p className="text-sm text-muted-foreground">{loan.address}</p>
          </div>
        </div>

        {/* Key Figures */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Balance</p>
              <p className="font-semibold">{formatCurrency(loan.current_principal)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
              <Percent className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Interest Rate</p>
              <p className="font-semibold">{formatPercent(loan.interest_rate)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Monthly Payment</p>
              <p className="font-semibold">{formatCurrency(monthlyPayment)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Next Due Date</p>
              <p className="font-semibold">{formatDate(loan.next_due_date)}</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="mb-2 flex justify-between text-sm">
            <span className="text-muted-foreground">Loan Progress</span>
            <span className="font-medium">{progressPercent.toFixed(1)}% Paid</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>{formatCurrency(paidOff)} paid</span>
            <span>{formatCurrency(loan.current_principal)} remaining</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
