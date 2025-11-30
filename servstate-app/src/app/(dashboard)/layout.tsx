'use client';

import { useState } from 'react';
import { ViewModeProvider, useViewMode } from '@/context/view-mode-context';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { cn } from '@/lib/utils';

function DashboardContent({
  children,
  sidebarCollapsed,
  onSidebarToggle,
}: {
  children: React.ReactNode;
  sidebarCollapsed: boolean;
  onSidebarToggle: () => void;
}) {
  const { viewMode } = useViewMode();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={sidebarCollapsed} onToggle={onSidebarToggle} />
      <Header sidebarCollapsed={sidebarCollapsed} />
      <main
        className={cn(
          'min-h-screen transition-all duration-300',
          viewMode === 'servicer' ? 'pt-24' : 'pt-16',
          sidebarCollapsed ? 'pl-16' : 'pl-64'
        )}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <ViewModeProvider>
      <DashboardContent
        sidebarCollapsed={sidebarCollapsed}
        onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      >
        {children}
      </DashboardContent>
    </ViewModeProvider>
  );
}
