import { useQuery } from '@tanstack/react-query';
import type { AuditLog } from '@/types';

async function fetchAuditLog(loanId?: string): Promise<AuditLog[]> {
  const params = loanId ? `?loanId=${loanId}` : '';
  const response = await fetch(`/api/audit-log${params}`);
  if (!response.ok) throw new Error('Failed to fetch audit log');
  return response.json();
}

export function useAuditLog(loanId?: string) {
  return useQuery({
    queryKey: loanId ? ['audit-log', loanId] : ['audit-log'],
    queryFn: () => fetchAuditLog(loanId),
  });
}

