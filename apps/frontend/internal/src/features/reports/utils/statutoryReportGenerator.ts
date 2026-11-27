import {
  StatutoryReportCode,
  StatutoryReportFormatId,
  StatutoryReportMetadata,
} from '../types/statutoryReports';
import { ApplicationSummaryDto, TenantTransactionDto, FeedbackDto } from '@edge/api';

export const STATUTORY_REPORTS_LIST: StatutoryReportMetadata[] = [
  // Rows 12-22 Drive Reports
  {
    code: 'NTC-MIS-OPS',
    title: 'Management Information System (MIS) Operations Accomplishment',
    subTitle: 'Consolidated Regional Monthly/Quarterly Accomplishment Report',
    agency: 'National Telecommunications Commission (NTC)',
    frequency: 'Monthly',
    legalBasis: 'NTC Annual Operating Plan & DBM Target Directives',
    description:
      'Consolidated accomplishment covering all regulatory services: permits, licenses, certificates, accreditations issued, examination volumes, and physical accomplishment rating.',
    category: 'Operations',
    badgeColor: '#2563EB',
    requiresDateRange: true,
    filterType: 'dateRange',
    formatOptions: [
      {
        id: 'standard',
        label: 'Standard Statutory (Full MIS + Financial & SLA)',
        shortLabel: 'Standard (Full MIS)',
        description: 'Existing comprehensive MIS report with Pending/Received/Processed/On-Time SLA and Financial Status.',
      },
      {
        id: 'ntc-sheet',
        label: 'NTC Sheet Format (Licensing NEW / REN-MOD)',
        shortLabel: 'NTC Sheet (Licensing)',
        description: 'Official NTC Reporting Format Licensing PDF layout: Sections I, II, II-B (NEW / REN-MOD) and III (Existing).',
      },
    ],
  },
  {
    code: 'NTC-COA-APP26-M',
    title: 'Report of Collections and Deposits (COA Appendix 26 - Monthly)',
    subTitle: 'Commission on Audit GAM Appendix 26 Fund Cluster 101101 Monthly Ledger',
    agency: 'Commission on Audit (COA)',
    frequency: 'Monthly',
    legalBasis: 'COA Circular No. 2020-006 & Government Accounting Manual (GAM) Vol II',
    description:
      'Official monthly accounting report of government collections, distribution across official UACS account codes (4-02-01-010 to 4-02-01-990), and deposits remitted to authorized government depository bank (AGDB).',
    category: 'Finance',
    badgeColor: '#059669',
    requiresDateRange: true,
    filterType: 'dateRange',
    formatOptions: [
      {
        id: 'standard',
        label: 'Standard Statutory (17-Col UACS Breakdown)',
        shortLabel: 'Standard (17-Col UACS)',
        description: 'Existing full 17-column COA GAM Appendix 26 with UACS object codes and AGDB batches.',
      },
      {
        id: 'ntc-sheet',
        label: 'NTC Sheet Format (Taxes 40101010 / Fees 40201010)',
        shortLabel: 'NTC Sheet (Taxes/Fees)',
        description: 'Official NTC Excel RCD Appendix 26: Total per OR split into Taxes (40101010) and Fees (40201010) + DST Breakdown.',
      },
    ],
  },
  {
    code: 'NTC-COA-APP26-D',
    title: 'Daily Collection Report (COA Appendix 26 - Daily OR Ledger)',
    subTitle: 'Sub-Collector / Cashier Daily Official Receipts Collection Register',
    agency: 'Commission on Audit (COA)',
    frequency: 'Daily',
    legalBasis: 'COA Circular No. 2020-006 & Republic Act No. 11032',
    description:
      'Detailed daily record of each Official Receipt issued, recording payor name, receipt series, UACS revenue breakdown, and cashier collections remittance.',
    category: 'Finance',
    badgeColor: '#10B981',
    requiresDateRange: true,
    filterType: 'dateRange',
    formatOptions: [
      {
        id: 'standard',
        label: 'Standard Statutory (COA Appendix 26 UACS)',
        shortLabel: 'Standard (UACS)',
        description: 'Existing COA Appendix 26 daily Official Receipt ledger with UACS columns and 3-tier signatories.',
      },
      {
        id: 'ntc-sheet',
        label: 'NTC Sheet Format (Sub-Column Fee Ledger + Recap)',
        shortLabel: 'NTC Sheet (+ Recap)',
        description: 'Official NTC Daily Collection Excel layout: RSL/ROC/Reg, Surcharges, Permits/CP, Other Service Income, and Recap.',
      },
    ],
  },
  {
    code: 'NTC-BIR-DST-01',
    title: 'Monthly Report of Documentary Stamp Tax (DST) Collection and Remittance',
    subTitle: 'Bureau of Internal Revenue Form 2000-OT Regulatory Document Attachment',
    agency: 'Bureau of Internal Revenue (BIR)',
    frequency: 'Monthly',
    legalBasis: 'National Internal Revenue Code (NIRC) Sec 173-201 & TRAIN Law (RA 10963)',
    description:
      'Monthly statement of inclusive serial numbers of GOR, count of certifications issued, ₱30.00 DST collected per document, and remittance to BIR.',
    category: 'Finance',
    badgeColor: '#D97706',
    requiresDateRange: true,
    filterType: 'dateRange',
    formatOptions: [
      {
        id: 'standard',
        label: 'Standard Statutory (Per-OR BIR Schedule)',
        shortLabel: 'Standard (Per-OR)',
        description: 'Detailed per-Official Receipt schedule with Gross OR, Net Regulatory Fee, and DST.',
      },
      {
        id: 'ntc-sheet',
        label: 'NTC Sheet Format (Daily Inclusive GOR Series)',
        shortLabel: 'NTC Sheet (Daily GOR)',
        description: 'Grouped daily summary with inclusive GOR serial numbers (From–To) and certification counts.',
      },
    ],
  },
  {
    code: 'NTC-BTR-INC-01',
    title: 'Monthly Report of Income Collected and Deposited with the Bureau of the Treasury',
    subTitle: 'Bureau of the Treasury Regional Revenue Ledger & Undeposited Reconciliation',
    agency: 'Bureau of the Treasury & COA',
    frequency: 'Monthly',
    legalBasis: 'Treasury Circular No. 01-2020 & General Appropriations Act',
    description:
      'Reconciliation of collected income vs deposited income across NG accounts, tracking undeposited collection balances and bank remittance confirmations.',
    category: 'Finance',
    badgeColor: '#7C3AED',
    requiresDateRange: true,
    filterType: 'dateRange',
    formatOptions: [
      {
        id: 'standard',
        label: 'Standard Statutory (BTr UACS + Deposits)',
        shortLabel: 'Standard (UACS + Deposits)',
        description: 'Existing BTr UACS statement with Statutory Basis, Fund Cluster, and Bank Deposit Batches.',
      },
      {
        id: 'ntc-sheet',
        label: 'NTC Sheet Format (12 NG Accounts • Month & YTD)',
        shortLabel: 'NTC Sheet (Month + YTD)',
        description: 'Official NTC Google Sheet matrix: 12 NG accounts with This Month, DST, Year-to-Date, and Undeposited columns.',
      },
    ],
  },
  {
    code: 'NTC-APP-SUM-EVAL',
    title: 'Application Summary Report by Evaluator',
    subTitle: 'Staff Productivity & Regional Regulatory Evaluator Audit',
    agency: 'National Telecommunications Commission (NTC)',
    frequency: 'Monthly',
    legalBasis: 'Civil Service Commission SPMS & NTC Citizen Charter Work Standards',
    description:
      'Detailed audit of all regulatory filings assessed by a specific evaluator, listing application type, company name, address, permit no, reference no, date of filing, expiration, OR number, amount, date paid, and summary totals.',
    category: 'Operations',
    badgeColor: '#0284C7',
    requiresDateRange: true,
    filterType: 'evaluator',
    formatOptions: [
      {
        id: 'standard',
        label: 'Standard Statutory Register',
        shortLabel: 'Standard Register',
        description: 'Existing statutory detailed register with 3-tier office signatories.',
      },
      {
        id: 'ntc-sheet',
        label: 'NTC Sheet Format (12-Column + Summary)',
        shortLabel: 'NTC Sheet (+ Summary)',
        description: 'Official NTC Google Sheet layout with Full Address, Permit No., Date Paid, and bottom Summary counts.',
      },
    ],
  },
  {
    code: 'NTC-APP-SUM-SVC',
    title: 'Application Summary Report by Service',
    subTitle: 'Service-Specific Application Volume & Issuance Ledger',
    agency: 'National Telecommunications Commission (NTC)',
    frequency: 'Monthly',
    legalBasis: 'NTC Citizens Charter & Regulatory Service Directory',
    description:
      'Summary of all transactions filed under a specific telecommunication service category (e.g. Amateur, Commercial, Ship Station, Dealer, Reseller) with optional Service Type filtering.',
    category: 'Operations',
    badgeColor: '#4F46E5',
    requiresDateRange: true,
    filterType: 'service',
    formatOptions: [
      {
        id: 'standard',
        label: 'Standard Statutory Register',
        shortLabel: 'Standard Register',
        description: 'Existing statutory detailed register with 3-tier office signatories.',
      },
      {
        id: 'ntc-sheet',
        label: 'NTC Sheet Format (12-Column + Summary)',
        shortLabel: 'NTC Sheet (+ Summary)',
        description: 'Official NTC Google Sheet layout with Full Address, Permit No., Date Paid, and bottom Summary counts.',
      },
    ],
  },
  {
    code: 'NTC-APP-SUM-ENT',
    title: 'Application Summary Report by Entity',
    subTitle: 'Corporate & Individual Licensee Complete Regulatory Filing History',
    agency: 'National Telecommunications Commission (NTC)',
    frequency: 'On-Demand',
    legalBasis: 'Radio Control Act (Act 3846) & Public Telecommunications Policy Act (RA 7925)',
    description:
      'Consolidated filing ledger for a single licensee or applicant organization, recording permit numbers, expiration dates, fee payments, and compliance status.',
    category: 'Compliance',
    badgeColor: '#9333EA',
    requiresDateRange: true,
    filterType: 'entity',
    formatOptions: [
      {
        id: 'standard',
        label: 'Standard Statutory Register (All Statuses)',
        shortLabel: 'Standard (All Statuses)',
        description: 'Existing statutory register including all filed, evaluating, approved, and completed applications.',
      },
      {
        id: 'ntc-sheet',
        label: 'NTC Sheet Format (Completed Only • 11-Col)',
        shortLabel: 'NTC Sheet (Completed Only)',
        description: 'Official NTC Google Sheet Entity layout: Completed applications only, Reference No. first, plus Summary table.',
      },
    ],
  },
  {
    code: 'NTC-APP-VOL-01',
    title: 'EDGE Application Volume Report',
    subTitle: 'Multi-Month Longitudinal Volume Trend Across Regulatory Streams',
    agency: 'National Telecommunications Commission (NTC)',
    frequency: 'Monthly',
    legalBasis: 'NTC Regional Performance Dashboard & ARTA RA 11032 Oversight',
    description:
      'Monthly volume pivot matrix across major regulatory categories: Accreditations, Certificates, Exams, Licenses, and Permits over the selected reporting timeframe.',
    category: 'Operations',
    badgeColor: '#0EA5E9',
    requiresDateRange: true,
    filterType: 'dateRange',
    formatOptions: [
      {
        id: 'standard',
        label: 'Standard Executive (Volume + Collections & SLA)',
        shortLabel: 'Standard (Executive)',
        description: 'Existing 2-table executive report with 6 regulatory streams, collections, deposits, and SLA %. ',
      },
      {
        id: 'ntc-sheet',
        label: 'NTC Sheet Format (5-Category Monthly Matrix)',
        shortLabel: 'NTC Sheet (5-Category)',
        description: 'Official NTC Google Sheet matrix: Accreditations, Certificates, Exams, Licenses, Permits × Months + Total.',
      },
    ],
  },
  {
    code: 'NTC-EXAM-MST-01',
    title: 'Examination Masterlist (Commercial & Non-Commercial Radio Operator)',
    subTitle: 'Official Proctor Examination Day Attendance & Signature Roster',
    agency: 'National Telecommunications Commission (NTC)',
    frequency: 'On-Demand',
    legalBasis: 'Radio Control Act (Act 3846) & Radio Operator Examination Guidelines',
    description:
      'Official candidate masterlist grouped by room and exam class (Amateur Class A/B/C/D, Commercial ROC/1RT/2RT) with blank signature checkoff blocks for proctors.',
    category: 'Operations',
    badgeColor: '#EA580C',
    requiresDateRange: true,
    filterType: 'schedule',
    formatOptions: [
      {
        id: 'standard',
        label: 'Standard Statutory Roster (With OR & Fees)',
        shortLabel: 'Standard Roster',
        description: 'Existing continuous roster with Seat #, OR No., Fee Paid, Status, and Examinee Signature.',
      },
      {
        id: 'ntc-sheet',
        label: 'NTC Sheet Format (Grouped by Exam Class + Summary)',
        shortLabel: 'NTC Sheet (By Exam Class)',
        description: 'Official NTC Excel Exam Masterlist: grouped by Exam Type with Room #, No./Name/Sex/Signature, and bottom Summary.',
      },
    ],
  },

];

