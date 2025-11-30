'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useViewMode } from '@/context/view-mode-context';

export default function DashboardPage() {
  const router = useRouter();
  const { viewMode } = useViewMode();

  useEffect(() => {
    // Redirect to the appropriate dashboard based on view mode
    router.push(viewMode === 'borrower' ? '/borrower' : '/servicer');
  }, [viewMode, router]);

  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-muted-foreground">Redirecting...</div>
    </div>
  );
}
