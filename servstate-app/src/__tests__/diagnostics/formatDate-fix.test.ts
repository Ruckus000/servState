import { describe, it, expect } from 'vitest';

/**
 * CURRENT IMPLEMENTATION (problematic)
 * Copy from src/lib/format.ts for reference
 */
const formatDateCurrent = (dateString: string, options?: Intl.DateTimeFormatOptions): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', options || {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

/**
 * PROPOSED FIX
 * Uses manual string building to avoid timezone/locale issues
 * Matches the pattern already used in formatDateTime
 */
const formatDateFixed = (dateString: string): string => {
  // Extract date portion to avoid timezone shifts
  // "2025-01-15T00:00:00.000Z" → "2025-01-15"
  const datePart = dateString.includes('T')
    ? dateString.split('T')[0]
    : dateString;

  const [year, month, day] = datePart.split('-').map(Number);

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  return `${months[month - 1]} ${day}, ${year}`;
};

describe('formatDate Fix Verification', () => {

  const testCases = [
    { input: '2025-01-15', expected: 'Jan 15, 2025' },
    { input: '2025-01-15T00:00:00.000Z', expected: 'Jan 15, 2025' },
    { input: '2025-01-15T05:00:00.000Z', expected: 'Jan 15, 2025' },
    { input: '2025-01-15T23:59:59.999Z', expected: 'Jan 15, 2025' },
    { input: '2025-12-31T00:00:00.000Z', expected: 'Dec 31, 2025' },
    { input: '2025-01-01T00:00:00.000Z', expected: 'Jan 1, 2025' },
    { input: '2024-02-29', expected: 'Feb 29, 2024' }, // Leap year
  ];

  describe('Fixed Implementation', () => {
    testCases.forEach(({ input, expected }) => {
      it(`correctly formats "${input}" as "${expected}"`, () => {
        const result = formatDateFixed(input);
        expect(result).toBe(expected);
      });
    });

    it('does not use Intl.DateTimeFormat', () => {
      const source = formatDateFixed.toString();
      expect(source).not.toContain('DateTimeFormat');
      expect(source).not.toContain('Intl');
    });

    it('does not use Date methods that depend on timezone', () => {
      const source = formatDateFixed.toString();
      // These methods are timezone-sensitive:
      expect(source).not.toContain('.getMonth()');
      expect(source).not.toContain('.getDate()');
      expect(source).not.toContain('.getFullYear()');
    });
  });

  describe('Current vs Fixed Comparison', () => {
    it('shows difference for midnight UTC dates', () => {
      const input = '2025-01-15T00:00:00.000Z';

      const currentResult = formatDateCurrent(input);
      const fixedResult = formatDateFixed(input);

      console.log(`\n  Input: ${input}`);
      console.log(`  Current implementation: ${currentResult}`);
      console.log(`  Fixed implementation: ${fixedResult}`);

      // Fixed version should always return Jan 15
      expect(fixedResult).toBe('Jan 15, 2025');

      // Current version MIGHT return Jan 14 depending on timezone
      // This test documents the discrepancy
      if (currentResult !== fixedResult) {
        console.warn(`  ⚠️  DIFFERENCE DETECTED!`);
        console.warn(`     Current impl is timezone-sensitive`);
        console.warn(`     This causes hydration mismatches`);
      }
    });

    it('compares all test cases between current and fixed', () => {
      console.log('\n=== CURRENT vs FIXED COMPARISON ===');
      let differences = 0;

      testCases.forEach(({ input, expected }) => {
        const currentResult = formatDateCurrent(input);
        const fixedResult = formatDateFixed(input);
        const match = currentResult === fixedResult;

        if (!match) {
          differences++;
          console.log(`  ❌ ${input}`);
          console.log(`     Current: ${currentResult}`);
          console.log(`     Fixed:   ${fixedResult}`);
          console.log(`     Expected: ${expected}`);
        } else {
          console.log(`  ✅ ${input} → ${fixedResult}`);
        }
      });

      console.log(`\n  Total differences: ${differences}/${testCases.length}`);

      if (differences > 0) {
        console.warn('  ⚠️  Differences found - timezone issue confirmed!');
      }

      // This test always passes - it's for documentation
      expect(true).toBe(true);
    });
  });

  describe('Ready-to-Apply Fix', () => {
    it('provides copy-paste replacement code', () => {
      const replacementCode = `
/**
 * Format a date string to a readable format
 * Uses manual string building to avoid SSR/client hydration mismatches
 */
export function formatDate(dateString: string): string {
  // Extract date portion to avoid timezone shifts
  const datePart = dateString.includes('T')
    ? dateString.split('T')[0]
    : dateString;

  const [year, month, day] = datePart.split('-').map(Number);

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  return \`\${months[month - 1]} \${day}, \${year}\`;
}
`;

      console.log('\n=== REPLACEMENT CODE FOR src/lib/format.ts ===');
      console.log(replacementCode);
      console.log('=== END REPLACEMENT CODE ===\n');

      expect(true).toBe(true); // Always pass, this is documentation
    });
  });

  describe('Edge Cases', () => {
    it('handles single-digit days correctly', () => {
      expect(formatDateFixed('2025-01-01')).toBe('Jan 1, 2025');
      expect(formatDateFixed('2025-01-09')).toBe('Jan 9, 2025');
    });

    it('handles all months correctly', () => {
      const months = [
        '01-Jan', '02-Feb', '03-Mar', '04-Apr', '05-May', '06-Jun',
        '07-Jul', '08-Aug', '09-Sep', '10-Oct', '11-Nov', '12-Dec'
      ];

      months.forEach((m, i) => {
        const [num, name] = m.split('-');
        const input = `2025-${num}-15`;
        const result = formatDateFixed(input);
        expect(result).toBe(`${name} 15, 2025`);
      });
    });

    it('handles leap year date', () => {
      expect(formatDateFixed('2024-02-29')).toBe('Feb 29, 2024');
    });

    it('handles year boundaries', () => {
      expect(formatDateFixed('2024-12-31')).toBe('Dec 31, 2024');
      expect(formatDateFixed('2025-01-01')).toBe('Jan 1, 2025');
    });
  });
});
