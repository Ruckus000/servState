'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Phone, Mail, MapPin, Calendar, DollarSign, Percent, CreditCard, Loader2, Pencil } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { PageHeader } from '@/components/shared/page-header';
import { PaymentDialog } from '@/components/payments/payment-dialog';
import { AuditLogTable } from '@/components/audit/audit-log-table';
import { DocumentUploadZone } from '@/components/documents/DocumentUploadZone';
import { DocumentList } from '@/components/documents/DocumentList';
import { CorrespondenceList } from '@/components/correspondence/correspondence-list';
import { EscrowInfoCard } from '@/components/loans/escrow-info-card';
import { EditLoanModal } from '@/components/loans/edit-loan-modal';
import { GenerateDocumentDropdown } from '@/components/loans/generate-document-dropdown';
import { PayoffModal } from '@/components/documents/payoff-modal';
import { PaymentHistoryModal } from '@/components/documents/payment-history-modal';
import { useLoan } from '@/hooks/use-loans';
import { useTransactions } from '@/hooks/use-transactions';
import { useDocuments } from '@/hooks/use-documents';
import { useNotes } from '@/hooks/use-notes';
import { useMessages } from '@/hooks/use-messages';
import { useCorrespondence } from '@/hooks/use-correspondence';
import { useTasks } from '@/hooks/use-tasks';
import { useAuditLog } from '@/hooks/use-audit-log';
import { formatCurrency, formatPercent, formatDate, formatDateTime, formatPhone } from '@/lib/format';

export default function LoanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const loanId = params.id as string;
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [payoffModalOpen, setPayoffModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  // Fetch all data via hooks (server-side filtered by loanId)
  const { data: loan, isLoading: loanLoading, error: loanError } = useLoan(loanId);
  const { data: transactions = [], isLoading: transactionsLoading } = useTransactions(loanId);
  const { data: documents = [], isLoading: documentsLoading } = useDocuments(loanId);
  const { data: notes = [], isLoading: notesLoading } = useNotes(loanId);
  const { data: messages = [], isLoading: messagesLoading } = useMessages(loanId);
  const { data: correspondence = [], isLoading: correspondenceLoading } = useCorrespondence(loanId);
  const { data: tasks = [], isLoading: tasksLoading } = useTasks(loanId);
  const { data: auditLog = [], isLoading: auditLoading } = useAuditLog(loanId);

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
        <div className="flex items-center gap-2">
          <GenerateDocumentDropdown
            onSelectPayoff={() => setPayoffModalOpen(true)}
            onSelectHistory={() => setHistoryModalOpen(true)}
          />
          <Button onClick={() => setPaymentDialogOpen(true)}>
            <CreditCard className="mr-2 h-4 w-4" />
            Make Payment
          </Button>
        </div>
      </div>

      {/* Dialogs/Modals */}
      <PaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        loan={loan}
      />
      <EditLoanModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        loan={loan}
      />
      <PayoffModal
        open={payoffModalOpen}
        onOpenChange={setPayoffModalOpen}
        loan={loan}
      />
      <PaymentHistoryModal
        open={historyModalOpen}
        onOpenChange={setHistoryModalOpen}
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
        <div className="flex items-center justify-between border-b">
          <TabsList className="border-0">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="history">History ({transactions.length})</TabsTrigger>
            <TabsTrigger value="messages">Messages ({messages.length})</TabsTrigger>
            <TabsTrigger value="correspondence">Correspondence ({correspondence.length})</TabsTrigger>
            <TabsTrigger value="documents">Documents ({documents.length})</TabsTrigger>
            <TabsTrigger value="notes">Notes ({notes.length})</TabsTrigger>
            <TabsTrigger value="tasks">Tasks ({tasks.length})</TabsTrigger>
            <TabsTrigger value="actions-log">Actions Log ({auditLog.length})</TabsTrigger>
          </TabsList>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditModalOpen(true)}
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <Pencil className="w-4 h-4 mr-2" />
            Edit Loan
          </Button>
        </div>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
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

            {/* Escrow Information */}
            <EscrowInfoCard loan={loan} />

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

        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Secure Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className="rounded-lg border p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={msg.from === 'borrower' ? 'secondary' : 'default'}>
                          {msg.from === 'borrower' ? 'From Borrower' : 'From Servicer'}
                        </Badge>
                        {msg.status && (
                          <Badge variant="outline">{msg.status}</Badge>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">{formatDateTime(msg.date)}</span>
                    </div>
                    {msg.subject && (
                      <p className="font-medium mb-2">{msg.subject}</p>
                    )}
                    <p className="text-sm text-muted-foreground">{msg.content}</p>
                  </div>
                ))}
                {messages.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No messages</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="correspondence">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Correspondence Log</CardTitle>
              <p className="text-sm text-muted-foreground">
                Complete history of all contact with borrower (calls, emails, letters, SMS)
              </p>
            </CardHeader>
            <CardContent>
              <CorrespondenceList correspondence={correspondence} />
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
                loanId={loanId}
                isLoading={documentsLoading}
                showTimestamp={true}
                userRole="servicer"
                showArchived={true}
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
