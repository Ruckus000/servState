import type { Correspondence } from '@/types';

export const mockCorrespondence: Correspondence[] = [
  {
    id: 'corr_1',
    loan_id: 'loan_3',
    type: 'email',
    direction: 'outbound',
    subject: 'Missed Payment Notification',
    from: 'servicing@servstate.com',
    to: 'bob.vance@example.com',
    date: '2023-11-16 10:30:00',
    body: 'Dear Mr. Vance,\n\nWe have not yet received your mortgage payment that was due on November 1st, 2023. Your account is now 15 days past due.\n\nCurrent Amount Due: $3,734.15\nLate Fee: $75.00\nTotal Amount Due: $3,809.15\n\nPlease contact us immediately at 1-800-555-0199 to discuss payment options.\n\nSincerely,\nServState Servicing',
    status: 'opened',
    delivery_status: {
      sent: '2023-11-16 10:30:15',
      delivered: '2023-11-16 10:30:45',
      opened: '2023-11-16 14:22:10',
      clicks: 1,
    },
    sent_by: 'John Smith',
    attachments: [],
  },
  {
    id: 'corr_2',
    loan_id: 'loan_3',
    type: 'letter',
    direction: 'outbound',
    subject: 'Payment Plan Agreement',
    to_address: '789 Pine Street, Capital City, IL 62701',
    date: '2023-11-20 15:00:00',
    status: 'mailed',
    delivery_status: {
      generated: '2023-11-20 15:00:00',
      mailed: '2023-11-21 09:00:00',
      delivered: null,
      expected_delivery: '2023-11-27',
    },
    sent_by: 'John Smith',
    tracking_number: 'USPS-9405511206123456789',
  },
  {
    id: 'corr_3',
    loan_id: 'loan_3',
    type: 'sms',
    direction: 'outbound',
    message: 'ServState Reminder: Your mortgage payment is past due. Please call us at 1-800-555-0199.',
    to: '(555) 555-0199',
    date: '2023-11-18 09:00:00',
    status: 'delivered',
    delivery_status: {
      sent: '2023-11-18 09:00:02',
      delivered: '2023-11-18 09:00:05',
    },
    sent_by: 'System',
  },
  {
    id: 'corr_4',
    loan_id: 'loan_3',
    type: 'call',
    direction: 'outbound',
    date: '2023-11-15 14:30:00',
    duration: 0,
    outcome: 'voicemail',
    notes: 'Left voicemail requesting callback regarding missed payment.',
    agent: 'John Smith',
    phone_number: '(555) 555-0199',
  },
  {
    id: 'corr_5',
    loan_id: 'loan_3',
    type: 'call',
    direction: 'inbound',
    date: '2023-11-18 09:15:00',
    duration: 420,
    outcome: 'discussed',
    notes:
      'Borrower returned call. Stated temporary job loss due to company restructuring. Expressed willingness to catch up once new employment secured. Discussed forbearance and payment plan options. Borrower opted for payment plan.',
    agent: 'John Smith',
    phone_number: '(555) 555-0199',
    recording_url: 'internal://recordings/call_5',
  },
  {
    id: 'corr_6',
    loan_id: 'loan_1',
    type: 'email',
    direction: 'inbound',
    subject: 'Question about escrow statement',
    from: 'j.anderson@example.com',
    to: 'servicing@servstate.com',
    date: '2023-11-25 10:30:00',
    body: 'When will I receive my annual escrow analysis statement?',
    status: 'responded',
  },
  {
    id: 'corr_7',
    loan_id: 'loan_1',
    type: 'email',
    direction: 'outbound',
    subject: 'Re: Question about escrow statement',
    from: 'servicing@servstate.com',
    to: 'j.anderson@example.com',
    date: '2023-11-25 14:15:00',
    body: "Dear Mr. Anderson,\n\nThank you for contacting ServState. Your annual escrow analysis will be mailed by January 15th, 2024. You can also view it in your online account Documents section once it becomes available.\n\nIf you have any other questions, please don't hesitate to contact us.\n\nBest regards,\nCustomer Service Team",
    status: 'opened',
    delivery_status: {
      sent: '2023-11-25 14:15:05',
      delivered: '2023-11-25 14:15:20',
      opened: '2023-11-25 16:45:00',
    },
    sent_by: 'Admin User',
    attachments: [],
  },
  {
    id: 'corr_8',
    loan_id: 'loan_2',
    type: 'email',
    direction: 'outbound',
    subject: 'Payment Confirmation',
    from: 'servicing@servstate.com',
    to: 's.jenkins@example.com',
    date: '2023-11-01 12:00:00',
    body: 'Dear Ms. Jenkins,\n\nThis confirms receipt of your payment of $2,186.45 on November 1st, 2023.\n\nPayment Breakdown:\nPrincipal & Interest: $1,636.45\nEscrow: $550.00\n\nYour next payment of $2,186.45 is due December 1st, 2023.\n\nThank you,\nServState Servicing',
    status: 'opened',
    delivery_status: {
      sent: '2023-11-01 12:00:10',
      delivered: '2023-11-01 12:00:35',
      opened: '2023-11-01 14:20:00',
    },
    sent_by: 'System',
    attachments: [],
  },
  {
    id: 'corr_9',
    loan_id: 'loan_5',
    type: 'email',
    direction: 'outbound',
    subject: 'Delinquency Notice - Action Required',
    from: 'servicing@servstate.com',
    to: 'david.kim@example.com',
    date: '2023-11-22 09:00:00',
    body: 'Dear Mr. Kim,\n\nYour mortgage payment due on November 1st, 2023 has not been received. Your account is now 21 days past due.\n\nAmount Due: $3,584.70\nLate Fee: $50.00\nTotal: $3,634.70\n\nPlease submit payment immediately to avoid additional late fees and potential credit bureau reporting.\n\nIf you are experiencing financial hardship, please contact us to discuss assistance options.\n\nServState Servicing\n1-800-555-0199',
    status: 'delivered',
    delivery_status: {
      sent: '2023-11-22 09:00:05',
      delivered: '2023-11-22 09:00:28',
    },
    sent_by: 'Collections Team',
    attachments: [],
  },
  {
    id: 'corr_10',
    loan_id: 'loan_2',
    type: 'letter',
    direction: 'outbound',
    subject: 'Insurance Verification Request',
    to_address: '456 Oak Lane, Shelbyville, IL 62565',
    date: '2023-11-12 10:00:00',
    status: 'delivered',
    delivery_status: {
      generated: '2023-11-12 10:00:00',
      mailed: '2023-11-13 08:00:00',
      delivered: '2023-11-17 14:30:00',
    },
    sent_by: 'Insurance Team',
    tracking_number: 'USPS-9405511206987654321',
  },
  {
    id: 'corr_11',
    loan_id: 'loan_1',
    type: 'call',
    direction: 'outbound',
    date: '2023-11-20 10:15:00',
    duration: 180,
    outcome: 'connected',
    notes: 'Courtesy call regarding upcoming property tax disbursement. Confirmed borrower awareness.',
    agent: 'Customer Service',
    phone_number: '(555) 123-4567',
  },
  {
    id: 'corr_12',
    loan_id: 'loan_4',
    type: 'email',
    direction: 'inbound',
    subject: 'AutoPay Enrollment',
    from: 'm.garcia@example.com',
    to: 'servicing@servstate.com',
    date: '2023-11-27 16:20:00',
    body: 'I would like to enroll in automatic payments. Please send me the enrollment form.',
    status: 'responded',
  },
];

