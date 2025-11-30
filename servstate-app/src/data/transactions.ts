import type { Transaction } from '@/types';

export const mockTransactions: Transaction[] = [
  {
    id: 'tx_1',
    loan_id: 'loan_1',
    date: '2023-10-01',
    type: 'Payment',
    amount: 2762.24,
    breakdown: { principal: 400, interest: 1812.24, escrow: 550 },
    status: 'completed',
  },
  {
    id: 'tx_2',
    loan_id: 'loan_1',
    date: '2023-11-01',
    type: 'Payment',
    amount: 2762.24,
    breakdown: { principal: 402.15, interest: 1810.09, escrow: 550 },
    status: 'completed',
  },
  {
    id: 'tx_3',
    loan_id: 'loan_1',
    date: '2023-12-01',
    type: 'Payment',
    amount: 2762.24,
    breakdown: { principal: 404.32, interest: 1807.92, escrow: 550 },
    status: 'completed',
  },
  {
    id: 'tx_4',
    loan_id: 'loan_2',
    date: '2023-11-01',
    type: 'Payment',
    amount: 2063.12,
    breakdown: { principal: 320, interest: 1323.12, escrow: 420 },
    status: 'completed',
  },
  {
    id: 'tx_5',
    loan_id: 'loan_4',
    date: '2023-11-01',
    type: 'Payment',
    amount: 3921.45,
    breakdown: { principal: 580, interest: 2621.45, escrow: 720 },
    status: 'completed',
  },
  {
    id: 'tx_6',
    loan_id: 'loan_1',
    date: '2023-09-01',
    type: 'Payment',
    amount: 2762.24,
    breakdown: { principal: 397.88, interest: 1814.36, escrow: 550 },
    status: 'completed',
  },
  {
    id: 'tx_7',
    loan_id: 'loan_1',
    date: '2023-08-01',
    type: 'Payment',
    amount: 2762.24,
    breakdown: { principal: 395.78, interest: 1816.46, escrow: 550 },
    status: 'completed',
  },
  {
    id: 'tx_8',
    loan_id: 'loan_1',
    date: '2023-06-15',
    type: 'Escrow Disbursement',
    amount: -2400.0,
    status: 'completed',
    description: 'Property Tax Payment - First Installment',
  },
  {
    id: 'tx_9',
    loan_id: 'loan_2',
    date: '2023-10-01',
    type: 'Payment',
    amount: 2063.12,
    breakdown: { principal: 318.5, interest: 1324.62, escrow: 420 },
    status: 'completed',
  },
  {
    id: 'tx_10',
    loan_id: 'loan_4',
    date: '2023-10-01',
    type: 'Payment',
    amount: 3921.45,
    breakdown: { principal: 577.2, interest: 2624.25, escrow: 720 },
    status: 'completed',
  },
];

export const getTransactionsByLoanId = (loanId: string): Transaction[] => {
  return mockTransactions.filter((tx) => tx.loan_id === loanId);
};

export const getRecentTransactions = (limit: number = 5): Transaction[] => {
  return [...mockTransactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
};
