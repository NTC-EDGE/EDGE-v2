export type StatutoryReportCode =
  | 'NTC-BAR-1'
  | 'NTC-BTr-COA-01'
  | 'ARTA-RA-11032'
  | 'NTC-SPECTRUM-INV'
  | 'NTC-CSMR-8888'
  | 'NTC-NOV-ENF'
  | 'NTC-MIS-OPS'
  | 'NTC-COA-APP26-M'
  | 'NTC-COA-APP26-D'
  | 'NTC-BIR-DST-01'
  | 'NTC-BTR-INC-01'
  | 'NTC-APP-SUM-EVAL'
  | 'NTC-APP-SUM-SVC'
  | 'NTC-APP-SUM-ENT'
  | 'NTC-APP-VOL-01'
  | 'NTC-EXAM-MST-01';

export type SubmissionAgency =
  | 'DBM & NEDA'
  | 'Bureau of the Treasury & COA'
  | 'Commission on Audit (COA)'
  | 'Bureau of Internal Revenue (BIR)'
  | 'Anti-Red Tape Authority (ARTA)'
  | 'NTC Central Office (RSPD)'
  | 'Civil Service Commission & OP 8888'
  | 'Legal & Enforcement Branch'
  | 'National Telecommunications Commission (NTC)';

export type SubmissionFrequency = 'Daily' | 'Monthly' | 'Quarterly' | 'Semi-Annual' | 'Annual' | 'On-Demand';

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
  requiresDateRange?: boolean;
  filterType?: 'evaluator' | 'service' | 'entity' | 'schedule' | 'dateRange' | 'none';
}

export interface StatutoryReportSummary {
  metadata: StatutoryReportMetadata;
  recordCount: number;
  complianceRate: number;
  totalAmount?: number;
  lastGeneratedDate?: string;
  status: 'Ready' | 'Needs Review' | 'Complete';
}
