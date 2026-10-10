import { PageFrame } from '@/components/print/PageFrame';
import { Letterhead } from './Letterhead';

/** Payment Voucher: two copies side by side. Voucher No, Date, Pay to, Serial No., Ref No., Description, Rate, Amount, Total, amount in words, Bank Account, Cheque No., Prepared by, Approved by, Received by. */
export function PaymentVoucher() {
  return (
    <PageFrame size="A4L">
      <Letterhead />
      <p className="text-ink-muted">PaymentVoucher layout goes here.</p>
    </PageFrame>
  );
}
