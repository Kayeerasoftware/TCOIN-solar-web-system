import { TextInput } from '@/components/forms/controls';
import { Button } from '@/components/ui/Button';
import { LINE_ITEM_HEADERS } from '@/config/documentOptions';
import { formatNumber, lineAmount } from '@/lib/money';
import type { CatalogItem } from '@/types/api';
import { blankLine, newLineKey, type EditorLine } from './lineHelpers';

interface Props {
  lines: EditorLine[];
  onChange: (lines: EditorLine[]) => void;
  catalog: CatalogItem[];
  disabled?: boolean;
}

/** Editable version of the eight-column table: No., Particulars, Size / Specification, Image, Quantity, Unit, Rate, Amount. */
export function LineItemEditor({ lines, onChange, catalog, disabled }: Props) {
  const patch = (key: string, p: Partial<EditorLine>) =>
    onChange(lines.map((l) => (l.key === key ? { ...l, ...p } : l)));
  const addFromCatalog = (variantId: string) => {
    const c = catalog.find((x) => x.variant_id === variantId);
    if (!c) return;
    const line: EditorLine = {
      key: newLineKey(),
      variant_id: c.variant_id,
      particulars: c.name,
      specification: c.specification,
      unit: c.unit,
      quantity: 1,
      rate: c.rate,
      image_url: c.image_url,
    };
    onChange([...lines.filter((l) => l.particulars.trim() || l.rate), line]);
  };
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <select
          aria-label="Add from catalog"
          disabled={disabled}
          value=""
          onChange={(e) => addFromCatalog(e.target.value)}
          className="min-h-[44px] rounded-md border border-line bg-white px-3"
        >
          <option value="">Add from catalog...</option>
          {catalog.map((c) => (
            <option key={c.variant_id} value={c.variant_id}>
              {c.name} ({c.sku})
            </option>
          ))}
        </select>
        <Button
          type="button"
          variant="secondary"
          disabled={disabled}
          onClick={() => onChange([...lines, blankLine()])}
        >
          Add blank line
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-sm">
          <thead>
            <tr className="bg-surface-alt">
              {[...LINE_ITEM_HEADERS, ''].map((h, i) => (
                <th
                  key={i}
                  scope="col"
                  className={`px-2 py-2 font-bold ${[4, 6, 7].includes(i) ? 'text-right' : 'text-left'}`}
                >
                  {h || <span className="sr-only">Remove</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lines.map((l, i) => {
              const n = i + 1;
              return (
                <tr key={l.key} className="border-b border-line align-top">
                  <td className="px-2 py-2">{n}</td>
                  <td className="px-1 py-1">
                    <TextInput
                      aria-label={`Line ${n} particulars`}
                      disabled={disabled}
                      value={l.particulars}
                      onChange={(e) => patch(l.key, { particulars: e.target.value })}
                    />
                  </td>
                  <td className="px-1 py-1">
                    <TextInput
                      aria-label={`Line ${n} specification`}
                      disabled={disabled}
                      value={l.specification}
                      onChange={(e) => patch(l.key, { specification: e.target.value })}
                    />
                  </td>
                  <td className="px-2 py-2">
                    {l.image_url ? (
                      <img src={l.image_url} alt="" className="h-9 w-11 rounded object-cover" />
                    ) : (
                      <div className="flex h-9 w-11 items-center justify-center rounded bg-line text-[9px] text-ink-muted">
                        Photo
                      </div>
                    )}
                  </td>
                  <td className="w-24 px-1 py-1">
                    <TextInput
                      aria-label={`Line ${n} quantity`}
                      type="number"
                      min={0}
                      step="any"
                      disabled={disabled}
                      className="text-right"
                      value={l.quantity}
                      onChange={(e) => patch(l.key, { quantity: Number(e.target.value) })}
                    />
                  </td>
                  <td className="w-20 px-1 py-1">
                    <TextInput
                      aria-label={`Line ${n} unit`}
                      disabled={disabled}
                      value={l.unit}
                      onChange={(e) => patch(l.key, { unit: e.target.value })}
                    />
                  </td>
                  <td className="w-32 px-1 py-1">
                    <TextInput
                      aria-label={`Line ${n} rate`}
                      type="number"
                      min={0}
                      step="any"
                      disabled={disabled}
                      className="text-right"
                      value={l.rate}
                      onChange={(e) => patch(l.key, { rate: Number(e.target.value) })}
                    />
                  </td>
                  <td className="w-32 px-2 py-2 text-right font-medium">
                    {formatNumber(lineAmount(l.quantity, l.rate))}
                  </td>
                  <td className="px-1 py-1">
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={disabled}
                      aria-label={`Remove line ${n}`}
                      onClick={() => onChange(lines.filter((x) => x.key !== l.key))}
                    >
                      Remove
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {!lines.length && (
        <p className="mt-2 text-sm text-ink-muted">
          No lines yet. Add an item from the catalog or a blank line.
        </p>
      )}
    </div>
  );
}
