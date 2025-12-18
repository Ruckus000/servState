#!/bin/bash
# Timezone Comparison Script for Hydration Diagnosis
# This script runs the formatDate tests in different timezone contexts
# to detect potential SSR/client mismatches

echo "============================================"
echo "Timezone Comparison Test for formatDate"
echo "============================================"
echo ""
echo "If outputs differ between timezones, formatDate has hydration risk!"
echo ""

echo "=== Running tests in UTC timezone ==="
TZ=UTC npx vitest run src/__tests__/diagnostics/formatDate-fix.test.ts 2>&1 | tee /tmp/tz-utc.log

echo ""
echo "=== Running tests in EST timezone (America/New_York) ==="
TZ=America/New_York npx vitest run src/__tests__/diagnostics/formatDate-fix.test.ts 2>&1 | tee /tmp/tz-est.log

echo ""
echo "=== Running tests in PST timezone (America/Los_Angeles) ==="
TZ=America/Los_Angeles npx vitest run src/__tests__/diagnostics/formatDate-fix.test.ts 2>&1 | tee /tmp/tz-pst.log

echo ""
echo "============================================"
echo "COMPARISON SUMMARY"
echo "============================================"
echo ""

# Check for differences in key test outputs
echo "Checking for timezone-related differences..."
echo ""

# Extract and compare Current implementation results
echo "--- Current Implementation Results ---"
echo "UTC:"
grep -A1 "Current implementation:" /tmp/tz-utc.log | tail -1 || echo "  (not found)"
echo "EST:"
grep -A1 "Current implementation:" /tmp/tz-est.log | tail -1 || echo "  (not found)"
echo "PST:"
grep -A1 "Current implementation:" /tmp/tz-pst.log | tail -1 || echo "  (not found)"

echo ""
echo "--- Fixed Implementation Results ---"
echo "UTC:"
grep -A1 "Fixed implementation:" /tmp/tz-utc.log | tail -1 || echo "  (not found)"
echo "EST:"
grep -A1 "Fixed implementation:" /tmp/tz-est.log | tail -1 || echo "  (not found)"
echo "PST:"
grep -A1 "Fixed implementation:" /tmp/tz-pst.log | tail -1 || echo "  (not found)"

echo ""
echo "============================================"
echo "DIAGNOSIS"
echo "============================================"

# Compare the log files for differences
if diff -q /tmp/tz-utc.log /tmp/tz-est.log > /dev/null 2>&1; then
  echo "✅ UTC and EST outputs are identical"
else
  echo "⚠️  UTC and EST outputs DIFFER - timezone issue confirmed!"
fi

if diff -q /tmp/tz-utc.log /tmp/tz-pst.log > /dev/null 2>&1; then
  echo "✅ UTC and PST outputs are identical"
else
  echo "⚠️  UTC and PST outputs DIFFER - timezone issue confirmed!"
fi

echo ""
echo "Log files saved to:"
echo "  /tmp/tz-utc.log"
echo "  /tmp/tz-est.log"
echo "  /tmp/tz-pst.log"
echo ""
echo "Run 'diff /tmp/tz-utc.log /tmp/tz-est.log' to see detailed differences"
