import { auth } from './auth';
import { sql } from './db';
import type { UserRole } from '@/types';

// Re-export validateLoanAccess from api-helpers for backward compatibility
// The canonical implementation is in api-helpers.ts
export { validateLoanAccess } from './api-helpers';

/**
 * Get the current authenticated user from the session
 */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user;
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

/**
 * Require a specific role - throws if user doesn't have the role
 */
export async function requireRole(role: UserRole) {
  const user = await requireAuth();
  if (user.role !== role) {
    throw new Error('Forbidden');
  }
  return user;
}

/**
 * Get the loan ID associated with a borrower user
 */
export async function getBorrowerLoanId(userId: string): Promise<string | null> {
  const result = await sql`
    SELECT id FROM loans WHERE borrower_id = ${userId} LIMIT 1
  `;
  return result.length > 0 ? result[0].id : null;
}












