'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  CreditCard,
  FileText,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
  Wallet,
  ClipboardList,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  getNotificationsByRole,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  formatNotificationTime,
} from '@/data/notifications';
import { Notification, NotificationType } from '@/types/notification';
import type { ViewMode } from '@/types';

interface NotificationPopoverProps {
  viewMode: ViewMode;
}

const notificationIcons: Record<NotificationType, React.ReactNode> = {
  payment_due: <Clock className="h-4 w-4 text-warning" />,
  payment_received: <CreditCard className="h-4 w-4 text-success" />,
  message: <MessageSquare className="h-4 w-4 text-primary" />,
  document: <FileText className="h-4 w-4 text-brand" />,
  system: <Settings className="h-4 w-4 text-muted-foreground" />,
  task: <ClipboardList className="h-4 w-4 text-primary" />,
  escrow: <Wallet className="h-4 w-4 text-success" />,
  delinquency: <AlertTriangle className="h-4 w-4 text-destructive" />,
};

export function NotificationPopover({ viewMode }: NotificationPopoverProps) {
  const [notifications, setNotifications] = useState(() =>
    getNotificationsByRole(viewMode).slice(0, 7)
  );
  const unreadCount = getUnreadCount(viewMode);

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
    setNotifications(getNotificationsByRole(viewMode).slice(0, 7));
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead(viewMode);
    setNotifications(getNotificationsByRole(viewMode).slice(0, 7));
  };

  const notificationsPath =
    viewMode === 'borrower'
      ? '/borrower/notifications'
      : '/servicer/notifications';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.preventDefault();
                handleMarkAllAsRead();
              }}
            >
              Mark all as read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[320px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">No notifications</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
              />
            ))
          )}
        </ScrollArea>
        <DropdownMenuSeparator />
        <div className="p-2">
          <Link href={notificationsPath} className="block">
            <Button variant="outline" size="sm" className="w-full">
              View all notifications
            </Button>
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const icon = notificationIcons[notification.type];

  return (
    <DropdownMenuItem
      className={cn(
        'flex items-start gap-3 p-3 cursor-pointer focus:bg-accent',
        !notification.read && 'bg-primary/5'
      )}
      onClick={() => {
        if (!notification.read) {
          onMarkAsRead(notification.id);
        }
      }}
    >
      <div className="flex-shrink-0 mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p
            className={cn(
              'text-sm truncate',
              !notification.read && 'font-medium'
            )}
          >
            {notification.title}
          </p>
          {!notification.read && (
            <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
          )}
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatNotificationTime(notification.date)}
        </p>
      </div>
      {notification.priority === 'high' && (
        <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
          Urgent
        </Badge>
      )}
    </DropdownMenuItem>
  );
}
