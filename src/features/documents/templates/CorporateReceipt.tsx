import { PageFrame } from '@/components/print/PageFrame';
import { formatDate } from '@/lib/dates';
import { formatNumber } from '@/lib/money';
import type { Receipt } from '@/types/api';
import { Letterhead } from './Letterhead';

const METHOD: Record<string, string> = {
  cash: 'Cash',
  cheque: 'Cheque',
  mtn_momo: 'MTN MoMo',
  airtel_money: 'Airtel Money',
  bank_transfer: 'Bank transfer',
  card: 'Card',
};

export function CorporateReceipt({ receipt }: { receipt: Receipt }) {
  const dots = 'border-b border-dotted border-ink font-serif not-italic';
  return (
    <PageFrame size="A5L">
      <Letterhead />
      <div className="flex gap-3">
        <div className="flex-1 rounded-2xl border-[3px] border-ink px-3 py-2 text-[13px] font-bold italic">
          Received with thanks from <span className={dots}>{receipt.received_from}</span>
          {receipt.received_from_address && (
            <div className={`${dots} mt-1 font-normal`}>{receipt.received_from_address}</div>
          )}
        </div>
        <div className="w-[200px] border-[3px] border-ink">
          <div className="bg-ink py-0.5 text-center text-[15px] text-white">RECEIPT</div>
          <div className="flex border-b-2 border-ink">
            <b className="w-12 p-1 font-serif">Date</b>
            <span className="flex-1 border-l-2 border-ink p-1 text-[12px]">
              {formatDate(receipt.receipt_date)}
            </span>
          </div>
          <div className="flex">
            <b className="w-12 p-1 font-serif">No</b>
            <span className="flex-1 border-l-2 border-ink p-1 text-[12px]">{receipt.receipt_no}</span>
          </div>
        </div>
      </div>
      <p className="mt-2 text-[13px] font-bold italic">
        The sum of Shillings <span className={dots}>{receipt.amount_in_words}</span>
      </p>
      <p className="mt-1.5 text-[13px] font-bold italic">
        Being payment of <span className={dots}>{receipt.payment_for ?? ''}</span>
      </p>
      <div className="mt-1.5 flex gap-4 text-[13px] font-bold italic">
        <p className="flex-[3]">
          Cash / Cheque No{' '}
          <span className={dots}>
            {METHOD[receipt.method]}
            {receipt.cheque_no ? ` ${receipt.cheque_no}` : ''}
          </span>
        </p>
        <p className="flex-[2]">
          Balance{' '}
          <span className={dots}>
            {receipt.balance_after != null ? formatNumber(receipt.balance_after) : ''}
          </span>
        </p>
      </div>
      <div className="mt-3 flex items-end justify-between">
        <div>
          <b className="text-[12px] italic">SHS</b>{' '}
          <span className="ml-1 inline-block min-w-[190px] rounded-xl border-[3px] border-ink px-3 py-2 font-serif text-[16px]">
            {formatNumber(receipt.amount)}
          </span>
          <div className="ml-8 mt-1 text-[12px] font-bold italic">Thank you</div>
        </div>
        <div className="w-[300px] text-[12px]">
          <b>Signature</b> <span className={dots}>{receipt.signatory_name}</span>
          <div className="mt-1">
            For and on behalf of: <b>TCOIN</b>
          </div>
        </div>
      </div>
    </PageFrame>
  );
}
