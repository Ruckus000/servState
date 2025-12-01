import { z } from 'zod';

/**
 * Validation schemas for API requests
 */

export const loanUpdateSchema = z.object({
  status: z.enum(['Active', 'Delinquent', 'Forbearance', 'Paid Off', 'Default']).optional(),
  days_past_due: z.number().min(0).optional(),
  monthly_escrow: z.number().min(0).optional(),
  escrow_balance: z.number().optional(),
  next_due_date: z.string().optional(),
});

export const transactionCreateSchema = z.object({
  loan_id: z.string().uuid(),
  type: z.enum(['Payment', 'Escrow Disbursement', 'Late Fee', 'NSF Fee', 'Adjustment', 'Refund']),
  amount: z.number(),
  principal_amount: z.number().optional(),
  interest_amount: z.number().optional(),
  escrow_amount: z.number().optional(),
  description: z.string().optional(),
  reference_number: z.string().optional(),
});

export const messageCreateSchema = z.object({
  loan_id: z.string().uuid(),
  subject: z.string().min(1).max(255),
  content: z.string().min(1),
});

export const taskCreateSchema = z.object({
  loan_id: z.string().uuid(),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  priority: z.enum(['high', 'medium', 'low']),
  assigned_to: z.string().optional(),
  due_date: z.string().optional(),
});

export const taskUpdateSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'completed']).optional(),
  assigned_to: z.string().optional(),
  due_date: z.string().optional(),
});

export const noteCreateSchema = z.object({
  loan_id: z.string().uuid(),
  type: z.string().min(1).max(50),
  content: z.string().min(1),
});

export const notificationCreateSchema = z.object({
  loan_id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  type: z.string().min(1).max(50),
  title: z.string().min(1).max(255),
  message: z.string().min(1),
  priority: z.enum(['high', 'medium', 'low']),
  role: z.enum(['borrower', 'servicer', 'both']),
  link: z.string().optional(),
});

