'use client';

import { useState, useRef, useEffect } from 'react';
import { History, Loader2, Download, Save } from 'lucide-react';
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
import { useSavePaymentHistoryDocument } from '@/hooks/use-document-save';
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
  const blobUrlRef = useRef<string | null>(null);

  // Hook for saving document
  const saveDocument = useSavePaymentHistoryDocument(loan.id);

  // Clean up blob URL on unmount
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
    };
  }, []);

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

  const handleDownload = async () => {
    setIsGenerating(true);

    try {
      // Use centralized API client with CSRF token handling
      const blob = await api.postBlob(`/api/loans/${loan.id}/documents/history`, { fromDate, toDate });

      // Store blob URL for potential re-download
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
      const url = URL.createObjectURL(blob);
      blobUrlRef.current = url;

      // Download the PDF
      const a = document.createElement('a');
      a.href = url;
      a.download = `payment-history-${loan.loan_number}-${fromDate}-to-${toDate}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      toast.success('Payment history downloaded');
    } catch (error) {
      console.error('Error generating payment history:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate payment history');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    try {
      const result = await saveDocument.mutateAsync({ fromDate, toDate });

      if (result.isExisting) {
        toast.info('Document already saved (within 5-minute window)');
      } else {
        toast.success('Payment history saved to Documents', {
          action: {
            label: 'View',
            onClick: () => {
              // Close modal - documents list will be refreshed by query invalidation
              onOpenChange(false);
            },
          },
        });
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving payment history:', error);
      const message = error instanceof Error ? error.message : 'Failed to save payment history';

      // Check for rate limit error
      if (message.includes('Rate limit')) {
        toast.error(message);
      } else {
        toast.error(message, {
          action: {
            label: 'Download Instead',
            onClick: handleDownload,
          },
        });
      }
    }
  };

  const handleClose = () => {
    setFromDate(formatDateForInput(getStartOfYear()));
    setToDate(today);
    // Clean up blob URL
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    onOpenChange(false);
  };

  const isLoading = isGenerating || saveDocument.isPending;

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
                disabled={isLoading}
              >
                Year to Date
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickSelect('last12')}
                className="flex-1"
                disabled={isLoading}
              >
                Last 12 Months
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickSelect('all')}
                className="flex-1"
                disabled={isLoading}
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
                disabled={isLoading}
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
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="rounded-lg bg-purple-50 border border-purple-200 p-4">
            <div className="text-sm text-purple-800">
              The report will include all payments, fees, and adjustments within the selected date range.
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="secondary"
            onClick={handleSave}
            disabled={isLoading || !fromDate || !toDate}
          >
            {saveDocument.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save to Documents
              </>
            )}
          </Button>
          <Button onClick={handleDownload} disabled={isLoading || !fromDate || !toDate}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
