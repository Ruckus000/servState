import { neon, Pool } from '@neondatabase/serverless';

// Create a SQL query function using the Neon serverless driver
// This automatically handles connection pooling for serverless environments
export const sql = neon(process.env.DATABASE_URL!);

// Pool for dynamic queries that can't use tagged template literals
// Use pool.query(queryText, values) for parameterized dynamic queries
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function query<T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const result = await pool.query(text, params);
  return result.rows as T[];
}

// Helper type for query results
export type QueryResult<T> = T[];

// Example usage:
// Tagged template (preferred for static queries):
// const loans = await sql`SELECT * FROM loans WHERE id = ${loanId}`;
//
// Dynamic queries with parameters:
// const result = await query('UPDATE loans SET status = $1 WHERE id = $2', [status, id]);
