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

export default function ServicerSettingsPage() {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  const [notifications, setNotifications] = useState<NotificationSettings>({
    // Servicer-specific email notifications
    email_task_assigned: true,
    email_delinquency_alert: true,
    email_borrower_message: true,
    email_modification_request: true,
    email_document_uploaded: true,
    email_system_updates: false,
    // SMS notifications
    sms_enabled: false,
    sms_phone: '',
    sms_alerts: false,
    sms_critical_alerts: false,
    // In-app notifications
    in_app_notifications: true,
    notification_sound: true,
    desktop_notifications: true,
    // Alert settings
    critical_alerts_enabled: true,
    warning_alerts_enabled: true,
    info_alerts_enabled: true,
    daily_digest_enabled: true,
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
        description="Manage your notification and workflow preferences"
      />

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Settings
            </CardTitle>
            <CardDescription>
              Choose how and when you want to be notified about loan servicing activities
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
                    <Label htmlFor="email_task_assigned">Task Assignments</Label>
                    <p className="text-sm text-muted-foreground">
                      When a task is assigned to you
                    </p>
                  </div>
                  <input
                    id="email_task_assigned"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300"
                    checked={notifications.email_task_assigned}
                    onChange={() => handleToggle('email_task_assigned')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email_delinquency_alert">Delinquency Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      When a loan becomes delinquent
                    </p>
                  </div>
                  <input
                    id="email_delinquency_alert"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300"
                    checked={notifications.email_delinquency_alert}
                    onChange={() => handleToggle('email_delinquency_alert')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email_borrower_message">Borrower Messages</Label>
                    <p className="text-sm text-muted-foreground">
                      New messages from borrowers
                    </p>
                  </div>
                  <input
                    id="email_borrower_message"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300"
                    checked={notifications.email_borrower_message}
                    onChange={() => handleToggle('email_borrower_message')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email_modification_request">Modification Requests</Label>
                    <p className="text-sm text-muted-foreground">
                      When borrowers request loan modifications
                    </p>
                  </div>
                  <input
                    id="email_modification_request"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300"
                    checked={notifications.email_modification_request}
                    onChange={() => handleToggle('email_modification_request')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email_document_uploaded">Document Uploads</Label>
                    <p className="text-sm text-muted-foreground">
                      When borrowers upload documents
                    </p>
                  </div>
                  <input
                    id="email_document_uploaded"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300"
                    checked={notifications.email_document_uploaded}
                    onChange={() => handleToggle('email_document_uploaded')}
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
                      Show notifications while using the platform
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

            {/* Alert Priorities */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Alert Priorities</h3>

              <div className="space-y-3 ml-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="critical_alerts_enabled">Critical Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      High-priority alerts requiring immediate attention
                    </p>
                  </div>
                  <input
                    id="critical_alerts_enabled"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300"
                    checked={notifications.critical_alerts_enabled}
                    onChange={() => handleToggle('critical_alerts_enabled')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="warning_alerts_enabled">Warning Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Important alerts that need review
                    </p>
                  </div>
                  <input
                    id="warning_alerts_enabled"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300"
                    checked={notifications.warning_alerts_enabled}
                    onChange={() => handleToggle('warning_alerts_enabled')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="info_alerts_enabled">Info Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      General information and updates
                    </p>
                  </div>
                  <input
                    id="info_alerts_enabled"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300"
                    checked={notifications.info_alerts_enabled}
                    onChange={() => handleToggle('info_alerts_enabled')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="daily_digest_enabled">Daily Digest</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive a daily summary of all activity
                    </p>
                  </div>
                  <input
                    id="daily_digest_enabled"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300"
                    checked={notifications.daily_digest_enabled}
                    onChange={() => handleToggle('daily_digest_enabled')}
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
