import { Badge } from '@/components/ui/badge';
import { formatDateTime, formatDuration } from '@/lib/format';
import { Phone, Mail, FileText, MessageSquare, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import type { Correspondence } from '@/types';

interface CorrespondenceListProps {
  correspondence: Correspondence[];
}

const typeIcons = {
  call: Phone,
  email: Mail,
  letter: FileText,
  sms: MessageSquare,
};

const typeColors = {
  call: 'bg-blue-100 text-blue-700',
  email: 'bg-purple-100 text-purple-700',
  letter: 'bg-green-100 text-green-700',
  sms: 'bg-yellow-100 text-yellow-700',
};

export function CorrespondenceList({ correspondence }: CorrespondenceListProps) {
  if (correspondence.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">No correspondence records</p>
    );
  }

  return (
    <div className="space-y-4">
      {correspondence.map((record: any) => {
        const Icon = typeIcons[record.type as keyof typeof typeIcons] || FileText;
        const typeColorClass = typeColors[record.type as keyof typeof typeColors] || 'bg-gray-100 text-gray-700';

        return (
          <div
            key={record.id}
            className="rounded-lg border p-4"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${typeColorClass}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium capitalize">{record.type}</span>
                    <Badge variant={record.direction === 'inbound' ? 'secondary' : 'default'}>
                      {record.direction === 'inbound' ? (
                        <><ArrowDownLeft className="h-3 w-3 mr-1" /> Inbound</>
                      ) : (
                        <><ArrowUpRight className="h-3 w-3 mr-1" /> Outbound</>
                      )}
                    </Badge>
                    {record.outcome && (
                      <Badge variant="outline" className="text-xs">
                        {record.outcome}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {formatDateTime(record.date)}
                    {record.duration && ` • ${formatDuration(record.duration)}`}
                  </p>
                </div>
              </div>
            </div>

            {record.subject && (
              <p className="font-medium mb-2 ml-13">{record.subject}</p>
            )}

            {record.notes && (
              <p className="text-sm text-muted-foreground ml-13">{record.notes}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

