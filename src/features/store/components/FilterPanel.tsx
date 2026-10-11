const CATEGORIES = [
  { value: '', label: 'All products' },
  { value: 'panels', label: 'Solar Panels' },
  { value: 'inverters', label: 'Inverters' },
  { value: 'batteries', label: 'Batteries' },
  { value: 'controllers', label: 'Charge Controllers' },
  { value: 'mounting', label: 'Mounting & Structures' },
  { value: 'pumps', label: 'Solar Pumps' },
  { value: 'accessories', label: 'Cables & Accessories' },
];

interface Props {
  category: string;
  onCategory: (c: string) => void;
  inStockOnly: boolean;
  onInStockOnly: (v: boolean) => void;
}

export function FilterPanel({ category, onCategory, inStockOnly, onInStockOnly }: Props) {
  return (
    <aside className="w-48 shrink-0 space-y-6">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-muted">Category</p>
        <ul className="space-y-0.5">
          {CATEGORIES.map((c) => (
            <li key={c.value}>
              <button
                onClick={() => onCategory(c.value)}
                className={`w-full rounded px-2 py-1.5 text-left text-sm transition-colors ${category === c.value ? 'bg-green-50 font-bold text-brand-green' : 'text-ink hover:bg-surface-alt'}`}
              >
                {c.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-muted">Availability</p>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => onInStockOnly(e.target.checked)}
            className="h-4 w-4 rounded border-line accent-brand-green"
          />
          In stock only
        </label>
      </div>
    </aside>
  );
}
