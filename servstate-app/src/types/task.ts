export type TaskType =
  | 'collections_call'
  | 'document_request'
  | 'escrow_analysis'
  | 'statement_generation'
  | 'payment_plan'
  | 'property_inspection'
  | 'tax_payment'
  | 'insurance_verification'
  | 'customer_inquiry'
  | 'autopay_setup'
  | 'compliance_review'
  | 'insurance_claim';

export type TaskPriority = 'high' | 'medium' | 'low';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export type TaskCategory =
  | 'Collections'
  | 'Loss Mitigation'
  | 'Escrow Management'
  | 'Reporting'
  | 'Property Management'
  | 'Insurance'
  | 'Customer Service'
  | 'Payment Processing'
  | 'Compliance';

export interface Task {
  id: string;
  loan_id: string;
  borrower_name: string;
  loan_number: string;
  type: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  assigned_to: string;
  created_date: string;
  due_date: string;
  completed_date?: string;
  title: string;
  description: string;
  category: TaskCategory;
}
