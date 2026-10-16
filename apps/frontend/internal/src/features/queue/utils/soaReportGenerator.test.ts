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

  const bareApplication: ApplicationData = {
    id: 'app-bare-9999',
    tenantId: 'tenant-1',
    referenceNumber: 'REF-BARE-999',
    applicationNumber: '',
    applicant: '',
    applicantType: 'Individual',
    permitTitle: '',
    category: 'Permits',
    status: 'Submitted',
    queueTab: 'pending',
    applicationType: 'SINGLE',
    mode: '',
    serviceName: '',
    serviceCategory: '',
    office: '',
    assignedTo: '',
    createdAt: '2026-09-21T08:00:00Z',
    dateLabel: 'Sep 21, 2026',
    isBeingViewed: false,
    isUrgent: false,
    isPinned: false,
    isArchived: false,
    address: {
      streetAddress: '',
      address: '',
      barangay: '',
      city: '',
      province: '',
      zipCode: '',
    },
    contactDetails: {
      contactNumber: '',
      email: '',
    },
    basicInfo: {
      lastName: '',
      firstName: '',
      middleName: '',
      extensionName: '',
      dob: '',
      placeOfBirth: '',
      sex: 'Male',
      weight: 0,
      height: 0,
      nationality: 'Filipino',
      employmentStatus: '',
      occupation: '',
    },
    applicationDetails: {
      noOfYears: 0,
      permitCategory: '',
      formType: '',
      submittedAt: '',
    },
    requirements: [],
    forms: [],
    soaItems: [],
    totalAmountDue: 0,
    dueDate: '',
    payment: {
      amountReceived: 0,
      method: 'cash',
      orNumber: '',
      checkNumber: '',
      checkName: '',
    },
    correctionAuditTrail: [],
    history: [],
    note: '',
  };

  describe('generateSoaPrintableHtml', () => {
    it('should generate official Statement of Account HTML matching soa-report-template.pdf format', () => {
      const html = generateSoaPrintableHtml(mockApplication, { outputMode: 'plain_paper' });
      expect(html).toContain("CASHIER'S REPORT");
      expect(html).toContain('MONTH OF');
      expect(html).toContain('FOR LICENSES');
      expect(html).toContain('FOR PERMITS');
      expect(html).toContain('FOR AMATUER AND ROC');
      expect(html).toContain('OTHER APPLICATION');
      expect(html).toContain('4-02-01-060');
      expect(html).toContain('TOTAL');
      expect(html).toContain('2,500.00');
    });

    it('should generate accountable form overlay mode with suppressed borders and static labels', () => {
      const html = generateSoaPrintableHtml(mockApplication, { outputMode: 'accountable_form' });
      expect(html).toContain('Pre-Printed Accountable Form Overlay Mode');
      expect(html).toContain('2,500.00');
      expect(html).not.toContain('undefined');
    });

    it('should handle applications without line items gracefully', () => {
      const emptySoaApp: ApplicationData = {
        ...mockApplication,
        soaItems: [],
        totalAmountDue: 600,
      };
      const html = generateSoaPrintableHtml(emptySoaApp);
      expect(html).toContain("CASHIER'S REPORT");
      expect(html).toContain('600.00');
      expect(html).not.toContain('undefined');
    });

    it('should not contain undefined strings for bare applications lacking address and contact fields', () => {
      const html = generateSoaPrintableHtml(bareApplication);
      expect(html).toContain("CASHIER'S REPORT");
      expect(html).not.toContain('undefined');
    });

    it('should display Evaluator and Chief of EOD names in SOA printable HTML without gray backgrounds', () => {
      const soaWithSignatories: ApplicationData = {
        ...mockApplication,
        evaluatingOfficer: 'Engr. John Doe',
        issuingOfficer: 'Dir. Jane Smith',
        soaPreparedByName: 'Engr. Alice Officer',
        soaPreparedByTitle: 'EVALUATOR, NTC',
        soaApprovedByName: 'Atty. Roberto EOD Chief',
        soaApprovedByTitle: 'CHIEF, ENFORCEMENT & OPERATIONS DIV.',
      };
      const html = generateSoaPrintableHtml(soaWithSignatories);
      expect(html).toContain('Engr. Alice Officer');
      expect(html).toContain('Atty. Roberto EOD Chief');
      expect(html).toContain('EVALUATOR, NTC');
      expect(html).toContain('CHIEF, ENFORCEMENT & OPERATIONS DIV.');
      // Verify gray background colors are removed
      expect(html).not.toContain('#f8fafc');
      expect(html).not.toContain('#f1f5f9');
      expect(html).not.toContain('#e2e8f0');
    });

    it('should fall back to evaluatingOfficer and issuingOfficer when SOA specific names are absent', () => {
      const fallbackApp: ApplicationData = {
        ...mockApplication,
        evaluatingOfficer: 'Engr. Fallback Evaluator',
        issuingOfficer: 'Chief Fallback Approver',
      };
      const html = generateSoaPrintableHtml(fallbackApp);
      expect(html).toContain('Engr. Fallback Evaluator');
      expect(html).toContain('Chief Fallback Approver');
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

    it('should not contain undefined strings for bare applications in OP generation', () => {
      const html = generateOpPrintableHtml(bareApplication);
      expect(html).toContain('ORDER OF PAYMENT (OP)');
      expect(html).toContain('Pending Cashier Collection');
      expect(html).not.toContain('undefined');
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

    it('should handle bare application without throwing or printing undefined', () => {
      const html = generateFullApplicationSummaryHtml(bareApplication);
      expect(html).toContain('Application Dossier &amp; Evaluation Summary');
      expect(html).toContain('No audit history recorded.');
      expect(html).toContain('Address:</strong> N/A');
      expect(html).not.toContain('undefined');
    });
  });
});
