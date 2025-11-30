# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ServState** is a mortgage servicing web application prototype. The application is currently a single-page HTML prototype using React (via CDN), Tailwind CSS, and Lucide icons. It demonstrates a dual-interface mortgage servicing platform with both borrower and servicer views.

The project is based on a detailed architectural planning document that outlines a production-ready Next.js + Supabase stack, but the current implementation is a static HTML prototype for rapid UI/UX validation.

## Current Architecture

### Technology Stack (Prototype)
- **Frontend Framework**: React 18 (loaded via UMD bundle from unpkg.com)
- **Build Tool**: Babel Standalone (in-browser JSX transformation)
- **Styling**: Tailwind CSS (via CDN)
- **Icons**: Lucide icons
- **Fonts**: Plus Jakarta Sans (Google Fonts)

### File Structure
- `mortgage_prototype.html` - Complete single-page application containing all components, state management, and mock data
- `Mortgage App Prototype Planning.txt` - Comprehensive architectural blueprint and technical specification

### Application Structure

The application is structured as a single React component tree with two main modes:

1. **Borrower View** - Customer-facing interface
   - Dashboard (loan summary, payment status, account overview)
   - Payments (payment history, make payment functionality)
   - Documents (statements, disclosures, notices)
   - Escrow (escrow account details and history)
   - Messages (secure messaging with servicer)

2. **Servicer View** - Administrative back-office
   - Dashboard (portfolio metrics, recent activity)
   - Loans (searchable/filterable loan portfolio)
   - Delinquency Management (overdue loan tracking)
   - Tasks & Reports (placeholders)

### Key Components

The HTML file defines reusable UI components following a component library pattern:
- `Button`, `Card`, `Input`, `Badge` - Basic UI primitives
- `DataTable` - Sortable data table with row click handling
- `StatCard` - Metric display cards with trend indicators
- `Sheet`, `Modal` - Overlay/drawer components
- `Tabs`, `Separator`, `Avatar`, `Progress` - Layout and presentation components
- Charts: `PaymentBreakdownChart`, `AmortizationChart`, `PortfolioChart`

### Mock Data

All data is currently hard-coded mock data defined at the component level:
- Loan portfolio (4 sample loans)
- Transactions (payment history)
- Documents (statements and disclosures)
- Messages (servicer communications)
- Notes (admin loan notes)

## Development Workflow

### Running the Application

Simply open `mortgage_prototype.html` in a modern web browser. No build process or development server required.

```bash
# Open in default browser (macOS)
open mortgage_prototype.html

# Or start a simple HTTP server if CORS issues arise
python3 -m http.server 8000
# Then navigate to http://localhost:8000/mortgage_prototype.html
```

### Making Changes

Since this is a single HTML file with embedded React:

1. **Styling changes**: Modify Tailwind classes directly in JSX
2. **Component changes**: Edit the component functions in the `<script type="text/babel">` block
3. **Mock data changes**: Update the mock data objects defined in the main `App` component
4. **New components**: Add new component functions following the existing pattern

### Testing

Manually test by:
- Toggling between Borrower/Servicer modes using the switch in the header
- Navigating through different views via the sidebar
- Testing interactions (payment modal, loan detail sheets, data table sorting)
- Verifying responsive behavior at different screen sizes

## Production Architecture (Planned)

The planning document outlines the intended production stack:

- **Backend**: Supabase (PostgreSQL database, Auth, Storage, Edge Functions)
- **Frontend**: Next.js (React framework)
- **Deployment**: Vercel (frontend) + Supabase (backend)
- **Payment Processing**: Stripe (sandbox mode for prototype)
- **UI Components**: MUI or Flowbite

### Database Schema (Planned)

Core tables defined in the planning document:
- `profiles` - Links auth users to borrowers/admins
- `borrowers` - Borrower personal information
- `loans` - Loan details (principal, rate, term, status)
- `amortization_schedule` - Pre-calculated payment schedule
- `transactions` - Payment and fee ledger
- `escrow_accounts` - Tax/insurance escrow tracking
- `documents` - Loan document metadata and storage paths

## Migration Path

To convert this prototype to the production stack:

1. **Initialize Next.js project**: `npx create-next-app@latest`
2. **Set up Supabase**: Create project, implement schema from planning doc
3. **Extract components**: Convert inline components to separate `.tsx` files
4. **Replace mock data**: Integrate Supabase client and queries
5. **Implement authentication**: Use Supabase Auth with `@supabase/auth-helpers-nextjs`
6. **Add payment processing**: Integrate Stripe checkout
7. **Configure Row Level Security**: Protect data access at database level
8. **Deploy**: Connect to Vercel, configure environment variables

## Key Design Patterns

### Relational Data Model
The application is built around a strict relational data model appropriate for financial applications:
- One borrower → One loan
- One loan → Many transactions
- One loan → One escrow account
- One loan → Many documents

### Component Composition
UI is built from composable primitives (Button, Card, Input) assembled into feature components (BorrowerDashboard, ServicerLoans).

### Mock Data Strategy
All mock data includes realistic financial values (loan amounts, interest rates, payment dates) to validate calculations and UI formatting.

### State Management
Currently using React's `useState` hook for local state. Production version should use Supabase real-time subscriptions for data updates.

## Important Considerations

### Security
- The prototype has NO authentication or authorization - it's a static UI demo
- Production implementation MUST use Supabase Row Level Security (RLS) policies
- Never expose admin functionality to borrower role
- Validate all payment amounts server-side (via Supabase Edge Functions)

### Financial Accuracy
- Amortization calculations should use the `mortgage-js` package (per planning doc)
- All currency values use `NUMERIC(12, 2)` precision in database
- Payment processing must be idempotent to prevent duplicate charges

### Compliance
- Production system must maintain immutable transaction ledger
- Document all calculation methods for audit purposes
- Implement proper logging for all financial transactions
