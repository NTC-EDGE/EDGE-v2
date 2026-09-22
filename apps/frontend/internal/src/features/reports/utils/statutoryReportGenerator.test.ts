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

  it('should have 6 statutory reports metadata', () => {
    expect(STATUTORY_REPORTS_LIST).toHaveLength(6);
    const codes = STATUTORY_REPORTS_LIST.map((r) => r.code);
    expect(codes).toContain('NTC-BAR-1');
    expect(codes).toContain('NTC-BTr-COA-01');
    expect(codes).toContain('ARTA-RA-11032');
    expect(codes).toContain('NTC-SPECTRUM-INV');
    expect(codes).toContain('NTC-CSMR-8888');
    expect(codes).toContain('NTC-NOV-ENF');
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
  });

  describe('generateStatutoryPrintableHtml', () => {
    it('should generate full HTML document with signatory blocks and official branding', () => {
      const report = STATUTORY_REPORTS_LIST[0];
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
      expect(html).toContain('Prepared By');
      expect(html).toContain('Regional Director');
    });
  });
});
