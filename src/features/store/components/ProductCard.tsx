import { Link } from 'react-router-dom';
import { useCartStore } from '@/store/cartStore';

const CATEGORY_ICON: Record<string, string> = {
  panels: '☀️',
  inverters: '⚡',
  batteries: '🔋',
  controllers: '🎛️',
  mounting: '🔩',
  pumps: '💧',
  accessories: '🔌',
};

interface Variant {
  id: string;
  sku: string;
  name: string;
  unit: string;
  price: { amount: string; currency: string };
  available_qty: number;
}
export interface Product {
  id: string;
  name: string;
  brand: string;
  model: string;
  slug: string;
  category: string;
  warranty_months: number;
  variants: Variant[];
}

export function ProductCard({ product }: { product: Product }) {
  const add = useCartStore((s) => s.add);
  const v = product.variants[0];
  const inStock = v && v.available_qty > 0;

  function quickAdd(e: React.MouseEvent) {
    e.preventDefault();
    if (!v || !inStock) return;
    add({
      variant_id: v.id,
      sku: v.sku,
      name: `${product.name} – ${v.name}`,
      unit_price: parseFloat(v.price.amount),
      quantity: 1,
    });
  }

  return (
    <Link
      to={`/store/${product.slug}`}
      className="group flex flex-col rounded-lg border border-line bg-white hover:shadow-md transition-shadow overflow-hidden"
    >
      {/* Image area */}
      <div className="flex h-36 items-center justify-center bg-surface-alt text-5xl">
        {CATEGORY_ICON[product.category] ?? '📦'}
      </div>
      {/* Info */}
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs text-ink-muted">{product.brand}</p>
        <h2 className="mt-0.5 text-sm font-bold leading-snug">{product.name}</h2>
        {product.warranty_months > 0 && (
          <p className="mt-1 text-xs text-ink-muted">
            {product.warranty_months >= 12
              ? `${product.warranty_months / 12}yr`
              : `${product.warranty_months}mo`}{' '}
            warranty
          </p>
        )}
        <div className="mt-auto pt-3 flex items-center justify-between">
          {v ? (
            <span className="font-bold text-brand-green text-sm">
              {v.price.currency} {Number(v.price.amount).toLocaleString()}
            </span>
          ) : (
            <span />
          )}
          {inStock ? (
            <span className="text-xs text-green-600">In stock</span>
          ) : (
            <span className="text-xs text-brand-red">Out of stock</span>
          )}
        </div>
        <button
          onClick={quickAdd}
          disabled={!inStock}
          className="mt-2 w-full rounded border border-brand-green py-1.5 text-xs font-bold text-brand-green hover:bg-green-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {inStock ? '+ Add to cart' : 'Out of stock'}
        </button>
      </div>
    </Link>
  );
}
