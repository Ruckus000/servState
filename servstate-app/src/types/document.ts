export type DocumentType = 'Statement' | 'Disclosure' | 'Correspondence' | 'Tax' | 'Legal' | 'Insurance';

export interface Document {
  id: string;
  loan_id: string;
  name: string;
  date: string;
  type: DocumentType;
  size: string;
  url?: string;
}
