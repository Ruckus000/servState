'use client';

import { CreditCard, Plus, Trash2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { PaymentMethod, CardBrand, maskCardNumber } from '@/types/payment-method';
import { cn } from '@/lib/utils';

interface SavedCardsSelectProps {
  paymentMethods: PaymentMethod[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

const cardBrandLabels: Record<CardBrand, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  amex: 'American Express',
  discover: 'Discover',
};

const cardBrandColors: Record<CardBrand, string> = {
  visa: 'bg-blue-100 text-blue-700',
  mastercard: 'bg-orange-100 text-orange-700',
  amex: 'bg-blue-100 text-blue-600',
  discover: 'bg-orange-100 text-orange-600',
};

export function SavedCardsSelect({
  paymentMethods,
  selectedId,
  onSelect,
  onDelete,
  className,
}: SavedCardsSelectProps) {
  if (paymentMethods.length === 0) {
    return (
      <div className={cn('text-sm text-muted-foreground', className)}>
        No saved payment methods
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      <Select
        value={selectedId || 'new'}
        onValueChange={(value) => onSelect(value === 'new' ? null : value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a payment method" />
        </SelectTrigger>
        <SelectContent>
          {paymentMethods.map((pm) => (
            <SelectItem key={pm.id} value={pm.id}>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'text-[10px] font-semibold px-1.5 py-0.5 rounded',
                    cardBrandColors[pm.card_brand]
                  )}
                >
                  {cardBrandLabels[pm.card_brand]}
                </span>
                <span className="font-mono text-sm">
                  {maskCardNumber(pm.card_last_four)}
                </span>
                {pm.is_default && (
                  <span className="text-xs text-muted-foreground">(Default)</span>
                )}
              </div>
            </SelectItem>
          ))}
          <SelectItem value="new">
            <div className="flex items-center gap-2 text-primary">
              <Plus className="h-4 w-4" />
              <span>Use a new card</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>

      {/* Show selected card details */}
      {selectedId && selectedId !== 'new' && (
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <div>
              {(() => {
                const pm = paymentMethods.find((p) => p.id === selectedId);
                if (!pm) return null;
                return (
                  <>
                    <p className="text-sm font-medium">{pm.cardholder_name}</p>
                    <p className="text-xs text-muted-foreground">
                      Expires {pm.expiry_month}/{pm.expiry_year.slice(-2)}
                    </p>
                  </>
                );
              })()}
            </div>
          </div>
          {onDelete && selectedId && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(selectedId)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
