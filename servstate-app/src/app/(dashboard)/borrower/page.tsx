'use client';

import { CreditCard, Calendar, PiggyBank, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { LoanSummaryCard } from '@/components/borrower/loan-summary-card';
import { PaymentBreakdownChart } from '@/components/charts/payment-breakdown-chart';
import { mockLoans, getTransactionsByLoanId } from '@/data';
import { formatCurrency, formatDate } from '@/lib/format';

export default function BorrowerDashboardPage() {
  // Get the first loan for the borrower view
  const loan = mockLoans[0];
  const transactions = getTransactionsByLoanId(loan.id);
  const recentTransactions = transactions.slice(0, 3);

  const monthlyPayment = loan.monthly_pi + loan.monthly_escrow;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={`Welcome back! Here's an overview of your mortgage.`}
      >
        <Button>Make a Payment</Button>
      </PageHeader>

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Next Payment"
          value={formatCurrency(monthlyPayment)}
          subtitle={`Due ${formatDate(loan.next_due_date)}`}
          icon={Calendar}
        />
        <StatCard
          title="Current Balance"
          value={formatCurrency(loan.current_principal)}
          subtitle={`of ${formatCurrency(loan.original_principal)}`}
          icon={CreditCard}
        />
        <StatCard
          title="Escrow Balance"
          value={formatCurrency(loan.escrow_balance)}
          subtitle="For taxes & insurance"
          icon={PiggyBank}
        />
        <StatCard
          title="Payments Made"
          value={loan.payments_made}
          subtitle={`of ${loan.term_months} total`}
          icon={TrendingUp}
          trend={{
            value: 5.2,
            label: 'ahead of schedule',
            direction: 'up',
          }}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Loan Summary */}
        <LoanSummaryCard loan={loan} />

        {/* Payment Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payment Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-4">
            <PaymentBreakdownChart
              principal={loan.monthly_pi - (loan.current_principal * loan.interest_rate / 12)}
              interest={loan.current_principal * loan.interest_rate / 12}
              escrow={loan.monthly_escrow}
            />
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Recent Transactions</CardTitle>
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
                    <CreditCard className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="font-medium">{tx.type}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(tx.date)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(tx.amount)}</p>
                  {tx.breakdown && (
                    <p className="text-xs text-muted-foreground">
                      P: {formatCurrency(tx.breakdown.principal)} | I: {formatCurrency(tx.breakdown.interest)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
