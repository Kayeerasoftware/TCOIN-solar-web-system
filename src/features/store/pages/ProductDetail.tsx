import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getProduct, listProducts } from '@/api/endpoints/catalog';
import { qk } from '@/api/queryKeys';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { LoadingState } from '@/components/feedback/LoadingState';
import type { Product } from '@/types/api';

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
function seed(id: string) {
  return id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
}
function fakeRating(id: string) {
  return 3.5 + (seed(id) % 15) / 10;
}
function fakeReviews(id: string) {
  return 4 + (seed(id) % 97);
}
function fakeOriginal(amount: string, id: string) {
  const pct = 1.1 + (seed(id) % 20) / 100;
  return Math.round((parseFloat(amount) * pct) / 1000) * 1000;
}

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.min(1, Math.max(0, rating - (i - 1)));
        return (
          <span key={i} style={{ position: 'relative', fontSize: size, color: '#e0e0e0', lineHeight: 1 }}>
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

function ProductThumb({ product }: { product: Product }) {
  const img = CATEGORY_IMG[product.category];
  const icon = CATEGORY_ICON[product.category] ?? '📦';
  const v = product.variants[0];
  return (
    <Link
      to={`/store/${product.slug ?? product.id}`}
      style={{
        textDecoration: 'none',
        color: 'inherit',
        display: 'flex',
        flexDirection: 'column',
        background: '#fff',
        border: '1px solid #e8e8e8',
        borderRadius: 4,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          aspectRatio: '1',
          background: '#f5f5f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {img ? (
          <img src={img} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: 40 }}>{icon}</span>
        )}
      </div>
      <div style={{ padding: '8px 10px' }}>
        <p
          style={{
            margin: '0 0 4px',
            fontSize: 11,
            color: '#222',
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {product.name}
        </p>
        {v && (
          <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: '#e53935' }}>
            UGX {fmt(v.price.amount)}
          </p>
        )}
      </div>
    </Link>
  );
}

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading } = useQuery<Product>({
    queryKey: qk.product(slug!),
    queryFn: () => getProduct(slug!),
    enabled: !!slug,
  });
  const { data: relatedData } = useQuery({
    queryKey: qk.products({ category: product?.category, limit: 6 }),
    queryFn: () => listProducts({ category: product?.category, limit: 6 }),
    enabled: !!product?.category,
  });

  const add = useCartStore((s) => s.add);
  const user = useAuthStore((s) => s.user);
  const cartCount = useCartStore((s) => s.lines.reduce((n, l) => n + l.quantity, 0));
  const [selVariant, setSelVariant] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [wished, setWished] = useState(false);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');
  const [thumbIdx, setThumbIdx] = useState(0);

  if (isLoading)
    return (
      <div style={{ padding: 60, textAlign: 'center' }}>
        <LoadingState />
      </div>
    );
  if (!product)
    return (
      <div style={{ maxWidth: 600, margin: '80px auto', textAlign: 'center', padding: '0 20px' }}>
        <p style={{ fontSize: 48 }}>🔍</p>
        <p style={{ fontWeight: 700, fontSize: 16 }}>Product not found.</p>
        <Link to="/store" style={{ color: '#f5a623', fontWeight: 700 }}>
          ← Back to store
        </Link>
      </div>
    );

  const v = product.variants[selVariant];
  const inStock = Boolean(v && v.available_qty > 0);
  const rating = fakeRating(product.id);
  const reviews = fakeReviews(product.id);
  const original = v ? fakeOriginal(v.price.amount, product.id) : 0;
  const disc = v ? Math.round((1 - parseFloat(v.price.amount) / original) * 100) : 0;
  const img = CATEGORY_IMG[product.category];
  const icon = CATEGORY_ICON[product.category] ?? '📦';
  const related = (relatedData?.data ?? []).filter((p) => p.id !== product.id).slice(0, 5);

  // fake extra thumbnails from same image
  const thumbs = [img, img, img].filter(Boolean);

  function addToCart() {
    if (!v) return;
    if (!user) {
      navigate('/login', { state: { from: `/store/${slug}` } });
      return;
    }
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

  function buyNow() {
    if (!v) return;
    if (!user) {
      navigate('/login', { state: { from: `/store/${slug}` } });
      return;
    }
    add({
      variant_id: v.id,
      sku: v.sku,
      name: `${product!.name}${product!.variants.length > 1 ? ` – ${v.name}` : ''}`,
      unit_price: parseFloat(v.price.amount),
      quantity: qty,
    });
    navigate('/cart');
  }

  const cat = product.category;

  return (
    <div style={{ background: '#f0f0f0', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '12px 12px 48px' }}>
        {/* Breadcrumb */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            color: '#888',
            marginBottom: 10,
            flexWrap: 'wrap',
          }}
        >
          <Link to="/" style={{ color: '#f5a623', textDecoration: 'none' }}>
            Home
          </Link>
          <span>›</span>
          <Link to="/store" style={{ color: '#f5a623', textDecoration: 'none' }}>
            Store
          </Link>
          <span>›</span>
          <Link
            to={`/store?category=${cat}`}
            style={{ color: '#f5a623', textDecoration: 'none', textTransform: 'capitalize' }}
          >
            {cat}
          </Link>
          <span>›</span>
          <span style={{ color: '#555' }}>{product.name}</span>
        </nav>

        {/* ── Main card ── */}
        <div
          style={{
            background: '#fff',
            borderRadius: 4,
            padding: 20,
            display: 'grid',
            gridTemplateColumns: '340px 1fr 260px',
            gap: 24,
            alignItems: 'start',
            marginBottom: 10,
          }}
        >
          {/* Left: image gallery */}
          <div>
            {/* Main image */}
            <div
              style={{
                border: '1px solid #e8e8e8',
                borderRadius: 4,
                overflow: 'hidden',
                aspectRatio: '1',
                background: '#f5f5f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 10,
              }}
            >
              {img ? (
                <img
                  src={thumbs[thumbIdx] ?? img}
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span style={{ fontSize: 100 }}>{icon}</span>
              )}
            </div>
            {/* Thumbnails */}
            {thumbs.length > 1 && (
              <div style={{ display: 'flex', gap: 8 }}>
                {thumbs.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => setThumbIdx(i)}
                    style={{
                      width: 60,
                      height: 60,
                      border: `2px solid ${thumbIdx === i ? '#f5a623' : '#e8e8e8'}`,
                      borderRadius: 3,
                      overflow: 'hidden',
                      padding: 0,
                      cursor: 'pointer',
                      background: '#f5f5f5',
                    }}
                  >
                    <img src={t} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
            {/* Share / wishlist row */}
            <div style={{ display: 'flex', gap: 16, marginTop: 14, fontSize: 12, color: '#888' }}>
              <button
                onClick={() => setWished((w) => !w)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 12,
                  color: wished ? '#e53935' : '#888',
                  fontWeight: 600,
                }}
              >
                <span style={{ fontSize: 16 }}>{wished ? '♥' : '♡'}</span>{' '}
                {wished ? 'Wishlisted' : 'Add to wishlist'}
              </button>
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 12,
                  color: '#888',
                }}
              >
                🔗 Share
              </button>
            </div>
          </div>

          {/* Middle: product info */}
          <div>
            {/* Brand */}
            <p
              style={{
                margin: '0 0 4px',
                fontSize: 11,
                color: '#f5a623',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              {product.brand || 'TCOIN Solar'} · Official Store
            </p>

            {/* Name */}
            <h1
              style={{ margin: '0 0 10px', fontSize: 20, fontWeight: 700, color: '#1a1a1a', lineHeight: 1.3 }}
            >
              {product.name}
            </h1>

            {/* Rating row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 12,
                paddingBottom: 12,
                borderBottom: '1px solid #f0f0f0',
              }}
            >
              <Stars rating={rating} size={15} />
              <span style={{ fontSize: 13, color: '#f5a623', fontWeight: 700 }}>{rating.toFixed(1)}</span>
              <span style={{ fontSize: 12, color: '#888' }}>({reviews} ratings)</span>
              <span style={{ color: '#e0e0e0' }}>|</span>
              <span style={{ fontSize: 12, color: inStock ? '#2a7a4b' : '#e53935', fontWeight: 600 }}>
                {inStock ? `✓ In Stock (${v?.available_qty})` : '✗ Out of Stock'}
              </span>
            </div>

            {/* Price */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <span style={{ fontSize: 28, fontWeight: 900, color: '#e53935' }}>
                  UGX {v ? fmt(v.price.amount) : '—'}
                </span>
                {disc > 0 && (
                  <span style={{ fontSize: 14, color: '#aaa', textDecoration: 'line-through' }}>
                    UGX {fmt(original)}
                  </span>
                )}
                {disc > 0 && (
                  <span
                    style={{
                      fontSize: 12,
                      background: '#e53935',
                      color: '#fff',
                      padding: '2px 6px',
                      borderRadius: 2,
                      fontWeight: 800,
                    }}
                  >
                    -{disc}%
                  </span>
                )}
              </div>
              {disc > 0 && (
                <p style={{ margin: '4px 0 0', fontSize: 12, color: '#2a7a4b', fontWeight: 600 }}>
                  You save UGX {fmt(original - parseFloat(v!.price.amount))}
                </p>
              )}
            </div>

            {/* Variant picker */}
            {product.variants.length > 1 && (
              <div style={{ marginBottom: 14 }}>
                <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: '#555' }}>
                  Option: <span style={{ color: '#1a1a1a' }}>{v?.name}</span>
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {product.variants.map((vv, i) => (
                    <button
                      key={vv.id}
                      onClick={() => {
                        setSelVariant(i);
                        setQty(1);
                      }}
                      style={{
                        padding: '6px 14px',
                        border: `2px solid ${i === selVariant ? '#f5a623' : '#e0e0e0'}`,
                        borderRadius: 3,
                        background: i === selVariant ? '#fff8ee' : '#fff',
                        color: i === selVariant ? '#b36b00' : '#333',
                        fontWeight: i === selVariant ? 700 : 400,
                        fontSize: 13,
                        cursor: 'pointer',
                      }}
                    >
                      {vv.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Qty */}
            {inStock && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#555' }}>Qty:</span>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid #ddd',
                    borderRadius: 3,
                    overflow: 'hidden',
                  }}
                >
                  <button
                    onClick={() => setQty((n) => Math.max(1, n - 1))}
                    style={{
                      width: 36,
                      height: 36,
                      border: 'none',
                      background: '#f5f5f5',
                      fontSize: 18,
                      cursor: 'pointer',
                      color: '#333',
                    }}
                  >
                    −
                  </button>
                  <span
                    style={{
                      width: 44,
                      textAlign: 'center',
                      fontSize: 14,
                      fontWeight: 700,
                      borderLeft: '1px solid #ddd',
                      borderRight: '1px solid #ddd',
                      lineHeight: '36px',
                    }}
                  >
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty((n) => Math.min(v!.available_qty, n + 1))}
                    style={{
                      width: 36,
                      height: 36,
                      border: 'none',
                      background: '#f5f5f5',
                      fontSize: 18,
                      cursor: 'pointer',
                      color: '#333',
                    }}
                  >
                    +
                  </button>
                </div>
                <span style={{ fontSize: 11, color: '#aaa' }}>{v?.available_qty} available</span>
              </div>
            )}

            {/* Key specs preview */}
            {product.spec_text && (
              <div
                style={{
                  background: '#f9f9f9',
                  border: '1px solid #f0f0f0',
                  borderRadius: 4,
                  padding: '10px 14px',
                  marginBottom: 14,
                }}
              >
                <p style={{ margin: 0, fontSize: 12, color: '#555', lineHeight: 1.6 }}>{product.spec_text}</p>
              </div>
            )}

            {/* Warranty */}
            {product.warranty_months > 0 && (
              <p style={{ margin: '0 0 14px', fontSize: 12, color: '#2a7a4b', fontWeight: 600 }}>
                🛡️{' '}
                {product.warranty_months >= 12
                  ? `${product.warranty_months / 12}-year`
                  : `${product.warranty_months}-month`}{' '}
                manufacturer warranty
              </p>
            )}

            {/* Added confirmation */}
            {added && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: '#f0f7f2',
                  border: '1px solid #a5d6a7',
                  borderRadius: 4,
                  marginBottom: 12,
                  fontSize: 13,
                }}
              >
                <span style={{ color: '#1d6434', fontWeight: 600 }}>✓ Added to cart!</span>
                <Link to="/cart" style={{ color: '#1d6434', fontWeight: 700, textDecoration: 'underline' }}>
                  View cart ({cartCount})
                </Link>
              </div>
            )}
          </div>

          {/* Right: buy box */}
          <div
            style={{
              border: '1px solid #e8e8e8',
              borderRadius: 4,
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 900, color: '#e53935' }}>
              UGX {v ? fmt(v.price.amount) : '—'}
            </div>

            {/* Delivery info */}
            <div style={{ fontSize: 12, color: '#555', borderTop: '1px solid #f0f0f0', paddingTop: 10 }}>
              <p style={{ margin: '0 0 6px', display: 'flex', gap: 8 }}>
                <span>🚚</span>
                <span>
                  <strong>Delivery:</strong> Kampala — Free
                  <br />
                  <span style={{ color: '#888' }}>Other areas — calculated at checkout</span>
                </span>
              </p>
              <p style={{ margin: '0 0 6px', display: 'flex', gap: 8 }}>
                <span>📦</span>
                <span>
                  <strong>Ready to ship</strong> in 1–2 business days
                </span>
              </p>
              <p style={{ margin: 0, display: 'flex', gap: 8 }}>
                <span>🏪</span>
                <span>
                  <strong>Pickup:</strong> Nabulagala, Kampala
                </span>
              </p>
            </div>

            {/* Sold by */}
            <div
              style={{
                background: '#f9f9f9',
                borderRadius: 3,
                padding: '8px 10px',
                fontSize: 11,
                color: '#555',
                borderTop: '1px solid #f0f0f0',
              }}
            >
              <p style={{ margin: '0 0 2px', fontWeight: 700, color: '#1a1a1a' }}>Sold by TCOIN Solar UG</p>
              <p style={{ margin: 0, color: '#2a7a4b' }}>✓ Official Store · Verified seller</p>
            </div>

            {/* CTA buttons */}
            {inStock ? (
              <>
                <button
                  onClick={addToCart}
                  style={{
                    width: '100%',
                    height: 42,
                    border: '2px solid #f5a623',
                    borderRadius: 4,
                    background: '#fff8ee',
                    color: '#b36b00',
                    fontSize: 14,
                    fontWeight: 800,
                    cursor: 'pointer',
                    transition: 'background 120ms',
                  }}
                >
                  {user ? '🛒 Add to Cart' : '🔒 Sign in to Buy'}
                </button>
                <button
                  onClick={buyNow}
                  style={{
                    width: '100%',
                    height: 42,
                    border: 'none',
                    borderRadius: 4,
                    background: '#f5a623',
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  {user ? '⚡ Buy Now' : '⚡ Buy Now — Sign in first'}
                </button>
              </>
            ) : (
              <button
                disabled
                style={{
                  width: '100%',
                  height: 42,
                  border: 'none',
                  borderRadius: 4,
                  background: '#e0e0e0',
                  color: '#aaa',
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: 'not-allowed',
                }}
              >
                Out of Stock
              </button>
            )}

            <button
              onClick={() => setWished((w) => !w)}
              style={{
                width: '100%',
                height: 36,
                border: '1px solid #e0e0e0',
                borderRadius: 4,
                background: '#fff',
                color: wished ? '#e53935' : '#888',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <span style={{ fontSize: 15 }}>{wished ? '♥' : '♡'}</span>{' '}
              {wished ? 'Wishlisted' : 'Add to Wishlist'}
            </button>

            {/* Return policy */}
            <p
              style={{
                margin: 0,
                fontSize: 10,
                color: '#aaa',
                textAlign: 'center',
                borderTop: '1px solid #f0f0f0',
                paddingTop: 10,
              }}
            >
              🔄 7-day return policy · Secure payment
            </p>
          </div>
        </div>

        {/* ── Tabs: Description / Specs / Reviews ── */}
        <div style={{ background: '#fff', borderRadius: 4, marginBottom: 10, overflow: 'hidden' }}>
          {/* Tab bar */}
          <div style={{ display: 'flex', borderBottom: '2px solid #f0f0f0' }}>
            {(['desc', 'specs', 'reviews'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '14px 24px',
                  border: 'none',
                  background: 'none',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  color: activeTab === tab ? '#f5a623' : '#555',
                  borderBottom: `2px solid ${activeTab === tab ? '#f5a623' : 'transparent'}`,
                  marginBottom: -2,
                  textTransform: 'capitalize',
                }}
              >
                {tab === 'desc' ? 'Description' : tab === 'specs' ? 'Specifications' : `Reviews (${reviews})`}
              </button>
            ))}
          </div>

          <div style={{ padding: 20 }}>
            {activeTab === 'desc' && (
              <p style={{ margin: 0, fontSize: 13, color: '#555', lineHeight: 1.8, maxWidth: 800 }}>
                {product.description ?? product.spec_text ?? 'No description available.'}
              </p>
            )}

            {activeTab === 'specs' && product.specs && (
              <table style={{ width: '100%', maxWidth: 700, borderCollapse: 'collapse', fontSize: 13 }}>
                <tbody>
                  {Object.entries(product.specs).map(([k, val], i) => (
                    <tr key={k} style={{ background: i % 2 === 0 ? '#f9f9f9' : '#fff' }}>
                      <td
                        style={{
                          padding: '9px 14px',
                          border: '1px solid #eee',
                          fontWeight: 600,
                          color: '#444',
                          textTransform: 'capitalize',
                          width: '35%',
                        }}
                      >
                        {k.replace(/_/g, ' ')}
                      </td>
                      <td style={{ padding: '9px 14px', border: '1px solid #eee', color: '#666' }}>
                        {String(val)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'specs' && !product.specs && (
              <p style={{ margin: 0, fontSize: 13, color: '#888' }}>
                {product.spec_text ?? 'No specifications available.'}
              </p>
            )}

            {activeTab === 'reviews' && (
              <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
                {/* Rating summary */}
                <div style={{ textAlign: 'center', flexShrink: 0 }}>
                  <p
                    style={{
                      margin: '0 0 4px',
                      fontSize: 48,
                      fontWeight: 900,
                      color: '#1a1a1a',
                      lineHeight: 1,
                    }}
                  >
                    {rating.toFixed(1)}
                  </p>
                  <Stars rating={rating} size={18} />
                  <p style={{ margin: '6px 0 0', fontSize: 12, color: '#888' }}>{reviews} ratings</p>
                </div>
                {/* Bar chart */}
                <div style={{ flex: 1, maxWidth: 320 }}>
                  {[5, 4, 3, 2, 1].map((star) => {
                    const pct =
                      star === Math.round(rating)
                        ? 60
                        : star === Math.round(rating) - 1
                          ? 25
                          : star > Math.round(rating)
                            ? 8
                            : 5;
                    return (
                      <div
                        key={star}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}
                      >
                        <span style={{ fontSize: 12, color: '#888', width: 10 }}>{star}</span>
                        <span style={{ fontSize: 11, color: '#f5a623' }}>★</span>
                        <div
                          style={{
                            flex: 1,
                            height: 8,
                            background: '#f0f0f0',
                            borderRadius: 4,
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              width: `${pct}%`,
                              height: '100%',
                              background: '#f5a623',
                              borderRadius: 4,
                            }}
                          />
                        </div>
                        <span style={{ fontSize: 11, color: '#888', width: 28 }}>{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Related products ── */}
        {related.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 4, padding: 16 }}>
            <h2
              style={{
                margin: '0 0 14px',
                fontSize: 14,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: '#333',
                borderLeft: '3px solid #f5a623',
                paddingLeft: 10,
              }}
            >
              Related Products
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: 8,
              }}
            >
              {related.map((p) => (
                <ProductThumb key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
