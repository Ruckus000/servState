/**
 * Supabase Client Configuration
 *
 * TODO: Implement Supabase integration
 *
 * Steps to implement:
 *
 * 1. Install dependencies:
 *    npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
 *
 * 2. Create a Supabase project at https://supabase.com
 *
 * 3. Add environment variables to .env.local:
 *    NEXT_PUBLIC_SUPABASE_URL=your-project-url
 *    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
 *
 * 4. Uncomment and use the code below:
 *
 * import { createBrowserClient } from '@supabase/ssr';
 *
 * export function createClient() {
 *   return createBrowserClient(
 *     process.env.NEXT_PUBLIC_SUPABASE_URL!,
 *     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
 *   );
 * }
 *
 * 5. For server components, use:
 *
 * import { createServerClient } from '@supabase/ssr';
 * import { cookies } from 'next/headers';
 *
 * export function createServerSupabaseClient() {
 *   const cookieStore = cookies();
 *   return createServerClient(
 *     process.env.NEXT_PUBLIC_SUPABASE_URL!,
 *     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
 *     {
 *       cookies: {
 *         get(name) {
 *           return cookieStore.get(name)?.value;
 *         },
 *       },
 *     }
 *   );
 * }
 */

// Placeholder export to prevent import errors
export const SUPABASE_NOT_CONFIGURED = true;

// Mock function for development
export function createClient() {
  console.warn('Supabase is not configured. Using mock data.');
  return null;
}
