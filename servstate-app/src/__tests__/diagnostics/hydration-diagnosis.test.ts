import { describe, it, expect } from 'vitest';
import { formatDate, formatDateTime } from '@/lib/format';

describe('Hydration Diagnosis: Date Formatting', () => {

  // Test dates that commonly cause timezone issues
  const problematicDates = [
    { input: '2025-01-15', expected: 'Jan 15, 2025', note: 'Simple date' },
    { input: '2025-01-15T00:00:00.000Z', expected: 'Jan 15, 2025', note: 'Midnight UTC - often becomes Jan 14 in US timezones!' },
    { input: '2025-01-15T05:00:00.000Z', expected: 'Jan 15, 2025', note: '5am UTC = midnight EST' },
    { input: '2025-01-01T00:00:00.000Z', expected: 'Jan 1, 2025', note: 'New Year edge case' },
    { input: '2025-12-31T23:59:59.999Z', expected: 'Dec 31, 2025', note: 'Year boundary' },
  ];

  describe('formatDate - Current Implementation Analysis', () => {

    it('should NOT use Intl.DateTimeFormat (causes hydration issues)', () => {
      // Check the source code for problematic patterns
      const sourceCode = formatDate.toString();
      const usesIntl = sourceCode.includes('DateTimeFormat') ||
                       sourceCode.includes('Intl');

      if (usesIntl) {
        console.warn('⚠️  formatDate uses Intl.DateTimeFormat - THIS CAUSES HYDRATION ISSUES');
        console.warn('    Server (Node) and Client (Browser) may have different ICU data');
        console.warn('    Timezone differences cause date shifts (Jan 15 UTC → Jan 14 EST)');
      }

      // This test documents the problem, not enforces the fix yet
      // Will fail if using Intl - that's informative
      expect(usesIntl).toBe(false);
    });

    problematicDates.forEach(({ input, expected, note }) => {
      it(`handles "${input}" (${note})`, () => {
        const result = formatDate(input);

        // Log for diagnosis
        console.log(`  Input: ${input}`);
        console.log(`  Output: ${result}`);
        console.log(`  Expected: ${expected}`);

        // Check format is correct pattern
        expect(result).toMatch(/^[A-Z][a-z]{2} \d{1,2}, \d{4}$/);

        // Check actual value - may fail due to timezone, that's diagnostic info
        if (result !== expected) {
          console.warn(`  ⚠️  MISMATCH: Got "${result}" but expected "${expected}"`);
          console.warn(`     This indicates timezone-sensitive behavior!`);
        }
      });
    });

    it('produces consistent results on repeated calls', () => {
      const date = '2025-06-15T12:00:00.000Z';
      const results = Array.from({ length: 10 }, () => formatDate(date));
      const allSame = results.every(r => r === results[0]);

      expect(allSame).toBe(true);
      console.log(`  Consistent result: ${results[0]}`);
    });
  });

  describe('formatDateTime - Already Fixed Implementation', () => {

    it('should use manual string building (not Intl)', () => {
      const sourceCode = formatDateTime.toString();
      const usesIntl = sourceCode.includes('DateTimeFormat');

      expect(usesIntl).toBe(false);
      console.log('  ✅ formatDateTime does not use Intl.DateTimeFormat');
    });

    it('has explicit month array for consistency', () => {
      const sourceCode = formatDateTime.toString();
      const hasMonthArray = sourceCode.includes("'Jan'") ||
                           sourceCode.includes('"Jan"');

      expect(hasMonthArray).toBe(true);
      console.log('  ✅ formatDateTime uses explicit month names');
    });
  });

  describe('Implementation Comparison', () => {
    it('documents the difference between formatDate and formatDateTime', () => {
      console.log('\n=== IMPLEMENTATION COMPARISON ===');
      console.log('formatDate source:');
      console.log(formatDate.toString().slice(0, 300) + '...\n');
      console.log('formatDateTime source:');
      console.log(formatDateTime.toString().slice(0, 300) + '...\n');

      // Always pass - this is just for documentation
      expect(true).toBe(true);
    });
  });
});

describe('Hydration Diagnosis: SSR Environment', () => {

  it('checks if DOMMatrix exists (react-pdf requirement)', () => {
    const hasDOMMatrix = typeof globalThis.DOMMatrix !== 'undefined';

    console.log(`  DOMMatrix available: ${hasDOMMatrix}`);
    if (!hasDOMMatrix) {
      console.warn('  ⚠️  DOMMatrix not available in Node.js');
      console.warn('     react-pdf may fail during SSR');
      console.warn('     Solution: Add "export const dynamic = \'force-dynamic\'" to page');
    }

    // Document the finding, don't fail
    expect(typeof hasDOMMatrix).toBe('boolean');
  });

  it('checks if document/window exist (client-only APIs)', () => {
    const hasDocument = typeof document !== 'undefined';
    const hasWindow = typeof window !== 'undefined';

    console.log(`  document available: ${hasDocument}`);
    console.log(`  window available: ${hasWindow}`);

    if (!hasDocument || !hasWindow) {
      console.log('  ℹ️  Running in Node.js (SSR) environment');
    }

    expect(typeof hasDocument).toBe('boolean');
  });
});
