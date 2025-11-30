export type CorrespondenceType = 'email' | 'letter' | 'sms' | 'call';

export type CorrespondenceDirection = 'inbound' | 'outbound';

export type CallOutcome = 'voicemail' | 'discussed' | 'connected' | 'no_answer' | 'busy' | 'disconnected';

export interface EmailDeliveryStatus {
  sent?: string;
  delivered?: string;
  opened?: string;
  clicks?: number;
}

export interface LetterDeliveryStatus {
  generated?: string;
  mailed?: string;
  delivered?: string | null;
  expected_delivery?: string;
}

export interface SmsDeliveryStatus {
  sent?: string;
  delivered?: string;
}

export interface BaseCorrespondence {
  id: string;
  loan_id: string;
  type: CorrespondenceType;
  direction: CorrespondenceDirection;
  date: string;
  status?: string;
  sent_by?: string;
}

export interface EmailCorrespondence extends BaseCorrespondence {
  type: 'email';
  subject: string;
  from: string;
  to: string;
  body: string;
  delivery_status?: EmailDeliveryStatus;
  template?: string;
  attachments?: string[];
  response_id?: string;
  in_reply_to?: string;
}

export interface LetterCorrespondence extends BaseCorrespondence {
  type: 'letter';
  subject: string;
  to_address: string;
  delivery_status?: LetterDeliveryStatus;
  template?: string;
  tracking_number?: string;
}

export interface SmsCorrespondence extends BaseCorrespondence {
  type: 'sms';
  message: string;
  to: string;
  delivery_status?: SmsDeliveryStatus;
  campaign?: string;
}

export interface CallCorrespondence extends BaseCorrespondence {
  type: 'call';
  duration: number;
  outcome: CallOutcome;
  notes: string;
  agent: string;
  phone_number: string;
  recording_url?: string;
}

export type Correspondence = EmailCorrespondence | LetterCorrespondence | SmsCorrespondence | CallCorrespondence;
