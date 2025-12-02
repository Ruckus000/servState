'use client';

import { useState, useMemo } from 'react';
import { FileText, Search, Filter, Upload as UploadIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { DocumentUploadZone } from '@/components/documents/DocumentUploadZone';
import { DocumentList } from '@/components/documents/DocumentList';
import { useDocuments } from '@/hooks/use-documents';
import type { DocumentType } from '@/types';

export default function BorrowerDocumentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showUpload, setShowUpload] = useState(false);

  // TODO: Get actual loan ID from user session/context
  // For now, using a hardcoded loan ID - replace with actual user's loan
  const loanId = '550e8400-e29b-41d4-a716-446655440000';

  const { data: documents = [], isLoading, refetch } = useDocuments(loanId);

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || doc.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [documents, searchTerm, typeFilter]);

  const documentTypes = useMemo(() => {
    return [...new Set(documents.map((d) => d.type))];
  }, [documents]);

  const handleUploadSuccess = () => {
    setShowUpload(false);
    refetch();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        description="View, upload, and download your loan documents"
      />

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <UploadIcon className="h-5 w-5" />
              Upload Documents
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowUpload(!showUpload)}
            >
              {showUpload ? 'Cancel' : 'Upload New'}
            </Button>
          </div>
        </CardHeader>
        {showUpload && (
          <CardContent>
            <DocumentUploadZone
              loanId={loanId}
              onUploadSuccess={handleUploadSuccess}
            />
          </CardContent>
        )}
      </Card>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {documentTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Your Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
            </div>
          ) : filteredDocuments.length === 0 && documents.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No documents uploaded yet"
              description="Upload your first document to get started"
            />
          ) : filteredDocuments.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No documents found"
              description="Try adjusting your search or filter criteria"
            />
          ) : (
            <DocumentList documents={filteredDocuments} isLoading={isLoading} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
