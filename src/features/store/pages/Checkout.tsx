import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api, withIdempotency } from '@/api/client';
import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/Button';

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
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
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

  const selectedMethod = PAYMENT_METHODS.find((m) => m.value === form.method);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <nav className="mb-6 flex items-center gap-2 text-sm text-ink-muted">
        <Link to="/store" className="hover:text-brand-green">
          Store
        </Link>
        <span>/</span>
        <Link to="/cart" className="hover:text-brand-green">
          Cart
        </Link>
        <span>/</span>
        <span className="text-ink">Checkout</span>
      </nav>

      <h1 className="text-2xl font-bold text-brand-green">Checkout</h1>

      <div className="mt-6 grid gap-8 lg:grid-cols-5">
        {/* Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-5">
          {error && (
            <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-brand-red">
              {error}
            </p>
          )}

          <fieldset className="space-y-4">
            <legend className="font-bold">Delivery details</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Full name *</label>
                <input
                  className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
                  required
                  value={form.name}
                  onChange={set('name')}
                  placeholder="e.g. Brian Ssemakula"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Phone *</label>
                <input
                  className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
                  type="tel"
                  required
                  value={form.phone}
                  onChange={set('phone')}
                  placeholder="+256 7XX XXX XXX"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <input
                className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Delivery address *</label>
              <input
                className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
                required
                value={form.address}
                onChange={set('address')}
                placeholder="Street, area, district"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Order notes</label>
              <textarea
                className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
                rows={2}
                value={form.notes}
                onChange={set('notes')}
                placeholder="Any special instructions…"
              />
            </div>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="font-bold">Payment method</legend>
            {PAYMENT_METHODS.map((m) => (
              <label
                key={m.value}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${form.method === m.value ? 'border-brand-green bg-green-50' : 'border-line hover:border-brand-green'}`}
              >
                <input
                  type="radio"
                  name="method"
                  value={m.value}
                  checked={form.method === m.value}
                  onChange={set('method')}
                  className="mt-0.5 accent-brand-green"
                />
                <div>
                  <p className="text-sm font-medium">{m.label}</p>
                  {form.method === m.value && <p className="mt-0.5 text-xs text-ink-muted">{m.hint}</p>}
                </div>
              </label>
            ))}
          </fieldset>

          <Button type="submit" busy={busy} className="w-full">
            Place order · UGX {fmt(subtotal)}
          </Button>
        </form>

        {/* Summary */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-line bg-white p-5 space-y-3 sticky top-4">
            <h2 className="font-bold">Order summary</h2>
            <div className="space-y-2">
              {lines.map((l) => (
                <div key={l.variant_id} className="flex justify-between text-sm">
                  <span className="text-ink-muted truncate max-w-[160px]">
                    {l.name} ×{l.quantity}
                  </span>
                  <span className="shrink-0 ml-2">UGX {fmt(l.unit_price * l.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-line pt-3 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-brand-green">UGX {fmt(subtotal)}</span>
            </div>
            {selectedMethod && (
              <p className="text-xs text-ink-muted">
                Payment via {selectedMethod.label.replace(/^[^\s]+ /, '')}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
