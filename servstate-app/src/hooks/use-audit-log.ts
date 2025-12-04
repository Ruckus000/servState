import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { AuditLogEntry } from '@/types';

async function fetchAuditLog(loanId?: string): Promise<AuditLogEntry[]> {
  const params = loanId ? `?loanId=${loanId}` : '';
  return api.get<AuditLogEntry[]>(`/api/audit-log${params}`);
}

export function useAuditLog(loanId?: string) {
  return useQuery({
    queryKey: loanId ? ['audit-log', loanId] : ['audit-log'],
    queryFn: () => fetchAuditLog(loanId),
  });
}

