import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { listProducts } from '@/api/endpoints/catalog';
import { qk } from '@/api/queryKeys';
import { useCartStore } from '@/store/cartStore';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ProductCard, type Product } from '../components/ProductCard';
import { FilterPanel } from '../components/FilterPanel';

export default function StoreListing() {
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const cartCount = useCartStore((s) => s.lines.reduce((n, l) => n + l.quantity, 0));

  const { data, isLoading } = useQuery({
    queryKey: qk.products({ q, category }),
    queryFn: () => listProducts({ q, category, limit: 40 }),
    staleTime: 30_000,
  });

  let products: Product[] = data?.data ?? [];
  if (inStockOnly) products = products.filter((p) => p.variants.some((v) => v.available_qty > 0));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-green">Solar components store</h1>
          <p className="text-sm text-ink-muted">Quality solar equipment delivered across Uganda</p>
        </div>
        <Link
          to="/cart"
          className="flex items-center gap-2 rounded-lg border border-brand-green px-4 py-2 text-sm font-bold text-brand-green hover:bg-green-50 transition-colors"
        >
          🛒 Cart
          {cartCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-green text-xs text-white">
              {cartCount}
            </span>
          )}
        </Link>
      </div>

      {/* Search */}
      <div className="mt-5">
        <input
          className="w-full max-w-lg rounded-lg border border-line px-4 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
          placeholder="Search panels, inverters, batteries, cables…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="mt-6 flex gap-8">
        <FilterPanel
          category={category}
          onCategory={setCategory}
          inStockOnly={inStockOnly}
          onInStockOnly={setInStockOnly}
        />

        <div className="flex-1">
          {isLoading && <LoadingState />}
          {!isLoading && products.length === 0 && (
            <div className="py-16 text-center text-ink-muted">
              <p className="text-4xl">🔍</p>
              <p className="mt-3 font-medium">No products found</p>
              <button
                onClick={() => {
                  setQ('');
                  setCategory('');
                  setInStockOnly(false);
                }}
                className="mt-2 text-sm text-brand-green underline"
              >
                Clear filters
              </button>
            </div>
          )}
          {!isLoading && products.length > 0 && (
            <>
              <p className="mb-4 text-sm text-ink-muted">
                {products.length} product{products.length !== 1 ? 's' : ''}
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
