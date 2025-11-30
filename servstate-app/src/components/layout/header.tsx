'use client';

import { useState, useEffect } from 'react';
import { Search, User, LogOut, Settings, HelpCircle } from 'lucide-react';
import { NotificationPopover } from '@/components/notifications/notification-popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useViewMode } from '@/context/view-mode-context';
import { MOCK_BORROWER, MOCK_SERVICER } from '@/types/user';
import { cn } from '@/lib/utils';

interface HeaderProps {
  sidebarCollapsed: boolean;
}

export function Header({ sidebarCollapsed }: HeaderProps) {
  const { viewMode, toggleViewMode } = useViewMode();
  const currentUser = viewMode === 'borrower' ? MOCK_BORROWER : MOCK_SERVICER;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <header
      className={cn(
        'fixed right-0 top-0 z-30 flex items-center justify-between border-b border-border bg-card px-6 transition-all duration-300',
        viewMode === 'servicer' ? 'h-24' : 'h-16',
        sidebarCollapsed ? 'left-16' : 'left-64'
      )}
    >
      {/* Search - only show for servicer view, expanded for prominence */}
      {viewMode === 'servicer' ? (
        <div className="relative flex-1 max-w-2xl">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search loans, borrowers, documents..."
            className="h-11 pl-12 text-base"
          />
        </div>
      ) : (
        <div />
      )}

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* View Mode Toggle - only render after mount to prevent hydration mismatch */}
        {mounted && (
          <Tabs
            value={viewMode}
            onValueChange={(value) => value !== viewMode && toggleViewMode()}
          >
            <TabsList>
              <TabsTrigger value="borrower" className="text-xs">
                Borrower
              </TabsTrigger>
              <TabsTrigger value="servicer" className="text-xs">
                Servicer
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        {/* Notifications */}
        <NotificationPopover viewMode={viewMode} />

        {/* User Menu - only render after mount to prevent hydration mismatch */}
        {mounted && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {getInitials(currentUser.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden text-left md:block">
                  <p className="text-sm font-medium">{currentUser.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{currentUser.role}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HelpCircle className="mr-2 h-4 w-4" />
                Help & Support
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => {
                  // TODO: Implement logout functionality when auth is added
                  // This will call supabase.auth.signOut() and redirect to /login
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
