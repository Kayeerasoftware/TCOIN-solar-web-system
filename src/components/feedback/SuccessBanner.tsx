export function SuccessBanner({ title, message }: { title: string; message?: string }) {
  return (
    <div role="status" className="rounded-lg border border-brand-green bg-green-50 p-4">
      <b className="text-brand-green">{title}</b>
      {message && <p className="text-sm text-ink-muted">{message}</p>}
    </div>
  );
}
