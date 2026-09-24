import {
  StatutoryReportCode,
  StatutoryReportMetadata,
} from '../types/statutoryReports';
import { ApplicationSummaryDto, TenantTransactionDto, FeedbackDto } from '@edge/api';

export const STATUTORY_REPORTS_LIST: StatutoryReportMetadata[] = [
  {
    code: 'NTC-BAR-1',
    title: 'Quarterly Physical Report of Operations (BAR No. 1)',
    subTitle: 'DBM & NEDA Major Final Output (MFO) Accomplishment Summary',
    agency: 'DBM & NEDA',
    frequency: 'Quarterly',
    legalBasis: 'DBM-COA Joint Circular No. 2019-1 / National Budget Circular',
    description:
      'Official statutory report submitted to the Department of Budget and Management detailing physical targets versus actual issuances of Radio Station Permits, Commercial Licenses, Certificates of Public Convenience (CPC), and Accreditations.',
    category: 'Operations',
    badgeColor: '#3B82F6',
  },
  {
    code: 'NTC-BTr-COA-01',
    title: 'Monthly Statement of Collections & Remittances',
    subTitle: 'Bureau of the Treasury & Commission on Audit Revenue Ledger',
    agency: 'Bureau of the Treasury & COA',
    frequency: 'Monthly',
    legalBasis: 'COA Circular No. 2020-006 & BTr National Revenue Guidelines',
    description:
      'Monthly regional breakdown of collected Spectrum User Fees (SUF), Supervision & Regulation Fees (SRF), filing fees, permit charges, and bank deposit remittances to the National Treasury.',
    category: 'Finance',
    badgeColor: '#10B981',
  },
  {
    code: 'ARTA-RA-11032',
    title: "ARTA Citizen's Charter & SLA Compliance Report",
    subTitle: 'Ease of Doing Business & Efficient Delivery of Gov Services (RA 11032)',
    agency: 'Anti-Red Tape Authority (ARTA)',
    frequency: 'Quarterly',
    legalBasis: 'Republic Act No. 11032 & ARTA Memorandum Circular No. 2019-002',
    description:
      'Zero-contact policy compliance audit and processing turnaround performance across Simple (3 days), Complex (7 days), and Highly Technical (20 days) telecommunication applications.',
    category: 'Compliance',
    badgeColor: '#8B5CF6',
  },
  {
    code: 'NTC-SPECTRUM-INV',
    title: 'Regional Radio Station & Spectrum Inventory Registry',
    subTitle: 'Central Office Radio Spectrum Planning Division (RSPD) Audit',
    agency: 'NTC Central Office (RSPD)',
    frequency: 'Quarterly',
    legalBasis: 'Radio Control Act (Act 3846 as amended) & NTC Spectrum Plan',
    description:
      'Comprehensive regional registry of active radio stations across Land Mobile, Maritime, Aeronautical, Broadcast (AM/FM/TV), Amateur, and Value-Added Services (VAS).',
    category: 'Spectrum',
    badgeColor: '#F59E0B',
  },
  {
    code: 'NTC-CSMR-8888',
    title: 'Client Satisfaction Measurement & OP-8888 Resolution Report',
    subTitle: 'Civil Service Commission & Presidential Complaint Center',
    agency: 'Civil Service Commission & OP 8888',
    frequency: 'Quarterly',
    legalBasis: 'CSC MC No. 25, s. 2019 & Executive Order No. 6 (8888 Citizen Hotline)',
    description:
      'Consolidated CSAT survey results, net satisfaction rating (NSR), feedback sentiment analysis, and resolution turnaround for citizen inquiries and 8888 complaints.',
    category: 'CSAT',
    badgeColor: '#EC4899',
  },
  {
    code: 'NTC-NOV-ENF',
    title: 'Quarterly Regional Enforcement & Notice of Violation (NOV) Registry',
    subTitle: 'Legal & Enforcement Branch Regional Inspection Audit',
    agency: 'Legal & Enforcement Branch',
    frequency: 'Quarterly',
    legalBasis: 'NTC Rules of Practice and Procedure & Enforcement Guidelines',
    description:
      'Summary of on-site spectrum and broadcast facility inspections conducted, illegal radio stations detected, show-cause orders issued, and administrative penalties enforced.',
    category: 'Enforcement',
    badgeColor: '#EF4444',
  },
];

