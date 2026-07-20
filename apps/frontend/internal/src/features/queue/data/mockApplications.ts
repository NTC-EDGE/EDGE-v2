export interface ApplicationData {
  id: string;
  title: string;
  applicant: string;
  status: 'Approved' | 'Pending' | 'Rejected' | 'Draft';
  date: string;
}

export const mockApplications: ApplicationData[] = [
  {
    id: 'APP-2026-001',
    title: '5G Spectrum Allocation License',
    applicant: 'Apex Telecom Group',
    status: 'Approved',
    date: '2026-07-15',
  },
  {
    id: 'APP-2026-002',
    title: 'Broadband Expansion Subsidy',
    applicant: 'RuralNet ISP',
    status: 'Pending',
    date: '2026-07-14',
  },
  {
    id: 'APP-2026-003',
    title: 'Infrastructure Sharing Permit',
    applicant: 'TowerCo Towers Corp',
    status: 'Approved',
    date: '2026-07-13',
  },
  {
    id: 'APP-2026-004',
    title: 'Satellite Uplink Authorization',
    applicant: 'OrbitLink Communications',
    status: 'Rejected',
    date: '2026-07-12',
  },
  {
    id: 'APP-2026-005',
    title: 'Submarine Cable Landing Permit',
    applicant: 'Global Connect Ltd',
    status: 'Pending',
    date: '2026-07-10',
  },
  {
    id: 'APP-2026-006',
    title: 'ISP Operations Registration',
    applicant: 'Astra ISP Solutions',
    status: 'Approved',
    date: '2026-07-09',
  },
  {
    id: 'APP-2026-007',
    title: 'VoIP Services Accreditation',
    applicant: 'TalkSoft Solutions Inc.',
    status: 'Draft',
    date: '2026-07-08',
  },
  {
    id: 'APP-2026-008',
    title: 'Spectrum License Renewal (2.4GHz)',
    applicant: 'MetroWave WiFi Corp',
    status: 'Approved',
    date: '2026-07-07',
  },
  {
    id: 'APP-2026-009',
    title: 'Fiber Optic Rollout Approval',
    applicant: 'CityFiber Infrastructures',
    status: 'Pending',
    date: '2026-07-05',
  },
  {
    id: 'APP-2026-010',
    title: 'Emergency Frequency Permit',
    applicant: 'National Rescue & Medical Services',
    status: 'Rejected',
    date: '2026-07-03',
  },
];
