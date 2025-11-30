'use client';

import { Folder, AlertTriangle, CheckSquare, DollarSign, Users, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { mockLoans, mockTasks, getPendingTasksCount, getDelinquentLoans } from '@/data';
import { formatCurrency, formatDate, getRelativeTime } from '@/lib/format';

export default function ServicerDashboardPage() {
  const delinquentLoans = getDelinquentLoans();
  const pendingTasksCount = getPendingTasksCount();
  const totalPortfolioValue = mockLoans.reduce((sum, loan) => sum + loan.current_principal, 0);

  // Recent activity (combine and sort by date)
  const recentTasks = mockTasks
    .filter((t) => t.status !== 'completed')
    .sort((a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Servicer Dashboard"
        description="Overview of your mortgage servicing portfolio"
      />

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Loans"
          value={mockLoans.length}
          subtitle="In portfolio"
          icon={Folder}
        />
        <StatCard
          title="Portfolio Value"
          value={formatCurrency(totalPortfolioValue)}
          subtitle="Total outstanding"
          icon={DollarSign}
          trend={{
            value: 2.4,
            label: 'from last month',
            direction: 'up',
          }}
        />
        <StatCard
          title="Delinquent Loans"
          value={delinquentLoans.length}
          subtitle={`${((delinquentLoans.length / mockLoans.length) * 100).toFixed(1)}% of portfolio`}
          icon={AlertTriangle}
          variant="destructive"
        />
        <StatCard
          title="Pending Tasks"
          value={pendingTasksCount}
          subtitle="Action required"
          icon={CheckSquare}
          variant={pendingTasksCount > 10 ? 'warning' : 'default'}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Delinquent Loans */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Delinquent Loans</CardTitle>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {delinquentLoans.map((loan) => (
                <div
                  key={loan.id}
                  className="flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/5 p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                    </div>
                    <div>
                      <p className="font-medium">{loan.borrower_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Loan #{loan.loan_number}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="destructive">
                      {loan.days_past_due} days past due
                    </Badge>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatCurrency(loan.monthly_pi + loan.monthly_escrow)} due
                    </p>
                  </div>
                </div>
              ))}
              {delinquentLoans.length === 0 && (
                <p className="py-8 text-center text-muted-foreground">
                  No delinquent loans
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Tasks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Tasks</CardTitle>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        task.priority === 'high'
                          ? 'bg-destructive/10'
                          : task.priority === 'medium'
                          ? 'bg-warning/10'
                          : 'bg-muted'
                      }`}
                    >
                      <CheckSquare
                        className={`h-5 w-5 ${
                          task.priority === 'high'
                            ? 'text-destructive'
                            : task.priority === 'medium'
                            ? 'text-warning'
                            : 'text-muted-foreground'
                        }`}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{task.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {task.borrower_name} - Due {formatDate(task.due_date)}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      task.priority === 'high'
                        ? 'destructive'
                        : task.priority === 'medium'
                        ? 'secondary'
                        : 'default'
                    }
                  >
                    {task.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Portfolio Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {mockLoans.slice(0, 3).map((loan) => (
              <div
                key={loan.id}
                className="rounded-lg border p-4 hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">{loan.borrower_name}</p>
                  <Badge
                    variant={loan.status === 'Active' ? 'default' : 'destructive'}
                    className={loan.status === 'Active' ? 'bg-success text-success-foreground' : ''}
                  >
                    {loan.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {loan.loan_type} - #{loan.loan_number}
                </p>
                <p className="text-lg font-semibold">
                  {formatCurrency(loan.current_principal)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {loan.interest_rate * 100}% APR - {loan.payments_made}/{loan.term_months} payments
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
