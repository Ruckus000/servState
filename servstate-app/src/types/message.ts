export type MessageFrom = 'borrower' | 'servicer';

export type MessageStatus = 'unread' | 'read' | 'resolved';

export interface Message {
  id: string;
  loan_id: string;
  from: MessageFrom;
  date: string;
  content: string;
  status: MessageStatus;
  subject?: string;
  attachments?: string[];
}
