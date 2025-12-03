import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Document, DocumentUploadResponse, DocumentDownloadResponse } from '@/types';

async function fetchDocuments(loanId: string): Promise<Document[]> {
  const response = await fetch(`/api/documents?loanId=${loanId}`);
  if (!response.ok) throw new Error('Failed to fetch documents');
  return response.json();
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

  // Step 1: Get presigned URL from API
  const response = await fetch('/api/documents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(metadata),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to initiate upload');
  }

  const data: DocumentUploadResponse = await response.json();

  // Step 2: Upload file directly to S3 using presigned URL
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

  // Step 3: Return document metadata (optimistic - no confirmation needed)
  return data.document;
}

async function downloadDocument(documentId: string): Promise<void> {
  // Get presigned download URL
  const response = await fetch(`/api/documents/${documentId}/download`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get download URL');
  }

  const data: DocumentDownloadResponse = await response.json();

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
  const response = await fetch(`/api/documents/${documentId}/download`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get preview URL');
  }

  const data: DocumentDownloadResponse = await response.json();
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



