'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Phone, Mail, MapPin, Calendar, DollarSign, Percent, CreditCard, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable, type Column } from '@/components/shared/data-table';
import { PaymentDialog } from '@/components/payments/payment-dialog';
import { AuditLogTable } from '@/components/audit/audit-log-table';
import { DocumentUploadZone } from '@/components/documents/DocumentUploadZone';
import { DocumentList } from '@/components/documents/DocumentList';
import { useLoan } from '@/hooks/use-loans';
import { useTransactions } from '@/hooks/use-transactions';
import { useDocuments } from '@/hooks/use-documents';
import { useNotes } from '@/hooks/use-notes';
import { useMessages } from '@/hooks/use-messages';
import { useTasks } from '@/hooks/use-tasks';
import { useAuditLog } from '@/hooks/use-audit-log';
import { formatCurrency, formatPercent, formatDate, formatDateTime, formatPhone, formatDuration } from '@/lib/format';
import type { Transaction, Document, Note, Correspondence, Modification, Task } from '@/types';

export default function LoanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const loanId = params.id as string;
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  // Fetch all data via hooks
  const { data: loan, isLoading: loanLoading, error: loanError } = useLoan(loanId);
  const { data: allTransactions = [], isLoading: transactionsLoading } = useTransactions();
  const { data: documents = [], isLoading: documentsLoading } = useDocuments(loanId);
  const { data: allNotes = [], isLoading: notesLoading } = useNotes();
  const { data: allMessages = [], isLoading: messagesLoading } = useMessages();
  const { data: allTasks = [], isLoading: tasksLoading } = useTasks();
  const { data: allAuditLog = [], isLoading: auditLoading } = useAuditLog();

  // Filter data by loan ID (client-side)
  const transactions = useMemo(
    () => allTransactions.filter(t => t.loan_id === loanId),
    [allTransactions, loanId]
  );
  const notes = useMemo(
    () => allNotes.filter(n => n.loan_id === loanId),
    [allNotes, loanId]
  );
  const correspondence = useMemo(
    () => allMessages.filter(m => m.loan_id === loanId),
    [allMessages, loanId]
  );
  const tasks = useMemo(
    () => allTasks.filter(t => t.loan_id === loanId),
    [allTasks, loanId]
  );
  const auditLog = useMemo(
    () => allAuditLog.filter(a => a.loan_id === loanId),
    [allAuditLog, loanId]
  );

  // Loading state
  if (loanLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Error state
  if (loanError || !loan) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-muted-foreground">Loan not found</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  const monthlyPayment = loan.monthly_pi + loan.monthly_escrow;
  const paidOff = loan.original_principal - loan.current_principal;
  const progressPercent = (paidOff / loan.original_principal) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <PageHeader
            title={loan.borrower_name}
            description={`Loan #${loan.loan_number} - ${loan.loan_type}`}
          >
            <Badge
              variant={loan.status === 'Active' ? 'default' : 'destructive'}
              className={loan.status === 'Active' ? 'bg-success text-success-foreground' : ''}
            >
              {loan.status}
              {loan.days_past_due && ` - ${loan.days_past_due} days past due`}
            </Badge>
          </PageHeader>
        </div>
        <Button onClick={() => setPaymentDialogOpen(true)}>
          <CreditCard className="mr-2 h-4 w-4" />
          Make Payment
        </Button>
      </div>

      {/* Payment Dialog */}
      <PaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        loan={loan}
      />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Balance</p>
                <p className="text-lg font-bold">{formatCurrency(loan.current_principal)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Percent className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Interest Rate</p>
                <p className="text-lg font-bold">{formatPercent(loan.interest_rate)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Payment</p>
                <p className="text-lg font-bold">{formatCurrency(monthlyPayment)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Next Due</p>
                <p className="text-lg font-bold">{formatDate(loan.next_due_date)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">History ({transactions.length})</TabsTrigger>
          <TabsTrigger value="correspondence">Correspondence ({correspondence.length})</TabsTrigger>
          <TabsTrigger value="documents">Documents ({documents.length})</TabsTrigger>
          <TabsTrigger value="notes">Notes ({notes.length})</TabsTrigger>
          <TabsTrigger value="tasks">Tasks ({tasks.length})</TabsTrigger>
          <TabsTrigger value="actions-log">Actions Log ({auditLog.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Borrower Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Borrower Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{loan.address}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{loan.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{formatPhone(loan.phone)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Loan Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Loan Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-muted-foreground">Principal Paid</span>
                    <span className="font-medium">{progressPercent.toFixed(1)}%</span>
                  </div>
                  <Progress value={progressPercent} className="h-3" />
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Original Amount</p>
                    <p className="font-medium">{formatCurrency(loan.original_principal)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Paid Off</p>
                    <p className="font-medium">{formatCurrency(paidOff)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Payments Made</p>
                    <p className="font-medium">{loan.payments_made} of {loan.term_months}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Escrow Balance</p>
                    <p className="font-medium">{formatCurrency(loan.escrow_balance)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium">{tx.type}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(tx.date)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(tx.amount)}</p>
                      {tx.breakdown && (
                        <p className="text-xs text-muted-foreground">
                          P: {formatCurrency(tx.breakdown.principal)} | I: {formatCurrency(tx.breakdown.interest)} | E: {formatCurrency(tx.breakdown.escrow)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {transactions.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No transactions</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="correspondence">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Correspondence History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {correspondence.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-lg border p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{c.type}</Badge>
                        <Badge variant={c.direction === 'inbound' ? 'secondary' : 'default'}>
                          {c.direction}
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">{formatDateTime(c.date)}</span>
                    </div>
                    {c.type === 'email' && 'subject' in c && (
                      <p className="font-medium">{c.subject}</p>
                    )}
                    {c.type === 'call' && 'outcome' in c && (
                      <p className="text-sm">
                        <span className="font-medium">Outcome:</span> {c.outcome}
                        {'duration' in c && c.duration > 0 && ` (${formatDuration(c.duration)})`}
                      </p>
                    )}
                    {c.type === 'call' && 'notes' in c && (
                      <p className="text-sm text-muted-foreground mt-1">{c.notes}</p>
                    )}
                  </div>
                ))}
                {correspondence.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No correspondence</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Loan Documents</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowUpload(!showUpload)}
                >
                  {showUpload ? 'Cancel' : 'Upload Document'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {showUpload && (
                <DocumentUploadZone
                  loanId={loanId}
                  onUploadSuccess={() => setShowUpload(false)}
                />
              )}
              <DocumentList
                documents={documents}
                isLoading={documentsLoading}
                showTimestamp={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Internal Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-lg border p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{note.author}</span>
                        <Badge variant="outline">{note.type}</Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">{formatDateTime(note.date)}</span>
                    </div>
                    <p className="text-sm">{note.content}</p>
                  </div>
                ))}
                {notes.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No notes</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="rounded-lg border p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">{task.title}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          task.priority === 'high' ? 'destructive' :
                          task.priority === 'medium' ? 'secondary' : 'default'
                        }>
                          {task.priority}
                        </Badge>
                        <Badge variant={task.status === 'completed' ? 'default' : 'outline'}>
                          {task.status}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Assigned to: {task.assigned_to} | Due: {formatDate(task.due_date)}
                    </div>
                  </div>
                ))}
                {tasks.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No tasks</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions-log">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions Log</CardTitle>
              <p className="text-sm text-muted-foreground">
                Complete history of all actions taken on this loan account
              </p>
            </CardHeader>
            <CardContent>
              <AuditLogTable entries={auditLog} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
