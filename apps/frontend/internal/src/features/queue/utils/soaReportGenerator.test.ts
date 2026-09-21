import { ApplicationData } from '../../../types/application';
import {
  generateSoaPrintableHtml,
  generateOpPrintableHtml,
  generateFullApplicationSummaryHtml,
} from './soaReportGenerator';

describe('SOA and OP Report Generator', () => {
  const mockApplication: ApplicationData = {
    id: 'app-test-12345678',
    tenantId: 'tenant-1',
    referenceNumber: 'REF-2026-001',
    applicationNumber: 'APP-2026-888',
    applicant: 'Juan Dela Cruz Communications Inc.',
    applicantType: 'Company',
    permitTitle: 'Radio Station Commercial Permit',
    category: 'Permits',
    status: 'Evaluating',
    queueTab: 'pending',
    applicationType: 'SINGLE',
    mode: 'Single',
    serviceName: 'Radio Station Commercial Permit',
    serviceCategory: 'Permits',
    serviceVariantName: 'New Commercial Station',
    office: 'National Capital Region',
    assignedTo: 'NTC Regional Office NCR',
    createdAt: '2026-09-21T08:00:00Z',
    dateLabel: 'Sep 21, 2026',
    isBeingViewed: false,
    isUrgent: false,
    isPinned: false,
    isArchived: false,
    address: {
      streetAddress: '123 Telecom Blvd, Diliman',
      address: '123 Telecom Blvd, Diliman',
      barangay: 'Diliman',
      city: 'Quezon City',
      province: 'Metro Manila',
      region: 'NCR',
      zipCode: '1101',
    },
    contactDetails: {
      contactNumber: '09171234567',
      email: 'juan.delacruz@example.com',
    },
    basicInfo: {
      firstName: 'Juan',
      lastName: 'Dela Cruz',
      middleName: 'Santos',
      extensionName: '',
      dob: '1985-05-15',
      placeOfBirth: 'Quezon City',
      sex: 'Male',
      weight: 70,
      height: 175,
      nationality: 'Filipino',
      civilStatus: 'Married',
      employmentStatus: 'Employed',
      occupation: 'General Manager',
    },
    applicationDetails: {
      noOfYears: 3,
      permitCategory: 'Commercial',
      formType: 'Standard',
      submittedAt: '2026-09-21T08:00:00Z',
    },
    requirements: [],
    forms: [],
    soaItems: [
      {
        particular: 'Commercial Radio Station Filing Fee',
        validityYears: 3,
        percentage: 0,
        noOfUnits: 1,
        fees: 1500,
        amount: 1500,
        code: 'NTC-RAD-01',
      },
      {
        particular: 'Spectrum Inspection & Engineering Fee',
        validityYears: 1,
        percentage: 0,
        noOfUnits: 2,
        fees: 500,
        amount: 1000,
        code: 'NTC-ENG-02',
      },
    ],
    totalAmountDue: 2500,
    dueDate: '2026-10-21',
    payment: {
      amountReceived: 2500,
      method: 'cash',
      orNumber: 'OR-998822-2026',
      checkNumber: '',
      checkName: '',
    },
    correctionAuditTrail: [],
    history: [
      {
        id: 'h-1',
        action: 'Application Submitted (Single)',
        staff: 'Juan Dela Cruz',
        timestamp: 'Sep 21, 2026, 08:00 AM',
      },
      {
        id: 'h-2',
        action: 'Status: Evaluating — Assigned to NCR Evaluator',
        staff: 'Evaluator EDGE',
        timestamp: 'Sep 21, 2026, 09:30 AM',
      },
    ],
    note: 'Priority commercial application.',
  };

  describe('generateSoaPrintableHtml', () => {
    it('should generate official Statement of Account HTML with correct headers and particulars', () => {
      const html = generateSoaPrintableHtml(mockApplication, 'NTC NCR Office', 'Maria Santos', 'Engr. Roberto Cruz');
      expect(html).toContain('STATEMENT OF ACCOUNT (SOA)');
      expect(html).toContain('NATIONAL TELECOMMUNICATIONS COMMISSION');
      expect(html).toContain('SOA-REF-2026-001');
      expect(html).toContain('Juan Dela Cruz Communications Inc.');
      expect(html).toContain('Commercial Radio Station Filing Fee');
      expect(html).toContain('NTC-RAD-01');
      expect(html).toContain('PHP 2,500.00');
      expect(html).toContain('TWO THOUSAND FIVE HUNDRED PESOS ONLY');
      expect(html).toContain('Maria Santos');
      expect(html).toContain('Engr. Roberto Cruz');
    });

    it('should handle applications without line items gracefully', () => {
      const emptySoaApp: ApplicationData = {
        ...mockApplication,
        soaItems: [],
        totalAmountDue: 600,
      };
      const html = generateSoaPrintableHtml(emptySoaApp);
      expect(html).toContain('STATEMENT OF ACCOUNT (SOA)');
      expect(html).toContain('PHP 600.00');
    });
  });

  describe('generateOpPrintableHtml', () => {
    it('should generate official Order of Payment HTML with nature of collection and cashier blocks', () => {
      const html = generateOpPrintableHtml(mockApplication, 'NTC NCR Office', 'Teresa Gomez');
      expect(html).toContain('ORDER OF PAYMENT (OP)');
      expect(html).toContain('OP-REF-2026-001');
      expect(html).toContain('Juan Dela Cruz Communications Inc.');
      expect(html).toContain('PHP 2,500.00');
      expect(html).toContain('OR #OR-998822-2026');
      expect(html).toContain('Teresa Gomez');
    });
  });

  describe('generateFullApplicationSummaryHtml', () => {
    it('should generate complete dossier summary with audit trail and applicant bio', () => {
      const html = generateFullApplicationSummaryHtml(mockApplication, 'NCR Regional Office');
      expect(html).toContain('Application Dossier &amp; Evaluation Summary');
      expect(html).toContain('REF-2026-001');
      expect(html).toContain('APP-2026-888');
      expect(html).toContain('Juan Dela Cruz');
      expect(html).toContain('Application Submitted (Single)');
      expect(html).toContain('Status: Evaluating — Assigned to NCR Evaluator');
    });
  });
});
