import type { Document } from '@/types';

export const mockDocuments: Document[] = [
  {
    id: 'doc_1',
    loan_id: 'loan_1',
    name: 'Monthly Statement - Nov 2023',
    date: '2023-11-05',
    type: 'Statement',
    size: '245 KB',
  },
  {
    id: 'doc_2',
    loan_id: 'loan_1',
    name: 'Monthly Statement - Oct 2023',
    date: '2023-10-05',
    type: 'Statement',
    size: '242 KB',
  },
  {
    id: 'doc_3',
    loan_id: 'loan_1',
    name: 'Annual Escrow Disclosure',
    date: '2023-01-15',
    type: 'Disclosure',
    size: '1.2 MB',
  },
  {
    id: 'doc_4',
    loan_id: 'loan_1',
    name: 'Welcome Packet',
    date: '2022-06-20',
    type: 'Correspondence',
    size: '3.4 MB',
  },
  {
    id: 'doc_5',
    loan_id: 'loan_1',
    name: '1098 Tax Form - 2022',
    date: '2023-01-31',
    type: 'Tax',
    size: '89 KB',
  },
  {
    id: 'doc_6',
    loan_id: 'loan_2',
    name: 'Monthly Statement - Nov 2023',
    date: '2023-11-05',
    type: 'Statement',
    size: '238 KB',
  },
  {
    id: 'doc_7',
    loan_id: 'loan_2',
    name: 'Insurance Declaration Page',
    date: '2023-02-15',
    type: 'Insurance',
    size: '156 KB',
  },
  {
    id: 'doc_8',
    loan_id: 'loan_3',
    name: 'Payment Plan Agreement',
    date: '2023-11-22',
    type: 'Legal',
    size: '320 KB',
  },
  {
    id: 'doc_9',
    loan_id: 'loan_3',
    name: 'Delinquency Notice',
    date: '2023-11-16',
    type: 'Correspondence',
    size: '98 KB',
  },
  {
    id: 'doc_10',
    loan_id: 'loan_4',
    name: 'Monthly Statement - Nov 2023',
    date: '2023-11-05',
    type: 'Statement',
    size: '251 KB',
  },
  {
    id: 'doc_11',
    loan_id: 'loan_4',
    name: '1098 Tax Form - 2022',
    date: '2023-01-31',
    type: 'Tax',
    size: '91 KB',
  },
  {
    id: 'doc_12',
    loan_id: 'loan_5',
    name: 'Monthly Statement - Oct 2023',
    date: '2023-10-05',
    type: 'Statement',
    size: '234 KB',
  },
];

export const getDocumentsByLoanId = (loanId: string): Document[] => {
  return mockDocuments.filter((doc) => doc.loan_id === loanId);
};

export const getDocumentsByType = (type: Document['type']): Document[] => {
  return mockDocuments.filter((doc) => doc.type === type);
};
