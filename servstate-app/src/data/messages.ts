import type { Message } from '@/types';

export const mockMessages: Message[] = [
  {
    id: 'msg_1',
    loan_id: 'loan_1',
    from: 'borrower',
    date: '2023-11-25 10:30',
    content: 'When will I receive my annual escrow statement?',
    status: 'resolved',
  },
  {
    id: 'msg_2',
    loan_id: 'loan_1',
    from: 'servicer',
    date: '2023-11-25 14:15',
    content:
      'Your annual escrow analysis will be mailed by January 15th. You can also view it in your Documents section once available.',
    status: 'resolved',
  },
  {
    id: 'msg_3',
    loan_id: 'loan_1',
    from: 'borrower',
    date: '2023-11-28 09:00',
    content: 'Can I set up automatic payments for my mortgage?',
    status: 'unread',
  },
  {
    id: 'msg_4',
    loan_id: 'loan_2',
    from: 'servicer',
    date: '2023-11-20 11:30',
    content: 'Your hazard insurance policy is expiring on December 31st. Please provide updated insurance documentation.',
    status: 'read',
  },
  {
    id: 'msg_5',
    loan_id: 'loan_2',
    from: 'borrower',
    date: '2023-11-22 14:00',
    content: 'I have renewed my insurance policy. Where should I upload the new declaration page?',
    status: 'read',
  },
  {
    id: 'msg_6',
    loan_id: 'loan_3',
    from: 'servicer',
    date: '2023-11-18 09:30',
    content:
      'We received your call regarding the missed payment. Please review the payment plan options we discussed and let us know how you would like to proceed.',
    status: 'read',
  },
  {
    id: 'msg_7',
    loan_id: 'loan_4',
    from: 'borrower',
    date: '2023-11-27 16:20',
    content: 'I would like to enroll in automatic payments. Please send me the enrollment form.',
    status: 'unread',
  },
];

export const getMessagesByLoanId = (loanId: string): Message[] => {
  return mockMessages.filter((msg) => msg.loan_id === loanId);
};

export const getUnreadMessages = (): Message[] => {
  return mockMessages.filter((msg) => msg.status === 'unread');
};

export const getUnreadCount = (loanId?: string): number => {
  const messages = loanId ? getMessagesByLoanId(loanId) : mockMessages;
  return messages.filter((msg) => msg.status === 'unread').length;
};
