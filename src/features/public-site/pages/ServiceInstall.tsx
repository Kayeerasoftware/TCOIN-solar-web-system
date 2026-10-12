import { ServicePage } from '../components/ServicePage';

export default function ServiceInstall() {
  return (
    <ServicePage
      title="Installation"
      intro="Certified crews, safety checklists, and a full handover."
      steps={[
        'Deposit and scheduling',
        'Delivery of equipment',
        'Installation',
        'Commissioning and handover',
      ]}
      gets={['Certified crew', 'Safety checklists', 'Handover pack with warranties']}
    />
  );
}
