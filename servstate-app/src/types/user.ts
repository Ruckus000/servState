export type UserRole = 'borrower' | 'servicer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  loan_id?: string; // For borrowers, the associated loan
}

// Mock user for development - will be replaced with Supabase auth
export const MOCK_BORROWER: User = {
  id: 'user_1',
  name: 'James Anderson',
  email: 'j.anderson@example.com',
  role: 'borrower',
  loan_id: 'loan_1',
};

export const MOCK_SERVICER: User = {
  id: 'user_admin',
  name: 'Admin User',
  email: 'admin@servstate.com',
  role: 'servicer',
};