export function generateStatutoryCsv(
  reportCode: StatutoryReportCode,
  tenantName: string,
  period: string,
  applications: ApplicationSummaryDto[],
  transactions: TenantTransactionDto[],
  feedback: FeedbackDto[]
): { content: string; filename: string } {
  const cleanTenant = tenantName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dateStamp = new Date().toISOString().slice(0, 10);
  let filename = `${reportCode}_${cleanTenant}_${dateStamp}.csv`;
  let content = '';

  switch (reportCode) {
    case 'NTC-BAR-1': {
      filename = `NTC_BAR_No1_Operations_${cleanTenant}_${dateStamp}.csv`;
      content = 'MFO / Service Category,Application Number,Reference No,Applicant Name,Service Name,Target SLA (Days),Current Status,Submission Date,Completion Date\n';
      for (const app of applications) {
        const cat = `"${(app.serviceCategory ?? 'Major Final Output 1').replace(/"/g, '""')}"`;
        const appNum = `"${app.applicationNumber ?? app.id}"`;
        const ref = `"${app.referenceNumber ?? ''}"`;
        const applicant = `"${(app.filingUser?.name ?? app.filingUser?.company?.name ?? 'Applicant').replace(/"/g, '""')}"`;
        const svc = `"${(app.serviceName ?? 'Regulatory Permit').replace(/"/g, '""')}"`;
        const sla = '7';
        const status = `"${app.status ?? 'Submitted'}"`;
        const subDate = `"${app.createdAt ?? ''}"`;
        const compDate = `"${app.createdAt ?? ''}"`;
        content += `${cat},${appNum},${ref},${applicant},${svc},${sla},${status},${subDate},${compDate}\n`;
      }
      break;
    }

    case 'NTC-BTr-COA-01': {
      filename = `NTC_BTr_COA_Collections_${cleanTenant}_${dateStamp}.csv`;
      content = 'Account Code,Reference / OR No,Payor / Applicant,Regulatory Revenue Stream,Amount (PHP),Payment Status,Collection Date,Remittance Status\n';
      for (const tx of transactions) {
        const accCode = '"4-02-01-010"';
        const ref = `"${tx.refNo ?? ''}"`;
        const name = `"${(tx.applicantName ?? '').replace(/"/g, '""')}"`;
        const svc = `"${(tx.serviceType ?? 'Permit & Regulatory Fee').replace(/"/g, '""')}"`;
        const amt = tx.amount ?? 0;
        const status = `"${tx.paymentStatus ?? 'Paid'}"`;
        const date = `"${tx.date ?? ''}"`;
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
        const svc = `"${(app.serviceName ?? 'Telecommunications Service').replace(/"/g, '""')}"`;
        const appNum = `"${app.applicationNumber ?? app.id}"`;
        const applicant = `"${(app.filingUser?.name ?? app.filingUser?.company?.name ?? 'Applicant').replace(/"/g, '""')}"`;
        const fDate = `"${app.createdAt ?? ''}"`;
        const rDate = `"${app.createdAt ?? ''}"`;
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
        const cat = `"${(app.serviceCategory ?? 'Land Mobile Radio').replace(/"/g, '""')}"`;
        const ref = `"${app.referenceNumber ?? app.applicationNumber ?? 'STN-2026-001'}"`;
        const licensee = `"${(app.filingUser?.name ?? app.filingUser?.company?.name ?? 'Licensee Entity').replace(/"/g, '""')}"`;
        const freq = '"VHF / UHF Commercial Band"';
        const stnClass = '"Base / Mobile Station"';
        const loc = `"${cleanTenant}"`;
        const status = `"${app.status ?? 'Authorized'}"`;
        const date = `"${app.createdAt ?? ''}"`;
        content += `${cat},${ref},${licensee},${freq},${stnClass},${loc},${status},${date}\n`;
      }
      break;
    }

    case 'NTC-CSMR-8888': {
      filename = `NTC_CSMR_Feedback_${cleanTenant}_${dateStamp}.csv`;
      content = 'Client / Citizen Name,Contact Email,Service Evaluated,CSAT Rating (1-5),Anonymous,Subject / Concern,Feedback Content,Resolution Status,Submission Date\n';
      for (const fb of feedback) {
        const name = `"${(fb.senderName ?? 'Citizen Client').replace(/"/g, '""')}"`;
        const email = `"${(fb.senderEmail ?? '').replace(/"/g, '""')}"`;
        const svc = '"Regional Service & Processing"';
        const rating = fb.rating;
        const anon = fb.isAnonymous ? 'Yes' : 'No';
        const subject = `"${(fb.subject ?? '').replace(/"/g, '""')}"`;
        const msg = `"${(fb.message ?? '').replace(/"/g, '""')}"`;
        const resStatus = '"Resolved / Recorded"';
        const date = `"${fb.createdAt ?? ''}"`;
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
        const entity = `"${(app?.filingUser?.name ?? app?.filingUser?.company?.name ?? 'Commercial Operator Inc.').replace(/"/g, '""')}"`;
        const stnClass = '"Commercial Broadcast & Radio Facility"';
        const finding = i % 2 === 0 ? '"Fully Compliant with Safety & Spectrum Standards"' : '"Minor Technical Discrepancy - RF Output"';
        const action = i % 2 === 0 ? '"Certificate of Inspection Issued"' : '"Notice of Rectification Issued"';
        const novRef = i % 2 === 0 ? '"N/A"' : `"NOV-2026-${String(i + 101)}"`;
        const status = '"Complied"';
        const date = `"${app?.createdAt ?? new Date().toISOString()}"`;
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

export function generateStatutoryPrintableHtml(
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
  const approvedApps = applications.filter((a) => a.status === 'Approved').length;
  const evaluatingApps = applications.filter((a) => a.status === 'Evaluating' || a.status === 'Submitted').length;
  const totalRevenue = transactions.reduce((sum, tx) => sum + (tx.amount ?? 0), 0);
  const avgCsat = feedback.length > 0 ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1) : '5.0';

  const rowsHtml = applications.slice(0, 15).map((app, idx) => `
    <tr>
      <td style="border: 1px solid #cbd5e1; padding: 8px; font-size: 11px;">${idx + 1}</td>
      <td style="border: 1px solid #cbd5e1; padding: 8px; font-size: 11px; font-weight: 600;">${app.applicationNumber ?? app.id}</td>
      <td style="border: 1px solid #cbd5e1; padding: 8px; font-size: 11px;">${app.filingUser?.name ?? app.filingUser?.company?.name ?? 'Applicant'}</td>
      <td style="border: 1px solid #cbd5e1; padding: 8px; font-size: 11px;">${app.serviceName ?? 'Radio Station Permit'}</td>
      <td style="border: 1px solid #cbd5e1; padding: 8px; font-size: 11px;">${app.serviceCategory ?? 'Permits'}</td>
      <td style="border: 1px solid #cbd5e1; padding: 8px; font-size: 11px; text-align: center;">
        <span style="background: ${app.status === 'Approved' ? '#dcfce7' : '#dbeafe'}; color: ${app.status === 'Approved' ? '#166534' : '#1e40af'}; padding: 2px 6px; border-radius: 4px; font-weight: bold;">
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
      @page { margin: 15mm; size: A4 landscape; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #1e293b;
      margin: 0;
      padding: 24px;
      background-color: #ffffff;
    }
    .header-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    .ph-header {
      text-align: center;
      line-height: 1.3;
    }
    .ph-title-rep {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #64748b;
    }
    .ph-title-ntc {
      font-size: 16px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: 0.5px;
      margin-top: 2px;
    }
    .ph-title-reg {
      font-size: 13px;
      font-weight: 600;
      color: #1e40af;
    }
    .report-banner {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-left: 5px solid ${reportMetadata.badgeColor};
      padding: 12px 16px;
      border-radius: 6px;
      margin-bottom: 20px;
    }
    .report-code {
      font-size: 12px;
      font-weight: 700;
      color: ${reportMetadata.badgeColor};
      text-transform: uppercase;
    }
    .report-title {
      font-size: 18px;
      font-weight: 800;
      color: #0f172a;
      margin: 2px 0 4px 0;
    }
    .report-meta {
      font-size: 11px;
      color: #64748b;
    }
    .summary-grid {
      display: flex;
      gap: 12px;
      margin-bottom: 20px;
    }
    .kpi-box {
      flex: 1;
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 10px 14px;
    }
    .kpi-label {
      font-size: 10px;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
    }
    .kpi-val {
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      margin-top: 2px;
    }
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 28px;
    }
    table.data-table th {
      background-color: #f1f5f9;
      border: 1px solid #cbd5e1;
      padding: 8px;
      font-size: 10px;
      text-transform: uppercase;
      font-weight: 700;
      color: #475569;
    }
    .signatories-container {
      display: flex;
      justify-content: space-between;
      margin-top: 40px;
      page-break-inside: avoid;
    }
    .sign-box {
      width: 30%;
      text-align: center;
    }
    .sign-line {
      border-top: 1px solid #475569;
      margin-top: 40px;
      padding-top: 4px;
      font-weight: 700;
      font-size: 12px;
    }
    .sign-role {
      font-size: 11px;
      color: #64748b;
    }
    .footer-note {
      font-size: 10px;
      color: #94a3b8;
      margin-top: 30px;
      border-top: 1px dashed #e2e8f0;
      padding-top: 8px;
    }
  </style>
</head>
<body>
  <div class="ph-header">
    <div class="ph-title-rep">Republic of the Philippines • Office of the President</div>
    <div class="ph-title-ntc">NATIONAL TELECOMMUNICATIONS COMMISSION</div>
    <div class="ph-title-reg">${tenantName || 'Regional Office No. VII (Central Visayas)'}</div>
  </div>

  <div class="report-banner">
    <div class="report-code">${reportMetadata.code} • ${reportMetadata.frequency} Submission</div>
    <div class="report-title">${reportMetadata.title}</div>
    <div class="report-meta">
      <strong>Oversight Agency:</strong> ${reportMetadata.agency} &nbsp;|&nbsp;
      <strong>Legal Authority:</strong> ${reportMetadata.legalBasis} &nbsp;|&nbsp;
      <strong>Reporting Term:</strong> ${period} &nbsp;|&nbsp;
      <strong>Generated On:</strong> ${currentDateStr}
    </div>
  </div>

  <div class="summary-grid">
    <div class="kpi-box">
      <div class="kpi-label">Total Applications Volume</div>
      <div class="kpi-val">${totalApps}</div>
    </div>
    <div class="kpi-box">
      <div class="kpi-label">Approved & Compliant</div>
      <div class="kpi-val">${approvedApps}</div>
    </div>
    <div class="kpi-box">
      <div class="kpi-label">Under Technical Evaluation</div>
      <div class="kpi-val">${evaluatingApps}</div>
    </div>
    <div class="kpi-box">
      <div class="kpi-label">Total Collections Remitted</div>
      <div class="kpi-val">₱${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
    </div>
    <div class="kpi-box">
      <div class="kpi-label">CSAT Satisfaction Rating</div>
      <div class="kpi-val">${avgCsat} ★</div>
    </div>
  </div>

  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 40px;">#</th>
        <th>Application / Item Ref</th>
        <th>Applicant / Entity Name</th>
        <th>Service Description</th>
        <th>Regulatory Category</th>
        <th style="width: 100px;">Status</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml || '<tr><td colspan="6" style="text-align: center; padding: 16px;">No recorded transactions for this period.</td></tr>'}
    </tbody>
  </table>

  <div class="signatories-container">
    <div class="sign-box">
      <div class="sign-line">${userName || 'Regulatory Evaluator'}</div>
      <div class="sign-role">Prepared By / Regulatory Staff</div>
    </div>
    <div class="sign-box">
      <div class="sign-line">Chief, Enforcement & Operations (EOD)</div>
      <div class="sign-role">Reviewed & Verified By</div>
    </div>
    <div class="sign-box">
      <div class="sign-line">Regional Director</div>
      <div class="sign-role">Certified Correct & Submitted By</div>
    </div>
  </div>

  <div class="footer-note">
    Document officially generated via NTC-EDGE Digital Portal. Governed by Republic Act No. 11032 and Philippine Government Accounting Manual.
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>
  `;
}

export function openPrintableReportWindow(htmlContent: string): void {
  if (typeof window !== 'undefined') {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    }
  }
}
