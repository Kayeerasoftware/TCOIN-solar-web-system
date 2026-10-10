import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="mx-auto max-w-md p-10 text-center">
      <h1 className="text-2xl font-bold text-brand-green">We could not find that page</h1>
      <p className="mt-2 text-ink-muted">Check the link or go back to the home page.</p>
      <Link to="/" className="mt-4 inline-block rounded bg-brand-accent px-4 py-2 font-bold text-ink">Go home</Link>
    </div>
  );
}
