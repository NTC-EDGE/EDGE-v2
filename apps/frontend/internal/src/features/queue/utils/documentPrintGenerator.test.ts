import {
  getEligibleTemplatesForApplication,
  generateAccountableFormOverlayHtml,
} from './documentPrintGenerator';
import { ApplicationData } from '../../../types/application';
import { DocumentPrintOptions, ACCOUNTABLE_FORM_TEMPLATES } from '../types/documentPrintTypes';

function createMockExamApp(overrides?: Partial<ApplicationData>): ApplicationData {
  const base: ApplicationData = {
    id: 'app-exam-001',
    referenceNumber: 'REF-EXAM-2026-001',
    applicationNumber: 'NTC-R07-2026-EXAM-001',
    applicant: 'JUAN DELA CRUZ',
    applicantType: 'Individual',
    permitTitle: 'Admission Slip for Radio Operator Examination',
    serviceName: 'Admission Slip for Radio Operator Examination',
    serviceCategory: 'Exams',
    category: 'Exams',
    status: 'Approved',
    queueTab: 'issuance',
    createdAt: '2026-10-29T08:00:00.000Z',
    dateLabel: 'Oct 29, 2026',
    assignedTo: 'NTC Regional Office VII',
    office: 'NTC Regional Office VII - Mandaue City',
    applicationType: 'SINGLE',
    isBeingViewed: false,
    isUrgent: false,
    isPinned: false,
    address: {
      streetAddress: '123 Osmeña Blvd',
      barangay: 'Kamputhaw',
      city: 'Cebu City',
      province: 'Cebu',
      region: 'Region VII',
      zipCode: '6000',
    },
    contactDetails: { contactNumber: '0917-123-4567', email: 'juan.delacruz@example.com' },
    basicInfo: {
      lastName: 'Dela Cruz',
      firstName: 'Juan',
      middleName: 'Mercado',
      extensionName: '',
      dob: '1995-05-15',
      placeOfBirth: 'Cebu City',
      sex: 'Male',
      weight: 65,
      height: 170,
      nationality: 'Filipino',
      employmentStatus: 'Employed',
      occupation: 'Radio Technician',
    },
    applicationDetails: {
      noOfYears: 1,
      permitCategory: 'Commercial',
      formType: 'NTC 1-01',
      submittedAt: '2026-10-29T08:00:00.000Z',
    },
    requirements: [
      {
        label: '1x1 ID Picture',
        filename: 'juan_1x1.jpg',
        thumbnailUri: 'https://cdn.example.com/photos/juan_1x1.jpg',
      },
    ],
    forms: [],
    soaItems: [],
    totalAmountDue: 250,
    dueDate: '2026-11-29',
    payment: {
      amountReceived: 250,
      method: 'cash',
      orNumber: 'OR-7788990',
      checkNumber: '',
      checkName: '',
    },
    correctionAuditTrail: [],
    history: [],
    note: 'First time exam applicant',
  };

  return { ...base, ...overrides };
}

function createPrintOptions(overrides?: Partial<DocumentPrintOptions>): DocumentPrintOptions {
  const base: DocumentPrintOptions = {
    paperSize: 'letter',
    outputMode: 'accountable_form',
    orientation: 'portrait',
    calibration: { offsetXmm: 0, offsetYmm: 0, scalePercent: 100 },
    formNumber: 'AS-2026-0001',
    licenseNumber: 'AS-2026-0001',
    signatoryName: 'DIR. ENGR. JUANITA SANTOS',
    signatoryTitle: 'Regional Director',
  };

  return { ...base, ...overrides };
}

