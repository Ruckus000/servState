# Manual Hydration Error Diagnosis

This checklist helps diagnose React hydration error #418 on the servicer loan detail page.

---

## Step 1: Open Browser DevTools

1. Navigate to a servicer loan detail page: `/servicer/loans/[id]`
2. Open DevTools → Console
3. Look for red errors containing:
   - "Minified React error #418"
   - "Hydration failed"
   - "Text content does not match"

### Record:
- [ ] Error observed: YES / NO
- [ ] Error message: _______________________________________________

---

## Step 2: Check Documents Tab

1. Click "Documents" tab on the loan detail page
2. Observe if documents render or show blank/broken
3. Check for new console errors when tab loads

### Record:
- [ ] Documents render: YES / NO
- [ ] New errors on tab load: YES / NO

---

## Step 3: Verify API Returns Data

1. Open DevTools → Network tab
2. Refresh the page
3. Find request to `/api/documents?loanId=...`
4. Check response contains document array (not empty)

### Record:
- [ ] API request found: YES / NO
- [ ] Response status: _____
- [ ] Response has documents: YES / NO (count: ____)

---

## Step 3a: Verify Database Has Documents

Run in Neon console:

```sql
-- Replace [LOAN_ID] with actual ID from URL
SELECT id, name, type, date, status, deleted_at
FROM documents
WHERE loan_id = '[LOAN_ID]'
ORDER BY created_at DESC LIMIT 5;

-- Also check the view works
SELECT COUNT(*) FROM active_documents WHERE loan_id = '[LOAN_ID]';
```

### Record:
- [ ] Documents in database: YES / NO (count: ____)
- [ ] active_documents view count: _____
- [ ] If count = 0 → Problem is missing data, not frontend

---

## Step 4: Test force-dynamic Fix

1. Open `src/app/(dashboard)/servicer/loans/[id]/page.tsx`
2. Add after `'use client'` line:
   ```typescript
   export const dynamic = 'force-dynamic';
   ```
3. Save and refresh browser
4. Check if hydration error is gone

### Record:
- [ ] Error resolved with force-dynamic: YES / NO
- [ ] If YES → Root cause is react-pdf SSR, not date formatting

---

## Step 5: Date Formatting Test (if Step 4 didn't fix it)

1. Remove force-dynamic (revert change)
2. Check if error message mentions specific date mismatch
3. Note which field: `doc.date` or `doc.created_at`

### Record:
- [ ] Error mentions date mismatch: YES / NO
- [ ] Which field: _____

---

## Success Criteria

After fixes are applied:
- [ ] No "Minified React error #418" in console
- [ ] No "Hydration failed" warnings
- [ ] Documents tab renders document list
- [ ] PDF preview modal opens without errors

---

## Summary of Findings

### Error Reproduction
- Hydration error observed: YES / NO
- Exact error message: _______________________________________________

### Root Cause Identification
- force-dynamic fixed the issue: YES / NO
- formatDate timezone issue confirmed: YES / NO
- Database has documents: YES / NO
- API returns documents: YES / NO

### Recommended Fix
- [ ] Add force-dynamic to servicer page
- [ ] Replace formatDate implementation
- [ ] Both
- [ ] Neither - different root cause: _______________________________________________

---

## If Error Doesn't Reproduce

1. Check if error is intermittent (refresh 5+ times)
2. Try in incognito mode (no extensions)
3. Try in different browser (Chrome, Firefox, Safari)
4. Check if error only occurs on first load (SSR) vs navigation (client)
5. Clear browser cache and try again
6. Check if error only occurs in development or also in production build

---

## Notes

_Add any additional observations here:_
