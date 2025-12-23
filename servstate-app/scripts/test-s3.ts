/**
 * Test S3 connectivity
 * Run with: npx tsx scripts/test-s3.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

async function testS3() {
  console.log('🧪 Testing S3 Connectivity...\n');

  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log(`   AWS_ACCESS_KEY_ID: ${process.env.AWS_ACCESS_KEY_ID ? '✅ Set' : '❌ Not set'}`);
  console.log(`   AWS_SECRET_ACCESS_KEY: ${process.env.AWS_SECRET_ACCESS_KEY ? '✅ Set' : '❌ Not set'}`);
  console.log(`   AWS_REGION: ${process.env.AWS_REGION || '❌ Not set'}`);
  console.log(`   AWS_S3_BUCKET: ${process.env.AWS_S3_BUCKET || '❌ Not set'}`);
  console.log('');

  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.error('❌ Missing AWS credentials');
    process.exit(1);
  }

  if (!process.env.AWS_S3_BUCKET) {
    console.error('❌ Missing AWS_S3_BUCKET');
    process.exit(1);
  }

  // Initialize S3 client
  const s3 = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  const testKey = `test-${Date.now()}.txt`;
  const testContent = 'S3 connectivity test';

  console.log('1️⃣ Testing S3 Upload (PutObject)...');
  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: testKey,
        Body: testContent,
        ContentType: 'text/plain',
      })
    );
    console.log(`   ✅ Upload successful: ${testKey}\n`);
  } catch (error: any) {
    console.error(`   ❌ Upload failed:`, error.message);
    console.error(`   Error code: ${error.Code || error.name}`);
    console.error(`   Details:`, error);
    process.exit(1);
  }

  console.log('2️⃣ Testing S3 Download (GetObject)...');
  try {
    const response = await s3.send(
      new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: testKey,
      })
    );
    const body = await response.Body?.transformToString();
    if (body === testContent) {
      console.log(`   ✅ Download successful and content matches\n`);
    } else {
      console.log(`   ⚠️  Downloaded but content mismatch: "${body}"\n`);
    }
  } catch (error: any) {
    console.error(`   ❌ Download failed:`, error.message);
    console.error(`   Error code: ${error.Code || error.name}`);
    console.error(`   Details:`, error);
    process.exit(1);
  }

  console.log('3️⃣ Testing S3 Delete (DeleteObject)...');
  try {
    await s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: testKey,
      })
    );
    console.log(`   ✅ Delete successful\n`);
  } catch (error: any) {
    console.error(`   ❌ Delete failed:`, error.message);
    console.error(`   Error code: ${error.Code || error.name}`);
    process.exit(1);
  }

  console.log('✅ All S3 operations successful!');
  console.log('\n🎉 Your AWS credentials and S3 bucket are configured correctly.');
  console.log('\n💡 Next steps:');
  console.log('   - The issue is that documents in your database have NULL storage_path');
  console.log('   - Check server logs when uploading/generating documents for errors');
  console.log('   - Verify the document upload/generation flow is calling S3 correctly');
}

testS3()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
