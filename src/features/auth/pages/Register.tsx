import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { register as registerApi } from '@/api/endpoints/auth';
import { FormField } from '@/components/forms/FormField';
import { TextInput } from '@/components/forms/controls';
import { Button } from '@/components/ui/Button';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { completeLogin, homeFor } from '../session';
import { registerSchema, type RegisterForm } from '../schemas';

export default function Register() {
  useDocumentTitle('Create account');
  const navigate = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from;
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const signUp = useMutation({
    mutationFn: (v: RegisterForm) => registerApi(v.full_name, v.email, v.password),
    onSuccess: async (t) => {
      navigate(homeFor(await completeLogin(t), from), { replace: true });
    },
    onError: (e: Error) => setError('root', { message: e.message }),
  });

  return (
    <form onSubmit={handleSubmit((v) => signUp.mutate(v))} noValidate aria-label="Create account">
      <h1 className="mb-4 text-xl font-bold text-brand-green">Create account</h1>
      {errors.root && (
        <p role="alert" className="mb-3 rounded bg-red-50 p-2 text-sm text-brand-red">
          {errors.root.message}
        </p>
      )}
      <FormField label="Full name" htmlFor="full_name" error={errors.full_name?.message}>
        <TextInput
          id="full_name"
          autoComplete="name"
          invalid={!!errors.full_name}
          {...register('full_name')}
        />
      </FormField>
      <FormField label="Email" htmlFor="email" error={errors.email?.message}>
        <TextInput
          id="email"
          type="email"
          autoComplete="email"
          invalid={!!errors.email}
          {...register('email')}
        />
      </FormField>
      <FormField label="Password" htmlFor="password" error={errors.password?.message}>
        <TextInput
          id="password"
          type="password"
          autoComplete="new-password"
          invalid={!!errors.password}
          {...register('password')}
        />
      </FormField>
      <Button type="submit" busy={signUp.isPending} className="w-full">
        Create account
      </Button>
      <p className="mt-4 text-center text-sm">
        Already have an account?{' '}
        <Link to="/login" state={{ from }} className="text-brand-green underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
