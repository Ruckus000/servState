import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { sql } from '@/lib/db';
import { errorResponse, successResponse, requireCsrf } from '@/lib/api-helpers';
import { logAudit, computeChangedFields } from '@/lib/audit';
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

    // Compute changed fields for audit log
    const changedFields = existingSettings
      ? computeChangedFields(
          {
            company_name: existingSettings.company_name,
            company_tagline: existingSettings.company_tagline,
            contact_email: existingSettings.contact_email,
            contact_phone: existingSettings.contact_phone,
            wire_bank_name: existingSettings.wire_bank_name,
            wire_routing_number: existingSettings.wire_routing_number,
            wire_account_number: existingSettings.wire_account_number,
            wire_account_name: existingSettings.wire_account_name,
            fee_recording: Number(existingSettings.fee_recording),
            fee_payoff_processing: Number(existingSettings.fee_payoff_processing),
          },
          data
        )
      : [];

    // Create audit log entry (category auto-derived as 'internal')
    await logAudit({
      loanId: null, // Company settings are not loan-specific
      actionType: 'company_settings_updated',
      description: `Company settings updated: ${changedFields.map(c => c.field).join(', ') || 'no changes'}`,
      performedBy: user.name,
      details: {
        changed_fields: changedFields,
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
