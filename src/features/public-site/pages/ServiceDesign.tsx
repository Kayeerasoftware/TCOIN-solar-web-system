import { ServicePage } from '../components/ServicePage';

export default function ServiceDesign() {
  return (
    <ServicePage
      title="Solar design"
      intro="Right-sized systems with a priced bill of materials."
      steps={[
        'Book a site survey',
        'We build your energy profile',
        'Sizing and design with single-line diagram',
        'You receive a priced quote',
      ]}
      gets={['Sizing report', 'Single-line diagram', 'Itemised bill of materials']}
    />
  );
}