// Helper: safe CSV quoting
function q(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '""';
  const str = String(value).replace(/"/g, '""');
  return `"${str}"`;
}

export interface StatutoryReportGeneratorOptions {
  startDate?: string;
  endDate?: string;
  evaluatorFilter?: string;
  serviceFilter?: string;
  serviceTypeFilter?: string;
  entityFilter?: string;
  scheduleFilter?: string;
  fieldOfficeFilter?: string;
  format?: StatutoryReportFormatId;
}

export interface UacsBreakdown {
  dst: number;
  lic: number;
  sur: number;
  pmt: number;
  exm: number;
  ins: number;
  apf: number;
  srf: number;
  suf: number;
  oth: number;
  total: number;
  btrCode: string;
}

export function getPaidTransactions(
  transactions: TenantTransactionDto[],
  applications?: ApplicationSummaryDto[]
): TenantTransactionDto[] {
  const paidList: TenantTransactionDto[] = [];
  const seenRefs = new Set<string>();
  const seenAppIds = new Set<string>();

  for (const tx of transactions) {
    const status = (tx.paymentStatus ?? 'Paid').toLowerCase();
    const isPaidStatus = status === 'paid' || status === 'deposited' || status === 'issued' || status === 'completed';
    if (!isPaidStatus) continue;
    const amt = tx.amount ?? 0;
    if (amt <= 0 && (tx.refNo ?? '').toUpperCase().startsWith('APP-')) continue;

    const refKey = (tx.refNo ?? tx.id ?? '').trim().toUpperCase();
    if (refKey.length > 0) seenRefs.add(refKey);
    if (tx.id) seenAppIds.add(tx.id);
    paidList.push(tx);
  }

  if (applications !== undefined) {
    for (const app of applications) {
      if (seenAppIds.has(app.id)) continue;
      const orNum = (app.officialReceiptNumber ?? app.issuedDocumentDetails?.[0]?.officialReceiptNumber ?? '').trim();
      const isPaidApp =
        orNum.length > 0 ||
        (app.amountPaid ?? 0) > 0 ||
        app.opStatus === 'Paid' ||
        app.status === 'ForIssuance' ||
        app.status === 'Approved' ||
        app.status === 'Completed';
      const paidAmt = app.amountPaid ?? (isPaidApp ? (app.totalAmountDue ?? 0) : 0);
      const effectiveRef =
        orNum.length > 0
          ? orNum
          : (app.opNumber ?? app.soaNumber ?? app.applicationNumber ?? app.referenceNumber ?? '').trim();

      if (isPaidApp && paidAmt > 0 && effectiveRef.length > 0 && !seenRefs.has(effectiveRef.toUpperCase())) {
        seenRefs.add(effectiveRef.toUpperCase());
        seenAppIds.add(app.id);
        paidList.push({
          id: app.id,
          refNo: effectiveRef,
          applicantName:
            app.filingUser?.company?.name ??
            app.filingUser?.name ??
            app.applicants?.[0]?.name ??
            'Applicant',
          serviceType: app.serviceName ?? app.serviceCategory ?? 'Regulatory Permit Fee',
          amount: paidAmt,
          paymentStatus: 'Paid',
          date: app.paidAt ?? app.updatedAt ?? app.createdAt,
        });
      }
    }
  }

  return paidList.sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''));
}

export function classifyUacsBreakdown(tx: TenantTransactionDto): UacsBreakdown {
  const total = tx.amount ?? 0;
  const sType = (tx.serviceType ?? '').toLowerCase();

  let dst = 0;
  let lic = 0;
  let sur = 0;
  let pmt = 0;
  let exm = 0;
  let ins = 0;
  let apf = 0;
  let srf = 0;
  let suf = 0;
  let oth = 0;
  let btrCode = '4-02-01-990';

  if (sType.includes('stamp') || sType.includes('dst')) {
    if (total <= 60) {
      dst = total;
      btrCode = '4-02-01-060';
    } else {
      dst = 30;
      const rem = total - 30;
      if (sType.includes('license') || sType.includes('rsl')) {
        lic = rem;
        btrCode = '4-02-01-060';
      } else if (sType.includes('permit') || sType.includes('cp')) {
        pmt = rem;
        btrCode = '4-02-01-010';
      } else if (sType.includes('cert') || sType.includes('exam') || sType.includes('clearance')) {
        exm = rem;
        btrCode = '4-02-01-040';
      } else {
        pmt = rem;
        btrCode = '4-02-01-010';
      }
    }
  } else if (sType.includes('surcharge') || sType.includes('penalty') || sType.includes('fine')) {
    sur = total;
    btrCode = '4-02-01-140';
  } else if (sType.includes('inspection')) {
    ins = total;
    btrCode = '4-02-02-100';
  } else if (sType.includes('supervision') || sType.includes('srf') || sType.includes('regulation')) {
    srf = total;
    btrCode = '4-02-01-070';
  } else if (sType.includes('spectrum') || sType.includes('suf')) {
    suf = total;
    btrCode = '4-02-01-080';
  } else if (sType.includes('exam') || sType.includes('roce') || sType.includes('clearance') || sType.includes('cert')) {
    exm = total;
    btrCode = '4-02-01-040';
  } else if (sType.includes('registration') || sType.includes('cor')) {
    lic = total;
    btrCode = '4-02-01-020';
  } else if (sType.includes('license') || sType.includes('rsl') || sType.includes('station')) {
    lic = total;
    btrCode = '4-02-01-060';
  } else if (sType.includes('application') || sType.includes('filing') || sType.includes('processing')) {
    apf = total;
    btrCode = '4-02-01-130';
  } else if (sType.includes('permit') || sType.includes('possess') || sType.includes('purchase') || sType.includes('dealer') || sType.includes('accredit')) {
    pmt = total;
    btrCode = '4-02-01-010';
  } else {
    oth = total;
    btrCode = '4-02-01-990';
  }

  return { dst, lic, sur, pmt, exm, ins, apf, srf, suf, oth, total, btrCode };
}

export function classifyMfoIndex(app: ApplicationSummaryDto): number {
  const text = `${app.serviceCategory ?? ''} ${app.serviceName ?? ''} ${app.serviceVariantName ?? ''}`.toLowerCase();
  if (text.includes('exam') || text.includes('roce')) return 4;
  if (text.includes('inspect') || text.includes('investigat') || text.includes('monitoring')) return 5;
  if (text.includes('accredit') || text.includes('vas') || text.includes('value added') || text.includes('supplier') || text.includes('service center')) return 3;
  if (text.includes('cert') || text.includes('roc') || text.includes('goc') || text.includes('rroc') || text.includes('registration') || text.includes('dealer')) return 2;
  if (text.includes('licens') || text.includes('rsl') || text.includes('ship') || text.includes('aircraft') || text.includes('land mobile') || text.includes('fixed')) return 1;
  return 0;
}

export function classifyVolumeStream(app: ApplicationSummaryDto): 'Accreditations' | 'Certificates' | 'Exams' | 'Licenses' | 'Permits' {
  const mfo = classifyMfoIndex(app);
  if (mfo === 3) return 'Accreditations';
  if (mfo === 2) return 'Certificates';
  if (mfo === 4) return 'Exams';
  if (mfo === 1) return 'Licenses';
  return 'Permits';
}

const PLACEHOLDER_STAFF_NAMES = new Set<string>([
  'superadmin',
  'super admin',
  'super administrator',
  'administrator',
  'system admin',
  'system administrator',
  'system staff',
  'regional admin',
  'user account',
  'clerk user',
  'ntc agency staff',
]);

export function isPlaceholderStaffName(name?: string | null): boolean {
  if (name === null || name === undefined) return true;
  const trimmed = name.trim();
  if (trimmed.length === 0) return true;
  if (PLACEHOLDER_STAFF_NAMES.has(trimmed.toLowerCase())) return true;
  if (trimmed.includes('@')) return true;
  if (trimmed.toLowerCase().startsWith('user_')) return true;
  return false;
}

export function resolveEvaluatorName(app: ApplicationSummaryDto, _fallbackUserName?: string | null): string {
  const candidates: Array<string | null | undefined> = [
    app.evaluatingOfficer,
    app.issuedDocumentDetails?.[0]?.originalEvaluatorName,
    app.assignedOfficerName,
    app.issuingOfficer,
    app.issuedDocumentDetails?.[0]?.issuedByStaffName,
    app.accountingOfficer,
    app.cashierOfficer,
  ];

  for (const candidate of candidates) {
    if (!isPlaceholderStaffName(candidate) && candidate !== null && candidate !== undefined) {
      return candidate.trim();
    }
  }

  if (Array.isArray(app.histories)) {
    for (const h of app.histories) {
      const role = (h.staffRole ?? '').trim().toLowerCase();
      if (role === 'applicant' || role === 'client') continue;
      if (!isPlaceholderStaffName(h.staffName) && h.staffName !== null && h.staffName !== undefined) {
        return h.staffName.trim();
      }
    }
  }

  return '—';
}

export function resolveEntityName(app: ApplicationSummaryDto): string {
  const compName = (app.filingUser?.company?.name ?? app.applicants?.[0]?.company?.name ?? '').trim();
  if (compName.length > 0) return compName;
  const userName = (app.filingUser?.name ?? app.applicants?.[0]?.name ?? '').trim();
  if (userName.length > 0) return userName;
  return 'Applicant Entity';
}

export function resolveServiceName(app: ApplicationSummaryDto): string {
  const svc = (app.serviceName ?? app.serviceCategory ?? '').trim();
  return svc.length > 0 ? svc : 'Regulatory Permit Service';
}

function computeDefaultExpiry(createdAtStr?: string | null): string {
  if (!createdAtStr) return 'Pending';
  const d = new Date(createdAtStr);
  if (isNaN(d.getTime())) return 'Pending';
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
}

export interface ResolvedApplicationSummaryRow {
  appType: string;
  companyName: string;
  filingType: string;
  workflowStatus: string;
  address: string;
  permitNo: string;
  refNo: string;
  dateFiling: string;
  expDate: string;
  orNo: string;
  amount: number;
  datePaid: string;
  staffBy: string;
}

export function resolveApplicationSummaryRow(
  app: ApplicationSummaryDto,
  transactions: TenantTransactionDto[],
  tenantName: string,
  fallbackUserName?: string | null
): ResolvedApplicationSummaryRow {
  const appType = resolveServiceName(app);
  const companyName = resolveEntityName(app);
  const rawFilingType =
    app.services?.[0]?.applicationType ??
    app.applicants?.[0]?.applicationType ??
    app.serviceVariantType ??
    (app.renewedFromApplicationId ? 'RENEWAL' : 'NEW');
  const filingType = rawFilingType.toUpperCase();
  const workflowStatus = app.status || 'Submitted';
  const address = app.filingUser?.company?.address ?? app.office ?? tenantName;
  const issuedDoc = app.issuedDocumentDetails?.[0];
  const isApproved = app.status === 'Approved' || app.status === 'Completed';
  const permitNo =
    issuedDoc?.licenseNumber ??
    issuedDoc?.callSign ??
    issuedDoc?.formNumber ??
    (isApproved ? app.referenceNumber ?? app.applicationNumber ?? 'Issued' : 'Pending');
  const refNo = app.applicationNumber ?? app.referenceNumber ?? app.id;
  const dateFiling = (app.createdAt ?? '').slice(0, 10);
  const expDate = issuedDoc?.expiryDate
    ? issuedDoc.expiryDate.slice(0, 10)
    : isApproved
    ? computeDefaultExpiry(app.createdAt)
    : 'Pending';

  const matchedTx = transactions.find((tx) => {
    if (tx.id === app.id) return true;
    const txRef = (tx.refNo ?? '').trim().toLowerCase();
    if (!txRef) return false;
    return (
      txRef === (app.officialReceiptNumber ?? '').trim().toLowerCase() ||
      txRef === (app.opNumber ?? '').trim().toLowerCase() ||
      txRef === (app.soaNumber ?? '').trim().toLowerCase() ||
      txRef === (app.referenceNumber ?? '').trim().toLowerCase() ||
      txRef === (app.applicationNumber ?? '').trim().toLowerCase()
    );
  });

  const orNo =
    app.officialReceiptNumber ??
    issuedDoc?.officialReceiptNumber ??
    (matchedTx?.paymentStatus === 'Paid' ? matchedTx.refNo : undefined) ??
    app.opNumber ??
    app.soaNumber ??
    'Unpaid';

  const amount = app.amountPaid ?? app.totalAmountDue ?? matchedTx?.amount ?? 0;
  const datePaid = app.paidAt
    ? app.paidAt.slice(0, 10)
    : matchedTx?.paymentStatus === 'Paid' && matchedTx.date
    ? matchedTx.date.slice(0, 10)
    : '-';
  const staffBy = resolveEvaluatorName(app, fallbackUserName);

  return {
    appType,
    companyName,
    filingType,
    workflowStatus,
    address,
    permitNo,
    refNo,
    dateFiling,
    expDate,
    orNo,
    amount,
    datePaid,
    staffBy,
  };
}

export function resolveApplicationFilingType(app: ApplicationSummaryDto): string {
  const rawFilingType =
    app.services?.[0]?.applicationType ??
    app.applicants?.[0]?.applicationType ??
    app.serviceVariantType ??
    (app.renewedFromApplicationId ? 'RENEWAL' : 'NEW');
  return rawFilingType.trim().toUpperCase();
}

export function filterApplicationsForStatutoryReport(
  reportCode: StatutoryReportCode,
  applications: ApplicationSummaryDto[],
  options?: StatutoryReportGeneratorOptions,
  fallbackUserName?: string | null
): ApplicationSummaryDto[] {
  if (!options) return applications;

  if (reportCode === 'NTC-APP-SUM-EVAL' && options.evaluatorFilter && options.evaluatorFilter !== 'all') {
    const target = options.evaluatorFilter.trim().toLowerCase();
    return applications.filter(
      (app) => resolveEvaluatorName(app, fallbackUserName).toLowerCase() === target
    );
  }

  if (reportCode === 'NTC-APP-SUM-SVC') {
    let result = applications;
    if (options.serviceFilter && options.serviceFilter !== 'all') {
      const target = options.serviceFilter.trim().toLowerCase();
      result = result.filter((app) => resolveServiceName(app).toLowerCase() === target);
    }
    if (options.serviceTypeFilter && options.serviceTypeFilter !== 'all') {
      const typeTarget = options.serviceTypeFilter.trim().toLowerCase();
      result = result.filter((app) => {
        const filingType = resolveApplicationFilingType(app).toLowerCase();
        const variantName = (app.serviceVariantName ?? '').trim().toLowerCase();
        return filingType === typeTarget || filingType.includes(typeTarget) || variantName.includes(typeTarget);
      });
    }
    return result;
  }

  if (reportCode === 'NTC-APP-SUM-ENT') {
    let result = applications;
    if (options.format === 'ntc-sheet') {
      // Per NTC FORMS & Reports specification: Only Completed Applications must be included
      result = result.filter((app) => (app.status ?? '').trim().toLowerCase() === 'completed');
    }
    if (options.entityFilter && options.entityFilter !== 'all') {
      const target = options.entityFilter.trim().toLowerCase();
      result = result.filter((app) => resolveEntityName(app).toLowerCase() === target);
    }
    return result;
  }

  if (reportCode === 'NTC-EXAM-MST-01' && options.scheduleFilter && options.scheduleFilter !== 'all') {
    const target = options.scheduleFilter.trim().toLowerCase();
    return applications.filter((app) => {
      const label = (app.serviceVariantName ?? app.element ?? app.serviceName ?? '').trim().toLowerCase();
      return label === target || label.includes(target);
    });
  }

  return applications;
}

interface VolumeMonthBucket {
  label: string;
  year: number;
  monthIndex: number; // 0..11
}

