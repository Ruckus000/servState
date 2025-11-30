'use client';

import { BarChart2, TrendingUp, DollarSign, Users, FileText, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { mockLoans, mockTasks, getDelinquentLoans } from '@/data';
import { formatCurrency } from '@/lib/format';

export default function ReportsPage() {
  const totalPortfolioValue = mockLoans.reduce(
    (sum, loan) => sum + loan.current_principal,
    0
  );
  const delinquentLoans = getDelinquentLoans();
  const completedTasks = mockTasks.filter((t) => t.status === 'completed').length;

  // Mock reports
  const availableReports = [
    {
      id: 'portfolio_summary',
      name: 'Portfolio Summary',
      description: 'Overview of all loans including status, balances, and rates',
      lastGenerated: '2023-11-28',
      type: 'PDF',
    },
    {
      id: 'delinquency_report',
      name: 'Delinquency Report',
      description: 'Detailed breakdown of all delinquent loans and actions taken',
      lastGenerated: '2023-11-28',
      type: 'Excel',
    },
    {
      id: 'payment_analysis',
      name: 'Payment Analysis',
      description: 'Analysis of payment patterns and trends',
      lastGenerated: '2023-11-25',
      type: 'PDF',
    },
    {
      id: 'escrow_summary',
      name: 'Escrow Account Summary',
      description: 'Summary of all escrow accounts and upcoming disbursements',
      lastGenerated: '2023-11-20',
      type: 'Excel',
    },
    {
      id: 'task_completion',
      name: 'Task Completion Report',
      description: 'Summary of task completion rates and team performance',
      lastGenerated: '2023-11-28',
      type: 'PDF',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Generate and download portfolio reports"
      >
        <Button>
          <FileText className="mr-2 h-4 w-4" />
          Generate Custom Report
        </Button>
      </PageHeader>

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Total Portfolio"
          value={formatCurrency(totalPortfolioValue)}
          subtitle={`${mockLoans.length} loans`}
          icon={DollarSign}
        />
        <StatCard
          title="Active Loans"
          value={mockLoans.length - delinquentLoans.length}
          subtitle="Current status"
          icon={Users}
          variant="success"
        />
        <StatCard
          title="Delinquency Rate"
          value={`${((delinquentLoans.length / mockLoans.length) * 100).toFixed(1)}%`}
          subtitle="of portfolio"
          icon={TrendingUp}
          variant={delinquentLoans.length > 0 ? 'destructive' : 'success'}
        />
        <StatCard
          title="Tasks Completed"
          value={completedTasks}
          subtitle="This month"
          icon={BarChart2}
        />
      </div>

      {/* Portfolio Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-lg border p-4 text-center">
              <p className="text-sm text-muted-foreground">Conventional</p>
              <p className="text-2xl font-bold">
                {mockLoans.filter((l) => l.loan_type === 'Conventional').length}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(
                  mockLoans
                    .filter((l) => l.loan_type === 'Conventional')
                    .reduce((sum, l) => sum + l.current_principal, 0)
                )}
              </p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <p className="text-sm text-muted-foreground">FHA</p>
              <p className="text-2xl font-bold">
                {mockLoans.filter((l) => l.loan_type === 'FHA').length}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(
                  mockLoans
                    .filter((l) => l.loan_type === 'FHA')
                    .reduce((sum, l) => sum + l.current_principal, 0)
                )}
              </p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <p className="text-sm text-muted-foreground">VA</p>
              <p className="text-2xl font-bold">
                {mockLoans.filter((l) => l.loan_type === 'VA').length}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(
                  mockLoans
                    .filter((l) => l.loan_type === 'VA')
                    .reduce((sum, l) => sum + l.current_principal, 0)
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Available Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {availableReports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{report.name}</p>
                      <Badge variant="secondary">{report.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {report.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Last generated: {report.lastGenerated}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Regenerate
                  </Button>
                  <Button size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
