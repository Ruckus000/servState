'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, Phone, CreditCard, DollarSign, Save, Loader2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { PageHeader } from '@/components/shared/page-header';
import { useCompanySettings, useUpdateCompanySettings } from '@/hooks/use-company-settings';
import { companySettingsUpdateSchema } from '@/lib/schemas';

type FormData = z.infer<typeof companySettingsUpdateSchema>;

export default function AdminCompanySettingsPage() {
  const { data: settings, isLoading, error } = useCompanySettings();
  const updateSettings = useUpdateCompanySettings();
  const [hasChanges, setHasChanges] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(companySettingsUpdateSchema),
    defaultValues: {
      company_name: '',
      company_tagline: '',
      contact_email: '',
      contact_phone: '',
      wire_bank_name: '',
      wire_routing_number: '',
      wire_account_number: '',
      wire_account_name: '',
      fee_recording: 75,
      fee_payoff_processing: 35,
    },
  });

  // Populate form when settings load
  useEffect(() => {
    if (settings) {
      reset({
        company_name: settings.company_name,
        company_tagline: settings.company_tagline || '',
        contact_email: settings.contact_email,
        contact_phone: settings.contact_phone,
        wire_bank_name: settings.wire_bank_name || '',
        wire_routing_number: settings.wire_routing_number || '',
        wire_account_number: settings.wire_account_number || '',
        wire_account_name: settings.wire_account_name || '',
        fee_recording: Number(settings.fee_recording),
        fee_payoff_processing: Number(settings.fee_payoff_processing),
      });
    }
  }, [settings, reset]);

  // Track form changes
  useEffect(() => {
    const subscription = watch(() => setHasChanges(true));
    return () => subscription.unsubscribe();
  }, [watch]);

  const onSubmit = async (data: FormData) => {
    await updateSettings.mutateAsync(data);
    setHasChanges(false);
  };

  // Check if wire instructions are complete
  const wireValues = watch(['wire_bank_name', 'wire_routing_number', 'wire_account_number', 'wire_account_name']);
  const isWireComplete = wireValues.every((v: string | null | undefined) => v && String(v).trim() !== '');
  const isWirePartial = wireValues.some((v: string | null | undefined) => v && String(v).trim() !== '') && !isWireComplete;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <p className="text-lg font-medium">Unable to load company settings</p>
        <p className="text-sm text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Company Settings"
        description="Configure company information, contact details, wire instructions, and fees"
      />

      {hasChanges && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-amber-800 text-sm">
          You have unsaved changes. Don&apos;t forget to save before leaving this page.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Company Information
            </CardTitle>
            <CardDescription>
              Basic company branding displayed on documents and communications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name *</Label>
                <Input
                  id="company_name"
                  {...register('company_name')}
                  placeholder="ServState"
                  aria-invalid={!!errors.company_name}
                />
                {errors.company_name && (
                  <p className="text-sm text-destructive">{errors.company_name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="company_tagline">Tagline</Label>
                <Input
                  id="company_tagline"
                  {...register('company_tagline')}
                  placeholder="Mortgage Servicing Solutions"
                />
                {errors.company_tagline && (
                  <p className="text-sm text-destructive">{errors.company_tagline.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Contact Details
            </CardTitle>
            <CardDescription>
              Contact information displayed on statements and documents
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contact_email">Email Address *</Label>
                <Input
                  id="contact_email"
                  type="email"
                  {...register('contact_email')}
                  placeholder="support@servstate.com"
                  aria-invalid={!!errors.contact_email}
                />
                {errors.contact_email && (
                  <p className="text-sm text-destructive">{errors.contact_email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_phone">Phone Number *</Label>
                <Input
                  id="contact_phone"
                  type="tel"
                  {...register('contact_phone')}
                  placeholder="(800) 555-0100"
                  aria-invalid={!!errors.contact_phone}
                />
                {errors.contact_phone && (
                  <p className="text-sm text-destructive">{errors.contact_phone.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wire Transfer Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Wire Transfer Instructions
            </CardTitle>
            <CardDescription>
              Banking details displayed on payoff statements for wire transfers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Warning Banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium">Sensitive Information</p>
                <p className="mt-1">
                  Wire instructions are displayed on payoff statements sent to borrowers.
                  Ensure this information is accurate to prevent misdirected payments.
                </p>
              </div>
            </div>

            {!isWireComplete && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-800">
                  <p className="font-medium">Wire Instructions Incomplete</p>
                  <p className="mt-1">
                    {isWirePartial
                      ? 'Wire instructions are partially configured. Complete all fields to enable payoff statement generation.'
                      : 'Wire instructions are not configured. Payoff statement generation will be blocked until all fields are completed.'}
                  </p>
                </div>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="wire_bank_name">Bank Name</Label>
                <Input
                  id="wire_bank_name"
                  {...register('wire_bank_name')}
                  placeholder="First National Bank"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wire_routing_number">Routing Number</Label>
                <Input
                  id="wire_routing_number"
                  {...register('wire_routing_number')}
                  placeholder="123456789"
                  maxLength={9}
                  aria-invalid={!!errors.wire_routing_number}
                />
                {errors.wire_routing_number && (
                  <p className="text-sm text-destructive">{errors.wire_routing_number.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="wire_account_number">Account Number</Label>
                <Input
                  id="wire_account_number"
                  {...register('wire_account_number')}
                  placeholder="987654321"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wire_account_name">Account Name</Label>
                <Input
                  id="wire_account_name"
                  {...register('wire_account_name')}
                  placeholder="ServState Operating Account"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fee Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Fee Configuration
            </CardTitle>
            <CardDescription>
              Standard fees applied to payoff calculations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fee_recording">Recording Fee *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="fee_recording"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('fee_recording', { valueAsNumber: true })}
                    className="pl-7"
                    aria-invalid={!!errors.fee_recording}
                  />
                </div>
                {errors.fee_recording && (
                  <p className="text-sm text-destructive">{errors.fee_recording.message}</p>
                )}
                <p className="text-xs text-muted-foreground">Fee charged for recording the satisfaction of mortgage</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fee_payoff_processing">Payoff Processing Fee *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="fee_payoff_processing"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('fee_payoff_processing', { valueAsNumber: true })}
                    className="pl-7"
                    aria-invalid={!!errors.fee_payoff_processing}
                  />
                </div>
                {errors.fee_payoff_processing && (
                  <p className="text-sm text-destructive">{errors.fee_payoff_processing.message}</p>
                )}
                <p className="text-xs text-muted-foreground">Fee charged for processing the payoff request</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={updateSettings.isPending}
            size="lg"
          >
            {updateSettings.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
