import type { Document } from '@/types';

export const mockDocuments: Document[] = [
  {
    id: 'doc_1',
    loan_id: 'loan_1',
    name: 'Monthly Statement - Nov 2023',
    date: '2023-11-05',
    type: 'Statement',
    size: '245 KB',
    storage_path: 'documents/loan_1/statement-nov-2023.pdf',
  },
  {
    id: 'doc_2',
    loan_id: 'loan_1',
    name: 'Monthly Statement - Oct 2023',
    date: '2023-10-05',
    type: 'Statement',
    size: '242 KB',
    storage_path: 'documents/loan_1/statement-oct-2023.pdf',
  },
  {
    id: 'doc_3',
    loan_id: 'loan_1',
    name: 'Annual Escrow Disclosure',
    date: '2023-01-15',
    type: 'Disclosure',
    size: '1.2 MB',
    storage_path: 'documents/loan_1/escrow-disclosure-2023.pdf',
  },
  {
    id: 'doc_4',
    loan_id: 'loan_1',
    name: 'Welcome Packet',
    date: '2022-06-20',
    type: 'Correspondence',
    size: '3.4 MB',
    storage_path: 'documents/loan_1/welcome-packet.pdf',
  },
  {
    id: 'doc_5',
    loan_id: 'loan_1',
    name: '1098 Tax Form - 2022',
    date: '2023-01-31',
    type: 'Tax',
    size: '89 KB',
    storage_path: 'documents/loan_1/1098-tax-2022.pdf',
  },
  {
    id: 'doc_6',
    loan_id: 'loan_2',
    name: 'Monthly Statement - Nov 2023',
    date: '2023-11-05',
    type: 'Statement',
    size: '238 KB',
    storage_path: 'documents/loan_2/statement-nov-2023.pdf',
  },
  {
    id: 'doc_7',
    loan_id: 'loan_2',
    name: 'Insurance Declaration Page',
    date: '2023-02-15',
    type: 'Insurance',
    size: '156 KB',
    storage_path: 'documents/loan_2/insurance-declaration.pdf',
  },
  {
    id: 'doc_8',
    loan_id: 'loan_3',
    name: 'Payment Plan Agreement',
    date: '2023-11-22',
    type: 'Legal',
    size: '320 KB',
    storage_path: 'documents/loan_3/payment-plan-agreement.pdf',
  },
  {
    id: 'doc_9',
    loan_id: 'loan_3',
    name: 'Delinquency Notice',
    date: '2023-11-16',
    type: 'Correspondence',
    size: '98 KB',
    storage_path: 'documents/loan_3/delinquency-notice.pdf',
  },
  {
    id: 'doc_10',
    loan_id: 'loan_4',
    name: 'Monthly Statement - Nov 2023',
    date: '2023-11-05',
    type: 'Statement',
    size: '251 KB',
    storage_path: 'documents/loan_4/statement-nov-2023.pdf',
  },
  {
    id: 'doc_11',
    loan_id: 'loan_4',
    name: '1098 Tax Form - 2022',
    date: '2023-01-31',
    type: 'Tax',
    size: '91 KB',
    storage_path: 'documents/loan_4/1098-tax-2022.pdf',
  },
  {
    id: 'doc_12',
    loan_id: 'loan_5',
    name: 'Monthly Statement - Oct 2023',
    date: '2023-10-05',
    type: 'Statement',
    size: '234 KB',
    storage_path: 'documents/loan_5/statement-oct-2023.pdf',
  },
];

export const getDocumentsByLoanId = (loanId: string): Document[] => {
  return mockDocuments.filter((doc) => doc.loan_id === loanId);
};

export const getDocumentsByType = (type: Document['type']): Document[] => {
  return mockDocuments.filter((doc) => doc.type === type);
};
