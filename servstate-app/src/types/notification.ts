export type NotificationType =
  | 'payment_due'
  | 'payment_received'
  | 'message'
  | 'document'
  | 'system'
  | 'task'
  | 'escrow'
  | 'delinquency';

export type NotificationPriority = 'high' | 'medium' | 'low';

export type NotificationRole = 'borrower' | 'servicer' | 'both';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  date: string;
  read: boolean;
  priority: NotificationPriority;
  link?: string;
  role: NotificationRole;
  loan_id?: string;
}
