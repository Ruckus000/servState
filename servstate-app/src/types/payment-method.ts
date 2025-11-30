export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'discover';

export interface PaymentMethod {
  id: string;
  loan_id: string;
  cardholder_name: string;
  card_last_four: string;
  card_brand: CardBrand;
  expiry_month: string;
  expiry_year: string;
  is_default: boolean;
  created_at: string;
  created_by: string; // servicer who added it
}

export interface CardInputData {
  cardholder_name: string;
  card_number: string;
  expiry_month: string;
  expiry_year: string;
  cvv: string;
  save_card: boolean;
}

// Helper to detect card brand from card number
export function detectCardBrand(cardNumber: string): CardBrand | null {
  const cleaned = cardNumber.replace(/\s/g, '');

  if (/^4/.test(cleaned)) return 'visa';
  if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) return 'mastercard';
  if (/^3[47]/.test(cleaned)) return 'amex';
  if (/^6(?:011|5)/.test(cleaned)) return 'discover';

  return null;
}

// Format card number with spaces
export function formatCardNumber(value: string): string {
  const cleaned = value.replace(/\D/g, '');
  const groups = cleaned.match(/.{1,4}/g);
  return groups ? groups.join(' ') : cleaned;
}

// Mask card number for display
export function maskCardNumber(lastFour: string): string {
  return `•••• •••• •••• ${lastFour}`;
}
