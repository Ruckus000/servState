-- ServState Seed Data
-- Run this after schema.sql to populate with sample data

-- ============================================
-- Sample Users
-- ============================================
INSERT INTO users (id, email, name, role) VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'j.anderson@example.com', 'James Anderson', 'borrower'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'm.chen@example.com', 'Michael Chen', 'borrower'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 's.williams@example.com', 'Sarah Williams', 'borrower'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'r.garcia@example.com', 'Robert Garcia', 'borrower'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a99', 'admin@servstate.com', 'Admin User', 'servicer')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Sample Loans
-- ============================================
INSERT INTO loans (id, borrower_id, loan_number, borrower_name, address, email, phone, loan_type, original_principal, current_principal, interest_rate, monthly_pi, monthly_escrow, escrow_balance, next_due_date, status, days_past_due, origination_date, term_months, payments_made) VALUES
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '10005678', 'James Anderson', '123 Main St, Austin, TX 78701', 'j.anderson@example.com', '5125551234', 'Conventional', 450000.00, 423567.89, 0.0675, 2762.24, 550.00, 3245.67, '2023-12-31', 'Active', 0, '2021-03-15', 360, 33),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '10005679', 'Michael Chen', '456 Oak Ave, Houston, TX 77001', 'm.chen@example.com', '7135559876', 'FHA', 320000.00, 312456.78, 0.0599, 1987.34, 475.00, 2156.89, '2023-11-15', 'Delinquent', 45, '2022-06-01', 360, 18),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '10005680', 'Sarah Williams', '789 Pine Rd, Dallas, TX 75201', 's.williams@example.com', '2145553456', 'VA', 380000.00, 365234.56, 0.0525, 2089.12, 425.00, 2890.45, '2024-01-01', 'Active', 0, '2022-01-10', 360, 24),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', '10005681', 'Robert Garcia', '321 Elm St, San Antonio, TX 78201', 'r.garcia@example.com', '2105557890', 'Conventional', 275000.00, 268901.23, 0.0725, 1834.56, 380.00, 1567.34, '2023-12-15', 'Forbearance', 0, '2023-02-20', 360, 10)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Sample Transactions for Loan 1
-- ============================================
INSERT INTO transactions (loan_id, date, type, amount, principal_amount, interest_amount, escrow_amount, status, reference_number) VALUES
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2023-11-30', 'Payment', 3312.24, 825.67, 2486.57, 550.00, 'completed', 'PMT-2023-11-001'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2023-10-30', 'Payment', 3312.24, 821.34, 2490.90, 550.00, 'completed', 'PMT-2023-10-001'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2023-10-15', 'Escrow Disbursement', -1850.00, NULL, NULL, NULL, 'completed', 'ESC-2023-10-001'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2023-09-30', 'Payment', 3312.24, 816.89, 2495.35, 550.00, 'completed', 'PMT-2023-09-001')
ON CONFLICT DO NOTHING;

-- ============================================
-- Sample Documents
-- ============================================
INSERT INTO documents (loan_id, name, type, date, size) VALUES
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'November 2023 Statement', 'Statement', '2023-11-01', '245 KB'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'October 2023 Statement', 'Statement', '2023-10-01', '242 KB'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2023 Annual Escrow Statement', 'Escrow', '2023-09-15', '189 KB'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Original Promissory Note', 'Legal', '2021-03-15', '1.2 MB')
ON CONFLICT DO NOTHING;

-- ============================================
-- Sample Messages
-- ============================================
INSERT INTO messages (loan_id, sender, subject, content, read, date) VALUES
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'servicer', 'Welcome to ServState', 'Thank you for choosing ServState for your mortgage servicing needs. We are here to help you with any questions about your loan.', true, '2021-03-15'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'servicer', 'Annual Escrow Analysis Complete', 'Your annual escrow analysis has been completed. Please review your new monthly escrow payment amount in your account dashboard.', false, '2023-09-20'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'borrower', 'Question about escrow', 'I noticed my escrow payment increased. Can you explain why?', true, '2023-09-22')
ON CONFLICT DO NOTHING;

-- ============================================
-- Sample Notes
-- ============================================
INSERT INTO notes (loan_id, author, type, content, date) VALUES
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Admin User', 'General', 'Borrower called to confirm payment was received. Confirmed payment posted on 11/30.', '2023-12-01'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Admin User', 'Collections', 'Left voicemail regarding past due amount. Will follow up in 3 days.', '2023-12-15'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Admin User', 'Collections', 'Spoke with borrower. They are aware of delinquency and expect to make payment by end of month.', '2023-12-18')
ON CONFLICT DO NOTHING;

-- ============================================
-- Sample Tasks
-- ============================================
INSERT INTO tasks (loan_id, title, description, priority, status, assigned_to, due_date) VALUES
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Follow up on delinquent account', 'Contact borrower regarding 45 days past due status', 'high', 'pending', 'Admin User', '2023-12-30'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Review forbearance request', 'Evaluate forbearance extension request from borrower', 'medium', 'in_progress', 'Admin User', '2024-01-05'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Annual review', 'Complete annual loan review and update documentation', 'low', 'pending', 'Admin User', '2024-03-15')
ON CONFLICT DO NOTHING;

-- ============================================
-- Sample Audit Log Entries
-- ============================================
INSERT INTO audit_log (loan_id, action_type, category, description, performed_by, performed_at, details) VALUES
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'payment_received', 'payment', 'Monthly payment received and applied', 'System', '2023-11-30 14:30:00', '{"amount": 3312.24, "method": "ACH"}'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'escrow_disbursement', 'escrow', 'Property tax disbursement processed', 'System', '2023-10-15 10:00:00', '{"amount": 1850.00, "payee": "Travis County Tax Office"}'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'status_changed', 'lifecycle', 'Loan status changed from Active to Delinquent', 'System', '2023-12-16 09:00:00', '{"previous_status": "Active", "new_status": "Delinquent", "days_past_due": 45}'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'call_outbound', 'communication', 'Collections call - left voicemail', 'Admin User', '2023-12-15 11:30:00', '{"duration": 45, "outcome": "Voicemail"}')
ON CONFLICT DO NOTHING;