export const getCorrespondenceByLoanId = (loanId: string): Correspondence[] => {
  return mockCorrespondence
    .filter((c) => c.loan_id === loanId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getCorrespondenceByType = (type: Correspondence['type']): Correspondence[] => {
  return mockCorrespondence.filter((c) => c.type === type);
};

/**
 * Get the most recent contact date for a loan (any correspondence)
 */
export function getLastContactDate(loanId: string): Date | null {
  const correspondence = getCorrespondenceByLoanId(loanId);
  if (correspondence.length === 0) return null;
  // Already sorted by date desc, so first item is most recent
  return new Date(correspondence[0].date);
}

export type OutreachStatus = 'no_contact' | 'voicemail' | 'spoke' | 'has_plan';

/**
 * Determine outreach status based on correspondence and modifications
 * Priority: has_plan > spoke > voicemail > no_contact
 */
export function getOutreachStatus(loanId: string): OutreachStatus {
  // Import here to avoid circular dependency - check modifications for payment plan
  // Note: This is a simplified check. In production, this would be a proper data join.
  const { mockModifications } = require('./modifications');

  // Check if loan has active/pending payment plan or forbearance
  const hasPaymentPlan = mockModifications.some(
    (mod: { loan_id: string; type: string; status: string }) =>
      mod.loan_id === loanId &&
      (mod.type === 'payment_plan' || mod.type === 'forbearance') &&
      (mod.status === 'active' || mod.status === 'pending')
  );

  if (hasPaymentPlan) return 'has_plan';

  // Check correspondence for call outcomes
  const correspondence = getCorrespondenceByLoanId(loanId);

  // Look for calls where we spoke with the borrower
  const spokeWithBorrower = correspondence.some(
    (c) =>
      c.type === 'call' &&
      (c.outcome === 'discussed' || c.outcome === 'connected')
  );

  if (spokeWithBorrower) return 'spoke';

  // Look for voicemail left
  const leftVoicemail = correspondence.some(
    (c) => c.type === 'call' && c.outcome === 'voicemail'
  );

  if (leftVoicemail) return 'voicemail';

  // Check if there's been any outreach at all
  const hasAnyContact = correspondence.length > 0;

  // If we sent emails/letters but no calls, still consider it "no_contact" for prioritization
  // Since the filter is about whether we've actually reached the borrower
  return hasAnyContact ? 'voicemail' : 'no_contact';
}
