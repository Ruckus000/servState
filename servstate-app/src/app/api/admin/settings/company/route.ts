import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { sql } from '@/lib/db';
import { errorResponse, successResponse, createAuditLogEntry, requireCsrf } from '@/lib/api-helpers';
import { invalidateConfigCache } from '@/lib/company-config';
import { companySettingsUpdateSchema } from '@/lib/schemas';
import type { CompanySettings } from '@/types/company-settings';

/**
 * GET /api/admin/settings/company
 * Fetch company settings (admin/servicer only)
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }

    const { user } = session;

    // Only admin/servicer can access company settings
    if (user.role !== 'admin' && user.role !== 'servicer') {
      return errorResponse('Forbidden', 403);
    }

    // Fetch company settings
    const result = await sql`SELECT * FROM company_settings LIMIT 1`;

    if (result.length === 0) {
      // Return defaults if no row exists
      return successResponse({
        company_name: 'ServState',
        company_tagline: 'Mortgage Servicing Solutions',
        contact_email: 'support@servstate.com',
        contact_phone: '(800) 555-0100',
        wire_bank_name: null,
        wire_routing_number: null,
        wire_account_number: null,
        wire_account_name: null,
        fee_recording: 75.0,
        fee_payoff_processing: 35.0,
      });
    }

    const settings = result[0] as unknown as CompanySettings;

    return successResponse({
      company_name: settings.company_name,
      company_tagline: settings.company_tagline,
      contact_email: settings.contact_email,
      contact_phone: settings.contact_phone,
      wire_bank_name: settings.wire_bank_name,
      wire_routing_number: settings.wire_routing_number,
      wire_account_number: settings.wire_account_number,
      wire_account_name: settings.wire_account_name,
      fee_recording: Number(settings.fee_recording),
      fee_payoff_processing: Number(settings.fee_payoff_processing),
      updated_at: settings.updated_at,
    });
  } catch (error) {
    console.error('Error fetching company settings:', error);
    return errorResponse('Failed to fetch company settings', 500);
  }
}

/**
 * PUT /api/admin/settings/company
 * Update company settings (admin/servicer only)
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }

    const { user } = session;

    // Only admin/servicer can update company settings
    if (user.role !== 'admin' && user.role !== 'servicer') {
      return errorResponse('Forbidden', 403);
    }

    // CSRF protection
    const csrfError = requireCsrf(request, user.id);
    if (csrfError) {
      return csrfError;
    }

    const body = await request.json();

    // Validate request body
    const parseResult = companySettingsUpdateSchema.safeParse(body);
    if (!parseResult.success) {
      return errorResponse(
        `Validation error: ${parseResult.error.issues.map((issue) => issue.message).join(', ')}`,
        400
      );
    }

    const data = parseResult.data;

    // Fetch existing settings for diff
    const existingResult = await sql`SELECT * FROM company_settings LIMIT 1`;
    const existingSettings = existingResult.length > 0
      ? existingResult[0] as unknown as CompanySettings
      : null;

    // Build update query
    const result = await sql`
      UPDATE company_settings
      SET
        company_name = ${data.company_name},
        company_tagline = ${data.company_tagline || null},
        contact_email = ${data.contact_email},
        contact_phone = ${data.contact_phone},
        wire_bank_name = ${data.wire_bank_name || null},
        wire_routing_number = ${data.wire_routing_number || null},
        wire_account_number = ${data.wire_account_number || null},
        wire_account_name = ${data.wire_account_name || null},
        fee_recording = ${data.fee_recording},
        fee_payoff_processing = ${data.fee_payoff_processing},
        updated_by = ${user.id},
        updated_at = NOW()
      RETURNING *
    `;

    if (result.length === 0) {
      return errorResponse('Company settings not found', 404);
    }

    // Invalidate cache
    invalidateConfigCache();

    // Calculate changed fields for audit log
    const changedFields: string[] = [];
    if (existingSettings) {
      if (existingSettings.company_name !== data.company_name) changedFields.push('company_name');
      if (existingSettings.company_tagline !== data.company_tagline) changedFields.push('company_tagline');
      if (existingSettings.contact_email !== data.contact_email) changedFields.push('contact_email');
      if (existingSettings.contact_phone !== data.contact_phone) changedFields.push('contact_phone');
      if (existingSettings.wire_bank_name !== data.wire_bank_name) changedFields.push('wire_bank_name');
      if (existingSettings.wire_routing_number !== data.wire_routing_number) changedFields.push('wire_routing_number');
      if (existingSettings.wire_account_number !== data.wire_account_number) changedFields.push('wire_account_number');
      if (existingSettings.wire_account_name !== data.wire_account_name) changedFields.push('wire_account_name');
      if (Number(existingSettings.fee_recording) !== data.fee_recording) changedFields.push('fee_recording');
      if (Number(existingSettings.fee_payoff_processing) !== data.fee_payoff_processing) changedFields.push('fee_payoff_processing');
    }

    // Create audit log entry
    await createAuditLogEntry({
      loanId: null, // Company settings are not loan-specific
      actionType: 'company_settings_updated',
      category: 'SETTINGS',
      description: `Company settings updated: ${changedFields.join(', ') || 'no changes'}`,
      performedBy: user.name,
      details: {
        changedFields,
        before: existingSettings
          ? {
              company_name: existingSettings.company_name,
              contact_email: existingSettings.contact_email,
              fee_recording: Number(existingSettings.fee_recording),
              fee_payoff_processing: Number(existingSettings.fee_payoff_processing),
            }
          : null,
        after: {
          company_name: data.company_name,
          contact_email: data.contact_email,
          fee_recording: data.fee_recording,
          fee_payoff_processing: data.fee_payoff_processing,
        },
      },
    });

    const updatedSettings = result[0] as unknown as CompanySettings;

    return successResponse({
      company_name: updatedSettings.company_name,
      company_tagline: updatedSettings.company_tagline,
      contact_email: updatedSettings.contact_email,
      contact_phone: updatedSettings.contact_phone,
      wire_bank_name: updatedSettings.wire_bank_name,
      wire_routing_number: updatedSettings.wire_routing_number,
      wire_account_number: updatedSettings.wire_account_number,
      wire_account_name: updatedSettings.wire_account_name,
      fee_recording: Number(updatedSettings.fee_recording),
      fee_payoff_processing: Number(updatedSettings.fee_payoff_processing),
      updated_at: updatedSettings.updated_at,
    });
  } catch (error) {
    console.error('Error updating company settings:', error);
    return errorResponse('Failed to update company settings', 500);
  }
}
