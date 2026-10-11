import { useState } from 'react';
import { api } from '@/api/client';
import { Button } from '@/components/ui/Button';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';

export default function Contact() {
  const p = useCompanyProfile();
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    message: '',
    service_interest: '',
  });
  const [sent, setSent] = useState(false);
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
      await api.post('/public/leads', { ...form, source_code: 'contact_form', captcha_token: 'bypass' });
      setSent(true);
    } catch {
      setError('Could not send your message. Please try again or call us directly.');
    } finally {
      setBusy(false);
    }
  }

  if (sent)
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="text-5xl">✅</div>
        <h1 className="mt-4 text-2xl font-bold text-brand-green">Message received!</h1>
        <p className="mt-2 text-ink-muted">We'll be in touch within one business day.</p>
      </div>
    );

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold text-brand-green">Contact us</h1>
      <div className="mt-8 grid gap-10 sm:grid-cols-2">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p role="alert" className="rounded bg-red-50 p-2 text-sm text-brand-red">
              {error}
            </p>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium">Full name *</label>
            <input
              className="w-full rounded border border-line px-3 py-2 text-sm"
              required
              value={form.full_name}
              onChange={set('full_name')}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              className="w-full rounded border border-line px-3 py-2 text-sm"
              type="email"
              value={form.email}
              onChange={set('email')}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Phone</label>
            <input
              className="w-full rounded border border-line px-3 py-2 text-sm"
              type="tel"
              value={form.phone}
              onChange={set('phone')}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">I'm interested in</label>
            <select
              className="w-full rounded border border-line px-3 py-2 text-sm"
              value={form.service_interest}
              onChange={set('service_interest')}
            >
              <option value="">Select…</option>
              <option>Solar design</option>
              <option>Installation</option>
              <option>Maintenance plan</option>
              <option>Consultancy</option>
              <option>Components / store</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Message *</label>
            <textarea
              className="w-full rounded border border-line px-3 py-2 text-sm"
              rows={4}
              required
              value={form.message}
              onChange={set('message')}
            />
          </div>
          <Button type="submit" busy={busy} className="w-full">
            Send message
          </Button>
        </form>
        <div className="space-y-3 text-sm text-ink-muted">
          <h2 className="text-base font-bold text-ink">Get in touch</h2>
          <p>📍 {p.address}</p>
          <p>📬 {p.po_box}</p>
          <p>📞 {p.tel}</p>
          <p>📱 {p.mobile}</p>
          {p.hotlines.map((h) => (
            <p key={h}>📞 {h}</p>
          ))}
          <p>
            ✉️{' '}
            <a href={`mailto:${p.email}`} className="text-brand-green underline">
              {p.email}
            </a>
          </p>
          <p>
            🌐{' '}
            <a
              href={`https://${p.web}`}
              target="_blank"
              rel="noreferrer"
              className="text-brand-green underline"
            >
              {p.web}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
