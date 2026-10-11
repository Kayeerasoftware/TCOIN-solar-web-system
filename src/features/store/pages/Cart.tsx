import { Link } from 'react-router-dom';
import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/Button';

function fmt(n: number) {
  return n.toLocaleString('en-UG');
}

export default function Cart() {
  const { lines, setQuantity, remove, clear } = useCartStore();
  const subtotal = lines.reduce((s, l) => s + l.unit_price * l.quantity, 0);

  if (lines.length === 0)
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <p className="text-6xl">🛒</p>
        <h1 className="mt-4 text-xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-sm text-ink-muted">Add some products to get started.</p>
        <Link
          to="/store"
          className="mt-6 inline-block rounded-lg bg-brand-green px-6 py-2.5 text-sm font-bold text-white hover:brightness-95"
        >
          Browse the store
        </Link>
      </div>
    );

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-green">Your cart</h1>
        <button onClick={clear} className="text-xs text-ink-muted hover:text-brand-red underline">
          Clear cart
        </button>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        {/* Line items */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-line bg-white divide-y divide-line">
            {lines.map((l) => (
              <div key={l.variant_id} className="flex items-center gap-4 p-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-surface-alt text-2xl">
                  📦
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{l.name}</p>
                  <p className="text-xs text-ink-muted">UGX {fmt(l.unit_price)} each</p>
                </div>
                {/* Qty stepper */}
                <div className="flex items-center rounded-lg border border-line">
                  <button
                    onClick={() => setQuantity(l.variant_id, l.quantity - 1)}
                    className="px-2.5 py-1.5 text-ink-muted hover:text-ink text-sm"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm">{l.quantity}</span>
                  <button
                    onClick={() => setQuantity(l.variant_id, l.quantity + 1)}
                    className="px-2.5 py-1.5 text-ink-muted hover:text-ink text-sm"
                  >
                    +
                  </button>
                </div>
                <p className="w-28 text-right text-sm font-bold">UGX {fmt(l.unit_price * l.quantity)}</p>
                <button
                  onClick={() => remove(l.variant_id)}
                  className="text-ink-muted hover:text-brand-red text-lg leading-none"
                  aria-label="Remove"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="rounded-xl border border-line bg-white p-5 h-fit space-y-4">
          <h2 className="font-bold">Order summary</h2>
          <div className="space-y-2 text-sm">
            {lines.map((l) => (
              <div key={l.variant_id} className="flex justify-between text-ink-muted">
                <span className="truncate max-w-[140px]">
                  {l.name} ×{l.quantity}
                </span>
                <span>UGX {fmt(l.unit_price * l.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-line pt-3 flex justify-between font-bold">
            <span>Subtotal</span>
            <span className="text-brand-green">UGX {fmt(subtotal)}</span>
          </div>
          <p className="text-xs text-ink-muted">Delivery charges calculated at checkout.</p>
          <Link to="/checkout">
            <Button className="w-full">Proceed to checkout →</Button>
          </Link>
          <Link to="/store" className="block text-center text-xs text-brand-green hover:underline">
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
