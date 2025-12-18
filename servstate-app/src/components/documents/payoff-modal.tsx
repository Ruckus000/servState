'use client';

import { useState, useRef, useEffect } from 'react';
import { FileText, Loader2, Download, Save } from 'lucide-react';
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
import { formatCurrency } from '@/lib/format';
import { api } from '@/lib/api-client';
import { useSavePayoffDocument } from '@/hooks/use-document-save';
import type { Loan } from '@/types/loan';

interface PayoffModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loan: Loan;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDateForInput(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function PayoffModal({ open, onOpenChange, loan }: PayoffModalProps) {
  const defaultGoodThroughDate = formatDateForInput(addDays(new Date(), 30));
  const [goodThroughDate, setGoodThroughDate] = useState(defaultGoodThroughDate);
  const [isGenerating, setIsGenerating] = useState(false);
  const blobUrlRef = useRef<string | null>(null);

  // Hook for saving document
  const saveDocument = useSavePayoffDocument(loan.id);

  // Clean up blob URL on unmount
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
    };
  }, []);

  const handleDownload = async () => {
    setIsGenerating(true);

    try {
      // Use centralized API client with CSRF token handling
      const blob = await api.postBlob(`/api/loans/${loan.id}/documents/payoff`, { goodThroughDate });

      // Store blob URL for potential re-download
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
      const url = URL.createObjectURL(blob);
      blobUrlRef.current = url;

      // Download the PDF
      const a = document.createElement('a');
      a.href = url;
      a.download = `payoff-${loan.loan_number}-${goodThroughDate}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      toast.success('Payoff statement downloaded');
    } catch (error) {
      console.error('Error generating payoff statement:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate payoff statement');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    try {
      const result = await saveDocument.mutateAsync({ goodThroughDate });

      if (result.isExisting) {
        toast.info('Document already saved (within 5-minute window)');
      } else {
        toast.success('Payoff statement saved to Documents', {
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
      console.error('Error saving payoff statement:', error);
      const message = error instanceof Error ? error.message : 'Failed to save payoff statement';

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
    setGoodThroughDate(defaultGoodThroughDate);
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
            <FileText className="h-5 w-5 text-blue-600" />
            Generate Payoff Statement
          </DialogTitle>
          <DialogDescription>
            Generate a payoff statement for {loan.borrower_name} - Loan #{loan.loan_number}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="rounded-lg bg-gray-50 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Current Principal Balance</span>
              <span className="font-medium">{formatCurrency(loan.current_principal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Interest Rate</span>
              <span className="font-medium">{(loan.interest_rate * 100).toFixed(3)}%</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="good_through_date">Good Through Date</Label>
            <Input
              id="good_through_date"
              type="date"
              value={goodThroughDate}
              onChange={(e) => setGoodThroughDate(e.target.value)}
              min={formatDateForInput(new Date())}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              The payoff amount will be calculated through this date, including per diem interest.
            </p>
          </div>

          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
            <div className="text-sm text-blue-800">
              <strong>Note:</strong> This is an estimated payoff amount. The actual payoff amount may vary based on the payment posting date and any additional fees.
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
            disabled={isLoading}
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
          <Button onClick={handleDownload} disabled={isLoading}>
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
