// Re-export all types
export * from './loan';
export * from './transaction';
export * from './document';
export * from './message';
export * from './task';
export * from './correspondence';
export * from './modification';
export * from './note';
export * from './user';
export * from './notification';
export * from './audit-log';
export * from './payment-method';

// Common utility types
export type ViewMode = 'borrower' | 'servicer';

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  badge?: string;
  badgeVariant?: 'default' | 'destructive' | 'secondary';
  href?: string;
}
