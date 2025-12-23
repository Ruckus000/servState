import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { sql, query } from '@/lib/db';
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
    const search = searchParams.get('search');

    const { user } = session;

    let loans;

    if (user.role === 'borrower') {
      // Borrowers can only see their own loan
      // Build WHERE clause dynamically with parameterized values
      const params: unknown[] = [user.id];
      let whereClause = 'borrower_id = $1';
      let paramIndex = 2;

      if (status) {
        whereClause += ` AND status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }

      if (search) {
        const searchPattern = `%${search}%`;
        whereClause += ` AND (loan_number ILIKE $${paramIndex} OR borrower_name ILIKE $${paramIndex} OR address ILIKE $${paramIndex})`;
        params.push(searchPattern);
        paramIndex++;
      }

      loans = await query(
        `SELECT * FROM loans WHERE ${whereClause} ORDER BY created_at DESC LIMIT 50`,
        params
      );
    } else {
      // Servicers and admins see all loans
      // Build WHERE clause dynamically with parameterized values
      const params: unknown[] = [];
      let whereClause = '';
      let paramIndex = 1;

      if (status) {
        whereClause += `status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }

      if (search) {
        const searchPattern = `%${search}%`;
        if (whereClause) {
          whereClause += ` AND `;
        }
        whereClause += `(loan_number ILIKE $${paramIndex} OR borrower_name ILIKE $${paramIndex} OR address ILIKE $${paramIndex})`;
        params.push(searchPattern);
        paramIndex++;
      }

      const queryText = whereClause
        ? `SELECT * FROM loans WHERE ${whereClause} ORDER BY created_at DESC LIMIT 50`
        : `SELECT * FROM loans ORDER BY created_at DESC LIMIT 50`;

      loans = await query(queryText, params);
    }

    // Normalize numeric fields (PostgreSQL NUMERIC comes as strings)
    const normalizedLoans = loans.map(loan => normalizeLoan(loan as Record<string, unknown>));
    return successResponse(normalizedLoans);
  } catch (error) {
    console.error('Error fetching loans:', error);
    return errorResponse('Failed to fetch loans', 500);
  }
}
