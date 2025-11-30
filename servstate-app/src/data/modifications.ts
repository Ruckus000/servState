import type { Modification } from '@/types';

export const mockModifications: Modification[] = [
  {
    id: 'mod_1',
    loan_id: 'loan_3',
    type: 'payment_plan',
    status: 'active',
    created_by: 'John Smith',
    created_date: '2023-11-22',
    effective_date: '2023-12-01',
    details: {
      reason: 'Temporary hardship - job loss',
      planType: 'Repayment Plan',
      duration: 6,
      monthlyAmount: 4484.15,
      totalArrearage: 7468.3,
      catchUpAmount: 750.0,
    },
  },
  {
    id: 'mod_2',
    loan_id: 'loan_1',
    type: 'contact_update',
    status: 'completed',
    created_by: 'Admin User',
    created_date: '2023-10-15',
    effective_date: '2023-10-15',
    details: {
      field: 'email',
      oldValue: 'j.anderson@oldmail.com',
      newValue: 'j.anderson@example.com',
      verified: true,
    },
  },
  {
    id: 'mod_3',
    loan_id: 'loan_4',
    type: 'autopay_setup',
    status: 'pending',
    created_by: 'Payment Team',
    created_date: '2023-11-27',
    effective_date: '2024-01-01',
    details: {
      bankName: 'First National Bank',
      accountType: 'Checking',
      paymentDay: 1,
      amount: 2981.2,
    },
  },
  {
    id: 'mod_4',
    loan_id: 'loan_2',
    type: 'contact_update',
    status: 'completed',
    created_by: 'Customer Service',
    created_date: '2023-09-20',
    effective_date: '2023-09-20',
    details: {
      field: 'phone',
      oldValue: '(555) 765-0000',
      newValue: '(555) 765-4321',
      verified: true,
    },
  },
  {
    id: 'mod_5',
    loan_id: 'loan_5',
    type: 'forbearance',
    status: 'pending',
    created_by: 'John Smith',
    created_date: '2023-11-26',
    effective_date: '2024-01-01',
    details: {
      reason: 'Financial hardship - medical expenses',
      duration: 3,
      monthlyReduction: 500,
      startDate: '2024-01-01',
      endDate: '2024-03-31',
    },
  },
];

export const getModificationsByLoanId = (loanId: string): Modification[] => {
  return mockModifications
    .filter((mod) => mod.loan_id === loanId)
    .sort((a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime());
};

export const getActiveModifications = (): Modification[] => {
  return mockModifications.filter((mod) => mod.status === 'active');
};

export const getPendingModifications = (): Modification[] => {
  return mockModifications.filter((mod) => mod.status === 'pending');
};
