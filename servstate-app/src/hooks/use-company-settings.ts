import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import type { CompanySettings } from '@/types/company-settings';

/**
 * Fetch company settings from the admin API
 */
async function fetchCompanySettings(): Promise<CompanySettings> {
  return api.get<CompanySettings>('/api/admin/settings/company');
}

/**
 * Data structure for updating company settings
 */
export interface UpdateCompanySettingsData {
  company_name: string;
  company_tagline?: string | null;
  contact_email: string;
  contact_phone: string;
  wire_bank_name?: string | null;
  wire_routing_number?: string | null;
  wire_account_number?: string | null;
  wire_account_name?: string | null;
  fee_recording: number;
  fee_payoff_processing: number;
}

/**
 * Update company settings via the admin API
 */
async function updateCompanySettings(data: UpdateCompanySettingsData): Promise<CompanySettings> {
  return api.put<CompanySettings>('/api/admin/settings/company', data);
}

/**
 * Hook to fetch company settings
 * Only accessible to admin/servicer roles
 */
export function useCompanySettings() {
  return useQuery({
    queryKey: ['company-settings'],
    queryFn: fetchCompanySettings,
    staleTime: 60 * 1000, // Consider fresh for 1 minute
    retry: (failureCount, error) => {
      // Don't retry on 403 (forbidden - wrong role)
      if (error instanceof Error && error.message.includes('Forbidden')) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

/**
 * Hook to update company settings
 * Invalidates cache on success
 */
export function useUpdateCompanySettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCompanySettings,
    onSuccess: () => {
      toast.success('Company settings updated successfully');
      queryClient.invalidateQueries({ queryKey: ['company-settings'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update company settings');
    },
  });
}
