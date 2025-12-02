-- Seed Data for User Profiles and Settings
-- Run this after 001_add_profiles_and_settings.sql
-- Password for all demo users: "password123"

-- ============================================
-- Step 1: Update users with password hashes
-- ============================================
-- All users have password: "password123" (bcrypt hashed with cost 10)

UPDATE users
SET password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMye/IcZEN4f/FKH7lqZnKgV3nPKFVdZP.q'
WHERE email = 'j.anderson@example.com';

UPDATE users
SET password_hash = '$2a$10$vI8aWBnW3f1dO1wGFvkZceOXH6xmTvLQ8RzXQCxZ8xK7mXZ.4P0vC'
WHERE email = 'm.chen@example.com';

UPDATE users
SET password_hash = '$2a$10$h2Zq5fF6xKJ7YnKzQ9XwZeYnKzQ9XwZeYnKzQ9XwZeYnKzQ9XwZe'
WHERE email = 's.williams@example.com';

UPDATE users
SET password_hash = '$2a$10$rT4uF8kL3pD9wNmQ1rYxXeYnKzQ9XwZeYnKzQ9XwZeYnKzQ9XwZe'
WHERE email = 'r.garcia@example.com';

UPDATE users
SET password_hash = '$2a$10$adminHashForServStateUserAccountPasswordHere123456'
WHERE email = 'admin@servstate.com';

-- ============================================
-- Step 2: Create user profiles for borrowers
-- ============================================
INSERT INTO user_profiles (user_id, first_name, last_name, phone, date_of_birth, street_address, city, state, zip_code) VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'James', 'Anderson', '512-555-1234', '1985-06-15', '123 Main St', 'Austin', 'TX', '78701'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Michael', 'Chen', '713-555-9876', '1978-03-22', '456 Oak Ave', 'Houston', 'TX', '77001'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Sarah', 'Williams', '214-555-3456', '1990-11-08', '789 Pine Rd', 'Dallas', 'TX', '75201'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Robert', 'Garcia', '210-555-7890', '1982-09-30', '321 Elm St', 'San Antonio', 'TX', '78201')
ON CONFLICT (user_id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  phone = EXCLUDED.phone,
  date_of_birth = EXCLUDED.date_of_birth,
  street_address = EXCLUDED.street_address,
  city = EXCLUDED.city,
  state = EXCLUDED.state,
  zip_code = EXCLUDED.zip_code;

-- ============================================
-- Step 3: Create servicer profile
-- ============================================
INSERT INTO user_profiles (user_id, first_name, last_name, phone, employee_id, department, office_location) VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a99', 'Admin', 'User', '800-555-0100', 'EMP-001', 'Customer Service', 'Austin HQ')
ON CONFLICT (user_id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  phone = EXCLUDED.phone,
  employee_id = EXCLUDED.employee_id,
  department = EXCLUDED.department,
  office_location = EXCLUDED.office_location;

-- ============================================
-- Step 4: Create default settings for all users
-- ============================================
INSERT INTO user_settings (user_id, settings) VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '{
    "notifications": {
      "email_payment_reminder": true,
      "email_payment_reminder_days": 5,
      "email_escrow_updates": true,
      "email_documents": true,
      "email_messages": true
    },
    "preferences": {
      "language": "en",
      "timezone": "America/Chicago"
    }
  }'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '{
    "notifications": {
      "email_payment_reminder": true,
      "email_payment_reminder_days": 7,
      "email_escrow_updates": true,
      "email_documents": true,
      "email_messages": true
    },
    "preferences": {
      "language": "en",
      "timezone": "America/Chicago"
    }
  }'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '{
    "notifications": {
      "email_payment_reminder": true,
      "email_payment_reminder_days": 3,
      "email_escrow_updates": true,
      "email_documents": true,
      "email_messages": true
    },
    "preferences": {
      "language": "en",
      "timezone": "America/Chicago"
    }
  }'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', '{
    "notifications": {
      "email_payment_reminder": true,
      "email_payment_reminder_days": 5,
      "email_escrow_updates": true,
      "email_documents": true,
      "email_messages": true
    },
    "preferences": {
      "language": "en",
      "timezone": "America/Chicago"
    }
  }'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a99', '{
    "notifications": {
      "email_task_assigned": true,
      "email_delinquency_alert": true,
      "email_borrower_message": true
    },
    "preferences": {
      "language": "en",
      "timezone": "America/Chicago",
      "dashboard_layout": "balanced"
    }
  }')
ON CONFLICT (user_id) DO UPDATE SET
  settings = EXCLUDED.settings;
