import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { sql } from '@/lib/db';
import { errorResponse, successResponse } from '@/lib/api-helpers';
import { normalizeLoan } from '@/lib/normalize';

/**
 * GET /api/loans
 * List loans with role-based filtering
 * - Borrowers see only their loan
 * - Servicers see all loans
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const { user } = session;

    let loans;
    
    if (user.role === 'borrower') {
      // Borrowers can only see their own loan
      if (status) {
        loans = await sql`
          SELECT * FROM loans 
          WHERE borrower_id = ${user.id} AND status = ${status}
          ORDER BY created_at DESC
        `;
      } else {
        loans = await sql`
          SELECT * FROM loans 
          WHERE borrower_id = ${user.id}
          ORDER BY created_at DESC
        `;
      }
    } else {
      // Servicers and admins see all loans
      if (status) {
        loans = await sql`
          SELECT * FROM loans 
          WHERE status = ${status}
          ORDER BY created_at DESC
        `;
      } else {
        loans = await sql`
          SELECT * FROM loans 
          ORDER BY created_at DESC
        `;
      }
    }

    // Normalize numeric fields (PostgreSQL NUMERIC comes as strings)
    const normalizedLoans = loans.map(loan => normalizeLoan(loan as Record<string, unknown>));
    return successResponse(normalizedLoans);
  } catch (error) {
    console.error('Error fetching loans:', error);
    return errorResponse('Failed to fetch loans', 500);
  }
}
