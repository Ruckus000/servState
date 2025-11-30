'use client';

import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/format';

interface PaymentBreakdownProps {
  principal: number;
  interest: number;
  escrow: number;
  size?: number;
  className?: string;
}

export function PaymentBreakdownChart({
  principal,
  interest,
  escrow,
  size = 200,
  className,
}: PaymentBreakdownProps) {
  const total = principal + interest + escrow;
  const principalPercent = (principal / total) * 100;
  const interestPercent = (interest / total) * 100;
  const escrowPercent = (escrow / total) * 100;

  // Calculate stroke dash arrays for the donut chart
  const circumference = 2 * Math.PI * 40; // radius = 40
  const principalDash = (principalPercent / 100) * circumference;
  const interestDash = (interestPercent / 100) * circumference;
  const escrowDash = (escrowPercent / 100) * circumference;

  // Calculate offsets
  const principalOffset = 0;
  const interestOffset = -principalDash;
  const escrowOffset = -(principalDash + interestDash);

  return (
    <div className={cn('flex items-center gap-6', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" className="transform -rotate-90">
          {/* Principal */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="var(--primary)"
            strokeWidth="12"
            strokeDasharray={`${principalDash} ${circumference}`}
            strokeDashoffset={principalOffset}
          />
          {/* Interest */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="var(--chart-2)"
            strokeWidth="12"
            strokeDasharray={`${interestDash} ${circumference}`}
            strokeDashoffset={interestOffset}
          />
          {/* Escrow */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="var(--chart-3)"
            strokeWidth="12"
            strokeDasharray={`${escrowDash} ${circumference}`}
            strokeDashoffset={escrowOffset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs text-muted-foreground">Total</span>
          <span className="text-lg font-bold">{formatCurrency(total)}</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-primary" />
          <div className="flex flex-col">
            <span className="text-sm font-medium">Principal</span>
            <span className="text-xs text-muted-foreground">
              {formatCurrency(principal)} ({principalPercent.toFixed(1)}%)
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-chart-2" />
          <div className="flex flex-col">
            <span className="text-sm font-medium">Interest</span>
            <span className="text-xs text-muted-foreground">
              {formatCurrency(interest)} ({interestPercent.toFixed(1)}%)
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-chart-3" />
          <div className="flex flex-col">
            <span className="text-sm font-medium">Escrow</span>
            <span className="text-xs text-muted-foreground">
              {formatCurrency(escrow)} ({escrowPercent.toFixed(1)}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
