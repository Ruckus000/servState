'use client';

import { PiggyBank, Home, Shield, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { mockLoans } from '@/data';
import { formatCurrency, formatDate } from '@/lib/format';

// Mock escrow transaction data
const escrowTransactions = [
  {
    id: 'esc_1',
    date: '2023-12-01',
    type: 'Deposit',
    description: 'Monthly escrow payment',
    amount: 550,
    balance: 2950,
  },
  {
    id: 'esc_2',
    date: '2023-11-15',
    type: 'Disbursement',
    description: 'Property Insurance Premium',
    amount: -1200,
    balance: 2400,
  },
  {
    id: 'esc_3',
    date: '2023-11-01',
    type: 'Deposit',
    description: 'Monthly escrow payment',
    amount: 550,
    balance: 3600,
  },
  {
    id: 'esc_4',
    date: '2023-10-01',
    type: 'Deposit',
    description: 'Monthly escrow payment',
    amount: 550,
    balance: 3050,
  },
  {
    id: 'esc_5',
    date: '2023-06-15',
    type: 'Disbursement',
    description: 'Property Tax - First Installment',
    amount: -2400,
    balance: 2500,
  },
];

export default function BorrowerEscrowPage() {
  const loan = mockLoans[0];

  // Mock escrow breakdown
  const annualPropertyTax = 4800;
  const annualInsurance = 1200;
  const totalAnnualEscrow = annualPropertyTax + annualInsurance;
  const monthlyEscrow = loan.monthly_escrow;

  // Target balance should cover upcoming disbursements
  const targetBalance = totalAnnualEscrow / 2; // 6 months cushion

  return (
    <div className="space-y-6">
      <PageHeader
        title="Escrow"
        description="View your escrow account details and transaction history"
      />

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Current Balance"
          value={formatCurrency(loan.escrow_balance)}
          subtitle="Available funds"
          icon={PiggyBank}
          variant="success"
        />
        <StatCard
          title="Monthly Deposit"
          value={formatCurrency(monthlyEscrow)}
          subtitle="Per payment"
          icon={TrendingUp}
        />
        <StatCard
          title="Annual Property Tax"
          value={formatCurrency(annualPropertyTax)}
          subtitle="Paid in 2 installments"
          icon={Home}
        />
        <StatCard
          title="Annual Insurance"
          value={formatCurrency(annualInsurance)}
          subtitle="Hazard insurance"
          icon={Shield}
        />
      </div>

      {/* Escrow Analysis */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Escrow Account Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-muted-foreground">Balance vs Target</span>
                <span className="font-medium">
                  {formatCurrency(loan.escrow_balance)} / {formatCurrency(targetBalance)}
                </span>
              </div>
              <Progress
                value={(loan.escrow_balance / targetBalance) * 100}
                className="h-3"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                {loan.escrow_balance >= targetBalance
                  ? 'Your escrow account is adequately funded.'
                  : `You may need an additional ${formatCurrency(targetBalance - loan.escrow_balance)} to meet target balance.`}
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Annual Escrow Breakdown</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-primary" />
                    <span>Property Taxes</span>
                  </div>
                  <span className="font-medium">{formatCurrency(annualPropertyTax)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span>Hazard Insurance</span>
                  </div>
                  <span className="font-medium">{formatCurrency(annualInsurance)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-sm font-medium">
                  <span>Total Annual</span>
                  <span>{formatCurrency(totalAnnualEscrow)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upcoming Disbursements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Home className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Property Tax - 2nd Installment</p>
                    <p className="text-sm text-muted-foreground">Due December 10, 2023</p>
                  </div>
                </div>
                <span className="font-semibold">{formatCurrency(2400)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Insurance Renewal</p>
                    <p className="text-sm text-muted-foreground">Due June 15, 2024</p>
                  </div>
                </div>
                <span className="font-semibold">{formatCurrency(1200)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {escrowTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      tx.amount > 0 ? 'bg-success/10' : 'bg-destructive/10'
                    }`}
                  >
                    {tx.amount > 0 ? (
                      <TrendingUp className="h-5 w-5 text-success" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-destructive" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{tx.description}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(tx.date)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-semibold ${
                      tx.amount > 0 ? 'text-success' : 'text-destructive'
                    }`}
                  >
                    {tx.amount > 0 ? '+' : ''}
                    {formatCurrency(tx.amount)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Balance: {formatCurrency(tx.balance)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
