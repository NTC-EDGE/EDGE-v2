import {
  STATUTORY_REPORTS_LIST,
  generateStatutoryCsv,
  generateStatutoryPrintableHtml,
} from './statutoryReportGenerator';
import { ApplicationSummaryDto, TenantTransactionDto, FeedbackDto } from '@edge/api';

describe('statutoryReportGenerator', () => {
  const sampleApps: ApplicationSummaryDto[] = [
    {
      id: 'app-1',
      applicationNumber: 'APP-2026-001',
      referenceNumber: 'REF-001',
      status: 'Approved',
      submissionMode: 'Online',
      office: 'NCR Regional Office',
      remarks: 'All requirements complete',
      isGuest: false,
      isPinned: false,
      isArchived: false,
      createdAt: '2026-03-10T08:00:00Z',
      serviceName: 'Radio Station Permit',
      serviceCategory: 'Permits',
      filingUser: {
        id: 'u-1',
        name: 'Juan Dela Cruz',
        email: 'juan@test.ph',
        accountType: 'Individual',
      },
      services: [],
      applicants: [],
    },
    {
      id: 'app-2',
      applicationNumber: 'APP-2026-002',
      status: 'Returned',
      submissionMode: 'Online',
      createdAt: '2026-03-12T08:00:00Z',
      serviceName: 'Ship Station License',
      serviceCategory: 'Licenses',
      filingUser: {
        id: 'u-2',
        name: 'Maritime Fleet Inc',
        email: 'fleet@marine.ph',
        accountType: 'Corporate',
      },
      services: [],
      applicants: [],
    },
  ];

  const sampleTx: TenantTransactionDto[] = [
    {
      id: 'tx-1',
      refNo: 'OR-2026-0001',
      applicantName: 'Juan Dela Cruz',
      serviceType: 'Radio Station Permit Fee',
      amount: 4500,
      paymentStatus: 'Paid',
      date: '2026-03-10T09:00:00Z',
    },
  ];

  const sampleFeedback: FeedbackDto[] = [
    {
      id: 'fb-1',
      senderName: 'Juan Dela Cruz',
      senderEmail: 'juan@test.ph',
      subject: 'Prompt Permit Processing',
      message: 'Processing was done within 24 hours.',
      rating: 5,
      status: 'Reviewed',
      isAnonymous: false,
      createdAt: '2026-03-11T10:00:00Z',
    },
  ];

  it('should have 16 statutory reports metadata', () => {
    expect(STATUTORY_REPORTS_LIST).toHaveLength(10);
    const codes = STATUTORY_REPORTS_LIST.map((r) => r.code);
    expect(codes).toContain('NTC-MIS-OPS');
    expect(codes).toContain('NTC-COA-APP26-M');
    expect(codes).toContain('NTC-COA-APP26-D');
    expect(codes).toContain('NTC-BIR-DST-01');
    expect(codes).toContain('NTC-BTR-INC-01');
    expect(codes).toContain('NTC-APP-SUM-EVAL');
    expect(codes).toContain('NTC-APP-SUM-SVC');
    expect(codes).toContain('NTC-APP-SUM-ENT');
    expect(codes).toContain('NTC-APP-VOL-01');
    expect(codes).toContain('NTC-EXAM-MST-01');
  });

  describe('generateStatutoryCsv', () => {
    it('should generate CSV with statutory headers for NTC-BAR-1', () => {
      const result = generateStatutoryCsv(
        'NTC-BAR-1',
        'NTC Region VII (Central Visayas)',
        'Q1 2026',
        sampleApps,
        sampleTx,
        sampleFeedback
      );

      expect(result.filename).toContain('NTC_BAR_No1');
      expect(result.content).toContain('MFO / Service Category');
      expect(result.content).toContain('APP-2026-001');
      expect(result.content).toContain('Radio Station Permit');
    });

    it('should generate COA Appendix 26 Monthly CSV for NTC-COA-APP26-M', () => {
      const result = generateStatutoryCsv(
        'NTC-COA-APP26-M',
        'NTC Region VII (Central Visayas)',
        'September 2026',
        sampleApps,
        sampleTx,
        sampleFeedback,
        { startDate: '2026-09-01', endDate: '2026-09-30' }
      );

      expect(result.filename).toContain('Appendix26_Monthly');
      expect(result.content).toContain('Entity Name: National Telecommunications Commission');
      expect(result.content).toContain('Fund Cluster: 101101');
      expect(result.content).toContain('4-02-01-060 Doc Stamps');
      expect(result.content).toContain('OR-2026-0001');
      expect(result.content).toContain('4500');
    });

    it('should generate BIR DST Remittance CSV for NTC-BIR-DST-01', () => {
      const result = generateStatutoryCsv(
        'NTC-BIR-DST-01',
        'NTC Region VII (Central Visayas)',
        'September 2026',
        sampleApps,
        sampleTx,
        sampleFeedback,
        { startDate: '2026-09-01', endDate: '2026-09-30' }
      );

      expect(result.filename).toContain('BIR_DST_Remittance');
      expect(result.content).toContain('MONTHLY REPORT OF DOCUMENTARY STAMP TAX');
      expect(result.content).toContain('NO. OF CERTIFICATIONS ISSUED');
      expect(result.content).toContain('OR-2026-0001');
      expect(result.content).toContain('30.00');
    });

    it('should generate Examination Masterlist CSV for NTC-EXAM-MST-01', () => {
      const result = generateStatutoryCsv(
        'NTC-EXAM-MST-01',
        'NTC Region VII (Central Visayas)',
        'September 20, 2025',
        sampleApps,
        sampleTx,
        sampleFeedback
      );

      expect(result.filename).toContain('Exam_Masterlist');
      expect(result.content).toContain('MASTERLIST FOR COMMERCIAL AND NON-COMMERCIAL RADIO OPERATOR EXAMINATION');
      expect(result.content).toContain('JUAN DELA CRUZ');
      expect(result.content).toContain('Signature');
    });

    it('should generate CSV with transaction records for NTC-BTr-COA-01', () => {
      const result = generateStatutoryCsv(
        'NTC-BTr-COA-01',
        'NTC Region VII (Central Visayas)',
        'Q1 2026',
        sampleApps,
        sampleTx,
        sampleFeedback
      );

      expect(result.filename).toContain('NTC_BTr_COA');
      expect(result.content).toContain('OR-2026-0001');
      expect(result.content).toContain('4500');
    });

    it('should generate CSV with feedback records for NTC-CSMR-8888', () => {
      const result = generateStatutoryCsv(
        'NTC-CSMR-8888',
        'NTC Region VII (Central Visayas)',
        'Q1 2026',
        sampleApps,
        sampleTx,
        sampleFeedback
      );

      expect(result.filename).toContain('NTC_CSMR');
      expect(result.content).toContain('Prompt Permit Processing');
      expect(result.content).toContain('Juan Dela Cruz');
    });

    it('should sanitize PII and mark anonymous citizen when isAnonymous is true per RA 10173', () => {
      const anonFeedback: FeedbackDto[] = [
        {
          id: 'fb-anon',
          senderName: 'Private Citizen',
          senderEmail: 'private@secret.ph',
          subject: 'Confidential Report',
          message: 'Anonymous feedback test',
          rating: 4,
          isAnonymous: true,
          status: 'Resolved',
          createdAt: '2026-03-15T08:00:00Z',
        },
      ];

      const result = generateStatutoryCsv(
        'NTC-CSMR-8888',
        'NTC Region VII (Central Visayas)',
        'Q1 2026',
        sampleApps,
        sampleTx,
        anonFeedback
      );

      expect(result.content).toContain('Anonymous Citizen');
      expect(result.content).toContain('[Redacted / Anonymous]');
      expect(result.content).not.toContain('Private Citizen');
      expect(result.content).not.toContain('private@secret.ph');
    });
  });

  describe('generateStatutoryPrintableHtml', () => {
    it('should generate full HTML document with signatory blocks and official branding for NTC-MIS-OPS', () => {
      const report = STATUTORY_REPORTS_LIST.find((r) => r.code === 'NTC-MIS-OPS');
      if (report === undefined) throw new Error('Report NTC-MIS-OPS not found');
      const html = generateStatutoryPrintableHtml(
        report,
        'NTC National Capital Region',
        'Q1 2026',
        sampleApps,
        sampleTx,
        sampleFeedback
      );

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('Republic of the Philippines');
      expect(html).toContain('NATIONAL TELECOMMUNICATIONS COMMISSION');
      expect(html).toContain('NTC National Capital Region');
      expect(html).toContain('Prepared by:');
      expect(html).toContain('Regional Director');
    });

    it('should generate exact template HTML for NTC-MIS-OPS with Physical Targets and MFOs', () => {
      const report = STATUTORY_REPORTS_LIST.find((r) => r.code === 'NTC-MIS-OPS');
      if (report === undefined) throw new Error('Report NTC-MIS-OPS not found');
      const html = generateStatutoryPrintableHtml(
        report,
        'NTC Region VII (Central Visayas)',
        'October 2026',
        sampleApps,
        sampleTx,
        sampleFeedback
      );

      expect(html).toContain('MANAGEMENT INFORMATION SYSTEM (MIS) OPERATIONS ACCOMPLISHMENT REPORT');
      expect(html).toContain('Major Final Output (MFO) / Regulatory Category');
      expect(html).toContain('Radio Permits');
      expect(html).toContain('Citizen Charter SLA');
      expect(html).toContain('Planning / MIS Officer');
    });

    it('should generate exact template HTML for NTC-COA-APP26-M with UACS columns and Certification', () => {
      const report = STATUTORY_REPORTS_LIST.find((r) => r.code === 'NTC-COA-APP26-M');
      if (report === undefined) throw new Error('Report NTC-COA-APP26-M not found');
      const html = generateStatutoryPrintableHtml(
        report,
        'NTC Region VII (Central Visayas)',
        'October 2026',
        sampleApps,
        sampleTx,
        sampleFeedback
      );

      expect(html).toContain('REPORT OF COLLECTIONS AND DEPOSITS');
      expect(html).toContain('Appendix 26');
      expect(html).toContain('4-02-01-060');
      expect(html).toContain('DOC. STAMPS');
      expect(html).toContain('CERTIFICATION');
      expect(html).toContain('Collecting Officer / Cashier');
    });

    it('should generate exact template HTML for NTC-BIR-DST-01 with TRAIN Law statement', () => {
      const report = STATUTORY_REPORTS_LIST.find((r) => r.code === 'NTC-BIR-DST-01');
      if (report === undefined) throw new Error('Report NTC-BIR-DST-01 not found');
      const html = generateStatutoryPrintableHtml(
        report,
        'NTC Region VII (Central Visayas)',
        'October 2026',
        sampleApps,
        sampleTx,
        sampleFeedback
      );

      expect(html).toContain('MONTHLY REPORT OF DOCUMENTARY STAMP TAX COLLECTION AND REMITTANCE');
      expect(html).toContain('BIR Form 2000-OT');
      expect(html).toContain('TRAIN Law RA 10963');
      expect(html).toContain('Regional Cashier / Collecting Officer');
    });

    it('should generate exact template HTML for NTC-BTR-INC-01 with Undeposited Balance calculation', () => {
      const report = STATUTORY_REPORTS_LIST.find((r) => r.code === 'NTC-BTR-INC-01');
      if (report === undefined) throw new Error('Report NTC-BTR-INC-01 not found');
      const html = generateStatutoryPrintableHtml(
        report,
        'NTC Region VII (Central Visayas)',
        'October 2026',
        sampleApps,
        sampleTx,
        sampleFeedback
      );

      expect(html).toContain('MONTHLY REPORT OF INCOME COLLECTED AND INCOME DEPOSITED WITH THE BUREAU OF THE TREASURY');
      expect(html).toContain('UNDEPOSITED COLLECTION');
      expect(html).toContain('4-02-01-010');
      expect(html).toContain('Permit Fees');
    });

    it('should generate exact template HTML for NTC-EXAM-MST-01 with physical proctor signature blocks', () => {
      const report = STATUTORY_REPORTS_LIST.find((r) => r.code === 'NTC-EXAM-MST-01');
      if (report === undefined) throw new Error('Report NTC-EXAM-MST-01 not found');
      const html = generateStatutoryPrintableHtml(
        report,
        'NTC Region VII (Central Visayas)',
        'October 2026',
        sampleApps,
        sampleTx,
        sampleFeedback
      );

      expect(html).toContain('MASTERLIST FOR COMMERCIAL AND NON-COMMERCIAL RADIO OPERATOR EXAMINATION');
      expect(html).toContain('EXAMINATION ROOM NO. 1');
      expect(html).toContain('Room Proctor Signature Over Printed Name');
      expect(html).toContain('Supervising Examination Officer');
    });
  });
});
