import {
  Notification,
  NotificationRole,
  NotificationType,
} from '@/types/notification';

export const mockNotifications: Notification[] = [
  // Borrower notifications
  {
    id: 'notif_1',
    type: 'payment_due',
    title: 'Payment Due Soon',
    message:
      'Your mortgage payment of $2,762.24 is due on December 31, 2023. Make your payment to avoid late fees.',
    date: '2023-12-28T09:00:00Z',
    read: false,
    priority: 'high',
    link: '/borrower/payments',
    role: 'borrower',
    loan_id: 'loan_1',
  },
  {
    id: 'notif_2',
    type: 'payment_received',
    title: 'Payment Confirmed',
    message:
      'We received your payment of $2,762.24 on November 30, 2023. Thank you for your payment.',
    date: '2023-11-30T14:30:00Z',
    read: true,
    priority: 'low',
    link: '/borrower/payments',
    role: 'borrower',
    loan_id: 'loan_1',
  },
  {
    id: 'notif_3',
    type: 'message',
    title: 'New Message from Servicer',
    message:
      'You have a new message regarding your escrow account. Click to view the full message.',
    date: '2023-12-15T11:20:00Z',
    read: false,
    priority: 'medium',
    link: '/borrower/messages',
    role: 'borrower',
    loan_id: 'loan_1',
  },
  {
    id: 'notif_4',
    type: 'document',
    title: 'New Document Available',
    message:
      'Your 2023 Annual Escrow Statement is now available. Download it from your documents section.',
    date: '2023-12-10T08:00:00Z',
    read: true,
    priority: 'medium',
    link: '/borrower/documents',
    role: 'borrower',
    loan_id: 'loan_1',
  },
  {
    id: 'notif_5',
    type: 'escrow',
    title: 'Escrow Analysis Complete',
    message:
      'Your annual escrow analysis is complete. Your new monthly escrow payment will be $550.00 starting January 2024.',
    date: '2023-12-05T10:15:00Z',
    read: true,
    priority: 'medium',
    link: '/borrower/escrow',
    role: 'borrower',
    loan_id: 'loan_1',
  },
  {
    id: 'notif_6',
    type: 'system',
    title: 'Profile Updated',
    message: 'Your contact information has been successfully updated.',
    date: '2023-12-01T16:45:00Z',
    read: true,
    priority: 'low',
    role: 'borrower',
    loan_id: 'loan_1',
  },

  // Servicer notifications
  {
    id: 'notif_7',
    type: 'task',
    title: 'New Task Assigned',
    message:
      'Collections call scheduled for Michael Chen (Loan #10005679). Account is 45 days past due.',
    date: '2023-12-28T08:30:00Z',
    read: false,
    priority: 'high',
    link: '/servicer/loans/loan_2',
    role: 'servicer',
    loan_id: 'loan_2',
  },
  {
    id: 'notif_8',
    type: 'payment_received',
    title: 'Payment Received',
    message:
      'James Anderson made a payment of $2,762.24 on Loan #10005678. Payment processed successfully.',
    date: '2023-11-30T14:30:00Z',
    read: true,
    priority: 'medium',
    link: '/servicer/loans/loan_1',
    role: 'servicer',
    loan_id: 'loan_1',
  },
  {
    id: 'notif_9',
    type: 'document',
    title: 'Document Received',
    message:
      'Sarah Williams uploaded proof of insurance for Loan #10005680. Review required.',
    date: '2023-12-20T13:00:00Z',
    read: false,
    priority: 'medium',
    link: '/servicer/loans/loan_3',
    role: 'servicer',
    loan_id: 'loan_3',
  },
  {
    id: 'notif_10',
    type: 'delinquency',
    title: 'Delinquency Alert',
    message:
      'Loan #10005679 (Michael Chen) is now 45 days past due. Immediate action required.',
    date: '2023-12-27T07:00:00Z',
    read: false,
    priority: 'high',
    link: '/servicer/delinquency',
    role: 'servicer',
    loan_id: 'loan_2',
  },
  {
    id: 'notif_11',
    type: 'system',
    title: 'Loan Status Changed',
    message:
      'Loan #10005679 status changed from Active to Delinquent. Days past due: 45.',
    date: '2023-12-26T09:00:00Z',
    read: true,
    priority: 'medium',
    link: '/servicer/loans/loan_2',
    role: 'servicer',
    loan_id: 'loan_2',
  },
  {
    id: 'notif_12',
    type: 'task',
    title: 'Task Completed',
    message:
      'Document request task for Sarah Williams (Loan #10005680) has been marked as completed.',
    date: '2023-12-20T15:30:00Z',
    read: true,
    priority: 'low',
    link: '/servicer/tasks',
    role: 'servicer',
    loan_id: 'loan_3',
  },
  {
    id: 'notif_13',
    type: 'escrow',
    title: 'Escrow Disbursement Processed',
    message:
      'Property tax disbursement of $1,850.00 processed for Loan #10005678 (James Anderson).',
    date: '2023-12-15T10:00:00Z',
    read: true,
    priority: 'low',
    link: '/servicer/loans/loan_1',
    role: 'servicer',
    loan_id: 'loan_1',
  },
];

// Helper functions
export function getNotificationsByRole(role: NotificationRole): Notification[] {
  return mockNotifications.filter(
    (n) => n.role === role || n.role === 'both'
  );
}

export function getUnreadNotifications(role: NotificationRole): Notification[] {
  return getNotificationsByRole(role).filter((n) => !n.read);
}

export function getUnreadNotificationCount(role: NotificationRole): number {
  return getUnreadNotifications(role).length;
}

export function getNotificationsByType(
  role: NotificationRole,
  type: NotificationType
): Notification[] {
  return getNotificationsByRole(role).filter((n) => n.type === type);
}

export function getNotificationById(id: string): Notification | undefined {
  return mockNotifications.find((n) => n.id === id);
}

export function markAsRead(id: string): void {
  const notification = mockNotifications.find((n) => n.id === id);
  if (notification) {
    notification.read = true;
  }
}

export function markAllAsRead(role: NotificationRole): void {
  mockNotifications.forEach((n) => {
    if (n.role === role || n.role === 'both') {
      n.read = true;
    }
  });
}

// Format relative time
export function formatNotificationTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}
