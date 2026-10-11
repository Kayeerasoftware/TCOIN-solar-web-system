import { PageFrame } from '@/components/print/PageFrame';
import { Letterhead } from './Letterhead';
import { QrCode } from '@/components/print/QrCode';

interface Props {
  receiptNo: string;
  receiptDate: string;
  receivedFrom: string;
  receivedFromAddress?: string;
  amount: string;
  currency: string;
  amountInWords: string;
  paymentFor?: string;
  method: string;
  chequeNo?: string;
  balanceAfter?: string;
  signatoryName?: string;
  verifyCode?: string;
}

export function CorporateReceipt({
  receiptNo,
  receiptDate,
  receivedFrom,
  receivedFromAddress,
  amount,
  currency,
  amountInWords,
  paymentFor,
  method,
  chequeNo,
  balanceAfter,
  signatoryName,
  verifyCode,
}: Props) {
  return (
    <PageFrame size="A5L">
      <Letterhead />

      <div className="flex items-start justify-between mt-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-brand-indigo">Receipt</p>
          <p className="text-[9px]">
            No: <strong>{receiptNo}</strong> &nbsp; Date: <strong>{receiptDate}</strong>
          </p>
        </div>
        {verifyCode && <QrCode value={`${window.location.origin}/verify/${verifyCode}`} size={48} />}
      </div>

      <p className="mt-2 text-[9px]">
        Received with thanks from: <strong>{receivedFrom}</strong>
      </p>
      {receivedFromAddress && <p className="text-[9px] text-ink-muted">{receivedFromAddress}</p>}

      <div className="mt-2 rounded border border-line p-2 text-[9px]">
        <p>
          Sum of Shillings: <strong>{amountInWords}</strong>
        </p>
        <p className="mt-0.5">
          Being payment of: <strong>{paymentFor ?? '—'}</strong>
        </p>
        <p className="mt-0.5">
          {method === 'cheque' ? `Cheque No: ${chequeNo ?? '—'}` : `Method: ${method?.replace('_', ' ')}`}
        </p>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <div className="rounded border border-brand-green px-4 py-2 text-center">
          <p className="text-[8px] text-ink-muted uppercase">SHS</p>
          <p className="text-[14px] font-bold text-brand-green">
            {currency} {amount}
          </p>
        </div>
        {balanceAfter !== undefined && (
          <div className="text-[9px] text-right">
            <p className="text-ink-muted">Balance remaining</p>
            <p className="font-bold">
              {currency} {balanceAfter}
            </p>
          </div>
        )}
      </div>

      <div className="mt-3 flex justify-between text-[9px]">
        <div className="w-32">
          <div className="border-b border-ink pb-3" />
          <p className="mt-1">Received by (signature)</p>
        </div>
        <div className="w-32 text-right">
          <div className="border-b border-ink pb-3" />
          <p className="mt-1 font-bold">{signatoryName ?? 'Authorised signatory'}</p>
          <p className="font-bold text-brand-indigo">For TCOIN SOLAR UG</p>
        </div>
      </div>
    </PageFrame>
  );
}
