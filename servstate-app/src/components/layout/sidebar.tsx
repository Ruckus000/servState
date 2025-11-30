'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CreditCard,
  FileText,
  PiggyBank,
  MessageCircle,
  Folder,
  AlertTriangle,
  CheckSquare,
  BarChart2,
  ChevronLeft,
  ChevronRight,
  Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useViewMode } from '@/context/view-mode-context';
import { borrowerNavItems, servicerNavItems } from '@/config/navigation';
import type { NavItem } from '@/types';

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  CreditCard,
  FileText,
  PiggyBank,
  MessageCircle,
  Folder,
  AlertTriangle,
  CheckSquare,
  BarChart2,
};

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { viewMode } = useViewMode();
  const navItems = viewMode === 'borrower' ? borrowerNavItems : servicerNavItems;

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r border-border bg-card transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Building2 className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="text-lg font-semibold text-foreground">ServState</span>
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onToggle}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 p-2">
        {navItems.map((item) => (
          <NavItemComponent
            key={item.id}
            item={item}
            collapsed={collapsed}
            isActive={pathname === item.href}
          />
        ))}
      </nav>
    </aside>
  );
}

interface NavItemComponentProps {
  item: NavItem;
  collapsed: boolean;
  isActive: boolean;
}

function NavItemComponent({ item, collapsed, isActive }: NavItemComponentProps) {
  const Icon = iconMap[item.icon] || LayoutDashboard;

  return (
    <Link
      href={item.href || '#'}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {!collapsed && (
        <>
          <span className="flex-1">{item.label}</span>
          {item.badge && (
            <Badge
              variant={item.badgeVariant === 'destructive' ? 'destructive' : 'secondary'}
              className="h-5 min-w-5 justify-center px-1.5 text-xs"
            >
              {item.badge}
            </Badge>
          )}
        </>
      )}
    </Link>
  );
}
