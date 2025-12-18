'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { FileText, Download, Eye, Archive, ArchiveRestore, Sparkles } from 'lucide-react';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useDownloadDocument, usePreviewDocument } from '@/hooks/use-documents';
import { useDocumentVisibility } from '@/hooks/use-document-save';
import { formatDate, formatDateTime } from '@/lib/format';

// Dynamically import DocumentPreviewModal to avoid SSR issues with react-pdf
const DocumentPreviewModal = dynamic(() => import('./DocumentPreviewModal').then(mod => ({ default: mod.DocumentPreviewModal })), { ssr: false });
import { toast } from 'sonner';
import type { Document } from '@/types';

interface DocumentListProps {
  documents: Document[];
  loanId: string;
  isLoading?: boolean;
  showTimestamp?: boolean;
  /** User role - archive/restore only available for servicers and admins */
  userRole?: 'borrower' | 'servicer' | 'admin';
  /** Show archived documents (only for servicers/admins) */
  showArchived?: boolean;
}

export function DocumentList({
  documents,
  loanId,
  isLoading,
  showTimestamp = false,
  userRole = 'borrower',
  showArchived = false,
}: DocumentListProps) {
  const [previewDocument, setPreviewDocument] = useState<{
    id: string;
    name: string;
    url: string;
  } | null>(null);

  const downloadMutation = useDownloadDocument();
  const previewMutation = usePreviewDocument();
  const visibilityMutation = useDocumentVisibility(loanId);

  const canArchive = userRole === 'servicer' || userRole === 'admin';

  // Filter documents based on visibility and user role
  const filteredDocuments = documents.filter((doc) => {
    if (canArchive && showArchived) {
      return true; // Show all for servicers when showArchived is true
    }
    return !doc.deleted_at; // Hide archived documents for borrowers
  });

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

  const handleToggleArchive = async (doc: Document) => {
    const isArchived = !!doc.deleted_at;

    try {
      await visibilityMutation.mutateAsync({
        documentId: doc.id,
        visible: isArchived, // If archived, set visible=true to restore
      });

      if (isArchived) {
        toast.success(`"${doc.name}" restored`);
      } else {
        toast.success(`"${doc.name}" archived`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update document';

      // Handle retention period error
      if (message.includes('retention period')) {
        toast.error(message);
      } else {
        toast.error(message);
      }
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
            {filteredDocuments.map((doc) => {
              const isArchived = !!doc.deleted_at;
              const isGenerated = !!doc.generated_by;

              return (
              <TableRow key={doc.id} className={isArchived ? 'opacity-60' : ''}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className={isArchived ? 'line-through' : ''}>{doc.name}</span>
                    {isGenerated && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge variant="outline" className="text-xs gap-1 text-purple-600 border-purple-200">
                              <Sparkles className="h-3 w-3" />
                              Generated
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Auto-generated by the system</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    {isArchived && (
                      <Badge variant="secondary" className="text-xs">Archived</Badge>
                    )}
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
                    {canArchive && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleArchive(doc)}
                              disabled={visibilityMutation.isPending}
                            >
                              {isArchived ? (
                                <ArchiveRestore className="h-4 w-4 text-green-600" />
                              ) : (
                                <Archive className="h-4 w-4 text-gray-500" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{isArchived ? 'Restore document' : 'Archive document'}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </TableCell>
              </TableRow>
              );
            })}
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
