'use client';

import { Building2, Shield, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/format';
import type { Loan } from '@/types/loan';

interface EscrowInfoCardProps {
  loan: Loan;
}

export function EscrowInfoCard({ loan }: EscrowInfoCardProps) {
  const monthlyPropertyTax = loan.property_tax_annual ? loan.property_tax_annual / 12 : 0;
  const monthlyHoi = loan.hoi_annual ? loan.hoi_annual / 12 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Escrow Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Property Taxes */}
        <div className="rounded-lg bg-gray-50 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
              <Building2 className="h-4 w-4 text-amber-600" />
            </div>
            <span className="font-medium text-sm">Property Taxes</span>
          </div>
          {loan.property_tax_exempt ? (
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              Tax Exempt
            </Badge>
          ) : loan.property_tax_annual ? (
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground">Annual</p>
                <p className="font-medium">{formatCurrency(loan.property_tax_annual)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Monthly</p>
                <p className="font-medium">{formatCurrency(monthlyPropertyTax)}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Not configured</p>
          )}
        </div>

        {/* Homeowners Insurance */}
        <div className="rounded-lg bg-gray-50 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
              <Shield className="h-4 w-4 text-blue-600" />
            </div>
            <span className="font-medium text-sm">Homeowners Insurance</span>
          </div>
          {loan.hoi_annual ? (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Annual</p>
                  <p className="font-medium">{formatCurrency(loan.hoi_annual)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Monthly</p>
                  <p className="font-medium">{formatCurrency(monthlyHoi)}</p>
                </div>
              </div>
              {loan.hoi_policy_number && (
                <div className="text-sm">
                  <p className="text-muted-foreground">Policy #</p>
                  <p className="font-medium">{loan.hoi_policy_number}</p>
                </div>
              )}
              {loan.hoi_expiration_date && (
                <div className="text-sm">
                  <p className="text-muted-foreground">Expires</p>
                  <p className="font-medium">{formatDate(loan.hoi_expiration_date)}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Not configured</p>
          )}
        </div>

        {/* Escrow Balance */}
        <div className="rounded-lg bg-gray-50 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100">
              <Wallet className="h-4 w-4 text-teal-600" />
            </div>
            <span className="font-medium text-sm">Escrow Balance</span>
          </div>
          <p className="text-2xl font-bold text-teal-600">
            {formatCurrency(loan.escrow_balance)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