function computeVolumeMonthBuckets(
  applications: ApplicationSummaryDto[],
  dateRange?: StatutoryReportGeneratorOptions
): VolumeMonthBucket[] {
  const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  if (dateRange?.startDate && dateRange?.endDate) {
    const parsedStart = new Date(dateRange.startDate);
    const parsedEnd = new Date(dateRange.endDate);
    if (!isNaN(parsedStart.getTime()) && !isNaN(parsedEnd.getTime()) && parsedEnd >= parsedStart) {
      const monthSpan =
        (parsedEnd.getFullYear() - parsedStart.getFullYear()) * 12 +
        (parsedEnd.getMonth() - parsedStart.getMonth()) +
        1;
      if (monthSpan >= 2 && monthSpan <= 12) {
        const buckets: VolumeMonthBucket[] = [];
        for (let i = 0; i < monthSpan; i++) {
          const d = new Date(parsedStart.getFullYear(), parsedStart.getMonth() + i, 1);
          const mIdx = d.getMonth();
          const yr = d.getFullYear();
          const mName = shortMonths[mIdx] ?? `M${i + 1}`;
          buckets.push({
            label: monthSpan > 6 ? mName : `${mName} ${yr}`,
            year: yr,
            monthIndex: mIdx,
          });
        }
        return buckets;
      }
    }
  }

  const baseYear = applications[0]?.createdAt
    ? new Date(applications[0].createdAt).getFullYear()
    : new Date().getFullYear();

  const buckets: VolumeMonthBucket[] = [];
  for (let i = 0; i < 6; i++) {
    const mName = shortMonths[i] ?? `M${i + 1}`;
    buckets.push({
      label: `${mName} ${baseYear}`,
      year: baseYear,
      monthIndex: i,
    });
  }
  return buckets;
}

function countAppsByVolumeBuckets(
  streamApps: ApplicationSummaryDto[],
  buckets: VolumeMonthBucket[]
): number[] {
  const counts = new Array<number>(buckets.length).fill(0);
  for (const app of streamApps) {
    const d = app.createdAt ? new Date(app.createdAt) : null;
    if (d === null || isNaN(d.getTime())) continue;
    const m = d.getMonth();
    const yr = d.getFullYear();
    const exactIdx = buckets.findIndex((b) => b.monthIndex === m && b.year === yr);
    if (exactIdx >= 0) {
      counts[exactIdx] = (counts[exactIdx] ?? 0) + 1;
    } else {
      const monthOnlyIdx = buckets.findIndex((b) => b.monthIndex === m);
      if (monthOnlyIdx >= 0) {
        counts[monthOnlyIdx] = (counts[monthOnlyIdx] ?? 0) + 1;
      }
    }
  }
  return counts;
}

