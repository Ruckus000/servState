import type { UserRole } from './user';

/**
 * Database row types - mirror the actual database schema from schema.sql + migrations
 * These represent what comes back from SQL queries
 *
 * IMPORTANT: These are database rows, not application types.
 * Application types in src/types/ may include computed/joined fields.
 */

export interface UserRow {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string | null;
  password_hash?: string; // Added by migration 001
  created_at?: Date | string;
  updated_at?: Date | string;
}

export interface PasswordResetTokenRow {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date | string;
  used: boolean;
  created_at?: Date | string;
}

// Documents table schema (from schema.sql lines 82-91)
export interface DocumentRow {
  id: string;
  loan_id: string;
  name: string; // NOT "title" - schema uses "name"
  type: string; // NOT "category" - schema uses "type"
  date: Date | string;
  size?: string | null;
  storage_path?: string | null; // NOT "file_path"
  created_at?: Date | string;
}

// Messages table schema (from schema.sql lines 96-104)
export interface MessageRow {
  id: string;
  loan_id: string;
  sender: string; // 'borrower' | 'servicer' - NOT user_id
  subject: string;
  content: string; // NOT "message"
  read: boolean; // NOT "is_read"
  date: Date | string; // NOT "created_at"
}

// Tasks table schema (from schema.sql lines 121-132)
export interface TaskRow {
  id: string;
  loan_id: string;
  title: string;
  description?: string | null;
  priority: string; // 'high' | 'medium' | 'low'
  status: string; // 'pending' | 'in_progress' | 'completed'
  assigned_to?: string | null;
  due_date?: Date | string | null;
  created_at?: Date | string;
  updated_at?: Date | string;
  // NOTE: borrower_name and loan_number are NOT in the table
  // They come from JOINs with the loans table
}

// Transactions table schema (from schema.sql lines 48-61)
export interface TransactionRow {
  id: string;
  loan_id: string;
  date: Date | string; // NOT "transaction_date"
  type: string;
  amount: number | string; // NUMERIC(12, 2)
  principal_amount?: number | string | null;
  interest_amount?: number | string | null;
  escrow_amount?: number | string | null;
  status?: string; // 'completed' | 'pending' | 'failed' | 'reversed'
  description?: string | null;
  reference_number?: string | null;
  created_at?: Date | string;
}
