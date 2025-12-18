import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type {
  DocumentSaveResponse,
  PayoffSaveRequest,
  PaymentHistorySaveRequest,
} from '@/types/document';

/**
 * Save a payoff statement to documents
 */
async function savePayoffDocument(
  loanId: string,
  params: PayoffSaveRequest
): Promise<DocumentSaveResponse> {
  return api.post<DocumentSaveResponse>(
    `/api/loans/${loanId}/documents/payoff/save`,
    params
  );
}

/**
 * Save a payment history document to documents
 */
async function savePaymentHistoryDocument(
  loanId: string,
  params: PaymentHistorySaveRequest
): Promise<DocumentSaveResponse> {
  return api.post<DocumentSaveResponse>(
    `/api/loans/${loanId}/documents/history/save`,
    params
  );
}

/**
 * Update document visibility (archive/restore)
 */
async function updateDocumentVisibility(
  documentId: string,
  visible: boolean
): Promise<{ document: { id: string; deleted_at: string | null }; action: string }> {
  return api.patch<{ document: { id: string; deleted_at: string | null }; action: string }>(
    `/api/documents/${documentId}/visibility`,
    { visible }
  );
}

/**
 * Get rate limit info for a loan
 */
interface RateLimitInfo {
  remaining: number;
  resetAt: number;
  limit: number;
  windowMinutes: number;
}

async function getRateLimitInfo(loanId: string): Promise<RateLimitInfo> {
  return api.get<RateLimitInfo>(`/api/loans/${loanId}/documents/payoff/save`);
}

/**
 * Hook for saving payoff statements
 */
export function useSavePayoffDocument(loanId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: PayoffSaveRequest) => savePayoffDocument(loanId, params),
    onSuccess: () => {
      // Invalidate documents list to show new document
      queryClient.invalidateQueries({ queryKey: ['documents', loanId] });
    },
  });
}

/**
 * Hook for saving payment history documents
 */
export function useSavePaymentHistoryDocument(loanId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: PaymentHistorySaveRequest) =>
      savePaymentHistoryDocument(loanId, params),
    onSuccess: () => {
      // Invalidate documents list to show new document
      queryClient.invalidateQueries({ queryKey: ['documents', loanId] });
    },
  });
}

/**
 * Hook for archiving/restoring documents
 */
export function useDocumentVisibility(loanId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentId, visible }: { documentId: string; visible: boolean }) =>
      updateDocumentVisibility(documentId, visible),
    onSuccess: () => {
      // Invalidate documents list to reflect visibility change
      queryClient.invalidateQueries({ queryKey: ['documents', loanId] });
    },
  });
}

/**
 * Hook for getting rate limit info
 */
export function useDocumentRateLimit(loanId: string) {
  const queryClient = useQueryClient();

  return {
    getRateLimit: () =>
      queryClient.fetchQuery({
        queryKey: ['document-rate-limit', loanId],
        queryFn: () => getRateLimitInfo(loanId),
        staleTime: 60 * 1000, // 1 minute
      }),
  };
}
