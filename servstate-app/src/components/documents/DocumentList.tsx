'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { FileText, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useDownloadDocument, usePreviewDocument } from '@/hooks/use-documents';
import { formatDate, formatDateTime } from '@/lib/format';

// Dynamically import DocumentPreviewModal to avoid SSR issues with react-pdf
const DocumentPreviewModal = dynamic(() => import('./DocumentPreviewModal').then(mod => ({ default: mod.DocumentPreviewModal })), { ssr: false });
import { toast } from 'sonner';
import type { Document } from '@/types';

interface DocumentListProps {
  documents: Document[];
  isLoading?: boolean;
  showTimestamp?: boolean;
}

export function DocumentList({ documents, isLoading, showTimestamp = false }: DocumentListProps) {
  const [previewDocument, setPreviewDocument] = useState<{
    id: string;
    name: string;
    url: string;
  } | null>(null);

  const downloadMutation = useDownloadDocument();
  const previewMutation = usePreviewDocument();

  const handleDownload = async (documentId: string) => {
    try {
      await downloadMutation.mutateAsync(documentId);
      toast.success('Download started');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Download failed');
    }
  };

  const handlePreview = async (documentId: string, documentName: string) => {
    // Only preview PDFs
    const isPdf = documentName.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      toast.error('Preview is only available for PDF documents');
      return;
    }

    try {
      const url = await previewMutation.mutateAsync(documentId);
      setPreviewDocument({ id: documentId, name: documentName, url });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Preview failed');
    }
  };

  const closePreview = () => {
    setPreviewDocument(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center p-8 border-2 border-dashed rounded-lg">
        <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500">No documents uploaded yet</p>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date</TableHead>
              {showTimestamp && <TableHead>Uploaded</TableHead>}
              <TableHead>Size</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    {doc.name}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{doc.type}</Badge>
                </TableCell>
                <TableCell>{formatDate(doc.date)}</TableCell>
                {showTimestamp && (
                  <TableCell className="text-muted-foreground text-sm">
                    {doc.created_at ? formatDateTime(doc.created_at) : '-'}
                  </TableCell>
                )}
                <TableCell>{doc.size}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePreview(doc.id, doc.name)}
                      disabled={
                        previewMutation.isPending ||
                        !doc.name.toLowerCase().endsWith('.pdf')
                      }
                      title={
                        doc.name.toLowerCase().endsWith('.pdf')
                          ? 'Preview PDF'
                          : 'Preview only available for PDFs'
                      }
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(doc.id)}
                      disabled={downloadMutation.isPending}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Preview Modal */}
      {previewDocument && (
        <DocumentPreviewModal
          documentId={previewDocument.id}
          documentName={previewDocument.name}
          previewUrl={previewDocument.url}
          isOpen={true}
          onClose={closePreview}
        />
      )}
    </>
  );
}
