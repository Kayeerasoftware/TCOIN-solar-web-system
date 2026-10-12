import type { Appliance, SystemType } from '@/sizing';

export interface CalculatorInput {
  mode: 'bill' | 'appliances';
  monthlyBill?: number;
  appliances: Appliance[];
  district: string;
  systemType: SystemType;
}
