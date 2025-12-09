'use client';

import { useState, useMemo } from 'react';
import {
  CreditCard,
  User,
  Wallet,
  Phone,
  FileText,
  Activity,
  Shield,
  Home,
  ClipboardList,
  StickyNote,
  Lock,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Download,
  Calendar,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Card } from '@/components/ui/card';
import {
  AuditLogEntry,
  AuditActionCategory,
  actionTypeLabels,
  categoryLabels,
} from '@/types/audit-log';
import { formatDateTime } from '@/lib/format';
import { cn } from '@/lib/utils';

interface AuditLogTableProps {
  entries: AuditLogEntry[];
  className?: string;
}

const categoryIcons: Record<AuditActionCategory, React.ReactNode> = {
  payment: <CreditCard className="h-4 w-4" />,
  account: <User className="h-4 w-4" />,
  escrow: <Wallet className="h-4 w-4" />,
  communication: <Phone className="h-4 w-4" />,
  document: <FileText className="h-4 w-4" />,
  lifecycle: <Activity className="h-4 w-4" />,
  compliance: <Shield className="h-4 w-4" />,
  insurance: <Home className="h-4 w-4" />,
  collections: <ClipboardList className="h-4 w-4" />,
  internal: <StickyNote className="h-4 w-4" />,
  security: <Lock className="h-4 w-4" />,
};

const categoryColors: Record<AuditActionCategory, string> = {
  payment: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  account: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  escrow: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  communication: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  document: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  lifecycle: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  compliance: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  insurance: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  collections: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  internal: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  security: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
};

export function AuditLogTable({ entries, className }: AuditLogTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredEntries = useMemo(() => {
    let result = [...entries];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (entry) =>
          entry.description.toLowerCase().includes(query) ||
          entry.performed_by.toLowerCase().includes(query) ||
          actionTypeLabels[entry.action_type].toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      result = result.filter((entry) => entry.category === categoryFilter);
    }

    // Sort by date
    result.sort((a, b) => {
      const dateA = new Date(a.performed_at).getTime();
      const dateB = new Date(b.performed_at).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [entries, searchQuery, categoryFilter, sortOrder]);

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const handleExport = () => {
    const csvContent = [
      ['Date', 'Action', 'Category', 'Description', 'Performed By', 'Details'].join(','),
      ...filteredEntries.map((entry) =>
        [
          formatDateTime(entry.performed_at),
          actionTypeLabels[entry.action_type],
          categoryLabels[entry.category],
          `"${entry.description}"`,
          entry.performed_by,
          entry.details ? `"${JSON.stringify(entry.details)}"` : '',
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search actions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                <div className="flex items-center gap-2">
                  {categoryIcons[key as AuditActionCategory]}
                  {label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
        >
          <Calendar className="h-4 w-4 mr-2" />
          {sortOrder === 'desc' ? 'Newest first' : 'Oldest first'}
        </Button>

        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Showing {filteredEntries.length} of {entries.length} entries
      </p>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Date & Time</TableHead>
              <TableHead className="w-[160px]">Action</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[140px]">Performed By</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEntries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No audit log entries found
                </TableCell>
              </TableRow>
            ) : (
              filteredEntries.map((entry) => (
                <>
                  <TableRow
                    key={entry.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => entry.details && toggleRow(entry.id)}
                  >
                    <TableCell className="font-mono text-sm">
                      {formatDateTime(entry.performed_at)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn(
                          'font-normal gap-1.5',
                          categoryColors[entry.category]
                        )}
                      >
                        {categoryIcons[entry.category]}
                        <span className="truncate max-w-[100px]">
                          {actionTypeLabels[entry.action_type]}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[300px]">
                      <span className="line-clamp-1">{entry.description}</span>
                    </TableCell>
                    <TableCell className="text-sm">{entry.performed_by}</TableCell>
                    <TableCell>
                      {entry.details && (
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          {expandedRows.has(entry.id) ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                  {entry.details && expandedRows.has(entry.id) && (
                    <TableRow key={`${entry.id}-details`}>
                      <TableCell colSpan={5} className="bg-muted/30">
                        <div className="py-2 px-4">
                          <p className="text-xs font-medium text-muted-foreground mb-2">
                            Details
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                            {Object.entries(entry.details).map(([key, value]) => (
                              <div key={key}>
                                <span className="text-muted-foreground">
                                  {key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}:
                                </span>{' '}
                                <span className="font-medium">
                                  {typeof value === 'object'
                                    ? JSON.stringify(value)
                                    : String(value)}
                                </span>
                              </div>
                            ))}
                          </div>
                          {entry.reference_id && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Reference ID: {entry.reference_id}
                            </p>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
