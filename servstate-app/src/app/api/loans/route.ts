import { NextResponse } from 'next/server';

/**
 * TODO: Implement Loans API
 *
 * This will connect to Supabase to manage loan data.
 *
 * Endpoints to implement:
 * - GET /api/loans - List all loans (with pagination, filtering)
 * - GET /api/loans/:id - Get single loan details
 * - PUT /api/loans/:id - Update loan information
 *
 * Security:
 * - Implement Row Level Security in Supabase
 * - Borrowers can only access their own loans
 * - Servicers can access all loans in their portfolio
 */

export async function GET() {
  // TODO: Replace with Supabase query
  return NextResponse.json({
    message: 'Loans API - Not yet implemented',
    hint: 'See src/app/api/README.md for implementation guide',
  });
}

export async function POST() {
  return NextResponse.json(
    { error: 'Not implemented' },
    { status: 501 }
  );
}
