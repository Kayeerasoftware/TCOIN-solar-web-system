export function PrintButton({ label = 'Print' }: { label?: string }) {
  return (
    <button type="button" className="rounded border border-brand-green px-4 py-2 font-bold text-brand-green print:hidden" onClick={() => window.print()}>
      {label}
    </button>
  );
}
