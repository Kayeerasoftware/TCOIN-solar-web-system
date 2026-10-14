import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api, withIdempotency } from '@/api/client';
import { useCartStore } from '@/store/cartStore';

function fmt(n: number) {
  return n.toLocaleString('en-UG');
}

const PAYMENT_METHODS = [
  {
    value: 'mobile_money',
    label: '📱 Mobile Money (MTN / Airtel)',
    hint: 'You will receive a payment prompt on your phone.',
  },
  {
    value: 'bank_transfer',
    label: '🏦 Bank Transfer',
    hint: 'Bank details will be sent to your email after ordering.',
  },
  { value: 'cash', label: '💵 Cash on Delivery', hint: 'Pay when your order arrives.' },
];

const field: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 4 };
const label: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: '#555',
};
const input: React.CSSProperties = {
  height: 38,
  padding: '0 12px',
  border: '1px solid #ddd',
  borderRadius: 3,
  fontSize: 13,
  outline: 'none',
  fontFamily: 'inherit',
};

export default function Checkout() {
  const navigate = useNavigate();
  const { lines, clear } = useCartStore();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
    method: 'mobile_money',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const subtotal = lines.reduce((s, l) => s + l.unit_price * l.quantity, 0);

  function set(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post(
        '/orders',
        {
          deliver_to: { name: form.name, address: form.address },
          contact: { email: form.email, phone: form.phone },
          notes: form.notes,
          payment_method: form.method,
          items: lines.map((l) => ({ variant_id: l.variant_id, quantity: l.quantity })),
        },
        withIdempotency(),
      );
      clear();
      navigate(`/orders/${data.id}/confirmation`);
    } catch {
      setError('Could not place your order. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  if (lines.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '20px 20px 40px' }}>
      {/* Breadcrumb */}
      <nav style={{ display: 'flex', gap: 6, fontSize: 12, color: '#888', marginBottom: 20 }}>
        <Link to="/store" style={{ color: '#1d6434', textDecoration: 'none' }}>
          Store
        </Link>
        <span>/</span>
        <Link to="/cart" style={{ color: '#1d6434', textDecoration: 'none' }}>
          Cart
        </Link>
        <span>/</span>
        <span style={{ color: '#333' }}>Checkout</span>
      </nav>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>
        {/* Form */}
        <form onSubmit={handleSubmit}>
          {error && (
            <div
              style={{
                padding: '12px 16px',
                background: '#fde8e8',
                borderLeft: '3px solid #c0392b',
                fontSize: 13,
                color: '#c0392b',
                marginBottom: 16,
                borderRadius: 3,
              }}
            >
              {error}
            </div>
          )}

          {/* Delivery */}
          <div
            style={{
              background: '#fff',
              border: '1px solid #e8e8e8',
              borderRadius: 4,
              padding: 20,
              marginBottom: 16,
            }}
          >
            <h2
              style={{
                margin: '0 0 16px',
                fontSize: 14,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: '#1d6434',
              }}
            >
              1. Delivery Details
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={field}>
                <label style={label}>Full name *</label>
                <input
                  style={input}
                  required
                  value={form.name}
                  onChange={set('name')}
                  placeholder="e.g. Brian Ssemakula"
                />
              </div>
              <div style={field}>
                <label style={label}>Phone *</label>
                <input
                  style={input}
                  type="tel"
                  required
                  value={form.phone}
                  onChange={set('phone')}
                  placeholder="+256 7XX XXX XXX"
                />
              </div>
              <div style={field}>
                <label style={label}>Email</label>
                <input
                  style={input}
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  placeholder="your@email.com"
                />
              </div>
              <div style={field}>
                <label style={label}>Delivery address *</label>
                <input
                  style={input}
                  required
                  value={form.address}
                  onChange={set('address')}
                  placeholder="Street, area, district"
                />
              </div>
              <div style={{ ...field, gridColumn: '1 / -1' }}>
                <label style={label}>Order notes</label>
                <textarea
                  style={{ ...input, height: 'auto', padding: '8px 12px', resize: 'vertical' }}
                  rows={2}
                  value={form.notes}
                  onChange={set('notes')}
                  placeholder="Any special instructions…"
                />
              </div>
            </div>
          </div>

          {/* Payment */}
          <div
            style={{
              background: '#fff',
              border: '1px solid #e8e8e8',
              borderRadius: 4,
              padding: 20,
              marginBottom: 16,
            }}
          >
            <h2
              style={{
                margin: '0 0 16px',
                fontSize: 14,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: '#1d6434',
              }}
            >
              2. Payment Method
            </h2>
            {PAYMENT_METHODS.map((m) => (
              <label
                key={m.value}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  padding: '12px 14px',
                  border: `1.5px solid ${form.method === m.value ? '#1d6434' : '#e8e8e8'}`,
                  borderRadius: 4,
                  marginBottom: 8,
                  cursor: 'pointer',
                  background: form.method === m.value ? '#f0f7f2' : '#fff',
                  transition: 'border-color 80ms, background 80ms',
                }}
              >
                <input
                  type="radio"
                  name="method"
                  value={m.value}
                  checked={form.method === m.value}
                  onChange={() => setForm((f) => ({ ...f, method: m.value }))}
                  style={{ marginTop: 3, accentColor: '#1d6434' }}
                />
                <div>
                  <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 600 }}>{m.label}</p>
                  {form.method === m.value && (
                    <p style={{ margin: 0, fontSize: 11, color: '#666' }}>{m.hint}</p>
                  )}
                </div>
              </label>
            ))}
          </div>

          <button
            type="submit"
            disabled={busy}
            style={{
              width: '100%',
              height: 46,
              border: 'none',
              borderRadius: 4,
              background: busy ? '#888' : '#1d6434',
              color: '#fff',
              fontSize: 15,
              fontWeight: 800,
              cursor: busy ? 'not-allowed' : 'pointer',
              transition: 'background 100ms',
            }}
          >
            {busy ? 'Placing order…' : `Place order · UGX ${fmt(subtotal)}`}
          </button>
        </form>

        {/* Summary */}
        <div
          style={{
            background: '#fff',
            border: '1px solid #e8e8e8',
            borderRadius: 4,
            padding: 20,
            position: 'sticky',
            top: 120,
          }}
        >
          <h2
            style={{
              margin: '0 0 14px',
              fontSize: 14,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#333',
            }}
          >
            Order Summary
          </h2>
          {lines.map((l) => (
            <div
              key={l.variant_id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 12,
                color: '#666',
                marginBottom: 6,
              }}
            >
              <span
                style={{ maxWidth: 170, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >
                {l.name} ×{l.quantity}
              </span>
              <span style={{ flexShrink: 0, marginLeft: 8 }}>UGX {fmt(l.unit_price * l.quantity)}</span>
            </div>
          ))}
          <div style={{ height: 1, background: '#f0f0f0', margin: '12px 0' }} />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 16,
              fontWeight: 800,
              color: '#1d6434',
            }}
          >
            <span>Total</span>
            <span>UGX {fmt(subtotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
