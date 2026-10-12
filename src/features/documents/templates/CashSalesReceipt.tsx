import { PageFrame } from '@/components/print/PageFrame';
import { formatDate } from '@/lib/dates';
import { formatNumber } from '@/lib/money';
import type { Receipt } from '@/types/api';
import { Letterhead } from './Letterhead';

const HEAD = ['No.', 'QTY', 'PARTICULARS', 'Rate (UGX)', 'Amount (UGX)'];
const W = ['8%', '10%', '47%', '16%', '19%'];

export function CashSalesReceipt({ receipt }: { receipt: Receipt }) {
  const blanks = Math.max(0, 8 - receipt.lines.length);
  return (
    <PageFrame size="A4">
      <Letterhead />
      <div className="flex items-center justify-between">
        <div className="inline-block rounded-2xl border-[3px] border-ink px-4 py-1 text-[22px] font-bold">
          Cash / Sales Receipt
        </div>
        <div className="text-[13px] font-bold">
          <div>
            Receipt No: <span className="font-serif font-normal">{receipt.receipt_no}</span>
          </div>
          <div className="mt-1">
            Date: <span className="font-serif font-normal">{formatDate(receipt.receipt_date)}</span>
          </div>
        </div>
      </div>
      <p className="mt-3 text-[13px]">
        <b>Received from:</b>{' '}
        <span className="border-b border-dotted border-ink font-serif">{receipt.received_from}</span>
      </p>
      <table className="mt-3 w-full table-fixed border-collapse text-[12px]">
        <thead>
          <tr>
            {HEAD.map((h, i) => (
              <th key={h} style={{ width: W[i] }} className="border-2 border-ink p-1">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {receipt.lines.map((l) => (
            <tr key={l.line_no}>
              {[l.line_no, l.quantity, l.particulars, formatNumber(l.rate), formatNumber(l.amount)].map(
                (c, i) => (
                  <td
                    key={i}
                    className={`h-8 border-2 border-ink px-1 font-serif ${i >= 3 ? 'text-right' : ''}`}
                  >
                    {c}
                  </td>
                ),
              )}
            </tr>
          ))}
          {Array.from({ length: blanks }, (_, i) => (
            <tr key={`b${i}`}>
              {HEAD.map((h) => (
                <td key={h} className="h-8 border-2 border-ink" />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-2 flex items-center justify-end gap-3 text-[13px] font-bold">
        <span>Total</span>
        <span className="min-w-[110px] border-[3px] border-ink px-2 py-1 text-right font-serif font-normal">
          {formatNumber(receipt.amount)}
        </span>
      </div>
      <p className="mt-3 text-[14px]">
        <b>The sum of Shillings</b>{' '}
        <span className="border-b border-dotted border-ink font-serif">{receipt.amount_in_words}</span>
      </p>
      <p className="ml-28 mt-6 text-[14px]">
        <b>Signature</b>{' '}
        <span className="border-b border-dotted border-ink font-serif">{receipt.signatory_name}</span>
      </p>
      <p className="ml-36 mt-2 text-[14px]">
        For and on behalf of: <b>TCOIN</b>
      </p>
      {receipt.disclaimer && (
        <p className="ml-32 mt-4 text-[13px] font-bold">Disclaimer, {receipt.disclaimer}</p>
      )}
    </PageFrame>
  );
}
