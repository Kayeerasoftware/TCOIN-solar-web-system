import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getProduct } from '@/api/endpoints/catalog';
import { qk } from '@/api/queryKeys';
import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/feedback/LoadingState';
import type { Product } from '@/types/api';

const CATEGORY_ICON: Record<string, string> = {
  panels: '☀️',
  inverters: '⚡',
  batteries: '🔋',
  controllers: '🎛️',
  mounting: '🔩',
  pumps: '💧',
  accessories: '🔌',
};

function fmt(n: string | number) {
  return Number(n).toLocaleString('en-UG');
}

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading } = useQuery<Product>({
    queryKey: qk.product(slug!),
    queryFn: () => getProduct(slug!),
    enabled: !!slug,
  });
  const add = useCartStore((s) => s.add);
  const cartCount = useCartStore((s) => s.lines.reduce((n, l) => n + l.quantity, 0));
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  if (isLoading) return <LoadingState />;
  if (!product)
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <p className="text-4xl">🔍</p>
        <p className="mt-4 font-medium">Product not found.</p>
        <Link to="/store" className="mt-2 block text-brand-green underline">
          Back to store
        </Link>
      </div>
    );

  const v = product.variants[selectedVariant];
  const inStock = v && v.available_qty > 0;

  function addToCart() {
    if (!v) return;
    add({
      variant_id: v.id,
      sku: v.sku,
      name: `${product!.name}${product!.variants.length > 1 ? ` – ${v.name}` : ''}`,
      unit_price: parseFloat(v.price.amount),
      quantity: qty,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-ink-muted">
        <Link to="/store" className="hover:text-brand-green">
          Store
        </Link>
        <span>/</span>
        <span className="capitalize">{product.category}</span>
        <span>/</span>
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-10 sm:grid-cols-2">
        {/* Image */}
        <div className="flex h-72 items-center justify-center rounded-xl bg-surface-alt text-8xl">
          {CATEGORY_ICON[product.category] ?? '📦'}
        </div>

        {/* Details */}
        <div>
          <p className="text-sm font-medium text-ink-muted">{product.brand}</p>
          <h1 className="mt-1 text-2xl font-bold">{product.name}</h1>
          <p className="mt-0.5 text-sm text-ink-muted">Model: {product.model}</p>
          {product.warranty_months > 0 && (
            <p className="mt-0.5 text-sm text-ink-muted">
              🛡️{' '}
              {product.warranty_months >= 12
                ? `${product.warranty_months / 12}-year`
                : `${product.warranty_months}-month`}{' '}
              warranty
            </p>
          )}

          {/* Variant picker */}
          {product.variants.length > 1 && (
            <div className="mt-5">
              <p className="mb-1.5 text-sm font-medium">Option</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((vv, i) => (
                  <button
                    key={vv.id}
                    onClick={() => {
                      setSelectedVariant(i);
                      setQty(1);
                    }}
                    className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${i === selectedVariant ? 'border-brand-green bg-green-50 font-bold text-brand-green' : 'border-line text-ink hover:border-brand-green'}`}
                  >
                    {vv.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {v && (
            <div className="mt-5">
              <p className="text-3xl font-bold text-brand-green">
                {v.price.currency} {fmt(v.price.amount)}
              </p>
              <p className={`mt-0.5 text-sm ${inStock ? 'text-green-600' : 'text-brand-red'}`}>
                {inStock ? `${v.available_qty} in stock` : 'Out of stock'}
              </p>

              {inStock && (
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex items-center rounded-lg border border-line">
                    <button
                      onClick={() => setQty((n) => Math.max(1, n - 1))}
                      className="px-3 py-2 text-ink-muted hover:text-ink"
                    >
                      −
                    </button>
                    <span className="w-10 text-center text-sm font-medium">{qty}</span>
                    <button
                      onClick={() => setQty((n) => Math.min(v.available_qty, n + 1))}
                      className="px-3 py-2 text-ink-muted hover:text-ink"
                    >
                      +
                    </button>
                  </div>
                  <Button onClick={addToCart} className="flex-1">
                    {added ? '✓ Added to cart!' : 'Add to cart'}
                  </Button>
                </div>
              )}

              {added && (
                <div className="mt-3 flex items-center justify-between rounded-lg bg-green-50 px-4 py-2.5 text-sm">
                  <span className="text-brand-green font-medium">Added to cart</span>
                  <Link to="/cart" className="font-bold text-brand-green underline">
                    View cart ({cartCount})
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <div className="mt-10">
          <h2 className="text-lg font-bold">Description</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">{product.description}</p>
        </div>
      )}

      {/* Specs */}
      {product.specs && Object.keys(product.specs).length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-bold">Specifications</h2>
          <div className="mt-3 overflow-hidden rounded-lg border border-line">
            <table className="w-full text-sm">
              <tbody>
                {Object.entries(product.specs).map(([k, val], i) => (
                  <tr key={k} className={i % 2 === 0 ? 'bg-white' : 'bg-surface-alt'}>
                    <td className="w-1/3 px-4 py-2.5 font-medium capitalize">{k.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-2.5 text-ink-muted">{String(val)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-8">
        <Link to="/store" className="text-sm text-brand-green hover:underline">
          ← Back to store
        </Link>
      </div>
    </div>
  );
}
