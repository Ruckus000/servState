/**
 * Document retention utilities for mortgage servicing compliance
 *
 * Mortgage documents must be retained for 7 years per:
 * - CFPB Regulation X (12 CFR 1024.38)
 * - GSE requirements (Fannie Mae, Freddie Mac)
 * - State regulations (varies by state)
 */

// Default retention period in years for mortgage documents
const DEFAULT_RETENTION_YEARS = 7;

/**
 * Calculate the retention end date for a document
 *
 * @param createdAt - Document creation date (defaults to now)
 * @param retentionYears - Number of years to retain (defaults to 7)
 * @returns ISO date string (YYYY-MM-DD) for retention_until field
 */
export function calculateRetentionDate(
  createdAt: Date = new Date(),
  retentionYears: number = DEFAULT_RETENTION_YEARS
): string {
  const retentionDate = new Date(createdAt);
  retentionDate.setFullYear(retentionDate.getFullYear() + retentionYears);
  return retentionDate.toISOString().split('T')[0];
}

export { DEFAULT_RETENTION_YEARS };
