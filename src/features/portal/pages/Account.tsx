import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/api/client';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function Account() {
  const { user, clear } = useAuthStore();
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwBusy, setPwBusy] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pwForm.next !== pwForm.confirm) {
      setPwMsg({ ok: false, text: 'New passwords do not match.' });
      return;
    }
    if (pwForm.next.length < 8) {
      setPwMsg({ ok: false, text: 'Password must be at least 8 characters.' });
      return;
    }
    setPwBusy(true);
    setPwMsg(null);
    try {
      await api.post('/auth/change-password', {
        current_password: pwForm.current,
        new_password: pwForm.next,
      });
      setPwMsg({ ok: true, text: 'Password updated successfully.' });
      setPwForm({ current: '', next: '', confirm: '' });
    } catch {
      setPwMsg({ ok: false, text: 'Could not update password. Check your current password and try again.' });
    } finally {
      setPwBusy(false);
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-bold text-brand-green">My account</h1>

      {/* Profile info */}
      <Card title="Profile">
        <dl className="space-y-3">
          {[
            { label: 'Full name', value: user?.full_name },
            { label: 'Account type', value: user?.user_type },
            { label: 'Roles', value: user?.roles.join(', ') || '—' },
            { label: 'Customer ID', value: user?.customer_id ?? '—' },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex items-center justify-between border-b border-line pb-2 last:border-0 last:pb-0"
            >
              <dt className="text-xs text-ink-muted uppercase tracking-wide">{label}</dt>
              <dd className="text-sm font-medium capitalize">{value}</dd>
            </div>
          ))}
        </dl>
      </Card>

      {/* Change password */}
      <Card title="Change password">
        <form onSubmit={changePassword} className="space-y-3">
          {pwMsg && (
            <p
              className={`rounded px-3 py-2 text-sm ${pwMsg.ok ? 'bg-green-50 text-brand-green' : 'bg-red-50 text-brand-red'}`}
            >
              {pwMsg.text}
            </p>
          )}
          {(['current', 'next', 'confirm'] as const).map((k) => (
            <div key={k}>
              <label className="mb-1 block text-sm font-medium capitalize">
                {k === 'current'
                  ? 'Current password'
                  : k === 'next'
                    ? 'New password'
                    : 'Confirm new password'}
              </label>
              <input
                type="password"
                className="w-full rounded border border-line px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-green"
                required
                value={pwForm[k]}
                onChange={(e) => setPwForm((f) => ({ ...f, [k]: e.target.value }))}
              />
            </div>
          ))}
          <Button type="submit" busy={pwBusy} variant="secondary" className="w-full">
            Update password
          </Button>
        </form>
      </Card>

      {/* Danger zone */}
      <Card title="Session">
        <p className="mb-3 text-sm text-ink-muted">
          Signing out will end your current session on this device.
        </p>
        <Button variant="danger" onClick={clear}>
          Sign out
        </Button>
      </Card>
    </div>
  );
}
