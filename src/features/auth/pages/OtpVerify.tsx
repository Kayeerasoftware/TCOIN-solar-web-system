import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { requestOtp, verifyOtp } from '@/api/endpoints/auth';
import { me } from '@/api/endpoints/auth';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';

export default function OtpVerify() {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((s) => s.setSession);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const from = (location.state as { from?: string })?.from ?? '/portal';

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await requestOtp(phone);
      setStep('code');
    } catch {
      setError('Could not send code. Check the number and try again.');
    } finally {
      setBusy(false);
    }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const tokens = await verifyOtp(phone, code);
      const user = await me();
      setSession(user, tokens.access_token, tokens.refresh_token);
      navigate(user.user_type === 'customer' ? '/portal' : from, { replace: true });
    } catch {
      setError('Invalid or expired code.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-brand-green">Sign in with OTP</h1>
      {error && (
        <p role="alert" className="rounded bg-red-50 p-2 text-sm text-brand-red">
          {error}
        </p>
      )}
      {step === 'phone' ? (
        <form onSubmit={sendOtp} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Phone number</label>
            <input
              className="w-full rounded border border-line px-3 py-2 text-sm"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <Button type="submit" busy={busy} className="w-full">
            Send code
          </Button>
        </form>
      ) : (
        <form onSubmit={verify} className="space-y-4">
          <p className="text-sm text-ink-muted">Code sent to {phone}.</p>
          <div>
            <label className="mb-1 block text-sm font-medium">One-time code</label>
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
          <button
            type="button"
            className="text-sm text-brand-green underline"
            onClick={() => setStep('phone')}
          >
            Change number
          </button>
        </form>
      )}
    </div>
  );
}
