import { PageFrame } from '@/components/print/PageFrame';
import { Letterhead } from './Letterhead';
import { QrCode } from '@/components/print/QrCode';
import { LineItemTable } from '@/components/line-items/LineItemTable';
import type { CurrencyCode, LineItem } from '@/types/domain';

interface Props {
  proformaNo: string;
  issuedOn: string;
  validUntil: string;
  billToText: string;
  documentTitle?: string;
  lines: LineItem[];
  currency: CurrencyCode;
  subtotal: string;
  taxAmount: string;
  total: string;
  amountInWords: string;
  showEoe?: boolean;
  signatoryName?: string;
  signatoryTitle?: string;
  verifyCode?: string;
}

export function ProformaInvoice({
  proformaNo,
  issuedOn,
  validUntil,
  billToText,
  documentTitle = 'PROFORMA INVOICE',
  lines,
  currency,
  subtotal,
  taxAmount,
  total,
  amountInWords,
  showEoe = true,
  signatoryName,
  signatoryTitle,
  verifyCode,
}: Props) {
  return (
    <PageFrame size="A4">
      <Letterhead />

      {/* Title row */}
      <div className="flex items-start justify-between mt-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-brand-indigo">{documentTitle}</p>
          <p className="mt-0.5 text-[9px] text-ink-muted">
            No: <strong>{proformaNo}</strong>
          </p>
          <p className="text-[9px] text-ink-muted">
            Date: <strong>{issuedOn}</strong>
          </p>
          <p className="text-[9px] text-ink-muted">
            Valid until: <strong>{validUntil}</strong>
          </p>
        </div>
        {verifyCode && <QrCode value={`${window.location.origin}/verify/${verifyCode}`} size={56} />}
      </div>

      {/* Bill to */}
      <div className="mt-2 rounded border border-line p-2">
        <p className="text-[8px] font-bold uppercase text-ink-muted">To M/s</p>
        <pre className="mt-0.5 text-[9px] leading-snug whitespace-pre-wrap">{billToText}</pre>
      </div>

      {/* Line items */}
      <div className="mt-3 text-[9px]">
        <LineItemTable items={lines} currency={currency} showImages showTotal />
      </div>

      {/* Totals */}
      <div className="mt-2 flex justify-end">
        <div className="w-56 space-y-0.5 text-[9px]">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>
              {currency} {subtotal}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Tax</span>
            <span>
              {currency} {taxAmount}
            </span>
          </div>
          {showEoe && <p className="text-[8px] italic text-ink-muted">E&amp;OE</p>}
          <div className="flex justify-between border-t border-ink pt-0.5 font-bold">
            <span>Grand Total</span>
            <span>
              {currency} {total}
            </span>
          </div>
        </div>
      </div>

      {/* Amount in words */}
      <p className="mt-2 text-[9px]">
        Sum of: <strong>{amountInWords}</strong>
      </p>

      {/* Signatures */}
      <div className="mt-4 flex justify-between text-[9px]">
        <div className="w-40">
          <div className="border-b border-ink pb-4" />
          <p className="mt-1">Client signature &amp; date</p>
        </div>
        <div className="w-40 text-right">
          <div className="border-b border-ink pb-4" />
          <p className="mt-1 font-bold">{signatoryName ?? 'Authorised signatory'}</p>
          {signatoryTitle && <p className="text-ink-muted">{signatoryTitle}</p>}
          <p className="font-bold text-brand-indigo">For TCOIN SOLAR UG</p>
        </div>
      </div>
    </PageFrame>
  );
}
