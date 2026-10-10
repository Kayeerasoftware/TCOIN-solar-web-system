import { PageFrame } from '@/components/print/PageFrame';
import { Letterhead } from './Letterhead';

/** Corporate Receipt: Received with thanks from, Date and No, sum of Shillings, Being payment of, Cash / Cheque No, Balance, SHS box, signature. */
export function CorporateReceipt() {
  return (
    <PageFrame size="A5L">
      <Letterhead />
      <p className="text-ink-muted">CorporateReceipt layout goes here.</p>
    </PageFrame>
  );
}
