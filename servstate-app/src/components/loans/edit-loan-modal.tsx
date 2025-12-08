'use client';

import { useState, useEffect } from 'react';
import { Pencil, Loader2, DollarSign } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { usePatchLoan } from '@/hooks/use-loans';
import { formatCurrency } from '@/lib/format';
import type { Loan } from '@/types/loan';

interface EditLoanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loan: Loan;
  onSuccess?: () => void;
}

interface FormData {
  email: string;
  phone: string;
  address: string;
  next_due_date: string;
  property_tax_annual: string;
  property_tax_exempt: boolean;
  hoi_annual: string;
  hoi_policy_number: string;
  hoi_expiration_date: string;
  escrow_balance: string;
}

interface FormErrors {
  email?: string;
  phone?: string;
  address?: string;
  next_due_date?: string;
  property_tax_annual?: string;
  hoi_annual?: string;
  escrow_balance?: string;
}

export function EditLoanModal({ open, onOpenChange, loan, onSuccess }: EditLoanModalProps) {
  const patchLoan = usePatchLoan();

  const [formData, setFormData] = useState<FormData>({
    email: '',
    phone: '',
    address: '',
    next_due_date: '',
    property_tax_annual: '',
    property_tax_exempt: false,
    hoi_annual: '',
    hoi_policy_number: '',
    hoi_expiration_date: '',
    escrow_balance: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Initialize form data when loan changes or modal opens
  useEffect(() => {
    if (open && loan) {
      setFormData({
        email: loan.email || '',
        phone: loan.phone || '',
        address: loan.address || '',
        next_due_date: loan.next_due_date ? loan.next_due_date.split('T')[0] : '',
        property_tax_annual: loan.property_tax_annual?.toString() || '',
        property_tax_exempt: loan.property_tax_exempt || false,
        hoi_annual: loan.hoi_annual?.toString() || '',
        hoi_policy_number: loan.hoi_policy_number || '',
        hoi_expiration_date: loan.hoi_expiration_date ? loan.hoi_expiration_date.split('T')[0] : '',
        escrow_balance: loan.escrow_balance?.toString() || '',
      });
      setErrors({});
    }
  }, [open, loan]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Phone validation (basic)
    if (formData.phone && formData.phone.replace(/\D/g, '').length < 10) {
      newErrors.phone = 'Phone must be at least 10 digits';
    }

    // Currency validations
    if (formData.property_tax_annual && (isNaN(Number(formData.property_tax_annual)) || Number(formData.property_tax_annual) < 0)) {
      newErrors.property_tax_annual = 'Must be a positive number';
    }
    if (formData.hoi_annual && (isNaN(Number(formData.hoi_annual)) || Number(formData.hoi_annual) < 0)) {
      newErrors.hoi_annual = 'Must be a positive number';
    }
    if (formData.escrow_balance && isNaN(Number(formData.escrow_balance))) {
      newErrors.escrow_balance = 'Must be a valid number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    // Build update payload with only changed fields
    const updates: Partial<Loan> = {};

    if (formData.email !== loan.email) {
      updates.email = formData.email;
    }
    if (formData.phone !== loan.phone) {
      updates.phone = formData.phone;
    }
    if (formData.address !== loan.address) {
      updates.address = formData.address;
    }
    if (formData.next_due_date !== (loan.next_due_date?.split('T')[0] || '')) {
      updates.next_due_date = formData.next_due_date;
    }

    const newPropertyTax = formData.property_tax_annual ? Number(formData.property_tax_annual) : null;
    if (newPropertyTax !== loan.property_tax_annual) {
      updates.property_tax_annual = newPropertyTax;
    }
    if (formData.property_tax_exempt !== loan.property_tax_exempt) {
      updates.property_tax_exempt = formData.property_tax_exempt;
    }

    const newHoiAnnual = formData.hoi_annual ? Number(formData.hoi_annual) : null;
    if (newHoiAnnual !== loan.hoi_annual) {
      updates.hoi_annual = newHoiAnnual;
    }
    if (formData.hoi_policy_number !== (loan.hoi_policy_number || '')) {
      updates.hoi_policy_number = formData.hoi_policy_number || null;
    }
    if (formData.hoi_expiration_date !== (loan.hoi_expiration_date?.split('T')[0] || '')) {
      updates.hoi_expiration_date = formData.hoi_expiration_date || null;
    }

    const newEscrowBalance = formData.escrow_balance ? Number(formData.escrow_balance) : 0;
    if (newEscrowBalance !== loan.escrow_balance) {
      updates.escrow_balance = newEscrowBalance;
    }

    // Only send if there are changes
    if (Object.keys(updates).length === 0) {
      onOpenChange(false);
      return;
    }

    try {
      await patchLoan.mutateAsync({ id: loan.id, data: updates });
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to update loan:', error);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user edits field
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5" />
            Edit Loan
          </DialogTitle>
          <DialogDescription>
            Update loan information for {loan.borrower_name} - Loan #{loan.loan_number}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Borrower Contact Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Borrower Contact</h3>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="borrower@email.com"
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="(555) 123-4567"
              />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Mailing Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => updateField('address', e.target.value)}
                placeholder="123 Main St, City, ST 12345"
              />
              {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
            </div>
          </div>

          <Separator />

          {/* Payment Details Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Payment Details</h3>

            <div className="space-y-2">
              <Label htmlFor="next_due_date">Next Payment Due Date</Label>
              <Input
                id="next_due_date"
                type="date"
                value={formData.next_due_date}
                onChange={(e) => updateField('next_due_date', e.target.value)}
              />
            </div>
          </div>

          <Separator />

          {/* Escrow Information Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Escrow Information</h3>

            <div className="space-y-2">
              <Label htmlFor="property_tax_annual">Annual Property Tax</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="property_tax_annual"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.property_tax_annual}
                  onChange={(e) => updateField('property_tax_annual', e.target.value)}
                  className="pl-8"
                  placeholder="0.00"
                  disabled={formData.property_tax_exempt}
                />
              </div>
              {errors.property_tax_annual && <p className="text-sm text-destructive">{errors.property_tax_annual}</p>}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="property_tax_exempt"
                checked={formData.property_tax_exempt}
                onCheckedChange={(checked) => {
                  updateField('property_tax_exempt', checked as boolean);
                  if (checked) {
                    updateField('property_tax_annual', '');
                  }
                }}
              />
              <Label htmlFor="property_tax_exempt" className="text-sm font-normal cursor-pointer">
                Property is tax exempt
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hoi_annual">Annual Homeowners Insurance</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="hoi_annual"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.hoi_annual}
                  onChange={(e) => updateField('hoi_annual', e.target.value)}
                  className="pl-8"
                  placeholder="0.00"
                />
              </div>
              {errors.hoi_annual && <p className="text-sm text-destructive">{errors.hoi_annual}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="escrow_balance">Current Escrow Balance</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="escrow_balance"
                  type="number"
                  step="0.01"
                  value={formData.escrow_balance}
                  onChange={(e) => updateField('escrow_balance', e.target.value)}
                  className="pl-8"
                  placeholder="0.00"
                />
              </div>
              {errors.escrow_balance && <p className="text-sm text-destructive">{errors.escrow_balance}</p>}
            </div>
          </div>

          <Separator />

          {/* Insurance Policy Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Insurance Policy (Optional)</h3>

            <div className="space-y-2">
              <Label htmlFor="hoi_policy_number">Policy Number</Label>
              <Input
                id="hoi_policy_number"
                value={formData.hoi_policy_number}
                onChange={(e) => updateField('hoi_policy_number', e.target.value)}
                placeholder="POL-123456789"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hoi_expiration_date">Policy Expiration Date</Label>
              <Input
                id="hoi_expiration_date"
                type="date"
                value={formData.hoi_expiration_date}
                onChange={(e) => updateField('hoi_expiration_date', e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose} disabled={patchLoan.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={patchLoan.isPending}>
            {patchLoan.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
