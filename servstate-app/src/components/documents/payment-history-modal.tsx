'use client';

import { useState } from 'react';
import { History, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api-client';
import type { Loan } from '@/types/loan';

interface PaymentHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loan: Loan;
}

function formatDateForInput(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getStartOfYear(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), 0, 1);
}

function getDateMonthsAgo(months: number): Date {
  const now = new Date();
  now.setMonth(now.getMonth() - months);
  return now;
}

export function PaymentHistoryModal({ open, onOpenChange, loan }: PaymentHistoryModalProps) {
  const today = formatDateForInput(new Date());
  const [fromDate, setFromDate] = useState(formatDateForInput(getStartOfYear()));
  const [toDate, setToDate] = useState(today);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleQuickSelect = (preset: 'ytd' | 'last12' | 'all') => {
    const now = new Date();

    switch (preset) {
      case 'ytd':
        setFromDate(formatDateForInput(getStartOfYear()));
        setToDate(formatDateForInput(now));
        break;
      case 'last12':
        setFromDate(formatDateForInput(getDateMonthsAgo(12)));
        setToDate(formatDateForInput(now));
        break;
      case 'all':
        // Use loan origination date as the start
        setFromDate(loan.origination_date.split('T')[0]);
        setToDate(formatDateForInput(now));
        break;
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      // Use centralized API client with CSRF token handling
      const blob = await api.postBlob(`/api/loans/${loan.id}/documents/history`, { fromDate, toDate });

      // Download the PDF
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payment-history-${loan.loan_number}-${fromDate}-to-${toDate}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Payment history generated successfully');
      onOpenChange(false);
    } catch (error) {
      console.error('Error generating payment history:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate payment history');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    setFromDate(formatDateForInput(getStartOfYear()));
    setToDate(today);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-purple-600" />
            Generate Payment History
          </DialogTitle>
          <DialogDescription>
            Generate a payment history report for {loan.borrower_name} - Loan #{loan.loan_number}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Quick Select Buttons */}
          <div className="space-y-2">
            <Label>Quick Select</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickSelect('ytd')}
                className="flex-1"
              >
                Year to Date
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickSelect('last12')}
                className="flex-1"
              >
                Last 12 Months
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickSelect('all')}
                className="flex-1"
              >
                All Time
              </Button>
            </div>
          </div>

          {/* Date Range Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="from_date">From Date</Label>
              <Input
                id="from_date"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                max={toDate}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="to_date">To Date</Label>
              <Input
                id="to_date"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                min={fromDate}
                max={today}
              />
            </div>
          </div>

          <div className="rounded-lg bg-purple-50 border border-purple-200 p-4">
            <div className="text-sm text-purple-800">
              The report will include all payments, fees, and adjustments within the selected date range.
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose} disabled={isGenerating}>
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={isGenerating || !fromDate || !toDate}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate PDF'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
