import type { ReactNode } from 'react';

/** Fixed paper frames for printed TCOIN documents. Screens never reflow these. */
const SIZES = { A4: { w: '210mm', h: '297mm' }, A5L: { w: '210mm', h: '148mm' }, A4L: { w: '297mm', h: '210mm' } } as const;

export function PageFrame({ size = 'A4', children }: { size?: keyof typeof SIZES; children: ReactNode }) {
  const s = SIZES[size];
  return (
    <div className="relative mx-auto overflow-hidden bg-white p-[8mm] text-[11px] text-black shadow print:shadow-none" style={{ width: s.w, height: s.h }}>
      {children}
    </div>
  );
}
