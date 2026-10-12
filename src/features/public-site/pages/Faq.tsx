import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const FAQ = [
  ['How long is a quote valid?', 'All rates on a Proforma Invoice are valid for 30 days.'],
  ['Can I pay with mobile money?', 'Yes. MTN MoMo, Airtel Money, card, cash, cheque, or bank transfer.'],
  [
    'Do you design before I buy?',
    'Yes. A site survey and design come first, then a priced bill of materials.',
  ],
  [
    'What warranty do I get?',
    'Panels, inverters, and batteries carry the manufacturer warranty. Workmanship is covered separately.',
  ],
  ['How do I report a fault?', 'Raise a ticket in your portal or call a hotline.'],
];

export default function Faq() {
  useDocumentTitle('FAQ');
  return (
    <div className="mx-auto max-w-3xl space-y-3 p-4">
      <h1 className="text-3xl font-extrabold text-brand-green">Frequently asked questions</h1>
      {FAQ.map(([q, a]) => (
        <details key={q} className="rounded-lg border border-line bg-surface p-4">
          <summary className="cursor-pointer font-bold">{q}</summary>
          <p className="mt-2 text-ink-muted">{a}</p>
        </details>
      ))}
    </div>
  );
}
