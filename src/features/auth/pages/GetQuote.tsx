import { Link } from 'react-router-dom';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function GetQuote() {
  useDocumentTitle('Get a Free Quote');
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>☀️</div>
      <h1 className="mb-2 text-xl font-bold text-brand-green">Get your free solar quote</h1>
      <p style={{ fontSize: '0.88rem', color: '#5A6878', marginBottom: '1.5rem', lineHeight: 1.6 }}>
        Your personalised quote lives in your customer portal — where you can view it, accept it, and track
        your project from survey to switch-on. Sign in or create a free account to continue.
      </p>
      <Link
        to="/login"
        state={{ from: '/portal/quotes' }}
        className="block w-full rounded-xl py-3 text-sm font-bold text-white mb-3"
        style={{ background: 'linear-gradient(135deg,#1D6434 0%,#155228 100%)' }}
      >
        Sign in to my account
      </Link>
      <Link
        to="/register"
        state={{ from: '/portal/quotes' }}
        className="block w-full rounded-xl py-3 text-sm font-bold text-white mb-4"
        style={{ background: '#3B3A93' }}
      >
        Create a free account
      </Link>
      <p style={{ fontSize: '0.78rem', color: '#9AA3AE' }}>
        Not ready yet?{' '}
        <Link to="/calculator" className="text-brand-green underline">
          Try the solar calculator first
        </Link>{' '}
        to see an instant estimate.
      </p>
    </div>
  );
}
