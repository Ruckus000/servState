export type NoteType = 'Call' | 'Email' | 'General' | 'System' | 'Internal';

export interface Note {
  id: string;
  loan_id: string;
  author: string;
  date: string;
  content: string;
  type: NoteType;
}
