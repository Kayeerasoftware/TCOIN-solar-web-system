import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  return (
    <div>
      <h1 className="mb-2 text-xl font-bold text-brand-green">Forgot your password?</h1>
      <p className="text-sm text-ink-muted">
        Password reset is handled by TCOIN staff for now. Call a hotline or email info.tcoinug@gmail.com, or{' '}
        <Link to="/otp" className="text-brand-green underline">
          sign in with a phone code
        </Link>
        .
      </p>
    </div>
  );
}
