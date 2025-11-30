import { neon } from '@neondatabase/serverless';

// Create a SQL query function using the Neon serverless driver
// This automatically handles connection pooling for serverless environments
export const sql = neon(process.env.DATABASE_URL!);

// Helper type for query results
export type QueryResult<T> = T[];

// Example usage:
// const loans = await sql`SELECT * FROM loans WHERE id = ${loanId}`;
// const result = await sql`INSERT INTO loans (borrower_name) VALUES (${name}) RETURNING *`;
