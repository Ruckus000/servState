'use client';

import { useState, useMemo } from 'react';
import { FileText, Search, Filter, Calendar } from 'lucide-react';
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
import { DocumentList } from '@/components/documents/DocumentList';
import { useDocuments } from '@/hooks/use-documents';
import type { DocumentType } from '@/types';

// Prevent static generation due to react-pdf DOMMatrix dependency
export const dynamic = 'force-dynamic';

// Type mapping for custom document groupings
const DOC_TYPE_GROUPS: Record<string, DocumentType[]> = {
  'Statements': ['Statement'],
  'Correspondence': ['Correspondence'],
  'Tax': ['Tax'],
  'Other': ['Disclosure', 'Legal', 'Insurance'],
};

const getTypesForGroup = (groupName: string): DocumentType[] => {
  return DOC_TYPE_GROUPS[groupName] || [];
};

// Helper functions for date filtering
function extractMonthYear(dateString: string): string {
  return dateString.substring(0, 7); // "2023-11" from "2023-11-15"
}

function formatMonthYear(monthYearStr: string): string {
  const [year, month] = monthYearStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function generateMonthYearOptions(documents: any[]): Array<{ value: string; label: string }> {
  const monthYearSet = new Set<string>();
  documents.forEach((doc) => {
    monthYearSet.add(extractMonthYear(doc.date));
  });

  return Array.from(monthYearSet)
    .sort()
    .reverse() // Newest first
    .map((monthYear) => ({
      value: monthYear,
      label: formatMonthYear(monthYear),
    }));
}

export default function BorrowerDocumentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [monthYearFilter, setMonthYearFilter] = useState<string>('all');

  // TODO: Get actual loan ID from user session/context
  // For now, using a hardcoded loan ID - replace with actual user's loan
  const loanId = '550e8400-e29b-41d4-a716-446655440000';

  const { data: documents = [], isLoading, refetch } = useDocuments(loanId);

  const monthYearOptions = useMemo(() => {
    return generateMonthYearOptions(documents);
  }, [documents]);

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      // Search filter
      const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());

      // Type filter with custom grouping
      let matchesType = true;
      if (typeFilter !== 'all') {
        const allowedTypes = getTypesForGroup(typeFilter);
        matchesType = allowedTypes.includes(doc.type);
      }

      // Month/Year filter
      let matchesMonthYear = true;
      if (monthYearFilter !== 'all') {
        const docMonthYear = extractMonthYear(doc.date);
        matchesMonthYear = docMonthYear === monthYearFilter;
      }

      return matchesSearch && matchesType && matchesMonthYear;
    });
  }, [documents, searchTerm, typeFilter, monthYearFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        description="View and download your loan documents"
      />

      {/* Filters - Two Row Layout */}
      <div className="space-y-3">
        {/* Row 1: Search Bar */}
        <div className="w-full">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Row 2: Type + Month/Year Filters */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Statements">Statements</SelectItem>
              <SelectItem value="Correspondence">Letters</SelectItem>
              <SelectItem value="Tax">Tax Documents</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>

          <Select value={monthYearFilter} onValueChange={setMonthYearFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="All Dates" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Dates</SelectItem>
              {monthYearOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
