import { PaymentMethod } from '@/types/payment-method';

export const mockPaymentMethods: PaymentMethod[] = [
  {
    id: 'pm_1',
    loan_id: 'loan_1',
    cardholder_name: 'James Anderson',
    card_last_four: '4242',
    card_brand: 'visa',
    expiry_month: '12',
    expiry_year: '2025',
    is_default: true,
    created_at: '2023-06-15T10:30:00Z',
    created_by: 'Admin User',
  },
  {
    id: 'pm_2',
    loan_id: 'loan_1',
    cardholder_name: 'James Anderson',
    card_last_four: '8888',
    card_brand: 'mastercard',
    expiry_month: '03',
    expiry_year: '2026',
    is_default: false,
    created_at: '2023-09-20T14:15:00Z',
    created_by: 'Admin User',
  },
  {
    id: 'pm_3',
    loan_id: 'loan_2',
    cardholder_name: 'Michael Chen',
    card_last_four: '1234',
    card_brand: 'amex',
    expiry_month: '08',
    expiry_year: '2024',
    is_default: true,
    created_at: '2023-04-10T09:00:00Z',
    created_by: 'Admin User',
  },
];

// Helper functions
export function getPaymentMethodsByLoanId(loanId: string): PaymentMethod[] {
  return mockPaymentMethods.filter((pm) => pm.loan_id === loanId);
}

export function getDefaultPaymentMethod(loanId: string): PaymentMethod | undefined {
  return mockPaymentMethods.find((pm) => pm.loan_id === loanId && pm.is_default);
}

export function getPaymentMethodById(id: string): PaymentMethod | undefined {
  return mockPaymentMethods.find((pm) => pm.id === id);
}

export function addPaymentMethod(paymentMethod: Omit<PaymentMethod, 'id'>): PaymentMethod {
  const newPaymentMethod: PaymentMethod = {
    ...paymentMethod,
    id: `pm_${Date.now()}`,
  };
  mockPaymentMethods.push(newPaymentMethod);
  return newPaymentMethod;
}

export function deletePaymentMethod(id: string): boolean {
  const index = mockPaymentMethods.findIndex((pm) => pm.id === id);
  if (index !== -1) {
    mockPaymentMethods.splice(index, 1);
    return true;
  }
  return false;
}

export function setDefaultPaymentMethod(loanId: string, paymentMethodId: string): void {
  mockPaymentMethods.forEach((pm) => {
    if (pm.loan_id === loanId) {
      pm.is_default = pm.id === paymentMethodId;
    }
  });
}
