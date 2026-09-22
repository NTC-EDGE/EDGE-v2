import { mapApplicationDtoToUI } from './applicationMapper';
import { ApplicationDto, ApplicationSummaryDto } from '@edge/api';

describe('applicationMapper', () => {
  it('correctly identifies Certificates category when serviceCategory is Certificates', () => {
    const dto: ApplicationSummaryDto = {
      id: 'app-cert-1',
      applicationNumber: 'APP-CERT-001',
      referenceNumber: 'REF-CERT-001',
      status: 'Submitted',
      submissionMode: 'Single',
      createdAt: '2026-09-20T10:00:00Z',
      serviceId: 'svc-1',
      serviceName: 'Restricted Radiotelephone Operator Certificate (RROC)',
      serviceCategory: 'Certificates',
      serviceVariantName: 'New',
      applicants: [
        {
          id: 'applicant-1',
          applicantType: 'Individual',
          name: 'Jane Doe',
        },
      ],
      services: [
        {
          id: 'svc-item-1',
          serviceId: 'svc-1',
          serviceName: 'Restricted Radiotelephone Operator Certificate (RROC)',
          serviceCategory: 'Certificates',
        },
      ],
    };

    const ui = mapApplicationDtoToUI(dto);
    expect(ui.category).toBe('Certificates');
    expect(ui.serviceCategory).toBe('Certificates');
    expect(ui.permitTitle).toBe('Restricted Radiotelephone Operator Certificate (RROC)');
    expect(ui.serviceName).toBe('Restricted Radiotelephone Operator Certificate (RROC)');
    expect(ui.services?.[0]?.serviceCategory).toBe('Certificates');
  });

  it('correctly identifies Certificates from serviceCategoryName on full ApplicationDto', () => {
    const dto: ApplicationDto = {
      id: 'app-cert-2',
      tenantId: 'tenant-1',
      applicationNumber: 'APP-CERT-002',
      referenceNumber: 'REF-CERT-002',
      status: 'Evaluating',
      submissionMode: 'Single',
      isGuest: false,
      createdAt: '2026-09-20T11:00:00Z',
      serviceName: 'General Operator Certificate (GOC)',
      serviceCategoryName: 'Certificates',
      applicants: [
        {
          id: 'applicant-2',
          tenantId: 'tenant-1',
          isGuest: false,
          applicantType: 'Individual',
          details: {
            id: 'detail-2',
            firstName: 'John',
            lastName: 'Smith',
            address: '123 Main St',
            contactNumber: '09171234567',
            zipCode: '1000',
            nationality: 'Filipino',
            sex: 'Male',
          },
        },
      ],
      statementsOfAccount: [],
      ordersOfPayment: [],
      histories: [],
      correctionAuditTrails: [],
    };

    const ui = mapApplicationDtoToUI(dto);
    expect(ui.category).toBe('Certificates');
    expect(ui.serviceCategory).toBe('Certificates');
    expect(ui.permitTitle).toBe('General Operator Certificate (GOC)');
    expect(ui.serviceName).toBe('General Operator Certificate (GOC)');
  });

  it('infers Certificates category from serviceName when category is not provided', () => {
    const dto: ApplicationSummaryDto = {
      id: 'app-cert-3',
      status: 'Submitted',
      submissionMode: 'Single',
      createdAt: '2026-09-20T12:00:00Z',
      serviceName: 'Radio Operator Certificate - Aviation',
      applicants: [
        {
          id: 'applicant-3',
          applicantType: 'Individual',
          name: 'Pilot Pete',
        },
      ],
      services: [],
    };

    const ui = mapApplicationDtoToUI(dto);
    expect(ui.category).toBe('Certificates');
    expect(ui.serviceCategory).toBe('Certificates');
    expect(ui.permitTitle).toBe('Radio Operator Certificate - Aviation');
  });

  it('correctly maps Permits category when service is a permit', () => {
    const dto: ApplicationSummaryDto = {
      id: 'app-permit-1',
      status: 'Submitted',
      submissionMode: 'Single',
      createdAt: '2026-09-20T13:00:00Z',
      serviceName: 'Permit to Purchase Radio Transmitter',
      serviceCategory: 'Permits',
      applicants: [
        {
          id: 'applicant-4',
          applicantType: 'Company',
          name: 'Telecom Corp',
        },
      ],
      services: [],
    };

    const ui = mapApplicationDtoToUI(dto);
    expect(ui.category).toBe('Permits');
    expect(ui.serviceCategory).toBe('Permits');
    expect(ui.permitTitle).toBe('Permit to Purchase Radio Transmitter');
  });

  it('correctly maps Licenses and Exams categories', () => {
    const licenseDto: ApplicationSummaryDto = {
      id: 'app-lic-1',
      status: 'Submitted',
      submissionMode: 'Single',
      createdAt: '2026-09-20T14:00:00Z',
      serviceName: 'Radio Station License (RSL)',
      serviceCategory: 'Licenses',
      applicants: [{ id: 'app-5', applicantType: 'Individual', name: 'Radio Operator' }],
      services: [],
    };
    const uiLic = mapApplicationDtoToUI(licenseDto);
    expect(uiLic.category).toBe('Licenses');

    const examDto: ApplicationSummaryDto = {
      id: 'app-exam-1',
      status: 'Submitted',
      submissionMode: 'Single',
      createdAt: '2026-09-20T15:00:00Z',
      serviceName: 'Radio Operator Examination Admission',
      serviceCategory: 'Exams',
      applicants: [{ id: 'app-6', applicantType: 'Individual', name: 'Student Applicant' }],
      services: [],
    };
    const uiExam = mapApplicationDtoToUI(examDto);
    expect(uiExam.category).toBe('Exams');
  });

  it('handles fallback when neither serviceName nor serviceCategory is present', () => {
    const bareDto: ApplicationSummaryDto = {
      id: 'app-bare',
      status: 'Draft',
      submissionMode: 'Single',
      createdAt: '2026-09-20T16:00:00Z',
      applicants: [],
      services: [],
    };
    const ui = mapApplicationDtoToUI(bareDto);
    expect(ui.category).toBe('Permits');
    expect(ui.permitTitle).toBe('Permits Application');
  });
});
