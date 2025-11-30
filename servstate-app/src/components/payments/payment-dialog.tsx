'use client';

import { useState } from 'react';
import { DollarSign, CreditCard, CheckCircle } from 'lucide-react';
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
import { Separator } from '@/components/ui/separator';
import { CardInputForm } from './card-input-form';
import { SavedCardsSelect } from './saved-cards-select';
import { getPaymentMethodsByLoanId } from '@/data/payment-methods';
import { CardInputData } from '@/types/payment-method';
import { Loan } from '@/types/loan';
import { formatCurrency } from '@/lib/format';

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loan: Loan;
}

const emptyCardData: CardInputData = {
  cardholder_name: '',
  card_number: '',
  expiry_month: '',
  expiry_year: '',
  cvv: '',
  save_card: false,
};

export function PaymentDialog({ open, onOpenChange, loan }: PaymentDialogProps) {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string | null>(null);
  const [cardData, setCardData] = useState<CardInputData>(emptyCardData);
  const [amount, setAmount] = useState(
    (loan.monthly_pi + loan.monthly_escrow).toFixed(2)
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const savedPaymentMethods = getPaymentMethodsByLoanId(loan.id);
  const defaultMethod = savedPaymentMethods.find((pm) => pm.is_default);

  // Initialize with default payment method if available
  useState(() => {
    if (defaultMethod) {
      setSelectedPaymentMethodId(defaultMethod.id);
    }
  });

  const handleSubmit = async () => {
    setIsProcessing(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsProcessing(false);
    setStep('success');
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state after close animation
    setTimeout(() => {
      setStep('form');
      setSelectedPaymentMethodId(defaultMethod?.id || null);
      setCardData(emptyCardData);
      setAmount((loan.monthly_pi + loan.monthly_escrow).toFixed(2));
    }, 200);
  };

  const isFormValid = () => {
    if (selectedPaymentMethodId) return true;
    return (
      cardData.cardholder_name &&
      cardData.card_number.replace(/\s/g, '').length >= 15 &&
      cardData.expiry_month &&
      cardData.expiry_year &&
      cardData.cvv.length >= 3
    );
  };

  if (step === 'success') {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center text-center py-6">
            <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <DialogTitle className="text-xl mb-2">Payment Successful</DialogTitle>
            <DialogDescription className="text-base">
              A payment of {formatCurrency(parseFloat(amount))} has been processed
              for loan #{loan.loan_number}.
            </DialogDescription>
            <p className="text-sm text-muted-foreground mt-4">
              A confirmation email will be sent to {loan.email}.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Make Payment
          </DialogTitle>
          <DialogDescription>
            Process a payment for {loan.borrower_name} - Loan #{loan.loan_number}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Payment Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Payment Amount</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Monthly payment due: {formatCurrency(loan.monthly_pi + loan.monthly_escrow)}
            </p>
          </div>

          <Separator />

          {/* Payment Method Selection */}
          <div className="space-y-4">
            <Label>Payment Method</Label>

            {savedPaymentMethods.length > 0 && (
              <SavedCardsSelect
                paymentMethods={savedPaymentMethods}
                selectedId={selectedPaymentMethodId}
                onSelect={setSelectedPaymentMethodId}
              />
            )}

            {/* New Card Form - show if no saved cards or "new card" selected */}
            {(savedPaymentMethods.length === 0 || selectedPaymentMethodId === null) && (
              <CardInputForm
                value={cardData}
                onChange={setCardData}
                showSaveOption={true}
              />
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid() || isProcessing || !amount}
          >
            {isProcessing ? (
              <>
                <span className="animate-spin mr-2">
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                </span>
                Processing...
              </>
            ) : (
              <>Process {formatCurrency(parseFloat(amount || '0'))}</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
