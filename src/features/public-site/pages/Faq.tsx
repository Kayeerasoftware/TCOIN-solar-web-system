import { useState } from 'react';

const faqs = [
  {
    q: 'How long does a solar installation take?',
    a: 'A typical residential system takes 1–3 days. Larger commercial systems may take 1–2 weeks.',
  },
  {
    q: 'What warranty do I get?',
    a: 'Panels carry a 25-year performance warranty. Inverters and batteries typically carry 5–10 years. We also offer our own workmanship warranty.',
  },
  {
    q: 'Can I add batteries later?',
    a: 'Yes. Hybrid inverters allow battery storage to be added at any time. We design with future expansion in mind.',
  },
  {
    q: 'Do you serve areas outside Kampala?',
    a: 'Yes. We serve over 20 districts across Uganda. Travel costs may apply for remote sites.',
  },
  {
    q: 'How do I pay?',
    a: 'We accept mobile money (MTN, Airtel), bank transfer, and cash. Instalment plans are available for larger projects.',
  },
  {
    q: 'What happens if my system breaks down?',
    a: 'Call our hotline. Customers on a maintenance plan get priority response. We also offer pay-per-visit support.',
  },
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-brand-green">Frequently asked questions</h1>
      <div className="mt-8 space-y-2">
        {faqs.map((f, i) => (
          <div key={i} className="rounded-lg border border-line bg-white">
            <button
              className="flex w-full items-center justify-between px-5 py-4 text-left font-medium"
              onClick={() => setOpen(open === i ? null : i)}
              aria-expanded={open === i}
            >
              {f.q}
              <span className="ml-4 text-brand-green">{open === i ? '−' : '+'}</span>
            </button>
            {open === i && <p className="border-t border-line px-5 py-4 text-sm text-ink-muted">{f.a}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
