import { PageFrame } from '@/components/print/PageFrame';
import { Letterhead } from './Letterhead';

/** Proforma Invoice: To M/s block, No. and Date, document title, the eight-column line table (LineItemTable), Total, E&OE, Grand Total, validity, amount in words, client signature, signed for TCOIN. See docs/screen-map.md and the Proforma print design. */
export function ProformaInvoice() {
  return (
    <PageFrame size="A4">
      <Letterhead />
      <p className="text-ink-muted">ProformaInvoice layout goes here.</p>
    </PageFrame>
  );
}
