import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { login } from '@/api/endpoints/auth';
import { FormField } from '@/components/forms/FormField';
import { TextInput } from '@/components/forms/controls';
import { Button } from '@/components/ui/Button';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { completeLogin, homeFor } from '../session';
import { loginSchema, type LoginForm } from '../schemas';

export default function Login() {
  useDocumentTitle('Sign in');
  const navigate = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from;
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const signIn = useMutation({
    mutationFn: (v: LoginForm) => login(v.identifier, v.password, 'web'),
    onSuccess: async (t) => {
      if (t.mfa_required) return navigate('/mfa', { state: { mfa_token: t.mfa_token, from } });
      navigate(homeFor(await completeLogin(t), from), { replace: true });
    },
    onError: (e: Error) => setError('root', { message: e.message }),
  });

  return (
    <form onSubmit={handleSubmit((v) => signIn.mutate(v))} noValidate aria-label="Sign in">
      <h1 className="mb-4 text-xl font-bold text-brand-green">Sign in</h1>
      {errors.root && (
        <p role="alert" className="mb-3 rounded bg-red-50 p-2 text-sm text-brand-red">
          {errors.root.message}
        </p>
      )}
      <FormField label="Email or phone" htmlFor="identifier" error={errors.identifier?.message}>
        <TextInput
          id="identifier"
          autoComplete="username"
          invalid={!!errors.identifier}
          {...register('identifier')}
        />
      </FormField>
      <FormField label="Password" htmlFor="password" error={errors.password?.message}>
        <TextInput
          id="password"
          type="password"
          autoComplete="current-password"
          invalid={!!errors.password}
          {...register('password')}
        />
      </FormField>
      <Button type="submit" busy={signIn.isPending} className="w-full">
        Sign in
      </Button>
      <p className="mt-4 text-center text-sm">
        <Link to="/otp" className="text-brand-green underline">
          Sign in with a phone code
        </Link>
        {' | '}
        <Link to="/forgot-password" className="text-brand-green underline">
          Forgot password
        </Link>
      </p>
    </form>
  );
}
