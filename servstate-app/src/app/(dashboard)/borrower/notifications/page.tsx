'use client';

import { useState } from 'react';
import {
  Bell,
  CreditCard,
  FileText,
  MessageSquare,
  AlertTriangle,
  Clock,
  Settings,
  Wallet,
  CheckCircle,
  Filter,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  getNotificationsByRole,
  markAsRead,
  markAllAsRead,
  formatNotificationTime,
} from '@/data/notifications';
import { Notification, NotificationType } from '@/types/notification';
import { cn } from '@/lib/utils';

const notificationIcons: Record<NotificationType, React.ReactNode> = {
  payment_due: <Clock className="h-5 w-5 text-warning" />,
  payment_received: <CreditCard className="h-5 w-5 text-success" />,
  message: <MessageSquare className="h-5 w-5 text-primary" />,
  document: <FileText className="h-5 w-5 text-brand" />,
  system: <Settings className="h-5 w-5 text-muted-foreground" />,
  task: <Bell className="h-5 w-5 text-primary" />,
  escrow: <Wallet className="h-5 w-5 text-success" />,
  delinquency: <AlertTriangle className="h-5 w-5 text-destructive" />,
};

const typeLabels: Record<NotificationType, string> = {
  payment_due: 'Payment Due',
  payment_received: 'Payment Received',
  message: 'Message',
  document: 'Document',
  system: 'System',
  task: 'Task',
  escrow: 'Escrow',
  delinquency: 'Delinquency',
};

export default function BorrowerNotificationsPage() {
  const [notifications, setNotifications] = useState(() =>
    getNotificationsByRole('borrower')
  );
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread' && n.read) return false;
    if (typeFilter !== 'all' && n.type !== typeFilter) return false;
    return true;
  });

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
    setNotifications(getNotificationsByRole('borrower'));
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead('borrower');
    setNotifications(getNotificationsByRole('borrower'));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Stay updated on your mortgage account activity"
      >
        {unreadCount > 0 && (
          <Button variant="outline" onClick={handleMarkAllAsRead}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters:</span>
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v as 'all' | 'unread')}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="unread">Unread ({unreadCount})</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="payment_due">Payment Due</SelectItem>
            <SelectItem value="payment_received">Payment Received</SelectItem>
            <SelectItem value="message">Messages</SelectItem>
            <SelectItem value="document">Documents</SelectItem>
            <SelectItem value="escrow">Escrow</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
        {(filter !== 'all' || typeFilter !== 'all') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setFilter('all');
              setTypeFilter('all');
            }}
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <Card className="p-12">
          <EmptyState
            icon={Bell}
            title="No notifications"
            description={
              filter === 'unread'
                ? "You're all caught up! No unread notifications."
                : 'No notifications match your current filters.'
            }
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

function NotificationCard({ notification, onMarkAsRead }: NotificationCardProps) {
  const icon = notificationIcons[notification.type];

  return (
    <Card
      className={cn(
        'cursor-pointer transition-colors hover:bg-accent/50',
        !notification.read && 'border-l-4 border-l-primary bg-primary/5'
      )}
      onClick={() => {
        if (!notification.read) {
          onMarkAsRead(notification.id);
        }
      }}
    >
      <CardContent className="flex items-start gap-4 p-4">
        <div className="flex-shrink-0 mt-1">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3
                  className={cn(
                    'text-sm',
                    !notification.read && 'font-semibold'
                  )}
                >
                  {notification.title}
                </h3>
                {!notification.read && (
                  <span className="h-2 w-2 rounded-full bg-primary" />
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {notification.message}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatNotificationTime(notification.date)}
              </span>
              {notification.priority === 'high' && (
                <Badge variant="destructive" className="text-xs">
                  Urgent
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="text-xs">
              {typeLabels[notification.type]}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
