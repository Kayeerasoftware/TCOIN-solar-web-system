export function LoadingState({ label = 'Loading' }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex items-center justify-center gap-3 p-10 text-ink-muted">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-line border-t-brand-green" />
      <span>{label}</span>
    </div>
  );
}
