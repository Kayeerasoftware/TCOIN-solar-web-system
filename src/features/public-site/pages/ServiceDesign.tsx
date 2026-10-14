import { ServicePage } from '../components/ServicePage';

export default function ServiceDesign() {
  return (
    <ServicePage
      title="Right-sized solar systems, engineered for your site."
      subtitle="System Design"
      intro="We survey your property, analyse your energy consumption and produce a complete, priced system design — so you know exactly what you're getting before a single cable is laid."
      photo="/Field photos/panels.jpg"
      icon="📐"
      accent="#1D6434"
      steps={[
        {
          title: 'Book a free site survey',
          text: 'One of our engineers visits your property at no cost. We measure roof space, assess shading, check your existing wiring and record your appliance list.',
        },
        {
          title: 'Energy profile & load analysis',
          text: 'We calculate your daily energy consumption from your appliance data and utility bills, identifying peak loads and overnight storage requirements.',
        },
        {
          title: 'System sizing & component selection',
          text: 'Using our sizing engine we select the optimal panel count, inverter rating, battery capacity and charge controller — matched to your budget and goals.',
        },
        {
          title: 'Single-line diagram & BOM',
          text: 'You receive a professional single-line diagram, a full bill of materials with part numbers, and a transparent itemised quote.',
        },
        {
          title: 'Review & approval',
          text: 'We walk you through the design, answer every question and adjust the spec until you are completely satisfied before any work begins.',
        },
      ]}
      gets={[
        {
          icon: '📄',
          title: 'Sizing Report',
          text: 'Full load analysis, daily kWh, autonomy days and system yield estimate.',
        },
        {
          icon: '📏',
          title: 'Single-Line Diagram',
          text: 'Professional electrical diagram showing every component and connection.',
        },
        {
          icon: '🧾',
          title: 'Bill of Materials',
          text: 'Itemised list of every component with brand, model, quantity and unit price.',
        },
        {
          icon: '💰',
          title: 'Transparent Quote',
          text: 'Fixed-price quote with no hidden costs — valid for 30 days.',
        },
      ]}
    />
  );
}
