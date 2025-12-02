export type DocumentType = 'Statement' | 'Disclosure' | 'Correspondence' | 'Tax' | 'Legal' | 'Insurance';

export interface Document {
  id: string;
  loan_id: string;
  name: string;
  date: string;
  type: DocumentType;
  size: string;
  storage_path: string | null;
  created_at?: string;
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
