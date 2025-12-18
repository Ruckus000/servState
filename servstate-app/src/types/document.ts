export type DocumentType = 'Statement' | 'Disclosure' | 'Correspondence' | 'Tax' | 'Legal' | 'Insurance';

export type DocumentStatus = 'pending' | 'uploaded' | 'upload_failed';

/**
 * Generation parameters for different document types
 */
export interface PayoffGenerationParams {
  type: 'payoff';
  goodThroughDate: string; // YYYY-MM-DD
  loanId: string;
}

export interface PaymentHistoryGenerationParams {
  type: 'payment_history';
  fromDate: string; // YYYY-MM-DD
  toDate: string; // YYYY-MM-DD
  loanId: string;
}

export type DocumentGenerationParams = PayoffGenerationParams | PaymentHistoryGenerationParams;

export interface Document {
  id: string;
  loan_id: string;
  name: string;
  date: string;
  type: DocumentType;
  size: string;
  storage_path: string | null;
  created_at?: string;
  // New fields for document save feature
  deleted_at?: string | null;
  status?: DocumentStatus;
  idempotency_key?: string | null;
  generated_by?: string | null;
  generation_params?: DocumentGenerationParams | null;
  retention_until?: string | null;
}

// API response types
export interface DocumentUploadResponse {
  document: Document;
  uploadUrl: string;
  expiresIn: number;
}

export interface DocumentDownloadResponse {
  downloadUrl: string;
  expiresIn: number;
  filename: string;
}

// Document save request/response types
export interface DocumentSaveRequest {
  regenerate?: boolean;
}

export interface PayoffSaveRequest extends DocumentSaveRequest {
  goodThroughDate: string; // YYYY-MM-DD
}

export interface PaymentHistorySaveRequest extends DocumentSaveRequest {
  fromDate: string; // YYYY-MM-DD
  toDate: string; // YYYY-MM-DD
}

export interface DocumentSaveResponse {
  document: Document;
  isExisting: boolean; // True if returned due to idempotency
}

export interface DocumentVisibilityRequest {
  visible: boolean; // false = soft delete, true = restore
}
