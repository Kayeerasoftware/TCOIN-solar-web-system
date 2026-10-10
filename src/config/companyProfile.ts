import type { CompanyProfile } from '@/types/domain';

/** Fallback used until /company-profile loads, and for static pages. The API record is the source of truth. */
export const FALLBACK_PROFILE: CompanyProfile = {
  company: 'TCOIN UG',
  legal_name: 'TCOIN Center of Innovations',
  division: 'TCOIN SOLAR UGANDA',
  division_short: 'TCOIN SOLAR UG',
  tagline: 'We Plan and Do',
  address: 'Nabulagala, near Kasubi Royal Tombs',
  po_box: 'P.O.Box 500273 Kampala Uganda',
  tel: '+256 394 702 962',
  mobile: '+256 779 116 709',
  hotlines: ['+256 705 998 786', '+256 705 111 123', '+256 707 537 623'],
  email: 'info.tcoinug@gmail.com',
  web: 'www.tcoinug.com',
  what_we_do: [
    'Electronic circuit designs, analysis, inspection and development (All repairing works)',
    "Provision of resources and support to the youth's innovations and research",
    'Electrical installations, designs, inspections, maintenance and consultancy',
    'Solar designs, inspection, installation, maintenance and consultancy',
    'Supply of electronics appliances, electricals and solar installation materials',
  ],
};
