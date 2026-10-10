import type { ReactNode } from 'react';

export function EmptyState({ title, message, action }: { title: string; message?: string; action?: ReactNode }) {
  return (
    <div className="rounded-lg border border-line bg-surface p-10 text-center">
      <h2 className="text-lg font-bold">{title}</h2>
      {message && <p className="mt-1 text-ink-muted">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
