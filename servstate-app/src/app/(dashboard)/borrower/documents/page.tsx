'use client';

import { useState } from 'react';
import { FileText, Download, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { mockLoans, getDocumentsByLoanId } from '@/data';
import { formatDate } from '@/lib/format';
import type { Document, DocumentType } from '@/types';

const documentTypeColors: Record<DocumentType, string> = {
  Statement: 'bg-blue-100 text-blue-800',
  Disclosure: 'bg-purple-100 text-purple-800',
  Correspondence: 'bg-gray-100 text-gray-800',
  Tax: 'bg-green-100 text-green-800',
  Legal: 'bg-red-100 text-red-800',
  Insurance: 'bg-yellow-100 text-yellow-800',
};

export default function BorrowerDocumentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const loan = mockLoans[0];
  const allDocuments = getDocumentsByLoanId(loan.id);

  const filteredDocuments = allDocuments.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || doc.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const documentTypes = [...new Set(allDocuments.map((d) => d.type))];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        description="View and download your loan documents"
      />

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

      {/* Documents Grid */}
      {filteredDocuments.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No documents found"
          description="Try adjusting your search or filter criteria"
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDocuments.map((doc) => (
            <Card key={doc.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(doc.date)} - {doc.size}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <Badge
                    variant="secondary"
                    className={documentTypeColors[doc.type]}
                  >
                    {doc.type}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
