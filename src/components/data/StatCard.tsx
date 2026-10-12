export function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <div className="text-sm text-ink-muted">{label}</div>
      <div className="mt-1 text-2xl font-bold text-ink">{value}</div>
      {hint && <div className="mt-1 text-xs text-ink-muted">{hint}</div>}
    </div>
  );
}
