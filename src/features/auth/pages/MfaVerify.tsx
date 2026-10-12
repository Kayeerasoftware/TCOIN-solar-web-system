import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { verifyMfa } from '@/api/endpoints/auth';
import { FormField } from '@/components/forms/FormField';
import { TextInput } from '@/components/forms/controls';
import { Button } from '@/components/ui/Button';
import { completeLogin, homeFor } from '../session';
import { codeSchema } from '../schemas';

/** Second step for staff accounts that require multi-factor authentication. */
export default function MfaVerify() {
  const navigate = useNavigate();
  const state = useLocation().state as { mfa_token?: string; from?: string } | null;
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<{ code: string }>({ resolver: zodResolver(codeSchema) });
  const verify = useMutation({
    mutationFn: (code: string) => verifyMfa(state!.mfa_token!, code),
    onSuccess: async (t) => navigate(homeFor(await completeLogin(t), state?.from), { replace: true }),
    onError: (e: Error) => setError('code', { message: e.message }),
  });
  if (!state?.mfa_token) return <Navigate to="/login" replace />;
  return (
    <form onSubmit={handleSubmit((v) => verify.mutate(v.code))} noValidate aria-label="Verify code">
      <h1 className="mb-1 text-xl font-bold text-brand-green">Two-step verification</h1>
      <p className="mb-4 text-sm text-ink-muted">Enter the code from your authenticator app.</p>
      <FormField label="Code" htmlFor="code" error={errors.code?.message}>
        <TextInput
          id="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          invalid={!!errors.code}
          {...register('code')}
        />
      </FormField>
      <Button type="submit" busy={verify.isPending} className="w-full">
        Verify
      </Button>
    </form>
  );
}
