import type { Note } from '@/types';

export const mockNotes: Note[] = [
  {
    id: 'note_1',
    loan_id: 'loan_3',
    author: 'John Smith',
    date: '2023-11-15 14:30',
    content: 'Called borrower regarding missed payment. Left voicemail.',
    type: 'Call',
  },
  {
    id: 'note_2',
    loan_id: 'loan_3',
    author: 'John Smith',
    date: '2023-11-18 09:15',
    content:
      'Borrower returned call. Stated temporary job loss due to company restructuring. Discussing payment plan options.',
    type: 'Call',
  },
  {
    id: 'note_3',
    loan_id: 'loan_3',
    author: 'Sarah Lee',
    date: '2023-11-20 11:00',
    content: 'Sent forbearance application packet via email.',
    type: 'Email',
  },
  {
    id: 'note_4',
    loan_id: 'loan_3',
    author: 'John Smith',
    date: '2023-11-22 10:30',
    content: 'Payment plan agreement signed and returned. Plan effective 12/1/2023.',
    type: 'General',
  },
  {
    id: 'note_5',
    loan_id: 'loan_1',
    author: 'Customer Service',
    date: '2023-11-25 14:15',
    content: 'Responded to borrower inquiry about escrow statement timeline.',
    type: 'Email',
  },
  {
    id: 'note_6',
    loan_id: 'loan_2',
    author: 'Insurance Team',
    date: '2023-11-12 09:00',
    content: 'Sent insurance verification request letter. Policy expires 12/31/2023.',
    type: 'General',
  },
  {
    id: 'note_7',
    loan_id: 'loan_5',
    author: 'Collections Team',
    date: '2023-11-22 11:00',
    content: 'First delinquency notice sent via email and mail.',
    type: 'System',
  },
  {
    id: 'note_8',
    loan_id: 'loan_4',
    author: 'Payment Team',
    date: '2023-11-27 16:45',
    content: 'Received AutoPay enrollment request. Awaiting bank account verification.',
    type: 'General',
  },
];

export const getNotesByLoanId = (loanId: string): Note[] => {
  return mockNotes
    .filter((note) => note.loan_id === loanId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};