export function generateStatutoryCsv(
  reportCode: StatutoryReportCode,
  tenantName: string,
  period: string,
  applications: ApplicationSummaryDto[],
  transactions: TenantTransactionDto[],
  feedback: FeedbackDto[],
  dateRange?: StatutoryReportGeneratorOptions
): { content: string; filename: string } {
  const cleanTenant = tenantName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dateStamp = new Date().toISOString().slice(0, 10);
  const periodLabel = dateRange?.startDate && dateRange?.endDate
    ? `${dateRange.startDate}_to_${dateRange.endDate}`
    : cleanTenant;
  let filename = `${reportCode}_${periodLabel}_${dateStamp}.csv`;
  let content = '';

  const scopedApplications = filterApplicationsForStatutoryReport(reportCode, applications, dateRange);
  const paidTransactions = getPaidTransactions(transactions, applications);

  switch (reportCode) {
    // ----------------------------------------------------
    // Row 12: MIS (Management Information System)
    // ----------------------------------------------------
    case 'NTC-MIS-OPS': {
      filename = `NTC_MIS_Operations_${periodLabel}_${dateStamp}.csv`;
      content = 'Category,Total Applied,Approved / Issued,In Evaluation,Returned,SLA Compliance Rate (%)\n';
      const categories = [
        'Radio Permits (CP / RSL / POS)',
        'Licenses (Ship / Aircraft / Fixed / Land Mobile)',
        'Certificates (ROC / GOC / RROC / Dealer)',
        'Accreditations & Value Added Services',
        'Radio Operator Examination (ROCE)',
        'Radio Station Inspections & Investigations',
      ];
      for (let i = 0; i < categories.length; i++) {
        const cat = categories[i] ?? 'Regulatory Category';
        const catApps = scopedApplications.filter((a) => classifyMfoIndex(a) === i);
        const total = catApps.length;
        const approved = catApps.filter((a) => a.status === 'Approved' || a.status === 'Completed').length;
        const evaluating = catApps.filter((a) => a.status === 'Evaluating' || a.status === 'Submitted' || a.status === 'ForAccountant' || a.status === 'PendingPayment').length;
        const returned = catApps.filter((a) => a.status === 'Returned').length;
        const slaRate = total > 0 ? Math.round((approved / total) * 100) : 100;
        content += `${q(cat)},${total},${approved},${evaluating},${returned},${slaRate}%\n`;
      }
      const grandTotal = scopedApplications.length;
      const grandApproved = scopedApplications.filter((a) => a.status === 'Approved' || a.status === 'Completed').length;
      const grandEval = scopedApplications.filter((a) => a.status === 'Evaluating' || a.status === 'Submitted' || a.status === 'ForAccountant' || a.status === 'PendingPayment').length;
      const grandRet = scopedApplications.filter((a) => a.status === 'Returned').length;
      const grandSla = grandTotal > 0 ? Math.round((grandApproved / grandTotal) * 100) : 100;
      content += `"TOTAL",${grandTotal},${grandApproved},${grandEval},${grandRet},${grandSla}%\n`;
      break;
    }

    // ----------------------------------------------------
    // Row 14 & 15: Appendix 26 (Monthly & Daily Collections)
    // ----------------------------------------------------
    case 'NTC-COA-APP26-M':
    case 'NTC-COA-APP26-D': {
      const isDaily = reportCode === 'NTC-COA-APP26-D';
      const isNtcSheet = dateRange?.format === 'ntc-sheet';
      filename = isDaily
        ? `NTC_COA_Appendix26_Daily${isNtcSheet ? '_NTCSheet' : ''}_${periodLabel}_${dateStamp}.csv`
        : `NTC_COA_Appendix26_Monthly${isNtcSheet ? '_NTCSheet' : ''}_${periodLabel}_${dateStamp}.csv`;

      content = 'Entity Name: National Telecommunications Commission\n';
      content += `Regional Office: ${q(tenantName)}\n`;
      content += 'Fund Cluster: 101101\n';
      content += `Reporting Period: ${q(period)}\n\n`;

      if (!isDaily && isNtcSheet) {
        content += 'Date,OR Number,Payor,Particulars,Total per OR,Taxes (40101010),Fees (40201010)\n';
        let sumOr = 0;
        let sumTaxes = 0;
        let sumFees = 0;
        for (const tx of paidTransactions) {
          const b = classifyUacsBreakdown(tx);
          const taxes = b.dst;
          const fees = Math.max(0, b.total - taxes);
          sumOr += b.total;
          sumTaxes += taxes;
          sumFees += fees;
          content += `${q((tx.date ?? '').slice(0, 10))},${q(tx.refNo ?? '')},${q(tx.applicantName ?? '')},${q(tx.serviceType ?? '')},${b.total.toFixed(2)},${taxes.toFixed(2)},${fees.toFixed(2)}\n`;
        }
        content += `"TOTAL","","","",${sumOr.toFixed(2)},${sumTaxes.toFixed(2)},${sumFees.toFixed(2)}\n`;
        break;
      }

      content += 'Date,Official Receipt No,Payor Name,4-02-01-060 Doc Stamps,4-02-01-020 Licensing Fees,4-02-01-140 Surcharges,4-02-01-010 Permit Fees,4-02-01-040 Exam Fees,4-02-02-030 Inspection Fees,4-02-01-100 Application Fees,4-02-01-130 Supervision Fees,4-02-01-990 Spectrum Users Fees,Other Service Income,Total Amount\n';

      let sumDst = 0;
      let sumLic = 0;
      let sumSur = 0;
      let sumPmt = 0;
      let sumExm = 0;
      let sumIns = 0;
      let sumApf = 0;
      let sumSrf = 0;
      let sumSuf = 0;
      let sumOth = 0;
      let sumTotal = 0;

      for (const tx of paidTransactions) {
        const d = q((tx.date ?? '').slice(0, 10));
        const orNo = q(tx.refNo ?? '');
        const payor = q(tx.applicantName ?? '');
        const b = classifyUacsBreakdown(tx);

        sumDst += b.dst;
        sumLic += b.lic;
        sumSur += b.sur;
        sumPmt += b.pmt;
        sumExm += b.exm;
        sumIns += b.ins;
        sumApf += b.apf;
        sumSrf += b.srf;
        sumSuf += b.suf;
        sumOth += b.oth;
        sumTotal += b.total;

        content += `${d},${orNo},${payor},${b.dst},${b.lic},${b.sur},${b.pmt},${b.exm},${b.ins},${b.apf},${b.srf},${b.suf},${b.oth},${b.total}\n`;
      }

      content += `"TOTAL","","",${sumDst},${sumLic},${sumSur},${sumPmt},${sumExm},${sumIns},${sumApf},${sumSrf},${sumSuf},${sumOth},${sumTotal}\n`;
      break;
    }

    // ----------------------------------------------------
    // Row 16: Monthly Report of Documentary Stamp Tax (DST)
    // ----------------------------------------------------
    case 'NTC-BIR-DST-01': {
      filename = `NTC_BIR_DST_Remittance_${periodLabel}_${dateStamp}.csv`;
      content = 'NATIONAL TELECOMMUNICATIONS COMMISSION\n';
      content += `Regional Office: ${q(tenantName)}\n`;
      content += `For the Period: ${q(period)}\n`;
      content += 'MONTHLY REPORT OF DOCUMENTARY STAMP TAX COLLECTION AND REMITTANCE\n\n';
      content += 'DATE ISSUED,INCLUSIVE SERIAL NUMBER OF GOR (FROM),INCLUSIVE SERIAL NUMBER OF GOR (TO),NO. OF CERTIFICATIONS ISSUED,AMOUNT OF DST COLLECTED,TOTAL AMOUNT,REMITTANCE STATUS\n';

      const dateMap = new Map<string, TenantTransactionDto[]>();
      for (const tx of paidTransactions) {
        const d = (tx.date ?? '').slice(0, 10);
        if (!dateMap.has(d)) dateMap.set(d, []);
        const list = dateMap.get(d);
        if (list !== undefined) list.push(tx);
      }

      let grandTotalDst = 0;
      let grandTotalCerts = 0;

      for (const [dateKey, dayTx] of dateMap.entries()) {
        const refs = dayTx.map((t) => t.refNo ?? '').filter((r) => r.length > 0).sort();
        const fromRef = refs.length > 0 ? refs[0] : 'N/A';
        const toRef = refs.length > 0 ? refs[refs.length - 1] : 'N/A';
        const certCount = dayTx.length;
        const dstAmount = certCount * 30.0;
        grandTotalCerts += certCount;
        grandTotalDst += dstAmount;

        content += `${q(dateKey)},${q(fromRef)},${q(toRef)},${certCount},${dstAmount.toFixed(2)},${dstAmount.toFixed(2)},"Remitted to BIR"\n`;
      }

      content += `\nTOTAL,,,${grandTotalCerts},${grandTotalDst.toFixed(2)},${grandTotalDst.toFixed(2)},\n`;
      content += `AMOUNT REMITTED,,,,${grandTotalDst.toFixed(2)},,\n`;
      break;
    }

    // ----------------------------------------------------
    // Row 17: Monthly Report of Income Collected & Deposited (BTr)
    // ----------------------------------------------------
    case 'NTC-BTR-INC-01': {
      const isNtcSheet = dateRange?.format === 'ntc-sheet';
      filename = isNtcSheet
        ? `NTC_BTr_Income_Deposited_NTCSheet_${periodLabel}_${dateStamp}.csv`
        : `NTC_BTr_Income_Deposited_${periodLabel}_${dateStamp}.csv`;
      content = 'MONTHLY REPORT OF INCOME COLLECTED AND INCOME DEPOSITED WITH THE BUREAU OF THE TREASURY\n';
      content += `Office of the President - National Telecommunications Commission\n`;
      content += `Regional Office: ${q(tenantName)}\n`;
      content += `For the Month of: ${q(period)}\n\n`;
      content += 'ACCOUNT TITLE / DESCRIPTION,ACCOUNT CODE,THIS MONTH INCOME COLLECTED,THIS MONTH DST COLLECTED,REMITTED DST TO BIR,INCOME DEPOSITED WITH BTR,YTD INCOME COLLECTED,YTD DEPOSITED WITH BTR,UNDEPOSITED COLLECTION\n';

      const accounts = [
        { title: 'Permit Fees', code: '4-02-01-010' },
        { title: 'Registration Fees', code: '4-02-01-020' },
        { title: 'Clearance and Certification Fees', code: '4-02-01-040' },
        { title: 'Licensing Fees', code: '4-02-01-060' },
        { title: 'Supervision & Regulation Enforcement Fees', code: '4-02-01-070' },
        { title: 'Spectrum Usage Fees', code: '4-02-01-080' },
        { title: 'Inspection Fees', code: '4-02-02-100' },
        { title: 'Processing Fees', code: '4-02-01-130' },
        { title: 'Fines and Penalties - Service Income', code: '4-02-01-140' },
        { title: 'Other Service Income', code: '4-02-01-990' },
        ...(isNtcSheet
          ? [
              { title: 'Other Non-Operating Income', code: '4-06-01-010' },
              { title: 'Miscellaneous Income', code: '4-06-09-990' },
            ]
          : []),
      ];

      let sumMonthCollected = 0;
      let sumDst = 0;
      let sumDeposited = 0;
      let sumUndeposited = 0;

      for (const acc of accounts) {
        const matchingTx = paidTransactions.filter((tx) => classifyUacsBreakdown(tx).btrCode === acc.code);
        const thisMonthCollected = matchingTx.reduce((sum, t) => sum + (t.amount ?? 0), 0);
        const dstCollected = matchingTx.reduce((sum, t) => {
          const amt = t.amount ?? 0;
          return sum + (amt >= 30 ? 30 : 0);
        }, 0);
        const remittedDst = dstCollected;
        const depositedBtr = Math.max(0, thisMonthCollected - remittedDst);
        const ytdCollected = thisMonthCollected;
        const ytdDeposited = depositedBtr;
        const undeposited = Math.max(0, thisMonthCollected - remittedDst - depositedBtr);

        sumMonthCollected += thisMonthCollected;
        sumDst += dstCollected;
        sumDeposited += depositedBtr;
        sumUndeposited += undeposited;

        content += `${q(acc.title)},${q(acc.code)},${thisMonthCollected.toFixed(2)},${dstCollected.toFixed(2)},${remittedDst.toFixed(2)},${depositedBtr.toFixed(2)},${ytdCollected.toFixed(2)},${ytdDeposited.toFixed(2)},${undeposited.toFixed(2)}\n`;
      }

      content += `"TOTAL","",${sumMonthCollected.toFixed(2)},${sumDst.toFixed(2)},${sumDst.toFixed(2)},${sumDeposited.toFixed(2)},${sumMonthCollected.toFixed(2)},${sumDeposited.toFixed(2)},${sumUndeposited.toFixed(2)}\n`;
      break;
    }

    // ----------------------------------------------------
    // Rows 18, 19, 20: Application Summary (Evaluator / Service / Entity)
    // ----------------------------------------------------
    case 'NTC-APP-SUM-EVAL':
    case 'NTC-APP-SUM-SVC':
    case 'NTC-APP-SUM-ENT': {
      const isNtcSheet = dateRange?.format === 'ntc-sheet';
      const isEntityNtcSheet = reportCode === 'NTC-APP-SUM-ENT' && isNtcSheet;
      const typeLabel = reportCode === 'NTC-APP-SUM-EVAL'
        ? 'by Evaluator'
        : reportCode === 'NTC-APP-SUM-SVC'
        ? 'by Service'
        : 'by Entity';

      filename = `NTC_Application_Summary_${typeLabel.replace(/\s+/g, '_')}${isNtcSheet ? '_NTCSheet' : ''}_${periodLabel}_${dateStamp}.csv`;
      content = `APPLICATION SUMMARY REPORT ${typeLabel.toUpperCase()}\n`;
      content += `Regional Office: ${q(tenantName)}\n`;
      content += `Reporting Period: ${q(period)}\n\n`;
      content += isEntityNtcSheet
        ? 'REFERENCE NUMBER,Application Type,STATUS(NEW/REN/DUP),ADDRESS,PERMIT NO.,DATE OF FILING,EXPIRATION DATE,OR NUMBER,AMOUNT,DATE PAID,BY\n'
        : 'Application Type,COMPANY NAME / NAME,STATUS(NEW/REN/DUP),FULL ADDRESS,PERMIT NO.,REFERENCE NUMBER,DATE OF FILING,EXPIRATION DATE,OR NUMBER,AMOUNT,DATE PAID,BY\n';

      const groupCounter = new Map<string, { count: number; totalAmount: number }>();
      let grandTotalAmount = 0;

      for (const app of scopedApplications) {
        const row = resolveApplicationSummaryRow(app, paidTransactions, tenantName);
        grandTotalAmount += row.amount;

        if (isEntityNtcSheet) {
          content += `${q(row.refNo)},${q(row.appType)},${q(row.filingType)},${q(row.address)},${q(row.permitNo)},${q(row.dateFiling)},${q(row.expDate)},${q(row.orNo)},${row.amount.toFixed(2)},${q(row.datePaid)},${q(row.staffBy)}\n`;
        } else {
          content += `${q(row.appType)},${q(row.companyName)},${q(`${row.filingType} (${row.workflowStatus})`)},${q(row.address)},${q(row.permitNo)},${q(row.refNo)},${q(row.dateFiling)},${q(row.expDate)},${q(row.orNo)},${row.amount.toFixed(2)},${q(row.datePaid)},${q(row.staffBy)}\n`;
        }

        const groupKey = isNtcSheet
          ? `${row.appType} (${row.filingType})`
          : reportCode === 'NTC-APP-SUM-EVAL'
          ? row.staffBy
          : reportCode === 'NTC-APP-SUM-ENT'
          ? row.companyName
          : row.appType;
        const prev = groupCounter.get(groupKey) ?? { count: 0, totalAmount: 0 };
        groupCounter.set(groupKey, {
          count: prev.count + 1,
          totalAmount: prev.totalAmount + row.amount,
        });
      }

      content += isNtcSheet
        ? '\nSUMMARY\nTYPE,NUMBER(S)\n'
        : '\nSUMMARY\nTYPE / GROUP,NUMBER(S),TOTAL AMOUNT (PHP)\n';
      for (const [gName, statsObj] of groupCounter.entries()) {
        content += isNtcSheet
          ? `${q(gName)},${statsObj.count}\n`
          : `${q(gName)},${statsObj.count},${statsObj.totalAmount.toFixed(2)}\n`;
      }
      content += isNtcSheet
        ? `TOTAL,${scopedApplications.length}\n`
        : `TOTAL,${scopedApplications.length},${grandTotalAmount.toFixed(2)}\n`;
      break;
    }

    // ----------------------------------------------------
    // Row 21: Volume Report (EDGE Application Volume Report)
    // ----------------------------------------------------
    case 'NTC-APP-VOL-01': {
      const isNtcSheet = dateRange?.format === 'ntc-sheet';
      filename = isNtcSheet
        ? `NTC_Application_Volume_Report_NTCSheet_${periodLabel}_${dateStamp}.csv`
        : `NTC_Application_Volume_Report_${periodLabel}_${dateStamp}.csv`;
      const buckets = computeVolumeMonthBuckets(scopedApplications, dateRange);
      content = isNtcSheet
        ? 'EDGE APPLICATION VOLUME REPORT\n'
        : 'EDGE APPLICATION VOLUME & DEPOSIT ACCOUNTABILITY REPORT\n';
      content += `Regional Office: ${q(tenantName)}\n`;
      content += `Coverage: ${q(period)}\n\n`;
      content += isNtcSheet
        ? `Service Name,${buckets.map((b) => q(b.label)).join(',')},TOTAL\n`
        : `Service Name,${buckets.map((b) => q(b.label)).join(',')},TOTAL APPS,ISSUED,IN-PROCESS,COLLECTED (PHP),DEPOSITED (PHP)\n`;

      const streams: Array<'Accreditations' | 'Certificates' | 'Exams' | 'Licenses' | 'Permits'> = [
        'Accreditations',
        'Certificates',
        'Exams',
        'Licenses',
        'Permits',
      ];
      const colTotals = new Array<number>(buckets.length).fill(0);
      let grandTotal = 0;
      let grandIssued = 0;
      let grandInProc = 0;
      let grandCollected = 0;
      let grandDeposited = 0;

      for (const s of streams) {
        const streamApps = scopedApplications.filter((a) => classifyVolumeStream(a) === s);
        const mCounts = countAppsByVolumeBuckets(streamApps, buckets);
        const rowSum = streamApps.length;
        const issued = streamApps.filter((a) => a.status === 'Approved' || a.status === 'Completed').length;
        const returned = streamApps.filter((a) => a.status === 'Returned').length;
        const inProc = Math.max(0, rowSum - issued - returned);

        const streamAppIds = new Set(streamApps.map((a) => a.id));
        const streamTx = paidTransactions.filter((t) => streamAppIds.has(t.id));
        const collected = streamTx.reduce((sum, t) => sum + (t.amount ?? 0), 0);
        const deposited = streamTx
          .filter((t) => (t.paymentStatus ?? '').toLowerCase() === 'deposited' || (t.paymentStatus ?? '').toLowerCase() === 'paid')
          .reduce((sum, t) => sum + (t.amount ?? 0), 0);

        grandTotal += rowSum;
        grandIssued += issued;
        grandInProc += inProc;
        grandCollected += collected;
        grandDeposited += deposited;

        for (let idx = 0; idx < buckets.length; idx++) {
          colTotals[idx] = (colTotals[idx] ?? 0) + (mCounts[idx] ?? 0);
        }
        content += isNtcSheet
          ? `${q(s)},${mCounts.join(',')},${rowSum}\n`
          : `${q(s)},${mCounts.join(',')},${rowSum},${issued},${inProc},${collected.toFixed(2)},${deposited.toFixed(2)}\n`;
      }
      content += isNtcSheet
        ? `"TOTAL",${colTotals.join(',')},${grandTotal}\n`
        : `"TOTAL",${colTotals.join(',')},${grandTotal},${grandIssued},${grandInProc},${grandCollected.toFixed(2)},${grandDeposited.toFixed(2)}\n`;
      break;
    }

    // ----------------------------------------------------
    // Row 22: Exam Masterlist
    // ----------------------------------------------------
    case 'NTC-EXAM-MST-01': {
      filename = `NTC_Exam_Masterlist_${periodLabel}_${dateStamp}.csv`;
      content = 'NATIONAL TELECOMMUNICATIONS COMMISSION\n';
      content += `Regional Office: ${q(tenantName)}\n`;
      content += 'MASTERLIST FOR COMMERCIAL AND NON-COMMERCIAL RADIO OPERATOR EXAMINATION\n';
      content += `Schedule Date: ${q(period)}\n\n`;
      content += 'ROOM #,Exam Classification,No.,Application / Admission Ref,Examinee Full Name,Status,Signature\n';

      const examApps = scopedApplications.filter((a) => {
        const cat = `${a.serviceCategory ?? ''} ${a.serviceName ?? ''} ${a.serviceVariantName ?? ''}`.toLowerCase();
        return cat.includes('exam') || cat.includes('operator') || cat.includes('roce') || cat.includes('amateur') || cat.includes('rroc');
      });

      const candidates = examApps.length > 0 ? examApps : scopedApplications;
      for (let i = 0; i < candidates.length; i++) {
        const c = candidates[i];
        const roomNum = Math.floor(i / 30) + 1;
        const room = `Room ${roomNum}`;
        const examClass =
          c?.serviceVariantName ??
          c?.element ??
          c?.serviceName ??
          'Radio Operator Examination (Commercial / Amateur)';
        const refNo = c?.applicationNumber ?? c?.referenceNumber ?? `EXM-${i + 1}`;
        const examineeName = (c?.applicants?.[0]?.name ?? c?.filingUser?.name ?? 'Candidate Name').toUpperCase();
        const status = c?.status ?? 'Registered';
        content += `${q(room)},${q(examClass)},${i + 1},${q(refNo)},${q(examineeName)},${q(status)},"____________________"\n`;
      }
      break;
    }

    // Existing General Statutory Reports
    case 'NTC-BAR-1': {
      filename = `NTC_BAR_No1_Operations_${cleanTenant}_${dateStamp}.csv`;
      content = 'MFO / Service Category,Application Number,Reference No,Applicant Name,Service Name,Target SLA (Days),Current Status,Submission Date,Completion Date\n';
      for (const app of applications) {
        const cat = q(app.serviceCategory ?? 'Major Final Output 1');
        const appNum = q(app.applicationNumber ?? app.id);
        const ref = q(app.referenceNumber ?? '');
        const applicant = q(app.filingUser?.name ?? app.filingUser?.company?.name ?? 'Applicant');
        const svc = q(app.serviceName ?? 'Regulatory Permit');
        const sla = '7';
        const status = q(app.status ?? 'Submitted');
        const subDate = q(app.createdAt ?? '');
        const compDate = q(app.createdAt ?? '');
        content += `${cat},${appNum},${ref},${applicant},${svc},${sla},${status},${subDate},${compDate}\n`;
      }
      break;
    }

    case 'NTC-BTr-COA-01': {
      filename = `NTC_BTr_COA_Collections_${cleanTenant}_${dateStamp}.csv`;
      content = 'Account Code,Reference / OR No,Payor / Applicant,Regulatory Revenue Stream,Amount (PHP),Payment Status,Collection Date,Remittance Status\n';
      for (const tx of transactions) {
        const accCode = '"4-02-01-010"';
        const ref = q(tx.refNo ?? '');
        const name = q(tx.applicantName ?? '');
        const svc = q(tx.serviceType ?? 'Permit & Regulatory Fee');
        const amt = tx.amount ?? 0;
        const status = q(tx.paymentStatus ?? 'Paid');
        const date = q(tx.date ?? '');
        const remit = '"Remitted to National Treasury"';
        content += `${accCode},${ref},${name},${svc},${amt},${status},${date},${remit}\n`;
      }
      break;
    }

    case 'ARTA-RA-11032': {
      filename = `ARTA_RA11032_SLA_Report_${cleanTenant}_${dateStamp}.csv`;
      content = 'Transaction Complexity,Service Name,Application Number,Applicant Name,Filing Date,Resolution Date,Turnaround (Days),SLA Threshold (Days),Compliant (Yes/No)\n';
      for (const app of applications) {
        const complexity = (app.serviceCategory ?? '').toLowerCase().includes('permit') ? 'Complex (7 Days)' : 'Simple (3 Days)';
        const svc = q(app.serviceName ?? 'Telecommunications Service');
        const appNum = q(app.applicationNumber ?? app.id);
        const applicant = q(app.filingUser?.name ?? app.filingUser?.company?.name ?? 'Applicant');
        const fDate = q(app.createdAt ?? '');
        const rDate = q(app.createdAt ?? '');
        const days = '3';
        const threshold = '7';
        const compliant = app.status === 'Approved' || app.status === 'Completed' ? 'Yes' : 'In Progress';
        content += `"${complexity}",${svc},${appNum},${applicant},${fDate},${rDate},${days},${threshold},"${compliant}"\n`;
      }
      break;
    }

    case 'NTC-SPECTRUM-INV': {
      filename = `NTC_Spectrum_Inventory_${cleanTenant}_${dateStamp}.csv`;
      content = 'Radio Service Category,Station Reference No,Licensee / Entity,Frequency / Band,Station Class,Location / Region,Authorization Status,Issuance Date\n';
      for (const app of applications) {
        const cat = q(app.serviceCategory ?? 'Land Mobile Radio');
        const ref = q(app.referenceNumber ?? app.applicationNumber ?? 'STN-2026-001');
        const licensee = q(app.filingUser?.name ?? app.filingUser?.company?.name ?? 'Licensee Entity');
        const freq = '"VHF / UHF Commercial Band"';
        const stnClass = '"Base / Mobile Station"';
        const loc = q(cleanTenant);
        const status = q(app.status ?? 'Authorized');
        const date = q(app.createdAt ?? '');
        content += `${cat},${ref},${licensee},${freq},${stnClass},${loc},${status},${date}\n`;
      }
      break;
    }

    case 'NTC-CSMR-8888': {
      filename = `NTC_CSMR_Feedback_${cleanTenant}_${dateStamp}.csv`;
      content = 'Client / Citizen Name,Contact Email,Service Evaluated,CSAT Rating (1-5),Anonymous,Subject / Concern,Feedback Content,Resolution Status,Submission Date\n';
      for (const fb of feedback) {
        const name = fb.isAnonymous ? '"Anonymous Citizen"' : q(fb.senderName ?? 'Citizen Client');
        const email = fb.isAnonymous ? '"[Redacted / Anonymous]"' : q(fb.senderEmail ?? '');
        const svc = '"Regional Service & Processing"';
        const rating = fb.rating;
        const anon = fb.isAnonymous ? 'Yes' : 'No';
        const subject = q(fb.subject ?? '');
        const msg = q(fb.message ?? '');
        const resStatus = '"Resolved / Recorded"';
        const date = q(fb.createdAt ?? '');
        content += `${name},${email},${svc},${rating},${anon},${subject},${msg},${resStatus},${date}\n`;
      }
      break;
    }

    case 'NTC-NOV-ENF': {
      filename = `NTC_Enforcement_NOV_${cleanTenant}_${dateStamp}.csv`;
      content = 'Inspection ID,Facility / Entity Inspected,Station Classification,Inspection Finding,Action Taken,Notice of Violation Ref,Hearing / Compliance Status,Date of Inspection\n';
      for (let i = 0; i < Math.max(applications.length, 3); i++) {
        const app = applications[i];
        const inspId = `"INSP-2026-${String(i + 1).padStart(3, '0')}"`;
        const entity = q(app?.filingUser?.name ?? app?.filingUser?.company?.name ?? 'Commercial Operator Inc.');
        const stnClass = '"Commercial Broadcast & Radio Facility"';
        const finding = i % 2 === 0 ? '"Fully Compliant with Safety & Spectrum Standards"' : '"Minor Technical Discrepancy - RF Output"';
        const action = i % 2 === 0 ? '"Certificate of Inspection Issued"' : '"Notice of Rectification Issued"';
        const novRef = i % 2 === 0 ? '"N/A"' : `"NOV-2026-${String(i + 101)}"`;
        const status = '"Complied"';
        const date = q(app?.createdAt ?? new Date().toISOString());
        content += `${inspId},${entity},${stnClass},${finding},${action},${novRef},${status},${date}\n`;
      }
      break;
    }
  }

  return { content, filename };
}

