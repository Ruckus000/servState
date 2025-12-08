'use client';

import { useState } from 'react';
import { FileText, Loader2 } from 'lucide-react';
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
import { formatCurrency, formatDate } from '@/lib/format';
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

  const handleGenerate = async () => {
    setIsGenerating(true);

    // TODO: Implement actual PDF generation
    // This would call an API endpoint to generate the payoff statement
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsGenerating(false);
    // For now, just show a message that generation is not yet implemented
    alert('PDF generation not yet implemented. Good through date: ' + goodThroughDate);
    onOpenChange(false);
  };

  const handleClose = () => {
    setGoodThroughDate(defaultGoodThroughDate);
    onOpenChange(false);
  };

  // Calculate estimated payoff amount (simplified calculation)
  const estimatedPayoff = loan.current_principal; // In reality, would include accrued interest, fees, etc.

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

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose} disabled={isGenerating}>
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={isGenerating}>
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
