import { Card } from '@/components/ui/Card';
import { ServicePage } from '../components/ServicePage';

const services = [
  { name: 'Energy audit', time: '2 hours' },
  { name: 'Feasibility study', time: '1 day' },
  { name: 'Design review', time: '90 minutes' },
];

export default function ServiceConsultancy() {
  return (
    <ServicePage
      title="Consultancy"
      intro="Energy audits, feasibility studies, and design reviews."
      steps={['Pick a service', 'Choose a slot and pay', 'Consultation', 'Report in your portal']}
      gets={['Written report', 'Recommendations', 'Optional quote']}
      extra={
        <Card title="Services">
          <ul>
            {services.map((s) => (
              <li key={s.name} className="flex justify-between border-t border-line py-2 first:border-0">
                <span>{s.name}</span>
                <span className="text-ink-muted">{s.time}</span>
              </li>
            ))}
          </ul>
        </Card>
      }
    />
  );
}
