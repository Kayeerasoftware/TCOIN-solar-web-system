import { Link, useLocation } from 'react-router-dom';

export function GuestCartGate() {
  const { pathname } = useLocation();
  return (
    <div
      style={{
        background: '#f0f0f0',
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 6,
          padding: '48px 40px',
          textAlign: 'center',
          maxWidth: 420,
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        }}
      >
        <div style={{ fontSize: 56, marginBottom: 16 }}>🛒</div>
        <h2 style={{ margin: '0 0 10px', fontSize: 20, fontWeight: 800, color: '#1a1a1a' }}>
          Sign in to continue
        </h2>
        <p style={{ margin: '0 0 24px', fontSize: 13, color: '#666', lineHeight: 1.7 }}>
          Your cart is saved to your account so you never lose your items. Sign in or create a free account to
          proceed to checkout.
        </p>
        <Link
          to="/login"
          state={{ from: pathname }}
          style={{
            display: 'block',
            padding: '13px 0',
            background: 'linear-gradient(135deg,#1D6434,#155228)',
            color: '#fff',
            borderRadius: 4,
            fontWeight: 800,
            fontSize: 14,
            textDecoration: 'none',
            marginBottom: 10,
          }}
        >
          Sign in to my account
        </Link>
        <Link
          to="/register"
          state={{ from: pathname }}
          style={{
            display: 'block',
            padding: '13px 0',
            background: '#3B3A93',
            color: '#fff',
            borderRadius: 4,
            fontWeight: 800,
            fontSize: 14,
            textDecoration: 'none',
            marginBottom: 16,
          }}
        >
          Create a free account
        </Link>
        <Link to="/store" style={{ fontSize: 13, color: '#1d6434', textDecoration: 'underline' }}>
          ← Continue browsing
        </Link>
      </div>
    </div>
  );
}
