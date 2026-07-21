export interface ApplicationData {
  id: string;
  title: string;
  applicant: string;
  status: 'FOR APPROVAL' | 'APPROVED' | 'COMPLETED' | 'PENDING' | 'REJECTED' | 'Approved' | 'Pending' | 'Rejected' | 'Draft';
  date: string;
  company: string;
  description?: string;
  timeAgo: string;
  flowType: 'BULK' | 'SINGLE';
  code: string;
  dateGroup: string;
  isBeingViewed?: boolean;
}

export const mockApplications: ApplicationData[] = [
  {
    id: 'APP-2026-0521',
    title: 'Admission Slip for Radio Operator Examination',
    applicant: 'Dezza Collection',
    company: 'Dezza Telecom Group',
    status: 'FOR APPROVAL',
    date: '2026-07-16',
    timeAgo: '5 days ago',
    flowType: 'BULK',
    code: 'DP-003',
    dateGroup: 'Today - Jul 16, 2026',
    isBeingViewed: true,
  },
  {
    id: 'APP-2026-0522',
    title: 'Admission Slip for Radio Operator Examination',
    applicant: 'EDWARD LANCE L. LORILLA',
    company: 'Lorilla Holdings',
    status: 'APPROVED',
    date: '2026-07-14',
    timeAgo: '1 week ago',
    flowType: 'SINGLE',
    code: 'ZC-001',
    dateGroup: '3 days ago - Jul 14, 2026',
    isBeingViewed: false,
  },
  {
    id: 'APP-2026-0523',
    title: 'Admission Slip for Radio Operator Examination',
    applicant: 'EDISSA A. AMANTE',
    company: 'Amante Solutions LLC',
    status: 'COMPLETED',
    date: '2026-07-13',
    timeAgo: 'Jul 13, 2026',
    flowType: 'SINGLE',
    code: 'ZC-001',
    dateGroup: '4 days ago - Jul 13, 2026',
    isBeingViewed: false,
  },
  {
    id: 'APP-2026-0524',
    title: 'Admission Slip for Radio Operator Examination',
    applicant: 'Dezza Collection',
    company: 'Dezza Telecom Group',
    status: 'FOR APPROVAL',
    date: '2026-07-12',
    timeAgo: 'Jul 12, 2026',
    flowType: 'BULK',
    code: 'DP-003',
    dateGroup: '4 days ago - Jul 13, 2026',
    isBeingViewed: false,
  },
];
