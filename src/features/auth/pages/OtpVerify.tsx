import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { requestOtp, verifyOtp } from '@/api/endpoints/auth';
import { FormField } from '@/components/forms/FormField';
import { TextInput } from '@/components/forms/controls';
import { Button } from '@/components/ui/Button';
import { completeLogin, homeFor } from '../session';
import { codeSchema, phoneSchema } from '../schemas';

/** Customers sign in with a one-time code sent to their phone. */
export default function OtpVerify() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState<string | null>(null);
  const phoneForm = useForm<{ phone: string }>({ resolver: zodResolver(phoneSchema) });
  const codeForm = useForm<{ code: string }>({ resolver: zodResolver(codeSchema) });

  const send = useMutation({ mutationFn: (p: string) => requestOtp(p), onSuccess: (_d, p) => setPhone(p) });
  const verify = useMutation({
    mutationFn: (code: string) => verifyOtp(phone!, code),
    onSuccess: async (t) => navigate(homeFor(await completeLogin(t)), { replace: true }),
    onError: (e: Error) => codeForm.setError('code', { message: e.message }),
  });

  if (!phone) {
    return (
      <form
        onSubmit={phoneForm.handleSubmit((v) => send.mutate(v.phone))}
        noValidate
        aria-label="Request code"
      >
        <h1 className="mb-4 text-xl font-bold text-brand-green">Sign in with a phone code</h1>
        <FormField
          label="Phone number"
          htmlFor="phone"
          error={phoneForm.formState.errors.phone?.message}
          hint="For example +256 700 111 222"
        >
          <TextInput
            id="phone"
            type="tel"
            invalid={!!phoneForm.formState.errors.phone}
            {...phoneForm.register('phone')}
          />
        </FormField>
        <Button type="submit" busy={send.isPending} className="w-full">
          Send code
        </Button>
        <p className="mt-4 text-center text-sm">
          <Link to="/login" className="text-brand-green underline">
            Use email and password
          </Link>
        </p>
      </form>
    );
  }
  return (
    <form onSubmit={codeForm.handleSubmit((v) => verify.mutate(v.code))} noValidate aria-label="Verify code">
      <h1 className="mb-1 text-xl font-bold text-brand-green">Enter your code</h1>
      <p className="mb-4 text-sm text-ink-muted">We sent a code to {phone}.</p>
      <FormField label="Code" htmlFor="code" error={codeForm.formState.errors.code?.message}>
        <TextInput
          id="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          invalid={!!codeForm.formState.errors.code}
          {...codeForm.register('code')}
        />
      </FormField>
      <Button type="submit" busy={verify.isPending} className="w-full">
        Verify
      </Button>
    </form>
  );
}
