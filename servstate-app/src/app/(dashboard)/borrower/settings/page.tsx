'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2, Bell, Mail, Smartphone } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { PageHeader } from '@/components/shared/page-header';
import { useSettings, useUpdateSettings } from '@/hooks/use-settings';
import { toast } from 'sonner';
import type { NotificationSettings } from '@/types/settings';

export default function BorrowerSettingsPage() {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  const [notifications, setNotifications] = useState<NotificationSettings>({
    email_payment_reminder: true,
    email_payment_reminder_days: 5,
    email_escrow_updates: true,
    email_documents: true,
    email_messages: true,
    email_system_updates: false,
    sms_enabled: false,
    sms_phone: '',
    sms_payment_reminder: false,
    sms_alerts: false,
    sms_critical_alerts: false,
    in_app_notifications: true,
    notification_sound: true,
    desktop_notifications: false,
    critical_alerts_enabled: true,
    warning_alerts_enabled: true,
    info_alerts_enabled: true,
    daily_digest_enabled: false,
  });

  // Populate form when settings load
  useEffect(() => {
    if (settings?.notifications) {
      setNotifications((prev) => ({
        ...prev,
        ...settings.notifications,
      }));
    }
  }, [settings]);

  const handleToggle = (field: keyof NotificationSettings) => {
    setNotifications((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleChange = (field: keyof NotificationSettings, value: string | number) => {
    setNotifications((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateSettings.mutateAsync({
        notifications,
      });
      toast.success('Settings updated successfully');
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your notification preferences"
      />

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Settings
            </CardTitle>
            <CardDescription>
              Choose how and when you want to be notified about important updates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email Notifications */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">Email Notifications</h3>
              </div>

              <div className="space-y-3 ml-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email_payment_reminder">Payment Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified before your payment is due
                    </p>
                  </div>
                  <input
                    id="email_payment_reminder"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300"
                    checked={notifications.email_payment_reminder}
                    onChange={() => handleToggle('email_payment_reminder')}
                  />
                </div>

                {notifications.email_payment_reminder && (
                  <div className="ml-6 flex items-center gap-2">
                    <Label htmlFor="reminder_days" className="text-sm">Remind me</Label>
                    <input
                      id="reminder_days"
                      type="number"
                      min="1"
                      max="30"
                      className="w-16 rounded-md border border-input px-2 py-1 text-sm"
                      value={notifications.email_payment_reminder_days}
                      onChange={(e) => handleChange('email_payment_reminder_days', parseInt(e.target.value))}
                    />
                    <span className="text-sm text-muted-foreground">days before due date</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email_escrow_updates">Escrow Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Notifications about escrow account changes
                    </p>
                  </div>
                  <input
                    id="email_escrow_updates"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300"
                    checked={notifications.email_escrow_updates}
                    onChange={() => handleToggle('email_escrow_updates')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email_documents">New Documents</Label>
                    <p className="text-sm text-muted-foreground">
                      When new documents are available
                    </p>
                  </div>
                  <input
                    id="email_documents"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300"
                    checked={notifications.email_documents}
                    onChange={() => handleToggle('email_documents')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email_messages">Messages</Label>
                    <p className="text-sm text-muted-foreground">
                      New messages from your servicer
                    </p>
                  </div>
                  <input
                    id="email_messages"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300"
                    checked={notifications.email_messages}
                    onChange={() => handleToggle('email_messages')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email_system_updates">System Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Product updates and announcements
                    </p>
                  </div>
                  <input
                    id="email_system_updates"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300"
                    checked={notifications.email_system_updates}
                    onChange={() => handleToggle('email_system_updates')}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* SMS Notifications */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">SMS Notifications</h3>
              </div>

              <div className="space-y-3 ml-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="sms_enabled">Enable SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive text message alerts
                    </p>
                  </div>
                  <input
                    id="sms_enabled"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300"
                    checked={notifications.sms_enabled}
                    onChange={() => handleToggle('sms_enabled')}
                  />
                </div>

                {notifications.sms_enabled && (
                  <>
                    <div className="ml-6 space-y-2">
                      <Label htmlFor="sms_phone" className="text-sm">Phone Number</Label>
                      <input
                        id="sms_phone"
                        type="tel"
                        className="w-full rounded-md border border-input px-3 py-2 text-sm"
                        placeholder="(555) 123-4567"
                        value={notifications.sms_phone}
                        onChange={(e) => handleChange('sms_phone', e.target.value)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="sms_payment_reminder">Payment Reminders</Label>
                      <input
                        id="sms_payment_reminder"
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300"
                        checked={notifications.sms_payment_reminder}
                        onChange={() => handleToggle('sms_payment_reminder')}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="sms_critical_alerts">Critical Alerts Only</Label>
                      <input
                        id="sms_critical_alerts"
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300"
                        checked={notifications.sms_critical_alerts}
                        onChange={() => handleToggle('sms_critical_alerts')}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            <Separator />

            {/* In-App Notifications */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">In-App Notifications</h3>
              </div>

              <div className="space-y-3 ml-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="in_app_notifications">Enable In-App Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Show notifications while using the app
                    </p>
                  </div>
                  <input
                    id="in_app_notifications"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300"
                    checked={notifications.in_app_notifications}
                    onChange={() => handleToggle('in_app_notifications')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="notification_sound">Notification Sound</Label>
                  <input
                    id="notification_sound"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300"
                    checked={notifications.notification_sound}
                    onChange={() => handleToggle('notification_sound')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="desktop_notifications">Desktop Notifications</Label>
                  <input
                    id="desktop_notifications"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300"
                    checked={notifications.desktop_notifications}
                    onChange={() => handleToggle('desktop_notifications')}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={updateSettings.isPending}
              >
                {updateSettings.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
