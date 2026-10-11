import { PageFrame } from '@/components/print/PageFrame';
import { Letterhead } from './Letterhead';
import { QrCode } from '@/components/print/QrCode';
import { LineItemTable } from '@/components/line-items/LineItemTable';
import type { CurrencyCode, LineItem } from '@/types/domain';

interface Props {
  receiptNo: string;
  receiptDate: string;
  receivedFrom: string;
  lines: LineItem[];
  currency: CurrencyCode;
  total: string;
  amountInWords: string;
  signatoryName?: string;
  verifyCode?: string;
}

export function CashSalesReceipt({
  receiptNo,
  receiptDate,
  receivedFrom,
  lines,
  currency,
  total,
  amountInWords,
  signatoryName,
  verifyCode,
}: Props) {
  return (
    <PageFrame size="A4">
      <Letterhead />

      <div className="flex items-start justify-between mt-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-brand-indigo">
            Cash / Sales Receipt
          </p>
          <p className="mt-0.5 text-[9px]">
            Receipt No: <strong>{receiptNo}</strong>
          </p>
          <p className="text-[9px]">
            Date: <strong>{receiptDate}</strong>
          </p>
        </div>
        {verifyCode && <QrCode value={`${window.location.origin}/verify/${verifyCode}`} size={56} />}
      </div>

      <p className="mt-2 text-[9px]">
        Received from: <strong>{receivedFrom}</strong>
      </p>

      <div className="mt-3 text-[9px]">
        <LineItemTable items={lines} currency={currency} showImages showTotal />
      </div>

      <div className="mt-2 flex justify-end">
        <div className="w-56 text-[9px]">
          <div className="flex justify-between border-t border-ink pt-0.5 font-bold">
            <span>Total</span>
            <span>
              {currency} {total}
            </span>
          </div>
        </div>
      </div>

      <p className="mt-2 text-[9px]">
        Sum of Shillings: <strong>{amountInWords}</strong>
      </p>

      <div className="mt-4 flex justify-between text-[9px]">
        <div className="w-40">
          <div className="border-b border-ink pb-4" />
          <p className="mt-1">Customer signature</p>
        </div>
        <div className="w-40 text-right">
          <div className="border-b border-ink pb-4" />
          <p className="mt-1 font-bold">{signatoryName ?? 'Cashier'}</p>
          <p className="text-[8px] text-ink-muted">This receipt is valid only when signed and stamped.</p>
        </div>
      </div>
    </PageFrame>
  );
}
