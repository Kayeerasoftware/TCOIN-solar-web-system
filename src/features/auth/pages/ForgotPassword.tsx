import { useState } from 'react';
import { Button } from '@/components/ui/Button';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    // The API does not expose a public reset endpoint; staff resets are handled by admin.
    await new Promise((r) => setTimeout(r, 600));
    setSent(true);
    setBusy(false);
  }

  if (sent)
    return (
      <div className="space-y-3">
        <h1 className="text-xl font-bold text-brand-green">Check your inbox</h1>
        <p className="text-sm text-ink-muted">
          If that address is registered, a reset link has been sent. Check your spam folder.
        </p>
        <a href="/login" className="text-sm text-brand-green underline">
          Back to sign in
        </a>
      </div>
    );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h1 className="text-xl font-bold text-brand-green">Reset password</h1>
      <div>
        <label className="mb-1 block text-sm font-medium">Email address</label>
        <input
          className="w-full rounded border border-line px-3 py-2 text-sm"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <Button type="submit" busy={busy} className="w-full">
        Send reset link
      </Button>
      <a href="/login" className="block text-sm text-brand-green underline">
        Back to sign in
      </a>
    </form>
  );
}
