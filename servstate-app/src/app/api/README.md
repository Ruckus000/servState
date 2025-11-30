# API Routes - TODO

This directory contains placeholder API routes for future backend integration.

## Planned Implementation

### Authentication
- **Provider**: Supabase Auth
- **Features**:
  - Email/password authentication
  - Magic link authentication
  - OAuth (Google, etc.)
  - Session management

### Database
- **Provider**: Supabase (PostgreSQL)
- **Tables**:
  - `profiles` - User profiles linked to auth
  - `borrowers` - Borrower information
  - `loans` - Loan details
  - `transactions` - Payment history
  - `documents` - Document metadata
  - `messages` - Secure messaging
  - `tasks` - Servicer workflow
  - `correspondence` - Communication logs
  - `modifications` - Loan modifications
  - `notes` - Internal notes

### Payment Processing
- **Provider**: Stripe
- **Features**:
  - One-time payments
  - Recurring AutoPay
  - Payment confirmation
  - Refund processing

### File Storage
- **Provider**: Supabase Storage
- **Features**:
  - Document uploads
  - Statement generation
  - Secure file access

## Getting Started

1. Create a Supabase project at https://supabase.com
2. Copy `.env.example` to `.env.local`
3. Fill in your Supabase credentials
4. Run database migrations
5. Implement API routes

## Environment Variables Required

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
STRIPE_SECRET_KEY=your-stripe-secret
STRIPE_WEBHOOK_SECRET=your-webhook-secret
```
