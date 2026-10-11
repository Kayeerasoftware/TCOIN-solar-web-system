import { useState } from 'react';
import { Button } from '@/components/ui/Button';

const CHANNELS = ['email', 'sms', 'whatsapp', 'in_app'] as const;
const EVENTS = [
  { key: 'quote_sent', label: 'Quote sent to you' },
  { key: 'invoice_issued', label: 'Invoice issued' },
  { key: 'payment_received', label: 'Payment received' },
  { key: 'project_update', label: 'Project status update' },
  { key: 'ticket_update', label: 'Support ticket update' },
  { key: 'warranty_expiring', label: 'Warranty expiring soon' },
];

type Prefs = Record<string, Record<string, boolean>>;

export default function Preferences() {
  const [prefs, setPrefs] = useState<Prefs>(() =>
    Object.fromEntries(
      EVENTS.map((e) => [
        e.key,
        Object.fromEntries(CHANNELS.map((c) => [c, c === 'in_app' || c === 'email'])),
      ]),
    ),
  );
  const [saved, setSaved] = useState(false);

  function toggle(event: string, channel: string) {
    setPrefs((p) => ({ ...p, [event]: { ...p[event], [channel]: !p[event][channel] } }));
    setSaved(false);
  }

  function save() {
    setSaved(true);
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-brand-green">Notification preferences</h1>
      <p className="mt-1 text-sm text-ink-muted">Choose how you want to be notified for each event.</p>

      <div className="mt-6 rounded-lg border border-line bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-line bg-surface-alt text-xs text-ink-muted">
            <tr>
              <th className="px-4 py-2 text-left">Event</th>
              {CHANNELS.map((c) => (
                <th key={c} className="px-4 py-2 text-center capitalize">
                  {c.replace('_', ' ')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {EVENTS.map((e) => (
              <tr key={e.key} className="border-b border-line last:border-0">
                <td className="px-4 py-2 font-medium">{e.label}</td>
                {CHANNELS.map((c) => (
                  <td key={c} className="px-4 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={prefs[e.key]?.[c] ?? false}
                      onChange={() => toggle(e.key, c)}
                      className="accent-brand-green"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Button onClick={save}>Save preferences</Button>
        {saved && <p className="text-sm text-brand-green">✓ Saved</p>}
      </div>
    </div>
  );
}
