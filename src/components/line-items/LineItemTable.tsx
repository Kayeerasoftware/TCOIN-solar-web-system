import type { ReactNode } from 'react';
import { LINE_ITEM_HEADERS } from '@/config/documentOptions';
import { formatNumber, sumAmounts } from '@/lib/money';
import type { CurrencyCode, LineItem } from '@/types/domain';

interface Props {
  items: LineItem[];
  currency?: CurrencyCode;
  showImages?: boolean;
  showTotal?: boolean;
  /** Extra columns appended after the eight standard ones, e.g. Reserved, Available for stock. */
  extraHeaders?: string[];
  renderExtra?: (item: LineItem) => ReactNode[];
  highlight?: (item: LineItem) => boolean;
}

const RIGHT = new Set([4, 6, 7]);

/**
 * The one table for every priced or counted list: No., Particulars, Size / Specification, Image,
 * Quantity, Unit, Rate, Amount. Quotes, BOM, stock, purchase orders and the cart all use it.
 */
export function LineItemTable({ items, currency = 'UGX', showImages = true, showTotal = true, extraHeaders = [], renderExtra, highlight }: Props) {
  const headers = LINE_ITEM_HEADERS.map((h) => h.replace('UGX', currency));
  const total = sumAmounts(items.map((i) => i.amount));
  const cols = headers.length + extraHeaders.length;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[820px] border-collapse text-sm">
        <thead>
          <tr className="bg-surface-alt">
            {[...headers, ...extraHeaders].map((h, i) => (
              <th key={h} scope="col" className={`border-b border-line px-2 py-2 font-bold ${RIGHT.has(i) ? 'text-right' : 'text-left'}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.line_no} className={`border-b border-line ${highlight?.(it) ? 'bg-amber-50' : ''}`}>
              <td className="px-2 py-2">{it.line_no}</td>
              <td className="px-2 py-2">{it.particulars}</td>
              <td className="px-2 py-2 text-ink-muted">{it.specification}</td>
              <td className="px-2 py-2">
                {showImages && (it.image_url ? <img src={it.image_url} alt="" className="h-9 w-11 rounded object-cover" /> : <div className="flex h-9 w-11 items-center justify-center rounded bg-line text-[9px] text-ink-muted">Photo</div>)}
              </td>
              <td className="px-2 py-2 text-right">{formatNumber(it.quantity)}</td>
              <td className="px-2 py-2">{it.unit}</td>
              <td className="px-2 py-2 text-right">{formatNumber(it.rate)}</td>
              <td className="px-2 py-2 text-right">{formatNumber(it.amount)}</td>
              {renderExtra?.(it).map((c, i) => <td key={i} className="px-2 py-2 text-right">{c}</td>)}
            </tr>
          ))}
        </tbody>
        {showTotal && (
          <tfoot>
            <tr className="bg-surface-alt font-bold">
              <td colSpan={7} className="px-2 py-2 text-right">Total</td>
              <td className="px-2 py-2 text-right">{formatNumber(total)}</td>
              {cols > 8 && <td colSpan={cols - 8} />}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
