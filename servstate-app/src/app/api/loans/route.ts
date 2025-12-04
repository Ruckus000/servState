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
    const search = searchParams.get('search');

    const { user } = session;

    let loans;

    if (user.role === 'borrower') {
      // Borrowers can only see their own loan
      let conditions = [sql`borrower_id = ${user.id}`];

      if (status) {
        conditions.push(sql`status = ${status}`);
      }

      if (search) {
        const searchPattern = `%${search}%`;
        conditions.push(sql`(
          loan_number ILIKE ${searchPattern} OR
          borrower_name ILIKE ${searchPattern} OR
          address ILIKE ${searchPattern}
        )`);
      }

      const whereClause = conditions.reduce((acc, cond, idx) =>
        idx === 0 ? cond : sql`${acc} AND ${cond}`
      );

      loans = await sql`
        SELECT * FROM loans
        WHERE ${whereClause}
        ORDER BY created_at DESC
        LIMIT 50
      `;
    } else {
      // Servicers and admins see all loans
      let conditions = [];

      if (status) {
        conditions.push(sql`status = ${status}`);
      }

      if (search) {
        const searchPattern = `%${search}%`;
        conditions.push(sql`(
          loan_number ILIKE ${searchPattern} OR
          borrower_name ILIKE ${searchPattern} OR
          address ILIKE ${searchPattern}
        )`);
      }

      if (conditions.length > 0) {
        const whereClause = conditions.reduce((acc, cond, idx) =>
          idx === 0 ? cond : sql`${acc} AND ${cond}`
        );

        loans = await sql`
          SELECT * FROM loans
          WHERE ${whereClause}
          ORDER BY created_at DESC
          LIMIT 50
        `;
      } else {
        loans = await sql`
          SELECT * FROM loans
          ORDER BY created_at DESC
          LIMIT 50
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
