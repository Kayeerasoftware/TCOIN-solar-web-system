import { Outlet } from 'react-router-dom';
import { PrintButton } from '@/components/print/PrintButton';

/** Shell for print pages: toolbar on screen, paper only when printing. Used by the six TCOIN documents. */
export function PrintLayout() {
  return (
    <div className="bg-surface-alt p-4 print:bg-white print:p-0">
      <div className="mx-auto mb-4 flex max-w-[297mm] justify-end gap-2 print:hidden"><PrintButton /></div>
      <Outlet />
    </div>
  );
}
