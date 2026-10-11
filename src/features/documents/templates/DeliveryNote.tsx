import { PageFrame } from '@/components/print/PageFrame';
import { Letterhead } from './Letterhead';
import { QrCode } from '@/components/print/QrCode';

interface DNLine {
  line_no: number;
  item_no?: string;
  description: string;
  quantity: number;
  unit?: string;
  condition?: string;
}

interface Props {
  dnNo: string;
  dnDate: string;
  deliverToName: string;
  deliverToAddress?: string;
  contactInfo?: string;
  lines: DNLine[];
  deliveredByName?: string;
  receivedByName?: string;
  verifyCode?: string;
}

export function DeliveryNote({
  dnNo,
  dnDate,
  deliverToName,
  deliverToAddress,
  contactInfo,
  lines,
  deliveredByName,
  receivedByName,
  verifyCode,
}: Props) {
  return (
    <PageFrame size="A4">
      <Letterhead />

      <div className="flex items-start justify-between mt-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-brand-indigo">Delivery Note</p>
          <p className="text-[9px]">
            No: <strong>{dnNo}</strong> &nbsp; Date: <strong>{dnDate}</strong>
          </p>
        </div>
        {verifyCode && <QrCode value={`${window.location.origin}/verify/${verifyCode}`} size={56} />}
      </div>

      <div className="mt-2 rounded border border-line p-2 text-[9px]">
        <p className="font-bold">Delivered to:</p>
        <p>
          <strong>{deliverToName}</strong>
        </p>
        {deliverToAddress && <p className="text-ink-muted">{deliverToAddress}</p>}
        {contactInfo && <p className="text-ink-muted">{contactInfo}</p>}
      </div>

      <table className="mt-3 w-full border-collapse text-[9px]">
        <thead>
          <tr className="bg-surface-alt">
            <th className="border border-line px-1 py-0.5 text-left">No.</th>
            <th className="border border-line px-1 py-0.5 text-left">Item No.</th>
            <th className="border border-line px-1 py-0.5 text-left">Description</th>
            <th className="border border-line px-1 py-0.5 text-right">QTY</th>
            <th className="border border-line px-1 py-0.5 text-left">Unit</th>
            <th className="border border-line px-1 py-0.5 text-left">Condition</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((l) => (
            <tr key={l.line_no}>
              <td className="border border-line px-1 py-0.5">{l.line_no}</td>
              <td className="border border-line px-1 py-0.5">{l.item_no ?? ''}</td>
              <td className="border border-line px-1 py-0.5">{l.description}</td>
              <td className="border border-line px-1 py-0.5 text-right">{l.quantity}</td>
              <td className="border border-line px-1 py-0.5">{l.unit ?? 'pcs'}</td>
              <td className="border border-line px-1 py-0.5">{l.condition ?? 'Good'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 flex justify-between text-[9px]">
        <div className="w-48">
          <div className="border-b border-ink pb-6" />
          <p className="mt-1 font-bold">{receivedByName ?? '___________________'}</p>
          <p className="text-ink-muted">Item received by (name, signature &amp; date)</p>
        </div>
        <div className="w-48 text-right">
          <div className="border-b border-ink pb-6" />
          <p className="mt-1 font-bold">{deliveredByName ?? '___________________'}</p>
          <p className="text-ink-muted">Item delivered by (name, signature &amp; date)</p>
        </div>
      </div>
    </PageFrame>
  );
}
