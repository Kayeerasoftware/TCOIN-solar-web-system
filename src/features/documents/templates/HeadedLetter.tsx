import { PageFrame } from '@/components/print/PageFrame';
import { DoubleRule } from '@/components/brand/DoubleRule';
import { Logo } from '@/components/brand/Logo';
import { Watermark } from '@/components/brand/Watermark';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';

interface Props {
  ourRef?: string;
  yourRef?: string;
  letterDate?: string;
  addressee: string;
  subject?: string;
  body: string;
  signatoryName?: string;
  signatoryTitle?: string;
}

export function HeadedLetter({
  ourRef,
  yourRef,
  letterDate,
  addressee,
  subject,
  body,
  signatoryName,
  signatoryTitle,
}: Props) {
  const p = useCompanyProfile();
  return (
    <PageFrame size="A4">
      <Watermark />

      {/* Full letterhead */}
      <header>
        <div className="flex items-end gap-3">
          <Logo />
          <div className="flex-1 text-right">
            <div className="font-serif text-[26px] font-bold leading-none text-brand-indigo">
              CENTER OF INNOVATIONS
            </div>
            <div className="mt-1 text-[9px] font-bold leading-tight">
              {p.address}, {p.po_box}
              <br />
              Tel: {p.mobile} | {p.hotlines.slice(0, 2).join(' | ')}
              <br />
              Email: {p.email} | Web: {p.web}
            </div>
          </div>
        </div>
        <div className="mt-1">
          <DoubleRule />
        </div>
        <ul className="mt-1 flex flex-wrap gap-x-4 text-[8px] italic text-ink-muted">
          {p.what_we_do.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
        <div className="my-2 border-t border-dashed border-ink-muted" />
      </header>

      {/* Refs */}
      <div className="flex justify-between text-[9px]">
        <div className="space-y-0.5">
          {ourRef && (
            <p>
              Our Ref: <strong>{ourRef}</strong>
            </p>
          )}
          {yourRef && (
            <p>
              Your Ref: <strong>{yourRef}</strong>
            </p>
          )}
        </div>
        <p>
          {letterDate ??
            new Date().toLocaleDateString('en-UG', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Addressee */}
      <div className="mt-3 text-[9px]">
        <pre className="whitespace-pre-wrap leading-snug">{addressee}</pre>
      </div>

      {/* Subject */}
      {subject && <p className="mt-3 text-[9px] font-bold underline">RE: {subject}</p>}

      {/* Body */}
      <div className="mt-3 text-[9px] leading-relaxed whitespace-pre-wrap">{body}</div>

      {/* Sign-off */}
      <div className="mt-6 text-[9px]">
        <p>Yours faithfully,</p>
        <div className="mt-6 border-b border-ink w-40" />
        <p className="mt-1 font-bold">{signatoryName ?? '___________________'}</p>
        {signatoryTitle && <p className="text-ink-muted">{signatoryTitle}</p>}
        <p className="font-bold text-brand-indigo">For TCOIN SOLAR UG</p>
      </div>

      {/* Footer */}
      <div className="absolute bottom-[8mm] left-[8mm] right-[8mm]">
        <div className="border-t border-line pt-1 text-center text-[8px] italic text-ink-muted">
          We Plan And Do
        </div>
      </div>
    </PageFrame>
  );
}
