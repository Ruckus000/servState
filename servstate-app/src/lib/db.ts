import { neon, Pool } from '@neondatabase/serverless';

// Lazy initialization - connections created only at runtime when first used
// This prevents build-time errors when DATABASE_URL isn't available
let _sqlClient: ReturnType<typeof neon> | null = null;
let _pool: Pool | null = null;

/**
 * Detect if code is running during Next.js build phase
 * During build, DATABASE_URL may not be available and database access should be avoided
 */
function isBuildTime(): boolean {
  // Next.js sets NEXT_PHASE during build
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return true;
  }
  // Vercel build environment
  if (process.env.VERCEL === '1' && process.env.CI === '1') {
    return true;
  }
  // Generic build detection - if NODE_ENV is production but DATABASE_URL is missing, likely build
  if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
    return true;
  }
  return false;
}

/**
 * Get database connection string
 * During build time, returns a placeholder to allow module evaluation without errors
 * Throws error only when actually trying to execute queries during build
 */
function getConnectionString(): string {
  const connectionString = process.env.DATABASE_URL;

  // During build time, return a placeholder to allow module imports
  // The actual error will be thrown when trying to execute queries
  if (isBuildTime() && !connectionString) {
    return 'postgresql://build-placeholder@localhost:5432/build';
  }

  if (!connectionString) {
    throw new Error(
      'DATABASE_URL environment variable is not set. ' +
      'Please ensure it is configured in your environment.'
    );
  }
  return connectionString;
}

function getSqlClient(): ReturnType<typeof neon> {
  if (!_sqlClient) {
    // During build time without DATABASE_URL, create a client that will fail gracefully
    if (isBuildTime() && !process.env.DATABASE_URL) {
      // Create a client with placeholder - it will fail if actually used, but allows module import
      _sqlClient = neon('postgresql://build-placeholder@localhost:5432/build');
    } else {
      _sqlClient = neon(getConnectionString());
    }
  }
  return _sqlClient;
}

function getPool(): Pool {
  if (!_pool) {
    // During build time without DATABASE_URL, create a pool that will fail gracefully
    if (isBuildTime() && !process.env.DATABASE_URL) {
      // Create a pool with placeholder - it will fail if actually used, but allows module import
      _pool = new Pool({ connectionString: 'postgresql://build-placeholder@localhost:5432/build' });
    } else {
      _pool = new Pool({ connectionString: getConnectionString() });
    }
  }
  return _pool;
}

/**
 * SQL tagged template literal for queries
 * Uses Neon serverless driver with automatic connection pooling
 * 
 * @example
 * const loans = await sql`SELECT * FROM loans WHERE id = ${loanId}`;
 */
export function sql(strings: TemplateStringsArray, ...values: unknown[]) {
  // Runtime check: prevent database access during build
  if (isBuildTime() && !process.env.DATABASE_URL) {
    throw new Error(
      'Database queries cannot be executed during build time. ' +
      'DATABASE_URL must be available at runtime. ' +
      'If you need to access the database, ensure this code runs only at request time, not during build.'
    );
  }
  return getSqlClient()(strings, ...values);
}

/**
 * Execute a parameterized query with dynamic SQL
 * Use this when queries can't be expressed as tagged template literals
 * 
 * @example
 * const result = await query('UPDATE loans SET status = $1 WHERE id = $2', [status, id]);
 */
export async function query<T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  // Runtime check: prevent database access during build
  if (isBuildTime() && !process.env.DATABASE_URL) {
    throw new Error(
      'Database queries cannot be executed during build time. ' +
      'DATABASE_URL must be available at runtime. ' +
      'If you need to access the database, ensure this code runs only at request time, not during build.'
    );
  }
  const result = await getPool().query(text, params);
  return result.rows as T[];
}

// Helper type for query results
export type QueryResult<T> = T[];

/**
 * Execute multiple queries within a transaction
 * Automatically handles commit/rollback
 * 
 * @example
 * await transaction(async (client) => {
 *   await client.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, id]);
 *   await client.query('UPDATE password_reset_tokens SET used = true WHERE id = $1', [tokenId]);
 * });
 */
export async function transaction<T>(
  callback: (client: {
    query: (text: string, params?: unknown[]) => Promise<{ rows: unknown[] }>;
  }) => Promise<T>
): Promise<T> {
  // Runtime check: prevent database access during build
  if (isBuildTime() && !process.env.DATABASE_URL) {
    throw new Error(
      'Database transactions cannot be executed during build time. ' +
      'DATABASE_URL must be available at runtime. ' +
      'If you need to access the database, ensure this code runs only at request time, not during build.'
    );
  }
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
