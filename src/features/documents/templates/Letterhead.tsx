import { DoubleRule } from '@/components/brand/DoubleRule';
import { Logo } from '@/components/brand/Logo';
import { Watermark } from '@/components/brand/Watermark';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';

/** Header used by the proforma invoice, receipts, voucher, and delivery note (compact contact block). */
export function Letterhead() {
  const p = useCompanyProfile();
  return (
    <header>
      <Watermark />
      <div className="flex items-end gap-3">
        <Logo />
        <div className="flex-1 text-right">
          <div className="font-serif text-[26px] font-bold leading-none text-brand-indigo">CENTER OF INNOVATIONS</div>
          <div className="mt-1 text-[9px] font-bold leading-tight">
            Located at {p.address}, {p.po_box}<br />Tel: {p.mobile}, {p.hotlines.slice(0, 2).join(', ')} | Email: {p.email} | Website: {p.web}
          </div>
        </div>
      </div>
      <div className="mt-1"><DoubleRule /></div>
      <ul className="mt-1 text-[9px] italic leading-snug">{p.what_we_do.map((l) => <li key={l}>{l}</li>)}</ul>
      <div className="my-2 border-t border-dashed border-ink-muted" />
    </header>
  );
}
