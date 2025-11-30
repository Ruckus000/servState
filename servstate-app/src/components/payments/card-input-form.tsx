'use client';

import { useState, useEffect } from 'react';
import { CreditCard } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  CardBrand,
  CardInputData,
  detectCardBrand,
  formatCardNumber,
} from '@/types/payment-method';
import { cn } from '@/lib/utils';

interface CardInputFormProps {
  value: CardInputData;
  onChange: (data: CardInputData) => void;
  showSaveOption?: boolean;
  className?: string;
}

const cardBrandLogos: Record<CardBrand, string> = {
  visa: 'Visa',
  mastercard: 'MC',
  amex: 'Amex',
  discover: 'Disc',
};

const cardBrandColors: Record<CardBrand, string> = {
  visa: 'text-blue-600',
  mastercard: 'text-orange-500',
  amex: 'text-blue-500',
  discover: 'text-orange-600',
};

export function CardInputForm({
  value,
  onChange,
  showSaveOption = true,
  className,
}: CardInputFormProps) {
  const [cardBrand, setCardBrand] = useState<CardBrand | null>(null);

  useEffect(() => {
    const brand = detectCardBrand(value.card_number);
    setCardBrand(brand);
  }, [value.card_number]);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    // Limit to 19 characters (16 digits + 3 spaces)
    if (formatted.length <= 19) {
      onChange({ ...value, card_number: formatted });
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/\D/g, '');

    if (input.length >= 2) {
      const month = input.substring(0, 2);
      const year = input.substring(2, 4);
      onChange({
        ...value,
        expiry_month: month,
        expiry_year: year ? `20${year}` : '',
      });
    } else {
      onChange({ ...value, expiry_month: input, expiry_year: '' });
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\D/g, '');
    // Amex has 4-digit CVV, others have 3
    const maxLength = cardBrand === 'amex' ? 4 : 3;
    if (input.length <= maxLength) {
      onChange({ ...value, cvv: input });
    }
  };

  const expiryDisplay =
    value.expiry_month && value.expiry_year
      ? `${value.expiry_month}/${value.expiry_year.slice(-2)}`
      : value.expiry_month || '';

  return (
    <div className={cn('space-y-4', className)}>
      {/* Cardholder Name */}
      <div className="space-y-2">
        <Label htmlFor="cardholder_name">Cardholder Name</Label>
        <Input
          id="cardholder_name"
          placeholder="Name on card"
          value={value.cardholder_name}
          onChange={(e) =>
            onChange({ ...value, cardholder_name: e.target.value })
          }
        />
      </div>

      {/* Card Number */}
      <div className="space-y-2">
        <Label htmlFor="card_number">Card Number</Label>
        <div className="relative">
          <Input
            id="card_number"
            placeholder="1234 5678 9012 3456"
            value={value.card_number}
            onChange={handleCardNumberChange}
            className="pr-16"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {cardBrand ? (
              <span
                className={cn(
                  'text-xs font-bold px-1.5 py-0.5 rounded',
                  cardBrandColors[cardBrand]
                )}
              >
                {cardBrandLogos[cardBrand]}
              </span>
            ) : (
              <CreditCard className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </div>
      </div>

      {/* Expiry and CVV */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="expiry">Expiry Date</Label>
          <Input
            id="expiry"
            placeholder="MM/YY"
            value={expiryDisplay}
            onChange={handleExpiryChange}
            maxLength={5}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cvv">CVV</Label>
          <Input
            id="cvv"
            placeholder={cardBrand === 'amex' ? '1234' : '123'}
            value={value.cvv}
            onChange={handleCvvChange}
            type="password"
            maxLength={cardBrand === 'amex' ? 4 : 3}
          />
        </div>
      </div>

      {/* Save Card Option */}
      {showSaveOption && (
        <div className="flex items-center space-x-2 pt-2">
          <Checkbox
            id="save_card"
            checked={value.save_card}
            onCheckedChange={(checked) =>
              onChange({ ...value, save_card: checked === true })
            }
          />
          <Label
            htmlFor="save_card"
            className="text-sm font-normal cursor-pointer"
          >
            Save this card for future payments
          </Label>
        </div>
      )}
    </div>
  );
}
