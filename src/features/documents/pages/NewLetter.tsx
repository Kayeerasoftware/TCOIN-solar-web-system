import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api/client';
import { Button } from '@/components/ui/Button';

export default function NewLetter() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ addressee: '', your_ref: '', subject: '', body: '', customer_id: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function set(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.post('/letters', { ...form, customer_id: form.customer_id || undefined });
      navigate('/console/documents');
    } catch {
      setError('Could not create letter.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-brand-green">New letter</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && <p className="rounded bg-red-50 p-2 text-sm text-brand-red">{error}</p>}
        <div>
          <label className="mb-1 block text-sm font-medium">Addressee *</label>
          <input
            className="w-full rounded border border-line px-3 py-2 text-sm"
            required
            value={form.addressee}
            onChange={set('addressee')}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Your ref</label>
            <input
              className="w-full rounded border border-line px-3 py-2 text-sm"
              value={form.your_ref}
              onChange={set('your_ref')}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Customer ID</label>
            <input
              className="w-full rounded border border-line px-3 py-2 text-sm"
              value={form.customer_id}
              onChange={set('customer_id')}
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Subject</label>
          <input
            className="w-full rounded border border-line px-3 py-2 text-sm"
            value={form.subject}
            onChange={set('subject')}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Body *</label>
          <textarea
            className="w-full rounded border border-line px-3 py-2 text-sm"
            rows={8}
            required
            value={form.body}
            onChange={set('body')}
            placeholder="Letter content…"
          />
        </div>
        <Button type="submit" busy={busy} className="w-full">
          Create letter
        </Button>
      </form>
    </div>
  );
}
