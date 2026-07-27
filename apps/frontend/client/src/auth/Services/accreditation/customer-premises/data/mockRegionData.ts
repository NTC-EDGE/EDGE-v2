export interface NTCOffice {
  id: string;
  name: string;
}

export interface NTCRegion {
  id: string;
  name: string;
  offices: NTCOffice[];
}

export const PHILIPPINE_REGIONS_WITH_OFFICES: NTCRegion[] = [
  {
    id: 'NCR',
    name: 'NCR - National Capital Region',
    offices: [
      { id: 'NCR-CO', name: 'NTC Central Office' },
      { id: 'NCR-RO', name: 'NTC NCR Regional Office' },
    ],
  },
  {
    id: 'CAR',
    name: 'CAR - Cordillera Administrative Region',
    offices: [
      { id: 'CAR-RO', name: 'NTC CAR Regional Office' },
    ],
  },
  {
    id: 'R1',
    name: 'Region I - Ilocos Region',
    offices: [
      { id: 'R1-RO', name: 'NTC Region I Regional Office' },
    ],
  },
  {
    id: 'R2',
    name: 'Region II - Cagayan Valley',
    offices: [
      { id: 'R2-RO', name: 'NTC Region II Regional Office' },
    ],
  },
  {
    id: 'R3',
    name: 'Region III - Central Luzon',
    offices: [
      { id: 'R3-RO', name: 'NTC Region III Regional Office' },
    ],
  },
  {
    id: 'R4A',
    name: 'Region IV-A - CALABARZON',
    offices: [
      { id: 'R4A-RO', name: 'NTC Region IV-A Regional Office' },
    ],
  },
  {
    id: 'MIMAROPA',
    name: 'MIMAROPA Region',
    offices: [
      { id: 'MIMAROPA-RO', name: 'NTC MIMAROPA Regional Office' },
    ],
  },
  {
    id: 'R5',
    name: 'Region V - Bicol Region',
    offices: [
      { id: 'R5-RO', name: 'NTC Region V Regional Office' },
    ],
  },
  {
    id: 'R6',
    name: 'Region VI - Western Visayas',
    offices: [
      { id: 'R6-RO', name: 'NTC Region VI Regional Office' },
    ],
  },
  {
    id: 'R7',
    name: 'Region VII - Central Visayas',
    offices: [
      { id: 'R7-RO', name: 'NTC Region VII Regional Office' },
    ],
  },
  {
    id: 'R8',
    name: 'Region VIII - Eastern Visayas',
    offices: [
      { id: 'R8-RO', name: 'NTC Region VIII Regional Office' },
    ],
  },
  {
    id: 'R9',
    name: 'Region IX - Zamboanga Peninsula',
    offices: [
      { id: 'R9-RO', name: 'NTC Region IX Regional Office' },
    ],
  },
  {
    id: 'R10',
    name: 'Region X - Northern Mindanao',
    offices: [
      { id: 'R10-RO', name: 'NTC Region X Regional Office' },
    ],
  },
  {
    id: 'R11',
    name: 'Region XI - Davao Region',
    offices: [
      { id: 'R11-RO', name: 'NTC Region XI Regional Office' },
    ],
  },
  {
    id: 'R12',
    name: 'Region XII - SOCCSKSARGEN',
    offices: [
      { id: 'R12-RO', name: 'NTC Region XII Regional Office' },
    ],
  },
  {
    id: 'R13',
    name: 'Region XIII - Caraga',
    offices: [
      { id: 'R13-RO', name: 'NTC Region XIII Regional Office' },
    ],
  },
  {
    id: 'BARMM',
    name: 'BARMM - Bangsamoro Autonomous Region in Muslim Mindanao',
    offices: [
      { id: 'BARMM-RO', name: 'NTC BARMM Regional Office' },
    ],
  },
];
