export function ErrorState({ message = 'Something went wrong.', onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="rounded-lg border border-brand-red/40 bg-red-50 p-6 text-center">
      <p className="font-medium text-brand-red">{message}</p>
      {onRetry && (
        <button className="mt-3 rounded bg-brand-accent px-4 py-2 font-bold text-ink" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
