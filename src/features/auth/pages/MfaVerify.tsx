import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { verifyMfa } from '@/api/endpoints/auth';
import { me } from '@/api/endpoints/auth';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';

export default function MfaVerify() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { mfa_token?: string; from?: string } | null;
  const setSession = useAuthStore((s) => s.setSession);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!state?.mfa_token) {
      navigate('/login');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const tokens = await verifyMfa(state.mfa_token, code);
      const user = await me();
      setSession(user, tokens.access_token, tokens.refresh_token);
      navigate(state.from ?? '/console', { replace: true });
    } catch {
      setError('Invalid or expired code.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h1 className="text-xl font-bold text-brand-green">Two-factor verification</h1>
      <p className="text-sm text-ink-muted">Enter the code from your authenticator app.</p>
      {error && (
        <p role="alert" className="rounded bg-red-50 p-2 text-sm text-brand-red">
          {error}
        </p>
      )}
      <div>
        <label className="mb-1 block text-sm font-medium">Authentication code</label>
        <input
          className="w-full rounded border border-line px-3 py-2 text-sm tracking-widest"
          type="text"
          inputMode="numeric"
          maxLength={6}
          required
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
      </div>
      <Button type="submit" busy={busy} className="w-full">
        Verify
      </Button>
    </form>
  );
}
