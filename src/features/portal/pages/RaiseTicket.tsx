import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api/client';
import { Button } from '@/components/ui/Button';

const CATEGORIES = ['Fault', 'Performance', 'Billing', 'Installation', 'Other'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

export default function RaiseTicket() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ category: 'Fault', priority: 'medium', subject: '', description: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function set(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post('/tickets', form);
      navigate(`/portal/support/${data.id}`);
    } catch {
      setError('Could not submit ticket. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-brand-green">Raise a support ticket</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && (
          <p role="alert" className="rounded bg-red-50 p-2 text-sm text-brand-red">
            {error}
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Category *</label>
            <select
              className="w-full rounded border border-line px-3 py-2 text-sm"
              value={form.category}
              onChange={set('category')}
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Priority</label>
            <select
              className="w-full rounded border border-line px-3 py-2 text-sm"
              value={form.priority}
              onChange={set('priority')}
            >
              {PRIORITIES.map((p) => (
                <option key={p} className="capitalize">
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Subject *</label>
          <input
            className="w-full rounded border border-line px-3 py-2 text-sm"
            required
            value={form.subject}
            onChange={set('subject')}
            placeholder="Brief description of the issue"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Description</label>
          <textarea
            className="w-full rounded border border-line px-3 py-2 text-sm"
            rows={5}
            value={form.description}
            onChange={set('description')}
            placeholder="Provide as much detail as possible…"
          />
        </div>
        <Button type="submit" busy={busy} className="w-full">
          Submit ticket
        </Button>
      </form>
    </div>
  );
}
