import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { Document, DocumentUploadResponse, DocumentDownloadResponse } from '@/types';

async function fetchDocuments(loanId: string): Promise<Document[]> {
  return api.get<Document[]>(`/api/documents?loanId=${loanId}`);
}

interface UploadDocumentParams {
  loan_id: string;
  name: string;
  type: string;
  size: number;
  contentType: string;
  file: File; // The actual file to upload
}

async function uploadDocument(params: UploadDocumentParams): Promise<Document> {
  const { file, ...metadata } = params;

  // Step 1: Get presigned URL from API (with CSRF protection)
  const data = await api.post<DocumentUploadResponse>('/api/documents', metadata);

  // Step 2: Upload file directly to S3 using presigned URL
  // Note: S3 presigned URLs don't need CSRF - they're time-limited and pre-authorized
  const uploadResponse = await fetch(data.uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': params.contentType,
    },
    body: file,
  });

  if (!uploadResponse.ok) {
    throw new Error('Failed to upload file to storage');
  }

  // Step 3: Return document metadata
  return data.document;
}

async function downloadDocument(documentId: string): Promise<void> {
  // Get presigned download URL
  const data = await api.get<DocumentDownloadResponse>(`/api/documents/${documentId}/download`);

  // Trigger download in browser
  const link = document.createElement('a');
  link.href = data.downloadUrl;
  link.download = data.filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

async function getPreviewUrl(documentId: string): Promise<string> {
  // Get presigned download URL (same endpoint, but return URL instead of triggering download)
  const data = await api.get<DocumentDownloadResponse>(`/api/documents/${documentId}/download`);
  return data.downloadUrl;
}

export function useDocuments(loanId: string) {
  return useQuery({
    queryKey: ['documents', loanId],
    queryFn: () => fetchDocuments(loanId),
    enabled: !!loanId,
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadDocument,
    onSuccess: (_, variables) => {
      // Invalidate and refetch documents for this loan
      queryClient.invalidateQueries({ queryKey: ['documents', variables.loan_id] });
    },
  });
}

export function useDownloadDocument() {
  return useMutation({
    mutationFn: downloadDocument,
  });
}

export function usePreviewDocument() {
  return useMutation({
    mutationFn: getPreviewUrl,
  });
}









