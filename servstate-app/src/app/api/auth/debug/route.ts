import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import bcrypt from 'bcryptjs';

/**
 * DEBUG ENDPOINT - REMOVE AFTER FIXING AUTH
 * Tests database connection and password verification
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Step 1: Check if database connection works
    const testResult = await sql`SELECT 1 as test`;
    console.log('DB connection test:', testResult);

    // Step 2: Query user
    const users = await sql`
      SELECT id, email, name, role, password_hash
      FROM users
      WHERE email = ${email}
    `;

    if (users.length === 0) {
      return NextResponse.json({
        step: 'user_query',
        error: 'USER_NOT_FOUND',
        message: `No user found with email: ${email}`,
        debug: { emailSearched: email }
      }, { status: 404 });
    }

    const user = users[0];

    // Step 3: Check if password_hash exists
    if (!user.password_hash) {
      return NextResponse.json({
        step: 'password_hash_check',
        error: 'NO_PASSWORD_HASH',
        message: 'User has no password_hash set',
        debug: { userId: user.id, email: user.email }
      }, { status: 500 });
    }

    // Step 4: Test bcrypt comparison
    console.log('Testing bcrypt compare...');
    console.log('Password length:', password?.length);
    console.log('Hash length:', user.password_hash?.length);
    console.log('Hash prefix:', user.password_hash?.substring(0, 7));

    const isValid = await bcrypt.compare(password, user.password_hash);

    return NextResponse.json({
      step: 'complete',
      success: isValid,
      debug: {
        userFound: true,
        userId: user.id,
        email: user.email,
        role: user.role,
        hashLength: user.password_hash?.length,
        hashPrefix: user.password_hash?.substring(0, 7),
        passwordProvided: !!password,
        passwordLength: password?.length,
        bcryptResult: isValid
      }
    });
  } catch (error) {
    console.error('Debug auth error:', error);
    return NextResponse.json({
      step: 'error',
      error: 'EXCEPTION',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
