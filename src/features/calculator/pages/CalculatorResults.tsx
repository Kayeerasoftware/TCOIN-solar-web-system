import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { submitLead } from '@/api/endpoints/crm';
import { StatCard } from '@/components/data/StatCard';
import { SuccessBanner } from '@/components/feedback/SuccessBanner';
import { FormField } from '@/components/forms/FormField';
import { TextInput } from '@/components/forms/controls';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { applyServerErrors } from '@/lib/forms';
import { formatNumber } from '@/lib/money';
import { SizingInputError } from '@/sizing';
import { runEstimate } from '../estimate';
import { leadCaptureSchema, type LeadCaptureForm } from '../schemas';
import type { CalculatorInput } from '../types';

export default function CalculatorResults() {
  const input = (useLocation().state as { input?: CalculatorInput } | null)?.input;
  const result = useMemo(() => {
    if (!input) return null;
    try {
      return runEstimate(input);
    } catch (e) {
      return e instanceof SizingInputError ? e : null;
    }
  }, [input]);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LeadCaptureForm>({ resolver: zodResolver(leadCaptureSchema) });
  const send = useMutation({
    mutationFn: (v: LeadCaptureForm) =>
      submitLead({
        full_name: v.full_name,
        phone: v.phone || undefined,
        email: v.email || undefined,
        location: input?.district,
        service_interest: 'design',
        source_code: 'web_calculator',
        calculator_input: input,
        calculator_result: result,
        consent_marketing: v.consent,
      }),
    onError: (e) => applyServerErrors(e, setError),
  });

  if (!input) return <Navigate to="/calculator" replace />;
  if (!result || result instanceof SizingInputError) {
    return (
      <div className="mx-auto max-w-3xl p-4">
        <p role="alert" className="text-brand-red">
          We could not size that. Check your numbers.
        </p>
        <Link to="/calculator" className="text-brand-green underline">
          Back to the calculator
        </Link>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4">
      <h1 className="text-2xl font-bold text-brand-green">Your estimate</h1>
      <div className="grid gap-3 sm:grid-cols-2">
        <StatCard
          label="Estimated system"
          value={`${formatNumber(result.arrayKwp, 1)} kWp solar`}
          hint={`${result.panels} panels of ${550} W`}
        />
        <StatCard
          label="Battery"
          value={result.batteryKwh ? `${formatNumber(result.batteryKwh, 1)} kWh` : 'None'}
          hint={`Inverter about ${formatNumber(result.inverterKw, 1)} kW`}
        />
        <StatCard
          label="Price range"
          value={`UGX ${formatNumber(result.priceLow)} to ${formatNumber(result.priceHigh)}`}
        />
        <StatCard
          label="Savings per year"
          value={`UGX ${formatNumber(result.annualSavings)}`}
          hint={
            result.paybackYearsLow
              ? `Payback about ${result.paybackYearsLow} to ${result.paybackYearsHigh} years`
              : undefined
          }
        />
      </div>
      <p className="text-sm italic text-ink-muted">
        {result.disclaimer} Prices and sun hours here are indicative.
      </p>
      {send.isSuccess ? (
        <SuccessBanner
          title="Thank you. We will call you soon."
          message={`Your reference is ${send.data.lead_no}. An engineer will confirm the design after a site survey.`}
        />
      ) : (
        <Card title="Get your detailed quote">
          <form onSubmit={handleSubmit((v) => send.mutate(v))} noValidate aria-label="Get my detailed quote">
            {errors.root && (
              <p role="alert" className="mb-2 text-brand-red">
                {errors.root.message}
              </p>
            )}
            <FormField label="Your name" htmlFor="full_name" error={errors.full_name?.message}>
              <TextInput id="full_name" invalid={!!errors.full_name} {...register('full_name')} />
            </FormField>
            <FormField label="Phone" htmlFor="phone" error={errors.phone?.message}>
              <TextInput id="phone" type="tel" invalid={!!errors.phone} {...register('phone')} />
            </FormField>
            <FormField label="Email (optional)" htmlFor="email" error={errors.email?.message}>
              <TextInput id="email" type="email" {...register('email')} />
            </FormField>
            <label className="mb-3 flex items-center gap-2 text-sm">
              <input type="checkbox" {...register('consent')} /> I agree that TCOIN may contact me about this
              quote
            </label>
            <Button type="submit" busy={send.isPending}>
              Send me the detailed quote
            </Button>
          </form>
        </Card>
      )}
      <Link to="/calculator" className="text-brand-green underline">
        Change my answers
      </Link>
    </div>
  );
}
