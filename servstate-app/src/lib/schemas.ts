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
  status: z.enum(['pending', 'in_progress', 'completed']).default('pending'),
  assigned_to: z.string().optional(),
  due_date: z.string().optional(),
  type: z.enum([
    'collections_call',
    'document_request',
    'escrow_analysis',
    'statement_generation',
    'payment_plan',
    'property_inspection',
    'tax_payment',
    'insurance_verification',
    'customer_inquiry',
    'autopay_setup',
    'compliance_review',
    'insurance_claim',
    'general_task',
  ]),
  category: z.enum([
    'Collections',
    'Loss Mitigation',
    'Escrow Management',
    'Reporting',
    'Property Management',
    'Insurance',
    'Customer Service',
    'Payment Processing',
    'Compliance',
    'General',
  ]),
});

export const taskUpdateSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  priority: z.enum(['high', 'medium', 'low']).optional(),
  status: z.enum(['pending', 'in_progress', 'completed']).optional(),
  assigned_to: z.string().optional(),
  due_date: z.string().optional(),
  type: z.enum([
    'collections_call',
    'document_request',
    'escrow_analysis',
    'statement_generation',
    'payment_plan',
    'property_inspection',
    'tax_payment',
    'insurance_verification',
    'customer_inquiry',
    'autopay_setup',
    'compliance_review',
    'insurance_claim',
    'general_task',
  ]).optional(),
  category: z.enum([
    'Collections',
    'Loss Mitigation',
    'Escrow Management',
    'Reporting',
    'Property Management',
    'Insurance',
    'Customer Service',
    'Payment Processing',
    'Compliance',
    'General',
  ]).optional(),
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

export const documentUploadSchema = z.object({
  loan_id: z.string().uuid(),
  name: z.string().min(1).max(255),
  type: z.enum(['Statement', 'Disclosure', 'Correspondence', 'Tax', 'Legal', 'Insurance']),
  size: z.number().positive().max(100 * 1024 * 1024), // 100MB max in bytes
  contentType: z.string().min(1),
});

export const correspondenceCreateSchema = z.object({
  loan_id: z.string().uuid(),
  type: z.enum(['call', 'email', 'letter', 'sms']),
  direction: z.enum(['inbound', 'outbound']),
  date: z.string(), // ISO date string
  subject: z.string().max(255).optional(),
  outcome: z.string().max(255).optional(),
  duration: z.number().int().min(0).optional(), // seconds for calls
  notes: z.string().optional(),
});




