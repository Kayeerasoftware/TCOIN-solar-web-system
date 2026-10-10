export function NotPermitted() {
  return (
    <div role="alert" className="mx-auto max-w-md p-10 text-center">
      <h1 className="text-2xl font-bold text-brand-green">Not permitted</h1>
      <p className="mt-2 text-ink-muted">You do not have permission to see this page. Ask an administrator if you need access.</p>
    </div>
  );
}
