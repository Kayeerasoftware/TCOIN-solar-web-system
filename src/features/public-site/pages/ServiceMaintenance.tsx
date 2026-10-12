import { Card } from '@/components/ui/Card';
import { ServicePage } from '../components/ServicePage';

const plans = [
  { plan: 'Basic', visits: 1, response: '48 hours' },
  { plan: 'Standard', visits: 2, response: '24 hours' },
  { plan: 'Premium', visits: 4, response: '4 hours' },
];

export default function ServiceMaintenance() {
  return (
    <ServicePage
      title="Maintenance plans"
      intro="Keep output high and get a fast response to faults."
      steps={[
        'Choose a plan',
        'We schedule your visits',
        'A technician inspects your system',
        'You receive a report',
      ]}
      gets={['Preventive visits', 'Warranty tracking', 'Priority response']}
      extra={
        <Card title="Plans">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th>Plan</th>
                <th>Visits per year</th>
                <th>Response</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((p) => (
                <tr key={p.plan} className="border-t border-line">
                  <td className="py-2">{p.plan}</td>
                  <td>{p.visits}</td>
                  <td>{p.response}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-xs text-ink-muted">Prices are given in your quote.</p>
        </Card>
      }
    />
  );
}
