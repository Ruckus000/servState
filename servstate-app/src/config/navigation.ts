import type { NavItem } from '@/types';

export const borrowerNavItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', href: '/borrower' },
  { id: 'payments', label: 'Payments', icon: 'CreditCard', href: '/borrower/payments' },
  { id: 'documents', label: 'Documents', icon: 'FileText', href: '/borrower/documents', badge: '3' },
  { id: 'escrow', label: 'Escrow', icon: 'PiggyBank', href: '/borrower/escrow' },
  {
    id: 'messages',
    label: 'Messages',
    icon: 'MessageCircle',
    href: '/borrower/messages',
    badge: '1',
    badgeVariant: 'destructive',
  },
  { id: 'notifications', label: 'Notifications', icon: 'Bell', href: '/borrower/notifications' },
];

export const servicerNavItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', href: '/servicer' },
  { id: 'loans', label: 'Loans', icon: 'Folder', href: '/servicer/loans' },
  {
    id: 'delinquency',
    label: 'Delinquency',
    icon: 'AlertTriangle',
    href: '/servicer/delinquency',
    badge: '2',
    badgeVariant: 'destructive',
  },
  {
    id: 'tasks',
    label: 'Tasks',
    icon: 'CheckSquare',
    href: '/servicer/tasks',
    // Badge will be dynamically set based on pending tasks count
  },
  { id: 'reports', label: 'Reports', icon: 'BarChart2', href: '/servicer/reports' },
  { id: 'notifications', label: 'Notifications', icon: 'Bell', href: '/servicer/notifications' },
];

export const getNavItems = (viewMode: 'borrower' | 'servicer'): NavItem[] => {
  return viewMode === 'borrower' ? borrowerNavItems : servicerNavItems;
};
