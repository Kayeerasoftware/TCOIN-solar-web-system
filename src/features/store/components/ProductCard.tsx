import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import type { Product } from '@/types/api';

export type { Product };

const CATEGORY_IMG: Record<string, string> = {
  panels: '/products display/Solar-panels.jpg',
  inverters: '/products display/Inverter.jpg',
  batteries: '/products display/battery.jpg',
};
const CATEGORY_ICON: Record<string, string> = {
  controllers: '🎛️',
  mounting: '🔩',
  pumps: '💧',
  accessories: '🔌',
};

function fmt(n: string | number) {
  return Number(n).toLocaleString('en-UG');
}

// Deterministic fake rating & reviews from product id
function seed(id: string) {
  return id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
}
function fakeRating(id: string) {
  return 3.5 + (seed(id) % 15) / 10;
} // 3.5–4.9
function fakeReviews(id: string) {
  return 4 + (seed(id) % 97);
}
// Fake "original" price — 10–30% above listed price
function fakeOriginal(amount: string, id: string) {
  const pct = 1.1 + (seed(id) % 20) / 100;
  return Math.round((parseFloat(amount) * pct) / 1000) * 1000;
}
function discountPct(original: number, current: string) {
  return Math.round((1 - parseFloat(current) / original) * 100);
}

function Stars({ rating }: { rating: number }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.min(1, Math.max(0, rating - (i - 1)));
        return (
          <span key={i} style={{ position: 'relative', fontSize: 11, color: '#e0e0e0', lineHeight: 1 }}>
            ★
            <span
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                overflow: 'hidden',
                width: `${fill * 100}%`,
                color: '#f5a623',
              }}
            >
              ★
            </span>
          </span>
        );
      })}
    </span>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const add = useCartStore((s) => s.add);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [added, setAdded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [wished, setWished] = useState(false);

  const v = product.variants[0];
  const inStock = Boolean(v && v.available_qty > 0);
  const rating = fakeRating(product.id);
  const reviews = fakeReviews(product.id);
  const original = v ? fakeOriginal(v.price.amount, product.id) : 0;
  const disc = v ? discountPct(original, v.price.amount) : 0;

  function quickAdd(e: React.MouseEvent) {
    e.preventDefault();
    if (!v || !inStock) return;
    if (!user) {
      navigate('/login', { state: { from: `/store/${product.slug}` } });
      return;
    }
    add({
      variant_id: v.id,
      sku: v.sku,
      name: `${product.name} – ${v.name}`,
      unit_price: parseFloat(v.price.amount),
      quantity: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <Link
      to={`/store/${product.slug}`}
      style={{
        textDecoration: 'none',
        color: 'inherit',
        display: 'flex',
        flexDirection: 'column',
        background: '#fff',
        borderRadius: 4,
        overflow: 'hidden',
        position: 'relative',
        boxShadow: hovered ? '0 4px 16px rgba(0,0,0,0.12)' : '0 1px 3px rgba(0,0,0,0.06)',
        transition: 'box-shadow 150ms',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Image area ── */}
      <div style={{ position: 'relative', aspectRatio: '1', background: '#f5f5f5', overflow: 'hidden' }}>
        {CATEGORY_IMG[product.category] ? (
          <img
            src={CATEGORY_IMG[product.category]}
            alt={product.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: hovered ? 'scale(1.04)' : 'scale(1)',
              transition: 'transform 350ms',
            }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 60,
            }}
          >
            {CATEGORY_ICON[product.category] ?? '📦'}
          </div>
        )}

        {/* Discount badge */}
        {v && disc > 0 && (
          <span
            style={{
              position: 'absolute',
              top: 8,
              left: 8,
              background: '#e53935',
              color: '#fff',
              fontSize: 10,
              fontWeight: 800,
              padding: '2px 6px',
              borderRadius: 2,
            }}
          >
            -{disc}%
          </span>
        )}

        {/* Out of stock overlay */}
        {!inStock && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(255,255,255,0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                background: '#e53935',
                color: '#fff',
                fontSize: 10,
                fontWeight: 800,
                padding: '4px 10px',
                borderRadius: 2,
                letterSpacing: '0.05em',
              }}
            >
              OUT OF STOCK
            </span>
          </div>
        )}

        {/* Wishlist */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setWished((w) => !w);
          }}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            background: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: 28,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: 15,
            boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
            opacity: hovered || wished ? 1 : 0,
            transition: 'opacity 150ms',
          }}
          aria-label="Wishlist"
        >
          <span style={{ color: wished ? '#e53935' : '#bbb' }}>{wished ? '♥' : '♡'}</span>
        </button>

        {/* Add to cart — slides up on hover */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            transform: hovered && inStock ? 'translateY(0)' : 'translateY(100%)',
            transition: 'transform 200ms',
            zIndex: 3,
          }}
        >
          <button
            onClick={quickAdd}
            disabled={!inStock}
            style={{
              width: '100%',
              height: 36,
              border: 'none',
              background: added ? '#1d6434' : '#f5a623',
              color: '#fff',
              fontSize: 12,
              fontWeight: 800,
              cursor: 'pointer',
              letterSpacing: '0.03em',
            }}
          >
            {added ? '✓ ADDED TO CART' : user ? 'ADD TO CART' : 'SIGN IN TO BUY'}
          </button>
        </div>
      </div>

      {/* ── Info area ── */}
      <div style={{ padding: '10px 10px 12px', display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
        {/* Official store badge */}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 3,
            fontSize: 9,
            fontWeight: 700,
            color: '#f5a623',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#f5a623',
              display: 'inline-block',
            }}
          />
          {product.brand || 'TCOIN Solar'}
        </span>

        {/* Product name */}
        <p
          style={{
            margin: 0,
            fontSize: 12,
            fontWeight: 500,
            color: '#222',
            lineHeight: 1.35,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: 32,
          }}
        >
          {product.name}
        </p>

        {/* Rating */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Stars rating={rating} />
          <span style={{ fontSize: 10, color: '#888' }}>({reviews})</span>
        </div>

        {/* Price row */}
        <div style={{ marginTop: 2 }}>
          {v ? (
            <>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#e53935', lineHeight: 1 }}>
                UGX {fmt(v.price.amount)}
              </p>
              {disc > 0 && (
                <p style={{ margin: '2px 0 0', fontSize: 10, color: '#aaa', textDecoration: 'line-through' }}>
                  UGX {fmt(original)}
                </p>
              )}
            </>
          ) : (
            <p style={{ margin: 0, fontSize: 12, color: '#aaa' }}>Price on request</p>
          )}
        </div>

        {/* Delivery / warranty line */}
        <p style={{ margin: 0, fontSize: 10, color: '#2a7a4b', fontWeight: 600 }}>
          {product.warranty_months >= 12
            ? `🛡️ ${product.warranty_months / 12}yr warranty`
            : product.warranty_months > 0
              ? `🛡️ ${product.warranty_months}mo warranty`
              : '📦 In-store pickup available'}
        </p>
      </div>
    </Link>
  );
}
