import { PageFrame } from '@/components/print/PageFrame';
import { Letterhead } from './Letterhead';

/** Delivery Note: Delivered to (Name, Address, Contact info), No., Date, QTY, ITEM No., DESCRIPTION, CONDITION, Item received by, Item delivered by. */
export function DeliveryNote() {
  return (
    <PageFrame size="A4">
      <Letterhead />
      <p className="text-ink-muted">DeliveryNote layout goes here.</p>
    </PageFrame>
  );
}
