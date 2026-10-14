import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api/client';
import '../portal.css';

const CATEGORIES = ['Fault', 'Performance', 'Billing', 'Installation', 'Other'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

const PRIORITY_NOTE: Record<string, string> = {
  low: 'Response within 1 business day.',
  medium: 'Response within 1 business day.',
  high: 'Response within 4 hours.',
  urgent: 'Response within 2 hours — system down.',
};

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
    <div className="pt-doc">
      <div
        className="pt-page-head"
        style={{
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: 0,
          minHeight: 72,
        }}
      >
        <img
          src="/brand/TCOIN LOGO OFFICIAL.svg"
          alt=""
          aria-hidden
          style={{
            position: 'absolute',
            right: -10,
            top: '50%',
            transform: 'translateY(-50%)',
            height: '160%',
            width: 'auto',
            opacity: 0.07,
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        />
        <div
          style={{
            width: 72,
            height: 72,
            flexShrink: 0,
            background: '#f1f4f1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#9ba19d',
            fontSize: 28,
          }}
        >
          ✉
        </div>
        <div style={{ padding: '14px 22px 12px 0' }}>
          <h1>Raise a Support Ticket</h1>
          <p>Describe your issue and our team will respond according to the priority level.</p>
        </div>
      </div>

      {error && <div className="pt-alert pt-alert-red">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Step 1 — Classification */}
        <div className="pt-section">
          <div className="pt-section-head">
            <span
              style={{
                display: 'grid',
                placeItems: 'center',
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: '#173b28',
                color: '#eaf3b5',
                fontSize: 10,
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              1
            </span>
            <h2>Classification</h2>
          </div>
          <div className="pt-section-body" style={{ padding: '16px 22px' }}>
            <div className="pt-grid-2">
              <div className="pt-field">
                <label className="pt-label" htmlFor="category">
                  Category *
                </label>
                <select id="category" className="pt-select" value={form.category} onChange={set('category')}>
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="pt-field">
                <label className="pt-label" htmlFor="priority">
                  Priority
                </label>
                <select id="priority" className="pt-select" value={form.priority} onChange={set('priority')}>
                  {PRIORITIES.map((p) => (
                    <option key={p} style={{ textTransform: 'capitalize' }}>
                      {p}
                    </option>
                  ))}
                </select>
                <span style={{ fontSize: 10, color: '#69736d', fontStyle: 'italic', marginTop: 2 }}>
                  {PRIORITY_NOTE[form.priority]}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2 — Details */}
        <div className="pt-section">
          <div className="pt-section-head">
            <span
              style={{
                display: 'grid',
                placeItems: 'center',
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: '#173b28',
                color: '#eaf3b5',
                fontSize: 10,
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              2
            </span>
            <h2>Issue details</h2>
          </div>
          <div
            className="pt-section-body"
            style={{ padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}
          >
            <div className="pt-field">
              <label className="pt-label" htmlFor="subject">
                Subject *
              </label>
              <input
                id="subject"
                className="pt-input"
                required
                value={form.subject}
                onChange={set('subject')}
                placeholder="Brief description of the issue"
              />
            </div>
            <div className="pt-field">
              <label className="pt-label" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                className="pt-textarea"
                rows={5}
                value={form.description}
                onChange={set('description')}
                placeholder="Provide as much detail as possible — system type, error messages, when it started…"
              />
            </div>
          </div>
        </div>

        {/* Footer / submit */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 22px',
            borderTop: '2px solid #173b28',
          }}
        >
          <p style={{ margin: 0, fontSize: 10, color: '#7a837e', fontStyle: 'italic' }}>
            E&amp;OE · Our team will contact you via the registered phone or email.
          </p>
          <button type="submit" className="pt-btn-primary" disabled={busy}>
            {busy ? 'Submitting…' : 'Submit ticket →'}
          </button>
        </div>
      </form>
    </div>
  );
}
