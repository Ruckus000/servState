'use client';

import { FileText, History, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface GenerateDocumentDropdownProps {
  onSelectPayoff: () => void;
  onSelectHistory: () => void;
}

export function GenerateDocumentDropdown({
  onSelectPayoff,
  onSelectHistory,
}: GenerateDocumentDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <FileText className="mr-2 h-4 w-4" />
          Generate Document
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={onSelectPayoff}>
          <FileText className="mr-2 h-4 w-4 text-blue-600" />
          Payoff Statement
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onSelectHistory}>
          <History className="mr-2 h-4 w-4 text-purple-600" />
          Payment History
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
