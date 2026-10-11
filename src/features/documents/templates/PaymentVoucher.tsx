import { PageFrame } from '@/components/print/PageFrame';
import { Letterhead } from './Letterhead';

interface VoucherLine {
  serial_no: number;
  ref_no?: string;
  description: string;
  amount?: string;
}

interface Props {
  voucherNo: string;
  voucherDate: string;
  payTo: string;
  currency: string;
  method?: string;
  bankAccount?: string;
  chequeNo?: string;
  lines: VoucherLine[];
  total: string;
  amountInWords: string;
  preparedBy?: string;
  approvedBy?: string;
  receivedByName?: string;
  withholdingAmount?: string;
}

function VoucherCopy({ label, ...p }: Props & { label: string }) {
  return (
    <div className="w-[138mm] border border-line p-[4mm] text-[9px]">
      <Letterhead />
      <div className="flex items-start justify-between mt-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-brand-indigo">Payment Voucher</p>
        <span className="rounded border border-line px-1 text-[8px] text-ink-muted">{label}</span>
      </div>
      <div className="mt-1 grid grid-cols-2 gap-x-4">
        <p>
          Voucher No: <strong>{p.voucherNo}</strong>
        </p>
        <p>
          Date: <strong>{p.voucherDate}</strong>
        </p>
        <p className="col-span-2 mt-0.5">
          Pay to: <strong>{p.payTo}</strong>
        </p>
        {p.method && (
          <p>
            Method: <strong>{p.method.replace('_', ' ')}</strong>
          </p>
        )}
        {p.bankAccount && (
          <p>
            Bank A/C: <strong>{p.bankAccount}</strong>
          </p>
        )}
        {p.chequeNo && (
          <p>
            Cheque No: <strong>{p.chequeNo}</strong>
          </p>
        )}
      </div>

      <table className="mt-2 w-full border-collapse">
        <thead>
          <tr className="bg-surface-alt text-[8px]">
            <th className="border border-line px-1 py-0.5 text-left">S/N</th>
            <th className="border border-line px-1 py-0.5 text-left">Ref No.</th>
            <th className="border border-line px-1 py-0.5 text-left">Description</th>
            <th className="border border-line px-1 py-0.5 text-right">Amount ({p.currency})</th>
          </tr>
        </thead>
        <tbody>
          {p.lines.map((l) => (
            <tr key={l.serial_no}>
              <td className="border border-line px-1 py-0.5">{l.serial_no}</td>
              <td className="border border-line px-1 py-0.5">{l.ref_no ?? ''}</td>
              <td className="border border-line px-1 py-0.5">{l.description}</td>
              <td className="border border-line px-1 py-0.5 text-right">{l.amount ?? ''}</td>
            </tr>
          ))}
          <tr className="font-bold">
            <td colSpan={3} className="border border-line px-1 py-0.5 text-right">
              Total
            </td>
            <td className="border border-line px-1 py-0.5 text-right">
              {p.currency} {p.total}
            </td>
          </tr>
          {p.withholdingAmount && (
            <tr>
              <td colSpan={3} className="border border-line px-1 py-0.5 text-right text-ink-muted">
                Withholding tax
              </td>
              <td className="border border-line px-1 py-0.5 text-right text-ink-muted">
                ({p.withholdingAmount})
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <p className="mt-1">
        Sum of: <strong>{p.amountInWords}</strong>
      </p>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {[
          { label: 'Prepared by', value: p.preparedBy },
          { label: 'Approved by', value: p.approvedBy },
          { label: 'Received by', value: p.receivedByName },
        ].map(({ label, value }) => (
          <div key={label}>
            <div className="border-b border-ink pb-3" />
            <p className="mt-0.5 text-[8px] text-ink-muted">{label}</p>
            {value && <p className="font-bold">{value}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

export function PaymentVoucher(props: Props) {
  return (
    <PageFrame size="A4L">
      <div className="flex gap-[4mm]">
        <VoucherCopy {...props} label="ORIGINAL" />
        <VoucherCopy {...props} label="COPY" />
      </div>
    </PageFrame>
  );
}