describe('documentPrintGenerator - Admission Slip & Accountable Forms', () => {
  it('identifies NTC-FORM-ADMISSION for Exam category applications', () => {
    const examApp = createMockExamApp();
    const templates = getEligibleTemplatesForApplication(examApp, 'issuance');

    expect(templates.length).toBeGreaterThan(0);
    const firstTemplate = templates[0];
    expect(firstTemplate?.id).toBe('NTC-FORM-ADMISSION');
    expect(firstTemplate?.code).toBe('NTC Form No. 1-01');
    expect(firstTemplate?.title).toContain('Admission Slip');
  });

  it('identifies NTC-FORM-102 for Radio Operator Certificate services', () => {
    const rocApp = createMockExamApp({
      serviceCategory: 'Certificates',
      serviceName: 'Radio Operator Certificate (ROC)',
    });
    const templates = getEligibleTemplatesForApplication(rocApp, 'issuance');
    expect(templates[0]?.id).toBe('NTC-FORM-102');
  });

  it('identifies NTC-FORM-101 for Radio Station License services', () => {
    const rslApp = createMockExamApp({
      serviceCategory: 'Licenses',
      serviceName: 'Radio Station License (RSL)',
    });
    const templates = getEligibleTemplatesForApplication(rslApp, 'issuance');
    expect(templates[0]?.id).toBe('NTC-FORM-101');
  });

  it('renders examinee name, mailing address, exam venue and date on Admission Slip accountable overlay', () => {
    const examApp = createMockExamApp();
    const admissionTemplate = ACCOUNTABLE_FORM_TEMPLATES.find((t) => t.id === 'NTC-FORM-ADMISSION');
    expect(admissionTemplate).toBeDefined();

    const options = createPrintOptions({
      selectedTemplateId: 'NTC-FORM-ADMISSION',
      applicantPhotoUrl: 'https://cdn.example.com/photos/juan_1x1.jpg',
      qrCodeValue: 'NTC-VERIFY-EXAM-2026',
    });

    const html = generateAccountableFormOverlayHtml(examApp, options, admissionTemplate);

    expect(html).toContain('JUAN DELA CRUZ');
    expect(html).toContain('123 Osmeña Blvd');
    expect(html).toContain('NTC Regional Office VII');
    expect(html).toContain('AS-2026-0001');
  });

  it('renders applicant 1x1 photo image tag when applicantPhotoUrl is supplied', () => {
    const examApp = createMockExamApp();
    const admissionTemplate = ACCOUNTABLE_FORM_TEMPLATES.find((t) => t.id === 'NTC-FORM-ADMISSION');
    const photoUrl = 'https://storage.edge.ntc.gov.ph/files/applicant-1x1-photo.jpg';

    const options = createPrintOptions({
      selectedTemplateId: 'NTC-FORM-ADMISSION',
      applicantPhotoUrl: photoUrl,
    });

    const html = generateAccountableFormOverlayHtml(examApp, options, admissionTemplate);

    expect(html).toContain('<img src="https://storage.edge.ntc.gov.ph/files/applicant-1x1-photo.jpg"');
    expect(html).toContain('alt="1x1 ID Picture"');
    expect(html).toContain('object-fit: cover');
  });

  it('renders a dashed 1x1 placeholder box when applicant photo is not yet uploaded', () => {
    const examApp = createMockExamApp({ requirements: [] });
    const admissionTemplate = ACCOUNTABLE_FORM_TEMPLATES.find((t) => t.id === 'NTC-FORM-ADMISSION');

    const options = createPrintOptions({
      selectedTemplateId: 'NTC-FORM-ADMISSION',
      applicantPhotoUrl: undefined,
    });

    const html = generateAccountableFormOverlayHtml(examApp, options, admissionTemplate);

    expect(html).toContain('1" × 1"');
    expect(html).toContain('PHOTO');
  });

  it('renders verification QR code and reference value on accountable overlay', () => {
    const examApp = createMockExamApp();
    const admissionTemplate = ACCOUNTABLE_FORM_TEMPLATES.find((t) => t.id === 'NTC-FORM-ADMISSION');

    const options = createPrintOptions({
      selectedTemplateId: 'NTC-FORM-ADMISSION',
      qrCodeValue: 'NTC-VERIFY-ADMISSION-REF001',
    });

    const html = generateAccountableFormOverlayHtml(examApp, options, admissionTemplate);

    expect(html).toContain('<svg');
    expect(html).toContain('NTC-VERIFY-ADMISSION-REF001');
  });
});
