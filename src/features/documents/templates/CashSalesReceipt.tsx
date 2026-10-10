import { PageFrame } from '@/components/print/PageFrame';
import { Letterhead } from './Letterhead';

/** Cash / Sales Receipt: Receipt No, Date, Received from, No., QTY, PARTICULARS, Rate, Amount, Total, sum of Shillings, signature, disclaimer. */
export function CashSalesReceipt() {
  return (
    <PageFrame size="A4">
      <Letterhead />
      <p className="text-ink-muted">CashSalesReceipt layout goes here.</p>
    </PageFrame>
  );
}
