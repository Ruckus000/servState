/**
 * Diagnostic script to check document status in the database
 * Run with: npx tsx scripts/check-documents.ts [loan-id]
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import { sql } from '@/lib/db';

async function checkDocuments(loanId?: string) {
  console.log('🔍 Checking document status in database...\n');

  try {
    let query;

    if (loanId) {
      console.log(`Filtering by loan_id: ${loanId}\n`);
      query = sql`
        SELECT
          id,
          loan_id,
          name,
          type,
          status,
          storage_path,
          size,
          created_at,
          deleted_at
        FROM documents
        WHERE loan_id = ${loanId}
        ORDER BY created_at DESC
        LIMIT 20
      `;
    } else {
      console.log('Showing all documents (max 20):\n');
      query = sql`
        SELECT
          id,
          loan_id,
          name,
          type,
          status,
          storage_path,
          size,
          created_at,
          deleted_at
        FROM documents
        ORDER BY created_at DESC
        LIMIT 20
      `;
    }

    const result = await query;

    if (result.length === 0) {
      console.log('❌ No documents found');
      return;
    }

    console.log(`📊 Found ${result.length} documents:\n`);
    console.log('─'.repeat(120));

    for (const doc of result) {
      const statusIcon =
        doc.status === 'uploaded' ? '✅' :
        doc.status === 'pending' ? '⏳' :
        doc.status === 'upload_failed' ? '❌' : '❓';

      const pathStatus = doc.storage_path ? '✅ Has path' : '❌ NULL';
      const deleteStatus = doc.deleted_at ? '🗑️  Deleted' : '✅ Active';

      console.log(`${statusIcon} ${doc.name}`);
      console.log(`   ID: ${doc.id}`);
      console.log(`   Loan ID: ${doc.loan_id}`);
      console.log(`   Type: ${doc.type}`);
      console.log(`   Status: ${doc.status}`);
      console.log(`   Storage Path: ${pathStatus}`);
      if (doc.storage_path) {
        console.log(`   Path: ${doc.storage_path}`);
      }
      console.log(`   Size: ${doc.size || 'N/A'}`);
      console.log(`   Visibility: ${deleteStatus}`);
      console.log(`   Created: ${doc.created_at}`);
      console.log('─'.repeat(120));
    }

    // Summary
    const byStatus = result.reduce((acc: any, doc: any) => {
      acc[doc.status] = (acc[doc.status] || 0) + 1;
      return acc;
    }, {});

    const withPath = result.filter((d: any) => d.storage_path).length;
    const withoutPath = result.filter((d: any) => !d.storage_path).length;
    const deleted = result.filter((d: any) => d.deleted_at).length;

    console.log('\n📈 Summary:');
    console.log(`   Total documents: ${result.length}`);
    console.log(`   With storage_path: ${withPath}`);
    console.log(`   Without storage_path: ${withoutPath} ⚠️`);
    console.log(`   Soft-deleted: ${deleted}`);
    console.log(`   By status:`);
    for (const [status, count] of Object.entries(byStatus)) {
      console.log(`     ${status}: ${count}`);
    }

    if (withoutPath > 0) {
      console.log('\n⚠️  WARNING: Documents without storage_path will fail with "Document not yet uploaded to storage"');
    }

  } catch (error) {
    console.error('❌ Error querying database:', error);
    process.exit(1);
  }
}

// Get loan ID from command line args
const loanId = process.argv[2];

checkDocuments(loanId)
  .then(() => {
    console.log('\n✅ Check complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
