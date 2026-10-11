import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { login } from '@/api/endpoints/auth';
import { me } from '@/api/endpoints/auth';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((s) => s.setSession);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const from = (location.state as { from?: string })?.from ?? '/console';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const tokens = await login(identifier, password);
      if (tokens.mfa_required && tokens.mfa_token) {
        navigate('/mfa', { state: { mfa_token: tokens.mfa_token, from } });
        return;
      }
      const user = await me();
      setSession(user, tokens.access_token, tokens.refresh_token);
      navigate(user.user_type === 'customer' ? '/portal' : from, { replace: true });
    } catch {
      setError('Invalid email/phone or password.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h1 className="text-xl font-bold text-brand-green">Sign in</h1>
      {error && (
        <p role="alert" className="rounded bg-red-50 p-2 text-sm text-brand-red">
          {error}
        </p>
      )}
      <div>
        <label className="mb-1 block text-sm font-medium">Email or phone</label>
        <input
          className="w-full rounded border border-line px-3 py-2 text-sm focus:outline-brand-indigo"
          type="text"
          autoComplete="username"
          required
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Password</label>
        <input
          className="w-full rounded border border-line px-3 py-2 text-sm focus:outline-brand-indigo"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <Button type="submit" busy={busy} className="w-full">
        Sign in
      </Button>
      <div className="flex justify-between text-sm">
        <a href="/otp" className="text-brand-green underline">
          Sign in with OTP
        </a>
        <a href="/forgot-password" className="text-brand-green underline">
          Forgot password?
        </a>
      </div>
    </form>
  );
}
