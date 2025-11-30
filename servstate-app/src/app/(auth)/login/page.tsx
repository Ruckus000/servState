'use client';

import Link from 'next/link';
import { Building2, Lock, Mail } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * TODO: Authentication Implementation
 *
 * This is a placeholder login page. When implementing authentication:
 *
 * 1. Install Supabase Auth helpers:
 *    npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
 *
 * 2. Create Supabase client in lib/supabase.ts
 *
 * 3. Implement authentication flow:
 *    - Email/password sign in
 *    - Magic link authentication
 *    - OAuth providers (Google, etc.)
 *
 * 4. Add protected route middleware
 *
 * 5. Implement Row Level Security policies in Supabase
 */

export default function LoginPage() {
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement actual authentication
    // For now, redirect to borrower dashboard
    window.location.href = '/borrower';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
              <Building2 className="h-7 w-7 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">Welcome to ServState</CardTitle>
          <CardDescription>
            Sign in to access your mortgage account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10"
                  defaultValue="j.anderson@example.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="pl-10"
                  defaultValue="password"
                />
              </div>
            </div>
            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>

          <div className="mt-6 p-4 rounded-lg bg-muted">
            <p className="text-sm text-muted-foreground text-center">
              <strong>Demo Mode:</strong> Authentication is not yet implemented.
              Click Sign In to access the dashboard.
            </p>
          </div>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Need help?{' '}
            <Link href="#" className="text-primary hover:underline">
              Contact Support
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
