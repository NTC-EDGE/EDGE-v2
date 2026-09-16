export type StatutoryReportCode =
  | 'NTC-BAR-1'
  | 'NTC-BTr-COA-01'
  | 'ARTA-RA-11032'
  | 'NTC-SPECTRUM-INV'
  | 'NTC-CSMR-8888'
  | 'NTC-NOV-ENF';

export type SubmissionAgency =
  | 'DBM & NEDA'
  | 'Bureau of the Treasury & COA'
  | 'Anti-Red Tape Authority (ARTA)'
  | 'NTC Central Office (RSPD)'
  | 'Civil Service Commission & OP 8888'
  | 'Legal & Enforcement Branch';

export type SubmissionFrequency = 'Monthly' | 'Quarterly' | 'Semi-Annual' | 'Annual';

export interface StatutoryReportMetadata {
  code: StatutoryReportCode;
  title: string;
  subTitle: string;
  agency: SubmissionAgency;
  frequency: SubmissionFrequency;
  legalBasis: string;
  description: string;
  category: 'Operations' | 'Finance' | 'Compliance' | 'Spectrum' | 'CSAT' | 'Enforcement';
  badgeColor: string;
}

export interface StatutoryReportSummary {
  metadata: StatutoryReportMetadata;
  recordCount: number;
  complianceRate: number;
  totalAmount?: number;
  lastGeneratedDate?: string;
  status: 'Ready' | 'Needs Review' | 'Complete';
}
