import type { ReactNode } from 'react';
import { EmptyState } from '@/components/feedback/EmptyState';

export interface Column<T> {
  header: string;
  cell: (row: T) => ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

interface Props<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  emptyTitle?: string;
  emptyMessage?: string;
}

/** Simple responsive table. Wide tables scroll sideways inside their own container. */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  emptyTitle = 'Nothing here yet',
  emptyMessage,
}: Props<T>) {
  if (!rows.length) return <EmptyState title={emptyTitle} message={emptyMessage} />;
  return (
    <div className="overflow-x-auto rounded-lg border border-line bg-surface">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="bg-surface-alt">
            {columns.map((c) => (
              <th
                key={c.header}
                scope="col"
                className={`px-3 py-2 font-bold ${c.align === 'right' ? 'text-right' : 'text-left'}`}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={rowKey(r)} className="border-t border-line">
              {columns.map((c) => (
                <td
                  key={c.header}
                  className={`px-3 py-2 ${c.align === 'right' ? 'text-right' : ''} ${c.className ?? ''}`}
                >
                  {c.cell(r)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
