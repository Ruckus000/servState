export interface NotificationSettings {
  // Email notifications
  email_payment_reminder?: boolean;
  email_payment_reminder_days?: number;
  email_escrow_updates?: boolean;
  email_documents?: boolean;
  email_messages?: boolean;
  email_system_updates?: boolean;

  // Servicer-specific email notifications
  email_task_assigned?: boolean;
  email_delinquency_alert?: boolean;
  email_borrower_message?: boolean;
  email_modification_request?: boolean;
  email_document_uploaded?: boolean;

  // SMS notifications
  sms_enabled?: boolean;
  sms_phone?: string;
  sms_payment_reminder?: boolean;
  sms_alerts?: boolean;
  sms_critical_alerts?: boolean;

  // In-app notifications
  in_app_notifications?: boolean;
  notification_sound?: boolean;
  desktop_notifications?: boolean;

  // Alert settings
  critical_alerts_enabled?: boolean;
  warning_alerts_enabled?: boolean;
  info_alerts_enabled?: boolean;
  daily_digest_enabled?: boolean;
}

export interface CommunicationSettings {
  preferred_contact_method?: 'email' | 'phone' | 'sms' | 'in_app';
  contact_hours_enabled?: boolean;
  contact_start_time?: string; // HH:mm
  contact_end_time?: string;
  timezone?: string;
  language?: string;
  date_format?: 'MM/DD/YYYY' | 'DD/MM/YYYY';
  currency_format?: string;
}

export interface PreferenceSettings {
  // Dashboard
  dashboard_widgets?: Array<{
    id: string;
    enabled: boolean;
    order: number;
  }>;
  dashboard_layout?: 'balanced' | 'metrics_heavy' | 'list_heavy';

  // Documents
  auto_download_statements?: boolean;
  include_tax_documents?: boolean;
  archive_old_documents?: boolean;
  document_retention_months?: number;

  // Accessibility
  high_contrast_mode?: boolean;
  large_font_size?: boolean;
  reduce_animations?: boolean;
  screen_reader_optimized?: boolean;
  font_size_multiplier?: number;

  // Theme
  theme?: 'light' | 'dark' | 'auto';
  compact_view?: boolean;
}

export interface UserSettings {
  notifications?: NotificationSettings;
  communication?: CommunicationSettings;
  preferences?: PreferenceSettings;
}

export interface UpdateSettingsRequest {
  settings: UserSettings;
}
