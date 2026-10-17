import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { GuestCartGate } from '../components/GuestCartGate';

const CATEGORY_IMG: Record<string, string> = {
  panels: '/products display/Solar-panels.jpg',
  inverters: '/products display/Inverter.jpg',
  batteries: '/products display/battery.jpg',
};

function fmt(n: number) {
  return n.toLocaleString('en-UG');
}

const DELIVERY_FEE = 0; // free Kampala delivery

export default function Cart() {
  const { lines, setQuantity, remove, clear } = useCartStore();
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [promo, setPromo] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');

  if (!user) return <GuestCartGate />;

  const subtotal = lines.reduce((s, l) => s + l.unit_price * l.quantity, 0);
  const discount = promoApplied ? Math.round(subtotal * 0.05) : 0;
  const total = subtotal - discount + DELIVERY_FEE;

  function applyPromo() {
    if (promo.trim().toUpperCase() === 'SOLAR5') {
      setPromoApplied(true);
      setPromoError('');
    } else {
      setPromoApplied(false);
      setPromoError('Invalid promo code.');
    }
  }

  if (lines.length === 0)
    return (
      <div
        style={{
          background: '#f0f0f0',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            background: '#fff',
            borderRadius: 4,
            padding: '48px 40px',
            textAlign: 'center',
            maxWidth: 400,
          }}
        >
          <p style={{ fontSize: 64, margin: 0 }}>🛒</p>
          <h1 style={{ margin: '16px 0 8px', fontSize: 20, fontWeight: 800, color: '#1a1a1a' }}>
            Your cart is empty
          </h1>
          <p style={{ margin: '0 0 24px', fontSize: 13, color: '#888' }}>
            Browse our solar products and add items to your cart.
          </p>
          <Link
            to="/store"
            style={{
              display: 'inline-block',
              padding: '12px 32px',
              background: '#f5a623',
              color: '#fff',
              borderRadius: 4,
              fontWeight: 800,
              fontSize: 14,
              textDecoration: 'none',
            }}
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );

  return (
    <div style={{ background: '#f0f0f0', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '12px 12px 48px' }}>
        {/* Header row */}
        <div
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}
        >
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1a1a1a' }}>
            Cart{' '}
            <span style={{ fontSize: 14, color: '#888', fontWeight: 400 }}>
              ({lines.length} item{lines.length !== 1 ? 's' : ''})
            </span>
          </h1>
          <Link
            to="/store"
            style={{ fontSize: 12, color: '#f5a623', fontWeight: 700, textDecoration: 'none' }}
          >
            ← Continue Shopping
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 10, alignItems: 'start' }}>
          {/* ── Left: items ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* Select all / clear bar */}
            <div
              style={{
                background: '#fff',
                borderRadius: 4,
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>Products</span>
              <button
                onClick={clear}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 12,
                  color: '#e53935',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Remove all
              </button>
            </div>

            {/* Item rows */}
            {lines.map((l) => {
              // guess category from name for image
              const cat = l.name.toLowerCase().includes('panel')
                ? 'panels'
                : l.name.toLowerCase().includes('inverter')
                  ? 'inverters'
                  : l.name.toLowerCase().includes('batter')
                    ? 'batteries'
                    : '';
              const img = CATEGORY_IMG[cat];

              return (
                <div
                  key={l.variant_id}
                  style={{
                    background: '#fff',
                    borderRadius: 4,
                    padding: '14px 16px',
                    display: 'grid',
                    gridTemplateColumns: '80px 1fr auto',
                    gap: 14,
                    alignItems: 'center',
                  }}
                >
                  {/* Image */}
                  <div
                    style={{
                      width: 80,
                      height: 80,
                      background: '#f5f5f5',
                      borderRadius: 3,
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {img ? (
                      <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: 32 }}>📦</span>
                    )}
                  </div>

                  {/* Info */}
                  <div>
                    <p
                      style={{
                        margin: '0 0 4px',
                        fontSize: 13,
                        fontWeight: 600,
                        color: '#1a1a1a',
                        lineHeight: 1.3,
                      }}
                    >
                      {l.name}
                    </p>
                    <p style={{ margin: '0 0 10px', fontSize: 11, color: '#888' }}>
                      UGX {fmt(l.unit_price)} each
                    </p>

                    {/* Qty stepper */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          border: '1px solid #ddd',
                          borderRadius: 3,
                          overflow: 'hidden',
                        }}
                      >
                        <button
                          onClick={() => setQuantity(l.variant_id, l.quantity - 1)}
                          style={{
                            width: 32,
                            height: 32,
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
                            width: 40,
                            textAlign: 'center',
                            fontSize: 13,
                            fontWeight: 700,
                            borderLeft: '1px solid #ddd',
                            borderRight: '1px solid #ddd',
                            lineHeight: '32px',
                          }}
                        >
                          {l.quantity}
                        </span>
                        <button
                          onClick={() => setQuantity(l.variant_id, l.quantity + 1)}
                          style={{
                            width: 32,
                            height: 32,
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
                      <button
                        onClick={() => remove(l.variant_id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          fontSize: 12,
                          color: '#e53935',
                          cursor: 'pointer',
                          fontWeight: 600,
                        }}
                      >
                        Remove
                      </button>
                      <button
                        style={{
                          background: 'none',
                          border: 'none',
                          fontSize: 12,
                          color: '#888',
                          cursor: 'pointer',
                        }}
                      >
                        Save for later
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#e53935' }}>
                      UGX {fmt(l.unit_price * l.quantity)}
                    </p>
                    {l.quantity > 1 && (
                      <p style={{ margin: '2px 0 0', fontSize: 10, color: '#aaa' }}>
                        {l.quantity} × UGX {fmt(l.unit_price)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Promo code */}
            <div style={{ background: '#fff', borderRadius: 4, padding: '14px 16px' }}>
              <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>
                🏷️ Promo Code
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={promo}
                  onChange={(e) => {
                    setPromo(e.target.value);
                    setPromoError('');
                  }}
                  placeholder="Enter promo code (try SOLAR5)"
                  style={{
                    flex: 1,
                    height: 36,
                    padding: '0 12px',
                    border: `1px solid ${promoError ? '#e53935' : '#ddd'}`,
                    borderRadius: 3,
                    fontSize: 12,
                    outline: 'none',
                  }}
                />
                <button
                  onClick={applyPromo}
                  style={{
                    padding: '0 16px',
                    height: 36,
                    border: 'none',
                    borderRadius: 3,
                    background: '#f5a623',
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  Apply
                </button>
              </div>
              {promoError && (
                <p style={{ margin: '6px 0 0', fontSize: 11, color: '#e53935' }}>{promoError}</p>
              )}
              {promoApplied && (
                <p style={{ margin: '6px 0 0', fontSize: 11, color: '#2a7a4b', fontWeight: 600 }}>
                  ✓ 5% discount applied!
                </p>
              )}
            </div>
          </div>

          {/* ── Right: order summary ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ background: '#fff', borderRadius: 4, padding: 16 }}>
              <h2
                style={{
                  margin: '0 0 14px',
                  fontSize: 13,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: '#333',
                }}
              >
                Order Summary
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: '#555' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Subtotal ({lines.reduce((n, l) => n + l.quantity, 0)} items)</span>
                  <span style={{ fontWeight: 600, color: '#1a1a1a' }}>UGX {fmt(subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Delivery</span>
                  <span style={{ color: '#2a7a4b', fontWeight: 600 }}>Free</span>
                </div>
                {promoApplied && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2a7a4b' }}>
                    <span>Promo (SOLAR5)</span>
                    <span style={{ fontWeight: 600 }}>− UGX {fmt(discount)}</span>
                  </div>
                )}
              </div>

              <div style={{ height: 1, background: '#f0f0f0', margin: '12px 0' }} />

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 16,
                  fontWeight: 900,
                  color: '#1a1a1a',
                  marginBottom: 16,
                }}
              >
                <span>Total</span>
                <span style={{ color: '#e53935' }}>UGX {fmt(total)}</span>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                style={{
                  width: '100%',
                  height: 44,
                  border: 'none',
                  borderRadius: 4,
                  background: '#f5a623',
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: 'pointer',
                  marginBottom: 8,
                }}
              >
                Proceed to Checkout ({lines.reduce((n, l) => n + l.quantity, 0)})
              </button>

              <Link
                to="/store"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '10px 0',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  color: '#555',
                  fontSize: 13,
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Continue Shopping
              </Link>
            </div>

            {/* Delivery info */}
            <div style={{ background: '#fff', borderRadius: 4, padding: 14, fontSize: 12, color: '#555' }}>
              <p style={{ margin: '0 0 8px', fontWeight: 700, color: '#1a1a1a', fontSize: 13 }}>
                🚚 Delivery Info
              </p>
              <p style={{ margin: '0 0 6px' }}>
                ✓ <strong>Kampala</strong> — Free delivery
              </p>
              <p style={{ margin: '0 0 6px' }}>✓ Other areas — fee at checkout</p>
              <p style={{ margin: 0 }}>✓ Ready to ship in 1–2 business days</p>
            </div>

            {/* Security badges */}
            <div
              style={{
                background: '#fff',
                borderRadius: 4,
                padding: 14,
                fontSize: 11,
                color: '#888',
                textAlign: 'center',
              }}
            >
              <p style={{ margin: '0 0 6px', fontWeight: 700, color: '#555', fontSize: 12 }}>
                Safe & Secure Checkout
              </p>
              <p style={{ margin: 0 }}>🔒 SSL encrypted · 7-day returns · Verified seller</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
