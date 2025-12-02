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
  | 'insurance_claim'
  | 'general_task';

export type TaskPriority = 'high' | 'medium' | 'low';

export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export type TaskCategory =
  | 'Collections'
  | 'Loss Mitigation'
  | 'Escrow Management'
  | 'Reporting'
  | 'Property Management'
  | 'Insurance'
  | 'Customer Service'
  | 'Payment Processing'
  | 'Compliance'
  | 'General';

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

// Constants for form dropdowns
export const TASK_TYPES: { value: TaskType; label: string }[] = [
  { value: 'collections_call', label: 'Collections Call' },
  { value: 'document_request', label: 'Document Request' },
  { value: 'escrow_analysis', label: 'Escrow Analysis' },
  { value: 'statement_generation', label: 'Statement Generation' },
  { value: 'payment_plan', label: 'Payment Plan' },
  { value: 'property_inspection', label: 'Property Inspection' },
  { value: 'tax_payment', label: 'Tax Payment' },
  { value: 'insurance_verification', label: 'Insurance Verification' },
  { value: 'customer_inquiry', label: 'Customer Inquiry' },
  { value: 'autopay_setup', label: 'Autopay Setup' },
  { value: 'compliance_review', label: 'Compliance Review' },
  { value: 'insurance_claim', label: 'Insurance Claim' },
  { value: 'general_task', label: 'General Task' },
];

export const TASK_CATEGORIES: { value: TaskCategory; label: string }[] = [
  { value: 'Collections', label: 'Collections' },
  { value: 'Loss Mitigation', label: 'Loss Mitigation' },
  { value: 'Escrow Management', label: 'Escrow Management' },
  { value: 'Reporting', label: 'Reporting' },
  { value: 'Property Management', label: 'Property Management' },
  { value: 'Insurance', label: 'Insurance' },
  { value: 'Customer Service', label: 'Customer Service' },
  { value: 'Payment Processing', label: 'Payment Processing' },
  { value: 'Compliance', label: 'Compliance' },
  { value: 'General', label: 'General' },
];

export const TASK_PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

export const TASK_STATUSES: { value: TaskStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];