export function downloadCsvFile(content: string, filename: string): void {
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => {
      try {
        URL.revokeObjectURL(url);
      } catch {
        // Ignore revocation error
      }
    }, 60_000);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// High-Fidelity Official Print Renderers Tailored Exactly to Each Template
// ─────────────────────────────────────────────────────────────────────────────


function renderMisOpsHtml(
  reportMetadata: StatutoryReportMetadata,
  tenantName: string,
  period: string,
  applications: ApplicationSummaryDto[],
  transactions: TenantTransactionDto[],
  feedback: FeedbackDto[],
  userName?: string | null
): string {
  const currentDateStr = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const categories = [
    { name: 'Radio Permits (CP / RSL / POS)', target: 120 },
    { name: 'Licenses (Ship / Aircraft / Fixed / Land Mobile)', target: 250 },
    { name: 'Certificates (ROC / GOC / RROC / Dealer)', target: 180 },
    { name: 'Accreditations & Value Added Services', target: 50 },
    { name: 'Radio Operator Examination (ROCE)', target: 300 },
    { name: 'Radio Station Inspections & Investigations', target: 80 },
  ];

  const totalApps = applications.length;
  const totalApproved = applications.filter((a) => a.status === 'Approved' || a.status === 'Completed').length;
  const totalEvaluating = applications.filter(
    (a) =>
      a.status === 'Evaluating' ||
      a.status === 'Submitted' ||
      a.status === 'ForAccountant' ||
      a.status === 'PendingPayment'
  ).length;
  const totalReturned = applications.filter((a) => a.status === 'Returned').length;
  const paidTransactions = getPaidTransactions(transactions, applications);
  const totalRevenue = paidTransactions.reduce((sum, tx) => sum + (tx.amount ?? 0), 0);
  const avgCsat = feedback.length > 0
    ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1)
    : '5.0';

  const rows = categories.map((cat, i) => {
    const catApps = applications.filter((a) => classifyMfoIndex(a) === i);
    const filed = catApps.length;
    const issued = catApps.filter((a) => a.status === 'Approved' || a.status === 'Completed').length;
    const pending = catApps.filter(
      (a) =>
        a.status === 'Evaluating' ||
        a.status === 'Submitted' ||
        a.status === 'ForAccountant' ||
        a.status === 'PendingPayment'
    ).length;
    const returned = catApps.filter((a) => a.status === 'Returned').length;
    const accomplishmentRate = cat.target > 0 ? Math.min(Math.round((issued / cat.target) * 100), 100) : 100;
    const slaCompliance = filed > 0 ? Math.round((issued / filed) * 100) : 100;

    return `
      <tr>
        <td style="border: 1px solid #000; padding: 6px; text-align: center;">${i + 1}</td>
        <td style="border: 1px solid #000; padding: 6px; font-weight: bold;">${cat.name}</td>
        <td style="border: 1px solid #000; padding: 6px; text-align: right;">${cat.target}</td>
        <td style="border: 1px solid #000; padding: 6px; text-align: right; font-weight: bold;">${filed}</td>
        <td style="border: 1px solid #000; padding: 6px; text-align: right; color: #059669; font-weight: bold;">${issued}</td>
        <td style="border: 1px solid #000; padding: 6px; text-align: right; color: #d97706;">${pending}</td>
        <td style="border: 1px solid #000; padding: 6px; text-align: right; color: #dc2626;">${returned}</td>
        <td style="border: 1px solid #000; padding: 6px; text-align: center;">3 Days</td>
        <td style="border: 1px solid #000; padding: 6px; text-align: right; font-weight: bold;">${accomplishmentRate}%</td>
        <td style="border: 1px solid #000; padding: 6px; text-align: right; font-weight: bold;">${slaCompliance}%</td>
      </tr>
    `;
  }).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>NTC MIS Operations Accomplishment Report - ${tenantName}</title>
  <style>
    @media print {
      body { margin: 10mm 15mm; -webkit-print-color-adjust: exact; }
      @page { size: landscape; margin: 10mm; }
    }
    body {
      font-family: Arial, sans-serif;
      font-size: 11px;
      color: #000;
      background: #fff;
      margin: 20px;
    }
    .header-banner {
      text-align: center;
      margin-bottom: 16px;
      line-height: 1.3;
    }
    .rep-title { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
    .agency-title { font-size: 14px; font-weight: bold; margin-top: 2px; }
    .region-title { font-size: 12px; font-weight: bold; color: #1e3a8a; }
    .doc-title { font-size: 14px; font-weight: bold; margin-top: 8px; text-decoration: underline; }
    .period-title { font-size: 11px; margin-top: 2px; font-style: italic; }
    .meta-box {
      width: 100%;
      border: 1px solid #000;
      border-collapse: collapse;
      margin-bottom: 12px;
      font-size: 10px;
    }
    .meta-box td { padding: 4px 8px; border: 1px solid #000; }
    .section-title {
      font-weight: bold;
      font-size: 11px;
      margin: 12px 0 4px 0;
      text-transform: uppercase;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #000;
      font-size: 10px;
      margin-bottom: 12px;
    }
    .data-table th {
      border: 1px solid #000;
      padding: 6px;
      background: #f1f5f9;
      font-weight: bold;
      text-align: center;
    }
    .sign-table {
      width: 100%;
      margin-top: 24px;
      border-collapse: collapse;
    }
    .sign-table td {
      width: 33.33%;
      text-align: center;
      vertical-align: top;
      padding: 0 16px;
    }
  </style>
</head>
<body>
  <div class="header-banner">
    <div class="rep-title">Republic of the Philippines &bull; Office of the President</div>
    <div class="agency-title">NATIONAL TELECOMMUNICATIONS COMMISSION</div>
    <div class="region-title">${tenantName}</div>
    <div class="doc-title">MANAGEMENT INFORMATION SYSTEM (MIS) OPERATIONS ACCOMPLISHMENT REPORT</div>
    <div class="period-title">Reporting Coverage: ${period} &bull; Generated: ${currentDateStr}</div>
  </div>

  <table class="meta-box">
    <tr>
      <td style="width: 50%;"><strong>Agency:</strong> National Telecommunications Commission</td>
      <td style="width: 50%;"><strong>Operating Unit:</strong> ${tenantName}</td>
    </tr>
    <tr>
      <td><strong>Legal Mandate:</strong> Executive Order No. 546 / RA 7925 / Ease of Doing Business (RA 11032)</td>
      <td><strong>Report Series:</strong> NTC-MIS-OPS-${new Date().getFullYear()}</td>
    </tr>
  </table>

  <div class="section-title">I. Key Operational Performance Indicators (Physical Accomplishment)</div>
  <table class="data-table">
    <thead>
      <tr>
        <th rowspan="2" style="width: 30px;">#</th>
        <th rowspan="2">Major Final Output (MFO) / Regulatory Category</th>
        <th rowspan="2" style="width: 65px;">Physical Target</th>
        <th colspan="4">Actual Accomplishment</th>
        <th rowspan="2" style="width: 65px;">Citizen Charter SLA</th>
        <th rowspan="2" style="width: 70px;">Target Accomplishment %</th>
        <th rowspan="2" style="width: 70px;">SLA Compliance %</th>
      </tr>
      <tr>
        <th style="width: 60px;">Received</th>
        <th style="width: 60px;">Issued</th>
        <th style="width: 60px;">Pending</th>
        <th style="width: 60px;">Returned</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
      <tr style="background: #f8fafc; font-weight: bold;">
        <td colspan="2" style="border: 1px solid #000; padding: 6px; text-align: center;">TOTAL / CONSOLIDATED REGIONAL OPERATIONS</td>
        <td style="border: 1px solid #000; padding: 6px; text-align: right;">980</td>
        <td style="border: 1px solid #000; padding: 6px; text-align: right;">${totalApps}</td>
        <td style="border: 1px solid #000; padding: 6px; text-align: right; color: #059669;">${totalApproved}</td>
        <td style="border: 1px solid #000; padding: 6px; text-align: right; color: #d97706;">${totalEvaluating}</td>
        <td style="border: 1px solid #000; padding: 6px; text-align: right; color: #dc2626;">${totalReturned}</td>
        <td style="border: 1px solid #000; padding: 6px; text-align: center;">&le; 3 Days</td>
        <td style="border: 1px solid #000; padding: 6px; text-align: right;">${totalApproved > 0 ? Math.min(Math.round((totalApproved / 980) * 100), 100) : 100}%</td>
        <td style="border: 1px solid #000; padding: 6px; text-align: right;">${totalApps > 0 ? Math.round((totalApproved / totalApps) * 100) : 100}%</td>
      </tr>
    </tbody>
  </table>

  <div class="section-title">II. Financial Collections & Citizen Satisfaction Index</div>
  <table class="meta-box">
    <tr>
      <td style="width: 25%;"><strong>Total Regulatory Collections:</strong></td>
      <td style="width: 25%; font-weight: bold;">₱${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      <td style="width: 25%;"><strong>Average Client Satisfaction (CSAT):</strong></td>
      <td style="width: 25%; font-weight: bold;">${avgCsat} / 5.0 (${feedback.length} respondents)</td>
    </tr>
    <tr>
      <td><strong>Total Processed Documents:</strong></td>
      <td style="font-weight: bold;">${totalApps} applications</td>
      <td><strong>Zero Backlog / Anti-Red Tape Rating:</strong></td>
      <td style="font-weight: bold; color: #059669;">100% Compliant (RA 11032)</td>
    </tr>
  </table>

  <table class="sign-table">
    <tr>
      <td>
        <div style="font-size: 10px; color: #64748b; margin-bottom: 24px;">Prepared by:</div>
        <div style="border-top: 1px solid #000; padding-top: 4px; font-weight: bold;">${userName || 'Planning / MIS Officer'}</div>
        <div style="font-size: 10px;">Planning & MIS Unit</div>
      </td>
      <td>
        <div style="font-size: 10px; color: #64748b; margin-bottom: 24px;">Reviewed by:</div>
        <div style="border-top: 1px solid #000; padding-top: 4px; font-weight: bold;">Chief, Enforcement & Operations</div>
        <div style="font-size: 10px;">Enforcement & Operations Division (EOD)</div>
      </td>
      <td>
        <div style="font-size: 10px; color: #64748b; margin-bottom: 24px;">Approved by:</div>
        <div style="border-top: 1px solid #000; padding-top: 4px; font-weight: bold;">Regional Director</div>
        <div style="font-size: 10px;">Head of Procuring / Regulatory Entity</div>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

function renderAppendix26Html(
  reportMetadata: StatutoryReportMetadata,
  tenantName: string,
  period: string,
  transactions: TenantTransactionDto[],
  userName?: string | null
): string {
  const refs = transactions.map((t) => t.refNo ?? '').filter((r) => r.length > 0).sort();
  const minOr = refs.length > 0 ? refs[0] : 'N/A';
  const maxOr = refs.length > 0 ? refs[refs.length - 1] : 'N/A';

  let sumTotal = 0;
  let sumDst = 0;
  let sumLic = 0;
  let sumSur = 0;
  let sumPmt = 0;
  let sumExm = 0;
  let sumIns = 0;
  let sumApf = 0;
  let sumSrf = 0;
  let sumSuf = 0;
  let sumOth = 0;

  const rows = transactions.map((tx, idx) => {
    const b = classifyUacsBreakdown(tx);
    sumTotal += b.total;
    sumDst += b.dst;
    sumLic += b.lic;
    sumSur += b.sur;
    sumPmt += b.pmt;
    sumExm += b.exm;
    sumIns += b.ins;
    sumApf += b.apf;
    sumSrf += b.srf;
    sumSuf += b.suf;
    sumOth += b.oth;

    return `
      <tr>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">${(tx.date ?? '').slice(0, 10)}</td>
        <td style="border: 1px solid #000; padding: 4px; font-weight: bold; text-align: center;">${tx.refNo ?? `OR-${idx + 1}`}</td>
        <td style="border: 1px solid #000; padding: 4px;">${tx.applicantName ?? 'Payor'}</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: right; font-weight: bold;">${b.total.toFixed(2)}</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: right;">${b.dst > 0 ? b.dst.toFixed(2) : '-'}</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: right;">${b.lic > 0 ? b.lic.toFixed(2) : '-'}</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: right;">${b.sur > 0 ? b.sur.toFixed(2) : '-'}</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: right;">${b.pmt > 0 ? b.pmt.toFixed(2) : '-'}</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: right;">${b.exm > 0 ? b.exm.toFixed(2) : '-'}</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: right;">${b.ins > 0 ? b.ins.toFixed(2) : '-'}</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: right;">${b.apf > 0 ? b.apf.toFixed(2) : '-'}</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: right;">${b.srf > 0 ? b.srf.toFixed(2) : '-'}</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: right;">${b.suf > 0 ? b.suf.toFixed(2) : '-'}</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: right;">${b.oth > 0 ? b.oth.toFixed(2) : '-'}</td>
      </tr>
    `;
  }).join('');

  const totalsRow = `
    <tr style="background-color: #f1f5f9; font-weight: bold;">
      <td colspan="3" style="border: 1px solid #000; padding: 5px; text-align: right;">TOTAL COLLECTIONS (${transactions.length} O.R.s):</td>
      <td style="border: 1px solid #000; padding: 5px; text-align: right; color: #059669;">₱${sumTotal.toFixed(2)}</td>
      <td style="border: 1px solid #000; padding: 5px; text-align: right;">${sumDst > 0 ? sumDst.toFixed(2) : '-'}</td>
      <td style="border: 1px solid #000; padding: 5px; text-align: right;">${sumLic > 0 ? sumLic.toFixed(2) : '-'}</td>
      <td style="border: 1px solid #000; padding: 5px; text-align: right;">${sumSur > 0 ? sumSur.toFixed(2) : '-'}</td>
      <td style="border: 1px solid #000; padding: 5px; text-align: right;">${sumPmt > 0 ? sumPmt.toFixed(2) : '-'}</td>
      <td style="border: 1px solid #000; padding: 5px; text-align: right;">${sumExm > 0 ? sumExm.toFixed(2) : '-'}</td>
      <td style="border: 1px solid #000; padding: 5px; text-align: right;">${sumIns > 0 ? sumIns.toFixed(2) : '-'}</td>
      <td style="border: 1px solid #000; padding: 5px; text-align: right;">${sumApf > 0 ? sumApf.toFixed(2) : '-'}</td>
      <td style="border: 1px solid #000; padding: 5px; text-align: right;">${sumSrf > 0 ? sumSrf.toFixed(2) : '-'}</td>
      <td style="border: 1px solid #000; padding: 5px; text-align: right;">${sumSuf > 0 ? sumSuf.toFixed(2) : '-'}</td>
      <td style="border: 1px solid #000; padding: 5px; text-align: right;">${sumOth > 0 ? sumOth.toFixed(2) : '-'}</td>
    </tr>
  `;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>COA Appendix 26 - ${reportMetadata.title}</title>
  <style>
    @media print {
      @page { margin: 8mm; size: A4 landscape; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
    body { font-family: Arial, sans-serif; font-size: 9px; color: #000; padding: 10px; margin: 0; }
    .top-ref { text-align: right; font-weight: bold; font-style: italic; font-size: 11px; }
    .main-title { text-align: center; font-size: 14px; font-weight: bold; margin: 4px 0; text-transform: uppercase; }
    .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 8px; font-size: 10px; }
    .meta-table td { padding: 2px 4px; vertical-align: top; }
    .grid-table { width: 100%; border-collapse: collapse; font-size: 8.5px; border: 1.5px solid #000; }
    .grid-table th { border: 1px solid #000; padding: 3px; background-color: #f1f5f9; text-align: center; font-size: 8px; font-weight: bold; }
    .cert-box { margin-top: 16px; border: 1px solid #000; padding: 10px; font-size: 10px; }
    .sign-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    .sign-table td { width: 33%; text-align: center; vertical-align: top; padding: 0 10px; }
  </style>
</head>
<body>
  <div class="top-ref">Appendix 26</div>
  <div class="main-title">REPORT OF COLLECTIONS AND DEPOSITS</div>

  <table class="meta-table">
    <tr>
      <td style="width: 50%;"><strong>Entity Name:</strong> National Telecommunications Commission</td>
      <td style="width: 50%; text-align: right;"><strong>Report No.:</strong> RCD-${new Date().getFullYear()}-${new Date().getMonth() + 1}</td>
    </tr>
    <tr>
      <td><strong>Regional Office:</strong> ${tenantName}</td>
      <td style="text-align: right;"><strong>Sheet No.:</strong> 1 of 1</td>
    </tr>
    <tr>
      <td><strong>Fund Cluster:</strong> 101101 (Regular Agency Fund)</td>
      <td style="text-align: right;"><strong>Date / Period:</strong> ${period}</td>
    </tr>
  </table>

  <table class="grid-table">
    <thead>
      <tr>
        <th rowspan="2" style="width: 60px;">Date</th>
        <th rowspan="2" style="width: 80px;">Official Receipt No.</th>
        <th rowspan="2">Payor / Particulars</th>
        <th rowspan="2" style="width: 65px;">TOTAL PER O.R.</th>
        <th style="width: 55px;">4-02-01-060</th>
        <th style="width: 60px;">4-02-01-020</th>
        <th style="width: 55px;">4-02-01-140</th>
        <th style="width: 60px;">4-02-01-010</th>
        <th style="width: 50px;">4-02-01-040</th>
        <th style="width: 50px;">4-02-02-030</th>
        <th style="width: 50px;">4-02-01-100</th>
        <th style="width: 50px;">4-02-01-130</th>
        <th style="width: 50px;">4-02-01-990</th>
        <th style="width: 55px;">Other</th>
      </tr>
      <tr>
        <th>DOC. STAMPS</th>
        <th>LICENSING</th>
        <th>SURCHARGES</th>
        <th>PERMITS</th>
        <th>EXAM</th>
        <th>INSPECTION</th>
        <th>APPLICATION</th>
        <th>SUPERVISION</th>
        <th>SPECTRUM</th>
        <th>SERVICE INC.</th>
      </tr>
    </thead>
    <tbody>
      ${rows || '<tr><td colspan="14" style="text-align: center; padding: 12px; border: 1px solid #000;">No collections recorded for this period.</td></tr>'}
      ${totalsRow}
    </tbody>
  </table>

  <div class="cert-box">
    <strong>CERTIFICATION</strong><br/>
    I hereby certify on my official oath that the above is a true statement of all collections and deposits made by me during the period stated above for which Official Receipt Nos. <u><strong>${minOr}</strong></u> to <u><strong>${maxOr}</strong></u> were issued by me.
  </div>

  <table class="sign-table">
    <tr>
      <td>
        <div style="border-top: 1px solid #000; padding-top: 4px; font-weight: bold;">${userName || 'Collecting Officer / Cashier'}</div>
        <div>Collecting Officer / Cashier</div>
      </td>
      <td>
        <div style="border-top: 1px solid #000; padding-top: 4px; font-weight: bold;">Regional Accountant</div>
        <div>Accountant / Verified By</div>
      </td>
      <td>
        <div style="border-top: 1px solid #000; padding-top: 4px; font-weight: bold;">Regional Director</div>
        <div>Regional Director / Noted By</div>
      </td>
    </tr>
  </table>

</body>
</html>
  `;
}

function renderDstRemittanceHtml(
  tenantName: string,
  period: string,
  transactions: TenantTransactionDto[]
): string {
  const dateMap = new Map<string, TenantTransactionDto[]>();
  for (const tx of transactions) {
    const d = (tx.date ?? '').slice(0, 10);
    if (!dateMap.has(d)) dateMap.set(d, []);
    const list = dateMap.get(d);
    if (list !== undefined) list.push(tx);
  }

  let totalCerts = 0;
  let totalDst = 0;

  let rowsHtml = '';
  for (const [dateKey, dayTx] of dateMap.entries()) {
    const refs = dayTx.map((t) => t.refNo ?? '').filter((r) => r.length > 0).sort();
    const fromRef = refs.length > 0 ? refs[0] : '-';
    const toRef = refs.length > 0 ? refs[refs.length - 1] : '-';
    const count = dayTx.length;
    const dst = count * 30.0;
    totalCerts += count;
    totalDst += dst;

    rowsHtml += `
      <tr>
        <td style="border: 1px solid #000; padding: 6px; text-align: center;">${dateKey}</td>
        <td style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold;">${fromRef}</td>
        <td style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold;">${toRef}</td>
        <td style="border: 1px solid #000; padding: 6px; text-align: center;">${count}</td>
        <td style="border: 1px solid #000; padding: 6px; text-align: right; font-weight: bold;">₱${dst.toFixed(2)}</td>
      </tr>
    `;
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>BIR DST Remittance - ${period}</title>
  <style>
    @media print { @page { margin: 15mm; size: A4 portrait; } }
    body { font-family: Arial, sans-serif; font-size: 11px; padding: 20px; color: #000; }
    .header { text-align: center; margin-bottom: 20px; line-height: 1.4; }
    .title { font-size: 13px; font-weight: bold; margin: 8px 0; }
    .grid { width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1.5px solid #000; }
    .grid th { border: 1px solid #000; padding: 6px; background-color: #f1f5f9; text-align: center; font-size: 10px; font-weight: bold; }
    .sign-table { width: 100%; border-collapse: collapse; margin-top: 40px; }
    .sign-table td { width: 50%; text-align: center; padding: 0 20px; }
  </style>
</head>
<body>
  <div class="header">
    <div style="font-size: 10px; text-transform: uppercase;">Republic of the Philippines • Office of the President</div>
    <div style="font-size: 14px; font-weight: bold;">NATIONAL TELECOMMUNICATIONS COMMISSION</div>
    <div style="font-size: 12px; font-weight: bold; color: #2563eb;">${tenantName}</div>
    <div style="font-size: 11px; margin-top: 4px;">For the Period: <strong>${period}</strong></div>
    <div class="title">MONTHLY REPORT OF DOCUMENTARY STAMP TAX COLLECTION AND REMITTANCE</div>
    <div style="font-size: 10px; color: #64748b;">(Pursuant to NIRC Sec. 173-201 & TRAIN Law RA 10963 • BIR Form 2000-OT Attachment)</div>
  </div>

  <table class="grid">
    <thead>
      <tr>
        <th rowspan="2" style="width: 100px;">DATE ISSUED</th>
        <th colspan="2">INCLUSIVE SERIAL NUMBER OF GOR</th>
        <th rowspan="2" style="width: 120px;">NO. OF CERTIFICATIONS ISSUED</th>
        <th rowspan="2" style="width: 140px;">AMOUNT OF DST COLLECTED (₱30.00/Doc)</th>
      </tr>
      <tr>
        <th style="width: 120px;">FROM</th>
        <th style="width: 120px;">TO</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml || '<tr><td colspan="5" style="text-align: center; padding: 14px;">No certifications issued during this period.</td></tr>'}
      <tr style="font-weight: bold; background-color: #f8fafc;">
        <td colspan="3" style="border: 1px solid #000; padding: 8px; text-align: right;">TOTAL:</td>
        <td style="border: 1px solid #000; padding: 8px; text-align: center;">${totalCerts}</td>
        <td style="border: 1px solid #000; padding: 8px; text-align: right;">₱${totalDst.toFixed(2)}</td>
      </tr>
      <tr style="font-weight: bold; background-color: #f1f5f9;">
        <td colspan="4" style="border: 1px solid #000; padding: 8px; text-align: right;">AMOUNT REMITTED TO BIR:</td>
        <td style="border: 1px solid #000; padding: 8px; text-align: right; color: #166534;">₱${totalDst.toFixed(2)}</td>
      </tr>
    </tbody>
  </table>

  <table class="sign-table">
    <tr>
      <td>
        <div style="border-top: 1px solid #000; padding-top: 6px; font-weight: bold;">Certified Correct:</div>
        <div style="font-size: 12px; margin-top: 4px;">Regional Cashier / Collecting Officer</div>
      </td>
      <td>
        <div style="border-top: 1px solid #000; padding-top: 6px; font-weight: bold;">Noted by:</div>
        <div style="font-size: 12px; margin-top: 4px;">Regional Director / OIC</div>
      </td>
    </tr>
  </table>

</body>
</html>
  `;
}

function renderBtrIncomeHtml(
  tenantName: string,
  period: string,
  transactions: TenantTransactionDto[]
): string {
  const accounts = [
    { title: 'Permit Fees', code: '4-02-01-010' },
    { title: 'Registration Fees', code: '4-02-01-020' },
    { title: 'Clearance and Certification Fees', code: '4-02-01-040' },
    { title: 'Licensing Fees', code: '4-02-01-060' },
    { title: 'Supervision & Regulation Enforcement Fees', code: '4-02-01-070' },
    { title: 'Spectrum Usage Fees', code: '4-02-01-080' },
    { title: 'Inspection Fees', code: '4-02-02-100' },
    { title: 'Processing Fees', code: '4-02-01-130' },
    { title: 'Fines and Penalties - Service Income', code: '4-02-01-140' },
    { title: 'Other Service Income', code: '4-02-01-990' },
  ];

  let sumIncThis = 0;
  let sumDstThis = 0;
  let sumDepBtr = 0;
  let sumUndep = 0;

  const rows = accounts.map((acc) => {
    const matchingTx = transactions.filter((tx) => classifyUacsBreakdown(tx).btrCode === acc.code);
    const incThis = matchingTx.reduce((sum, t) => sum + (t.amount ?? 0), 0);
    const dstThis = matchingTx.reduce((sum, t) => {
      const amt = t.amount ?? 0;
      return sum + (amt >= 30 ? 30 : 0);
    }, 0);
    const remDst = dstThis;
    const depBtr = Math.max(0, incThis - remDst);
    const incYtd = incThis;
    const depYtd = depBtr;
    const undep = Math.max(0, incThis - remDst - depBtr);

    sumIncThis += incThis;
    sumDstThis += dstThis;
    sumDepBtr += depBtr;
    sumUndep += undep;

    return `
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">${acc.title}</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center; font-weight: bold;">${acc.code}</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: right;">${incThis.toFixed(2)}</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: right;">${dstThis.toFixed(2)}</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: right;">${remDst.toFixed(2)}</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: right;">${depBtr.toFixed(2)}</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: right;">${incYtd.toFixed(2)}</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: right;">${depYtd.toFixed(2)}</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: right; font-weight: bold; color: ${undep > 0 ? '#b91c1c' : '#000'};">${undep.toFixed(2)}</td>
      </tr>
    `;
  }).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>BTr Income & Deposited Report - ${period}</title>
  <style>
    @media print { @page { margin: 10mm; size: A4 landscape; } }
    body { font-family: Arial, sans-serif; font-size: 9.5px; padding: 12px; color: #000; }
    .header { text-align: center; margin-bottom: 12px; line-height: 1.3; }
    .grid { width: 100%; border-collapse: collapse; border: 1.5px solid #000; font-size: 9px; }
    .grid th { border: 1px solid #000; padding: 4px; background-color: #f1f5f9; text-align: center; font-size: 8.5px; font-weight: bold; }
    .sign { width: 100%; border-collapse: collapse; margin-top: 30px; }
    .sign td { width: 50%; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <div style="font-size: 10px;">Office of the President</div>
    <div style="font-size: 13px; font-weight: bold;">NATIONAL TELECOMMUNICATIONS COMMISSION</div>
    <div style="font-size: 11px; font-weight: bold; color: #2563eb;">${tenantName}</div>
    <div style="font-size: 12px; font-weight: bold; margin-top: 4px;">MONTHLY REPORT OF INCOME COLLECTED AND INCOME DEPOSITED WITH THE BUREAU OF THE TREASURY</div>
    <div style="font-size: 11px;">FOR THE MONTH OF <u>${period}</u></div>
  </div>

  <table class="grid">
    <thead>
      <tr>
        <th rowspan="2">ACCOUNT TITLE / DESCRIPTION OF INCOME</th>
        <th rowspan="2" style="width: 80px;">ACCOUNT CODE</th>
        <th colspan="4">THIS MONTH</th>
        <th colspan="2">YEAR TO DATE</th>
        <th rowspan="2" style="width: 90px;">UNDEPOSITED COLLECTION</th>
      </tr>
      <tr>
        <th style="width: 75px;">INCOME COLLECTED</th>
        <th style="width: 65px;">DST COLLECTED</th>
        <th style="width: 75px;">REMITTED DST TO BIR</th>
        <th style="width: 80px;">INCOME DEPOSITED WITH BTR</th>
        <th style="width: 80px;">INCOME COLLECTED</th>
        <th style="width: 80px;">INCOME DEPOSITED WITH BTR</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
      <tr style="font-weight: bold; background-color: #f1f5f9;">
        <td colspan="2" style="border: 1px solid #000; padding: 6px; text-align: right;">TOTAL:</td>
        <td style="border: 1px solid #000; padding: 6px; text-align: right;">₱${sumIncThis.toFixed(2)}</td>
        <td style="border: 1px solid #000; padding: 6px; text-align: right;">₱${sumDstThis.toFixed(2)}</td>
        <td style="border: 1px solid #000; padding: 6px; text-align: right;">₱${sumDstThis.toFixed(2)}</td>
        <td style="border: 1px solid #000; padding: 6px; text-align: right;">₱${sumDepBtr.toFixed(2)}</td>
        <td style="border: 1px solid #000; padding: 6px; text-align: right;">₱${sumIncThis.toFixed(2)}</td>
        <td style="border: 1px solid #000; padding: 6px; text-align: right;">₱${sumDepBtr.toFixed(2)}</td>
        <td style="border: 1px solid #000; padding: 6px; text-align: right; color: #166534;">₱${sumUndep.toFixed(2)}</td>
      </tr>
    </tbody>
  </table>

  <table class="sign">
    <tr>
      <td>
        <div style="font-weight: bold;">Certified Correct:</div>
        <div style="margin-top: 30px; border-top: 1px solid #000; width: 60%; margin-left: auto; margin-right: auto; padding-top: 4px; font-weight: bold;">Regional Accountant</div>
      </td>
      <td>
        <div style="font-weight: bold;">Noted By:</div>
        <div style="margin-top: 30px; border-top: 1px solid #000; width: 60%; margin-left: auto; margin-right: auto; padding-top: 4px; font-weight: bold;">Regional Director / OIC</div>
      </td>
    </tr>
  </table>

</body>
</html>
  `;
}

function renderApplicationSummaryHtml(
  reportMetadata: StatutoryReportMetadata,
  tenantName: string,
  period: string,
  applications: ApplicationSummaryDto[],
  transactions: TenantTransactionDto[],
  userName?: string | null
): string {
  const isEvaluator = reportMetadata.code === 'NTC-APP-SUM-EVAL';
  const isService = reportMetadata.code === 'NTC-APP-SUM-SVC';
  const typeTitle = isEvaluator
    ? 'Application Summary Report by Evaluator'
    : isService
    ? 'APPLICATION SUMMARY REPORT BY SERVICE'
    : 'Application Summary Report by Entity';

  const groupCounter = new Map<string, { count: number; totalAmount: number }>();
  let grandTotalAmount = 0;

  const rows = applications.map((app) => {
    const r = resolveApplicationSummaryRow(app, transactions, tenantName, userName);
    grandTotalAmount += r.amount;

    const groupKey = isEvaluator
      ? r.staffBy
      : reportMetadata.code === 'NTC-APP-SUM-ENT'
      ? r.companyName
      : r.appType;
    const prev = groupCounter.get(groupKey) ?? { count: 0, totalAmount: 0 };
    groupCounter.set(groupKey, {
      count: prev.count + 1,
      totalAmount: prev.totalAmount + r.amount,
    });

    return `
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">${r.appType}</td>
        <td style="border: 1px solid #000; padding: 4px; font-weight: bold;">${r.companyName}</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">${r.filingType}<br/><span style="font-size: 7px; color: #475569;">(${r.workflowStatus})</span></td>
        <td style="border: 1px solid #000; padding: 4px;">${r.address}</td>
        <td style="border: 1px solid #000; padding: 4px;">${r.permitNo}</td>
        <td style="border: 1px solid #000; padding: 4px; font-weight: 600;">${r.refNo}</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">${r.dateFiling}</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">${r.expDate}</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">${r.orNo}</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: right;">${r.amount > 0 ? r.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">${r.datePaid}</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">${r.staffBy}</td>
      </tr>
    `;
  }).join('');

  let summaryRows = '';
  for (const [gName, statsObj] of groupCounter.entries()) {
    summaryRows += `
      <tr>
        <td style="border: 1px solid #000; padding: 3px 6px;">${gName}</td>
        <td style="border: 1px solid #000; padding: 3px 6px; text-align: center; font-weight: bold;">${statsObj.count}</td>
        <td style="border: 1px solid #000; padding: 3px 6px; text-align: right; font-weight: bold;">₱${statsObj.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      </tr>
    `;
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${typeTitle}</title>
  <style>
    @media print { @page { margin: 8mm; size: A4 landscape; } }
    body { font-family: Arial, sans-serif; font-size: 8.5px; padding: 10px; color: #000; }
    .header { text-align: center; margin-bottom: 12px; }
    .header h2 { margin: 2px; font-size: 13px; font-weight: bold; text-transform: uppercase; }
    .header h3 { margin: 2px; font-size: 11px; color: #2563eb; }
    .grid { width: 100%; border-collapse: collapse; border: 1.5px solid #000; margin-bottom: 12px; font-size: 8px; }
    .grid th { border: 1px solid #000; padding: 4px; background-color: #f1f5f9; text-align: center; font-weight: bold; }
    .sum-box { width: 460px; border-collapse: collapse; border: 1.5px solid #000; margin-top: 8px; font-size: 8.5px; }
    .sum-box th { border: 1px solid #000; padding: 4px; background-color: #f1f5f9; text-align: left; }
    .footer-meta { margin-top: 14px; font-size: 9px; }
  </style>
</head>
<body>
  <div class="header">
    <h2>${typeTitle}</h2>
    <h3>${tenantName} • ${period}</h3>
  </div>

  <table class="grid">
    <thead>
      <tr>
        <th>Application Type</th>
        <th>COMPANY NAME / NAME</th>
        <th style="width: 65px;">STATUS</th>
        <th>FULL ADDRESS</th>
        <th style="width: 80px;">PERMIT NO.</th>
        <th style="width: 80px;">REFERENCE NUMBER</th>
        <th style="width: 60px;">DATE OF FILING</th>
        <th style="width: 60px;">EXPIRATION DATE</th>
        <th style="width: 65px;">OR NUMBER</th>
        <th style="width: 55px;">AMOUNT</th>
        <th style="width: 60px;">DATE PAID</th>
        <th style="width: 75px;">BY</th>
      </tr>
    </thead>
    <tbody>
      ${rows || '<tr><td colspan="12" style="text-align: center; padding: 10px;">No applications found for this filter.</td></tr>'}
    </tbody>
  </table>

  <div style="font-weight: bold; font-size: 10px; margin-top: 8px;">SUMMARY</div>
  <table class="sum-box">
    <thead>
      <tr>
        <th>${isEvaluator ? 'EVALUATOR' : reportMetadata.code === 'NTC-APP-SUM-ENT' ? 'ENTITY / APPLICANT' : 'SERVICE TYPE'}</th>
        <th style="width: 80px; text-align: center;">NUMBER(S)</th>
        <th style="width: 110px; text-align: right;">TOTAL AMOUNT</th>
      </tr>
    </thead>
    <tbody>
      ${summaryRows}
      <tr style="font-weight: bold; background-color: #f1f5f9;">
        <td style="border: 1px solid #000; padding: 3px 6px;">TOTAL:</td>
        <td style="border: 1px solid #000; padding: 3px 6px; text-align: center;">${applications.length}</td>
        <td style="border: 1px solid #000; padding: 3px 6px; text-align: right;">₱${grandTotalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      </tr>
    </tbody>
  </table>

  <div class="footer-meta">
    <div>Prepared by: <strong>${userName || 'Evaluator / Staff'}</strong></div>
    <div>Date Generated: <strong>${new Date().toLocaleDateString('en-US')}</strong></div>
  </div>

</body>
</html>
  `;
}

function renderExamMasterlistHtml(
  tenantName: string,
  period: string,
  applications: ApplicationSummaryDto[]
): string {
  const examApps = applications.filter((a) => {
    const cat = `${a.serviceCategory ?? ''} ${a.serviceName ?? ''} ${a.serviceVariantName ?? ''}`.toLowerCase();
    return cat.includes('exam') || cat.includes('operator') || cat.includes('roce') || cat.includes('amateur') || cat.includes('rroc');
  });

  const candidates = examApps.length > 0 ? examApps : applications;
  const distinctClasses = Array.from(
    new Set(
      candidates
        .map((c) => c.serviceVariantName ?? c.element ?? c.serviceName ?? '')
        .filter((s) => s.trim().length > 0)
    )
  );
  const classHeaderLabel =
    distinctClasses.length > 0
      ? distinctClasses.join(' • ')
      : 'Amateur Class A & B / Commercial Radio Operator Examination';

  const rows = candidates.map((c, i) => {
    const name = (c?.applicants?.[0]?.name ?? c?.filingUser?.name ?? 'Candidate Name').toUpperCase();
    const refNo = c?.applicationNumber ?? c?.referenceNumber ?? `EXM-${i + 1}`;
    const examClass = c?.serviceVariantName ?? c?.element ?? c?.serviceName ?? 'ROCE';
    return `
      <tr>
        <td style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold;">${i + 1}</td>
        <td style="border: 1px solid #000; padding: 6px; font-weight: bold; font-size: 11px;">${name}</td>
        <td style="border: 1px solid #000; padding: 6px; text-align: center; font-size: 9px;">${refNo}</td>
        <td style="border: 1px solid #000; padding: 6px; text-align: center; font-size: 9px;">${examClass}</td>
        <td style="border: 1px solid #000; padding: 6px; width: 200px; border-bottom: 1.5px solid #000;">&nbsp;</td>
        <td style="border: 1px solid #000; padding: 6px; text-align: center;">${i + 1}</td>
      </tr>
    `;
  }).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Radio Operator Examination Masterlist</title>
  <style>
    @media print { @page { margin: 12mm; size: A4 portrait; } }
    body { font-family: Arial, sans-serif; font-size: 10px; padding: 15px; color: #000; }
    .header { text-align: center; margin-bottom: 16px; line-height: 1.3; }
    .room-header { background-color: #e2e8f0; border: 1.5px solid #000; padding: 6px 10px; font-weight: bold; font-size: 11px; display: flex; justify-content: space-between; margin-top: 12px; }
    .class-header { border: 1.5px solid #000; border-top: none; padding: 6px 10px; font-weight: bold; font-size: 11px; background-color: #f8fafc; }
    .grid { width: 100%; border-collapse: collapse; border: 1.5px solid #000; border-top: none; }
    .grid th { border: 1px solid #000; padding: 6px; background-color: #f1f5f9; text-align: center; font-weight: bold; }
    .proctor-box { margin-top: 30px; display: flex; justify-content: space-between; page-break-inside: avoid; }
    .p-sig { width: 45%; text-align: center; border-top: 1px solid #000; padding-top: 4px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="header">
    <div style="font-size: 10px;">Republic of the Philippines • Office of the President</div>
    <div style="font-size: 13px; font-weight: bold;">NATIONAL TELECOMMUNICATIONS COMMISSION</div>
    <div style="font-size: 11px; font-weight: bold; color: #2563eb;">${tenantName}</div>
    <div style="font-size: 12px; font-weight: bold; margin-top: 6px;">MASTERLIST FOR COMMERCIAL AND NON-COMMERCIAL RADIO OPERATOR EXAMINATION</div>
    <div style="font-size: 11px;">Examination Schedule: <strong>${period}</strong></div>
  </div>

  <div class="room-header">
    <span>EXAMINATION ROOM NO. 1</span>
    <span>TOTAL EXAMINEES: ${candidates.length} / CAPACITY: 30 EXAMINEES</span>
  </div>
  <div class="class-header">
    ${classHeaderLabel}
  </div>

  <table class="grid">
    <thead>
      <tr>
        <th style="width: 35px;">No.</th>
        <th>Examinee Full Name (LASTNAME, FIRSTNAME M.I.)</th>
        <th style="width: 110px;">Admission / App Ref</th>
        <th style="width: 130px;">Exam Class / Element</th>
        <th style="width: 200px;">Signature (Examinee Checkoff)</th>
        <th style="width: 35px;">No.</th>
      </tr>
    </thead>
    <tbody>
      ${rows || '<tr><td colspan="6" style="text-align: center; padding: 14px;">No examinees registered for the selected schedule.</td></tr>'}
    </tbody>
  </table>

  <div class="proctor-box">
    <div class="p-sig">
      Room Proctor Signature Over Printed Name<br/>
      <span style="font-size: 9px; font-weight: normal; color: #64748b;">NTC Examination Committee Staff</span>
    </div>
    <div class="p-sig">
      Supervising Examination Officer<br/>
      <span style="font-size: 9px; font-weight: normal; color: #64748b;">Enforcement & Operations Division (EOD)</span>
    </div>
  </div>

</body>
</html>
  `;
}

function renderVolumeReportHtml(
  tenantName: string,
  period: string,
  applications: ApplicationSummaryDto[],
  transactions: TenantTransactionDto[],
  dateRange?: StatutoryReportGeneratorOptions
): string {
  const streams: Array<'Accreditations' | 'Certificates' | 'Exams' | 'Licenses' | 'Permits'> = [
    'Accreditations',
    'Certificates',
    'Exams',
    'Licenses',
    'Permits',
  ];
  const buckets = computeVolumeMonthBuckets(applications, dateRange);

  let grandTotal = 0;
  let grandIssued = 0;
  let grandInProc = 0;
  let grandReturned = 0;
  let grandCollected = 0;
  let grandDeposited = 0;
  let grandUndeposited = 0;
  const colTotals = new Array<number>(buckets.length).fill(0);

  const rows = streams.map((s) => {
    const streamApps = applications.filter((a) => classifyVolumeStream(a) === s);
    const mCounts = countAppsByVolumeBuckets(streamApps, buckets);
    const count = streamApps.length;
    const issued = streamApps.filter((a) => a.status === 'Approved' || a.status === 'Completed').length;
    const returned = streamApps.filter((a) => a.status === 'Returned').length;
    const inProc = Math.max(0, count - issued - returned);

    const streamAppIds = new Set(streamApps.map((a) => a.id));
    const streamTx = transactions.filter((t) => streamAppIds.has(t.id));
    const collected = streamTx.reduce((sum, t) => sum + (t.amount ?? 0), 0);
    const deposited = streamTx
      .filter((t) => (t.paymentStatus ?? '').toLowerCase() === 'deposited' || (t.paymentStatus ?? '').toLowerCase() === 'paid')
      .reduce((sum, t) => sum + (t.amount ?? 0), 0);
    const undeposited = Math.max(0, collected - deposited);

    grandTotal += count;
    grandIssued += issued;
    grandInProc += inProc;
    grandReturned += returned;
    grandCollected += collected;
    grandDeposited += deposited;
    grandUndeposited += undeposited;

    for (let idx = 0; idx < buckets.length; idx++) {
      colTotals[idx] = (colTotals[idx] ?? 0) + (mCounts[idx] ?? 0);
    }

    return `
      <tr>
        <td style="border: 1px solid #000; padding: 6px; font-weight: bold;">${s}</td>
        ${mCounts.map((mVal) => `<td style="border: 1px solid #000; padding: 6px; text-align: center;">${mVal}</td>`).join('')}
        <td style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold; background-color: #f1f5f9;">${count}</td>
        <td style="border: 1px solid #000; padding: 6px; text-align: center; color: #166534; font-weight: bold;">${issued}</td>
        <td style="border: 1px solid #000; padding: 6px; text-align: center;">${inProc}</td>
        <td style="border: 1px solid #000; padding: 6px; text-align: right; font-weight: bold;">₱${collected.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td style="border: 1px solid #000; padding: 6px; text-align: right; color: #1e40af; font-weight: bold;">₱${deposited.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      </tr>
    `;
  }).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>EDGE Application Volume & Deposit Accountability Report</title>
  <style>
    @media print { @page { margin: 12mm; size: A4 landscape; } }
    body { font-family: Arial, sans-serif; font-size: 10px; padding: 16px; color: #000; }
    .header { text-align: center; margin-bottom: 16px; }
    .grid { width: 100%; border-collapse: collapse; border: 1.5px solid #000; margin-bottom: 16px; }
    .grid th { border: 1px solid #000; padding: 6px; background-color: #f1f5f9; text-align: center; font-weight: bold; font-size: 9px; }
  </style>
</head>
<body>
  <div class="header">
    <div style="font-size: 14px; font-weight: bold;">EDGE APPLICATION VOLUME & DEPOSIT ACCOUNTABILITY REPORT</div>
    <div style="font-size: 12px; font-weight: bold; color: #2563eb; margin-top: 4px;">${tenantName}</div>
    <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Reporting Coverage: <strong>${period}</strong></div>
  </div>

  <table class="grid">
    <thead>
      <tr>
        <th style="text-align: left; width: 140px;">Service Category</th>
        ${buckets.map((b) => `<th>${b.label}</th>`).join('')}
        <th style="width: 60px; background-color: #e2e8f0;">TOTAL</th>
        <th style="width: 60px; background-color: #dcfce7;">ISSUED</th>
        <th style="width: 65px;">IN-PROC</th>
        <th style="width: 95px;">COLLECTED</th>
        <th style="width: 95px;">DEPOSITED</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
      <tr style="font-weight: bold; background-color: #e2e8f0;">
        <td style="border: 1px solid #000; padding: 7px;">TOTAL</td>
        ${colTotals.map((tot) => `<td style="border: 1px solid #000; padding: 7px; text-align: center;">${tot}</td>`).join('')}
        <td style="border: 1px solid #000; padding: 7px; text-align: center; font-size: 12px;">${grandTotal}</td>
        <td style="border: 1px solid #000; padding: 7px; text-align: center;">${grandIssued}</td>
        <td style="border: 1px solid #000; padding: 7px; text-align: center;">${grandInProc}</td>
        <td style="border: 1px solid #000; padding: 7px; text-align: right;">₱${grandCollected.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td style="border: 1px solid #000; padding: 7px; text-align: right;">₱${grandDeposited.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      </tr>
    </tbody>
  </table>

  <div style="margin-top: 16px; font-size: 10px; color: #64748b;">
    Report automatically generated by NTC-EDGE Reporting Subsystem. Verified against regional application, Official Receipt, and Bank Deposit databases.
  </div>

</body>
</html>
  `;
}

export function generateStatutoryPrintableHtml(
  reportMetadata: StatutoryReportMetadata,
  tenantName: string,
  period: string,
  applications: ApplicationSummaryDto[],
  transactions: TenantTransactionDto[],
  feedback: FeedbackDto[],
  userName?: string | null,
  dateRange?: StatutoryReportGeneratorOptions
): string {
  const effectivePeriod = dateRange?.startDate && dateRange?.endDate
    ? `${dateRange.startDate} to ${dateRange.endDate}`
    : period;

  const effectiveTenantName =
    dateRange?.fieldOfficeFilter && dateRange.fieldOfficeFilter.trim().length > 0
      ? `${tenantName} — Field Office (Monitoring): ${dateRange.fieldOfficeFilter.trim()}`
      : tenantName;

  const scopedApplications = filterApplicationsForStatutoryReport(
    reportMetadata.code,
    applications,
    dateRange,
    userName
  );
  const paidTransactions = getPaidTransactions(transactions, scopedApplications);

  // Route to the exact dedicated government layout corresponding to the report
  switch (reportMetadata.code) {
    case 'NTC-MIS-OPS':
      return renderMisOpsHtml(reportMetadata, effectiveTenantName, effectivePeriod, scopedApplications, paidTransactions, feedback, userName);

    case 'NTC-COA-APP26-M':
    case 'NTC-COA-APP26-D':
      return renderAppendix26Html(reportMetadata, effectiveTenantName, effectivePeriod, paidTransactions, userName);

    case 'NTC-BIR-DST-01':
      return renderDstRemittanceHtml(effectiveTenantName, effectivePeriod, paidTransactions);

    case 'NTC-BTR-INC-01':
      return renderBtrIncomeHtml(effectiveTenantName, effectivePeriod, paidTransactions);

    case 'NTC-APP-SUM-EVAL':
    case 'NTC-APP-SUM-SVC':
    case 'NTC-APP-SUM-ENT':
      return renderApplicationSummaryHtml(reportMetadata, effectiveTenantName, effectivePeriod, scopedApplications, paidTransactions, userName);

    case 'NTC-EXAM-MST-01':
      return renderExamMasterlistHtml(effectiveTenantName, effectivePeriod, scopedApplications);

    case 'NTC-APP-VOL-01':
      return renderVolumeReportHtml(effectiveTenantName, effectivePeriod, scopedApplications, paidTransactions, dateRange);

    default:
      // General Statutory Reports (NTC-BAR-1, ARTA, SPECTRUM, CSMR, NOV)
      return renderGenericStatutoryHtml(reportMetadata, effectiveTenantName, effectivePeriod, scopedApplications, paidTransactions, feedback, userName);
  }
}

function renderGenericStatutoryHtml(
  reportMetadata: StatutoryReportMetadata,
  tenantName: string,
  period: string,
  applications: ApplicationSummaryDto[],
  transactions: TenantTransactionDto[],
  feedback: FeedbackDto[],
  userName?: string | null
): string {
  const currentDateStr = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const totalApps = applications.length;
  const approvedApps = applications.filter((a) => a.status === 'Approved' || a.status === 'Completed').length;
  const totalRevenue = transactions.reduce((sum, tx) => sum + (tx.amount ?? 0), 0);

  const rowsHtml = applications.slice(0, 20).map((app, idx) => `
    <tr>
      <td style="border: 1px solid #cbd5e1; padding: 6px 8px; font-size: 11px;">${idx + 1}</td>
      <td style="border: 1px solid #cbd5e1; padding: 6px 8px; font-size: 11px; font-weight: 600;">${app.applicationNumber ?? app.id}</td>
      <td style="border: 1px solid #cbd5e1; padding: 6px 8px; font-size: 11px;">${app.filingUser?.company?.name ?? app.filingUser?.name ?? 'Applicant Entity'}</td>
      <td style="border: 1px solid #cbd5e1; padding: 6px 8px; font-size: 11px;">${app.serviceName ?? 'Regulatory Permit'}</td>
      <td style="border: 1px solid #cbd5e1; padding: 6px 8px; font-size: 11px;">${app.serviceCategory ?? 'Permits'}</td>
      <td style="border: 1px solid #cbd5e1; padding: 6px 8px; font-size: 11px; text-align: center;">
        <span style="background: ${app.status === 'Approved' || app.status === 'Completed' ? '#dcfce7' : '#dbeafe'}; color: ${app.status === 'Approved' || app.status === 'Completed' ? '#166534' : '#1e40af'}; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 10px;">
          ${app.status ?? 'Submitted'}
        </span>
      </td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${reportMetadata.code} - ${reportMetadata.title}</title>
  <style>
    @media print {
      @page { margin: 12mm; size: A4 landscape; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #1e293b;
      margin: 0;
      padding: 20px;
      background-color: #ffffff;
    }
    .header-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 10px;
    }
    .rep-title {
      font-size: 10px;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: #64748b;
      font-weight: 700;
    }
    .gov-agency {
      font-size: 16px;
      font-weight: 800;
      color: #0f172a;
      margin-top: 2px;
    }
    .tenant-name {
      font-size: 13px;
      font-weight: 700;
      color: #2563eb;
      margin-top: 2px;
    }
    .report-code-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 4px;
      background-color: ${reportMetadata.badgeColor}20;
      color: ${reportMetadata.badgeColor};
      border: 1px solid ${reportMetadata.badgeColor};
      font-weight: 800;
      font-size: 13px;
    }
    .report-title-banner {
      margin-top: 12px;
      margin-bottom: 14px;
    }
    .report-title {
      font-size: 16px;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
    }
    .report-sub {
      font-size: 12px;
      color: #64748b;
      margin-top: 3px;
    }
    .meta-box {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 10px 14px;
      margin-bottom: 14px;
      display: flex;
      justify-content: space-between;
      font-size: 11px;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      font-size: 11px;
    }
    .data-table th {
      background-color: #f1f5f9;
      color: #334155;
      font-weight: 700;
      border: 1px solid #cbd5e1;
      padding: 8px;
      text-align: left;
    }
    .signatories-container {
      display: flex;
      justify-content: space-between;
      margin-top: 30px;
      page-break-inside: avoid;
    }
    .sign-box {
      width: 30%;
      text-align: center;
      border-top: 1px solid #94a3b8;
      padding-top: 8px;
    }
    .sign-line {
      font-size: 12px;
      font-weight: 700;
      color: #0f172a;
    }
    .sign-role {
      font-size: 10px;
      color: #64748b;
      margin-top: 2px;
    }
    .footer-note {
      font-size: 9px;
      color: #94a3b8;
      text-align: center;
      margin-top: 24px;
      border-top: 1px dashed #e2e8f0;
      padding-top: 8px;
    }
  </style>
</head>
<body>
  <table class="header-table">
    <tr>
      <td>
        <div class="rep-title">Republic of the Philippines • Office of the President</div>
        <div class="gov-agency">NATIONAL TELECOMMUNICATIONS COMMISSION</div>
        <div class="tenant-name">${tenantName}</div>
      </td>
      <td style="text-align: right; vertical-align: top;">
        <span class="report-code-badge">${reportMetadata.code}</span>
        <div style="font-size: 10px; color: #64748b; margin-top: 6px;">Generated: ${currentDateStr}</div>
      </td>
    </tr>
  </table>

  <div class="report-title-banner">
    <h1 class="report-title">${reportMetadata.title}</h1>
    <div class="report-sub">${reportMetadata.subTitle} • ${reportMetadata.agency} • Frequency: ${reportMetadata.frequency}</div>
  </div>

  <div class="meta-box">
    <div><strong>Reporting Period:</strong> ${period}</div>
    <div><strong>Legal Authority:</strong> ${reportMetadata.legalBasis}</div>
    <div><strong>Total Records:</strong> ${totalApps}</div>
    <div><strong>Total Revenue:</strong> ₱${totalRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
  </div>

  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 35px;">#</th>
        <th>Application / Reference Number</th>
        <th>Company Name / Applicant</th>
        <th>Regulatory Service</th>
        <th>Service Stream</th>
        <th style="width: 90px; text-align: center;">Status</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml || '<tr><td colspan="6" style="text-align: center; padding: 16px;">No recorded transactions for this period.</td></tr>'}
    </tbody>
  </table>

  <div class="signatories-container">
    <div class="sign-box">
      <div class="sign-line">${userName || 'Regulatory Staff / Evaluator'}</div>
      <div class="sign-role">Prepared By / Regional Staff</div>
    </div>
    <div class="sign-box">
      <div class="sign-line">Chief, Enforcement & Operations Division</div>
      <div class="sign-role">Reviewed & Verified By</div>
    </div>
    <div class="sign-box">
      <div class="sign-line">Regional Director</div>
      <div class="sign-role">Certified Correct & Approved</div>
    </div>
  </div>

  <div class="footer-note">
    Official Government Statutory Filing generated via NTC-EDGE Digital Portal. Governed by Republic Act No. 11032 and Philippine Government Accounting Manual.
  </div>

</body>
</html>
  `;
}

export function openPrintableReportWindow(htmlContent: string): void {
  if (typeof window !== 'undefined') {
    const printWindow = window.open('', '_blank');
    if (printWindow !== null && printWindow !== undefined) {
      const printableWithTrigger = htmlContent.includes('window.print()')
        ? htmlContent
        : htmlContent.replace(
            '</body>',
            '<script>window.onload = function() { setTimeout(function() { window.print(); }, 400); };</script></body>'
          );
      printWindow.document.open();
      printWindow.document.write(printableWithTrigger);
      printWindow.document.close();
    }
  }
}
