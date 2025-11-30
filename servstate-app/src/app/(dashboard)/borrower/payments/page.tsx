'use client';

import { useState } from 'react';
import { CreditCard, Download, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { DataTable, type Column } from '@/components/shared/data-table';
import { mockLoans, getTransactionsByLoanId } from '@/data';
import { formatCurrency, formatDate } from '@/lib/format';
import type { Transaction } from '@/types';

export default function BorrowerPaymentsPage() {
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const loan = mockLoans[0];
  const transactions = getTransactionsByLoanId(loan.id);
  const monthlyPayment = loan.monthly_pi + loan.monthly_escrow;

  const columns: Column<Transaction>[] = [
    {
      key: 'date',
      header: 'Date',
      sortable: true,
      render: (tx) => formatDate(tx.date),
    },
    {
      key: 'type',
      header: 'Type',
      render: (tx) => (
        <Badge variant="secondary">{tx.type}</Badge>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      sortable: true,
      render: (tx) => (
        <span className="font-medium">{formatCurrency(tx.amount)}</span>
      ),
    },
    {
      key: 'breakdown',
      header: 'Breakdown',
      render: (tx) =>
        tx.breakdown ? (
          <span className="text-sm text-muted-foreground">
            P: {formatCurrency(tx.breakdown.principal)} | I: {formatCurrency(tx.breakdown.interest)} | E: {formatCurrency(tx.breakdown.escrow)}
          </span>
        ) : (
          '-'
        ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (tx) => (
        <Badge
          variant={tx.status === 'completed' ? 'default' : 'secondary'}
          className={tx.status === 'completed' ? 'bg-success text-success-foreground' : ''}
        >
          {tx.status}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="View your payment history and make payments"
      >
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
        <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Make a Payment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Make a Payment</DialogTitle>
              <DialogDescription>
                Submit a payment towards your mortgage loan #{loan.loan_number}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">Monthly Payment Due</p>
                <p className="text-2xl font-bold">{formatCurrency(monthlyPayment)}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Due {formatDate(loan.next_due_date)}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Payment Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder={monthlyPayment.toString()}
                  defaultValue={monthlyPayment}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account">Bank Account</Label>
                <Input
                  id="account"
                  placeholder="Select bank account"
                  defaultValue="Chase Checking ****4567"
                  disabled
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPaymentModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setPaymentModalOpen(false)}>
                Submit Payment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Next Payment"
          value={formatCurrency(monthlyPayment)}
          subtitle={`Due ${formatDate(loan.next_due_date)}`}
          icon={CreditCard}
        />
        <StatCard
          title="Total Paid (YTD)"
          value={formatCurrency(monthlyPayment * 12)}
          subtitle="Principal + Interest + Escrow"
          icon={CreditCard}
        />
        <StatCard
          title="Payments Made"
          value={loan.payments_made}
          subtitle={`of ${loan.term_months} total payments`}
          icon={CreditCard}
        />
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={transactions}
            emptyMessage="No payment history"
          />
        </CardContent>
      </Card>
    </div>
  );
}
