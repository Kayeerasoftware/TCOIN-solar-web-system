import { LineItemTable } from '@/components/line-items/LineItemTable';
import { PageFrame } from '@/components/print/PageFrame';
import { DOCUMENT_DEFAULTS } from '@/config/documentOptions';
import { formatDate } from '@/lib/dates';
import { formatNumber } from '@/lib/money';
import type { Quote } from '@/types/api';
import { Letterhead } from './Letterhead';

/** Proforma Invoice: To M/s, number and date, title, the eight-column table, totals, validity, words, signatures. */
export function ProformaInvoice({ quote }: { quote: Quote }) {
  const issued = !!quote.proforma_no;
  return (
    <PageFrame size="A4">
      <div className="flex h-full flex-col">
        <Letterhead />
        <div className="flex gap-3">
          <div className="min-h-[70px] flex-1 border-2 border-ink p-2 text-[11px]">
            <div className="text-ink-muted">To. M/s:</div>
            <div className="py-1 font-serif text-[14px]">{quote.bill_to_text}</div>
          </div>
          <div className="w-[230px] border-2 border-ink">
            <div className="border-b-2 border-ink p-1 text-center font-serif text-[14px] font-bold">
              PROFORMA INVOICE
            </div>
            <div className="flex border-b-2 border-ink">
              <div className="w-14 p-1.5 font-serif font-bold">No.</div>
              <div className="flex-1 border-l-2 border-ink p-1.5 text-[14px] text-brand-red">
                {quote.proforma_no ?? 'Not issued'}
              </div>
            </div>
            <div className="flex">
              <div className="w-14 p-1.5 font-serif font-bold">Date :</div>
              <div className="flex-1 border-l-2 border-ink p-1.5">
                {quote.issued_on ? formatDate(quote.issued_on) : '-'}
              </div>
            </div>
          </div>
        </div>
        <h2 className="my-3 font-serif text-[14px] font-bold">{quote.document_title}</h2>
        <LineItemTable
          compact
          showTotal={false}
          showImages={quote.show_images}
          items={quote.lines.map((l) => ({ ...l, specification: l.specification }))}
        />
        <div className="mt-3 flex items-center justify-end gap-3 text-[11px] font-bold">
          {quote.discount_amount > 0 && (
            <span className="font-normal">
              Discount {quote.discount_pct}%: - {formatNumber(quote.discount_amount)}
            </span>
          )}
          <span>Total</span>
          <span className="min-w-[90px] border-2 border-ink px-2 py-1 text-right font-normal">
            {formatNumber(quote.subtotal)}
          </span>
        </div>
        <div className="mt-auto">
          <div className="flex items-center justify-between border-b border-t-2 border-ink py-1">
            <b className="border-r-2 border-ink pr-2 text-[11px]">{quote.show_eoe ? 'E&OE' : ''}</b>
            <span className="flex items-center gap-2">
              <b className="text-[11px]">GRAND TOTAL</b>
              <span className="border-2 border-ink px-2 py-0.5 text-[18px]">{formatNumber(quote.total)}</span>
            </span>
          </div>
          <p className="ml-4 mt-4 text-[11px] italic">
            All rates are valid for {quote.validity_days || DOCUMENT_DEFAULTS.proformaValidityDays} days
          </p>
          <p className="mt-1 text-[11px]">
            Amount in words{' '}
            <span className="border-b border-dotted border-ink font-serif">{quote.amount_in_words}</span>
          </p>
          <div className="mt-4 flex gap-6 text-[11px]">
            <div className="flex-1 border-b border-dotted border-ink">Client&rsquo;s signature:</div>
            <div className="flex-1 border-b border-dotted border-ink">
              Signed: <span className="font-serif">{issued ? quote.signatory_name : ''}</span>
            </div>
          </div>
          <p className="mt-1 text-right text-[11px]">
            For and on behalf of: <b>TCOIN</b>
          </p>
          <div className="mt-2 border-t-2 border-ink pt-1 text-center text-[12px] font-bold">
            {DOCUMENT_DEFAULTS.footer}
          </div>
        </div>
      </div>
    </PageFrame>
  );
}
