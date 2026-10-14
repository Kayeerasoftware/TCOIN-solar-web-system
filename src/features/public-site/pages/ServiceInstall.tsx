import { ServicePage } from '../components/ServicePage';

export default function ServiceInstall() {
  return (
    <ServicePage
      title="Professional installation, completed in a single day."
      subtitle="Installation"
      intro="Our certified crews handle everything from cable routing to commissioning — with a full safety checklist, a handover pack and a workmanship warranty on every job."
      photo="/Field photos/wiring.jpg"
      icon="⚡"
      accent="#F5A623"
      steps={[
        {
          title: 'Deposit & scheduling',
          text: 'Once you approve the quote, a 50% deposit confirms your installation date. We coordinate delivery of all equipment to your site.',
        },
        {
          title: 'Equipment delivery & inspection',
          text: 'All components arrive the day before or on the morning of installation. Our team inspects every item against the bill of materials before work begins.',
        },
        {
          title: 'Mounting & cabling',
          text: 'Panels are mounted on your roof or ground frame. DC cabling is run to the inverter room with correct sizing, fusing and labelling throughout.',
        },
        {
          title: 'Inverter & battery installation',
          text: 'The inverter, battery bank and charge controller are installed, wired and configured to your load profile and utility tariff.',
        },
        {
          title: 'Commissioning & testing',
          text: 'We power up the system, verify all voltages and protection settings, run a full load test and confirm the system is performing to spec.',
        },
        {
          title: 'Handover & training',
          text: 'You receive a handover pack with all warranties, a system overview and a walkthrough of the monitoring app so you can track your savings.',
        },
      ]}
      gets={[
        {
          icon: '👷',
          title: 'Certified Crew',
          text: 'Every installer is trained and certified. No subcontractors, no shortcuts.',
        },
        {
          icon: '✅',
          title: 'Safety Checklists',
          text: 'IEC-compliant safety checklist completed and signed off on every job.',
        },
        {
          icon: '📦',
          title: 'Handover Pack',
          text: 'All manufacturer warranties, data sheets and commissioning records in one folder.',
        },
        {
          icon: '🛡️',
          title: 'Workmanship Warranty',
          text: '2-year workmanship warranty on all installation labour and materials.',
        },
      ]}
    />
  );
}
