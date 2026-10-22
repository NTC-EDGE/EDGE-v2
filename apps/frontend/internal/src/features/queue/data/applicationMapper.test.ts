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

  describe('Role-based queueTab deriving', () => {
    it('places Submitted/Evaluating in pending and ForAccountant/PendingPayment/Completed in archived (history) for Evaluator', () => {
      const evalPendingDto: ApplicationSummaryDto = {
        id: 'eval-1',
        status: 'Evaluating',
        submissionMode: 'Single',
        createdAt: '2026-09-20T10:00:00Z',
        applicants: [],
        services: [],
      };
      const evalApprovedDto: ApplicationSummaryDto = {
        id: 'eval-2',
        status: 'ForAccountant',
        submissionMode: 'Single',
        createdAt: '2026-09-20T10:00:00Z',
        applicants: [],
        services: [],
      };

      const pendingUi = mapApplicationDtoToUI(evalPendingDto, 'Evaluator');
      const approvedUi = mapApplicationDtoToUI(evalApprovedDto, 'Evaluator');

      expect(pendingUi.queueTab).toBe('pending');
      expect(approvedUi.queueTab).toBe('history');
    });

    it('places ForAccountant in pending and PendingPayment/Completed in archived (history) for Accountant', () => {
      const acctPendingDto: ApplicationSummaryDto = {
        id: 'acct-1',
        status: 'ForAccountant',
        submissionMode: 'Single',
        createdAt: '2026-09-20T10:00:00Z',
        applicants: [],
        services: [],
      };
      const acctApprovedDto: ApplicationSummaryDto = {
        id: 'acct-2',
        status: 'PendingPayment',
        submissionMode: 'Single',
        createdAt: '2026-09-20T10:00:00Z',
        applicants: [],
        services: [],
      };

      const pendingUi = mapApplicationDtoToUI(acctPendingDto, 'Accountant');
      const approvedUi = mapApplicationDtoToUI(acctApprovedDto, 'Accountant');

      expect(pendingUi.queueTab).toBe('pending');
      expect(approvedUi.queueTab).toBe('history');
    });

    it('places PendingPayment in pending and Completed in archived (history) for Cashier', () => {
      const cashierPendingDto: ApplicationSummaryDto = {
        id: 'cashier-1',
        status: 'PendingPayment',
        submissionMode: 'Single',
        createdAt: '2026-09-20T10:00:00Z',
        applicants: [],
        services: [],
      };
      const cashierCompletedDto: ApplicationSummaryDto = {
        id: 'cashier-2',
        status: 'Completed',
        submissionMode: 'Single',
        createdAt: '2026-09-20T10:00:00Z',
        applicants: [],
        services: [],
      };

      const pendingUi = mapApplicationDtoToUI(cashierPendingDto, 'Cashier');
      const completedUi = mapApplicationDtoToUI(cashierCompletedDto, 'Cashier');

      expect(pendingUi.queueTab).toBe('pending');
      expect(completedUi.queueTab).toBe('history');
    });

    it('places ForIssuance in issuance queue tab for dedicated For Issuance column', () => {
      const issuanceDto: ApplicationSummaryDto = {
        id: 'issue-1',
        status: 'ForIssuance',
        submissionMode: 'Single',
        createdAt: '2026-09-20T10:00:00Z',
        applicants: [],
        services: [],
      };

      const evalUi = mapApplicationDtoToUI(issuanceDto, 'Evaluator');
      const chiefUi = mapApplicationDtoToUI(issuanceDto, 'Chief of EOD');
      const rdUi = mapApplicationDtoToUI(issuanceDto, 'Regional Director');

      expect(evalUi.queueTab).toBe('issuance');
      expect(chiefUi.queueTab).toBe('issuance');
      expect(rdUi.queueTab).toBe('issuance');
    });

    it('directly uses backend returned queueTab as the single source of truth when present', () => {
      const backendPendingDto: ApplicationSummaryDto = {
        id: 'be-1',
        status: 'ForAccountant',
        queueTab: 'pending',
        submissionMode: 'Single',
        createdAt: '2026-09-20T10:00:00Z',
        applicants: [],
        services: [],
      };
      const backendArchivedDto: ApplicationSummaryDto = {
        id: 'be-2',
        status: 'ForAccountant',
        queueTab: 'history',
        submissionMode: 'Single',
        createdAt: '2026-09-20T10:00:00Z',
        applicants: [],
        services: [],
      };

      const pendingUi = mapApplicationDtoToUI(backendPendingDto);
      const archivedUi = mapApplicationDtoToUI(backendArchivedDto);

      expect(pendingUi.queueTab).toBe('pending');
      expect(archivedUi.queueTab).toBe('history');
    });

    it('correctly attributes evaluatingOfficer to original Evaluator (not Accountant) and places in Processed tab for Accountant when application is returned', () => {
      const returnedDto: ApplicationDto = {
        id: 'app-returned-1',
        tenantId: 'tenant-1',
        applicationNumber: 'APP-RET-001',
        referenceNumber: 'REF-RET-001',
        status: 'Evaluating',
        submissionMode: 'Single',
        isGuest: false,
        createdAt: '2026-09-20T10:00:00Z',
        remarks: 'SOA returned by Accountant: Fee correction needed',
        applicants: [
          {
            id: 'applicant-1',
            tenantId: 'tenant-1',
            isGuest: false,
            applicantType: 'Individual',
            details: {
              id: 'det-1',
              firstName: 'Juan',
              lastName: 'Dela Cruz',
              address: '123 Test St',
              nationality: 'Filipino',
              sex: 'Male',
              contactNumber: '09123456789',
            },
          },
        ],
        statementsOfAccount: [
          {
            id: 'soa-1',
            applicationId: 'app-returned-1',
            soaNumber: 'SOA-001',
            status: 'Returned',
            issuedToType: 'Individual',
            issuedToName: 'Juan Dela Cruz',
            totalAmount: 1200,
            dueDate: '2026-10-20',
            lineItems: [],
            histories: [],
          },
        ],
        ordersOfPayment: [],
        histories: [
          {
            id: 'h-1',
            action: 'Application Submitted',
            toStatus: 'Submitted',
            staffName: 'Juan Dela Cruz',
            staffRole: 'Filing Submitter',
            timestamp: '2026-09-20T10:00:00Z',
          },
          {
            id: 'h-2',
            action: 'Evaluation Started by Engr. Maria Santos',
            toStatus: 'Evaluating',
            staffName: 'Engr. Maria Santos',
            staffRole: 'Evaluator',
            timestamp: '2026-09-20T10:30:00Z',
          },
          {
            id: 'h-3',
            action: 'Approved & Forwarded to Accountant',
            toStatus: 'ForAccountant',
            staffName: 'Engr. Maria Santos',
            staffRole: 'Evaluator',
            timestamp: '2026-09-20T11:00:00Z',
          },
          {
            id: 'h-4',
            action: 'SOA Returned to Evaluator',
            toStatus: 'Evaluating',
            staffName: 'John Accountant',
            staffRole: 'Accountant',
            remarks: 'Fee correction needed',
            timestamp: '2026-09-20T11:30:00Z',
          },
        ],
        correctionAuditTrails: [],
      };

      const uiForEvaluator = mapApplicationDtoToUI(returnedDto, 'Evaluator');
      const uiForAccountant = mapApplicationDtoToUI(returnedDto, 'Accountant');

      // Evaluating officer MUST be the evaluator, NEVER the accountant
      expect(uiForEvaluator.evaluatingOfficer).toBe('Engr. Maria Santos');
      expect(uiForEvaluator.assignedTo).toBe('Engr. Maria Santos');
      expect(uiForEvaluator.queueTab).toBe('pending');

      // For accountant, it has already passed their hands, so it appears in history (Processed)
      expect(uiForAccountant.queueTab).toBe('history');
      expect(uiForAccountant.evaluatingOfficer).toBe('Engr. Maria Santos');
    });

    it('correctly maps application with status Returned to pending for Evaluator and history for Accountant', () => {
      const returnedDto: ApplicationDto = {
        id: 'app-returned-status',
        tenantId: 'tenant-1',
        applicationNumber: 'APP-RET-002',
        referenceNumber: 'REF-RET-002',
        status: 'Returned',
        submissionMode: 'Single',
        isGuest: false,
        createdAt: '2026-09-20T10:00:00Z',
        remarks: 'SOA returned by Accountant: Re-calculate fees',
        applicants: [
          {
            id: 'applicant-1',
            tenantId: 'tenant-1',
            isGuest: false,
            applicantType: 'Individual',
            details: {
              id: 'det-1',
              firstName: 'Juan',
              lastName: 'Dela Cruz',
              address: '123 Test St',
              nationality: 'Filipino',
              sex: 'Male',
              contactNumber: '09123456789',
            },
          },
        ],
        statementsOfAccount: [
          {
            id: 'soa-2',
            applicationId: 'app-returned-status',
            soaNumber: 'SOA-002',
            status: 'Returned',
            issuedToType: 'Individual',
            issuedToName: 'Juan Dela Cruz',
            totalAmount: 1200,
            dueDate: '2026-10-20',
            lineItems: [],
            histories: [],
          },
        ],
        ordersOfPayment: [],
        histories: [
          {
            id: 'h-1',
            action: 'Application Submitted',
            toStatus: 'Submitted',
            staffName: 'Juan Dela Cruz',
            staffRole: 'Filing Submitter',
            timestamp: '2026-09-20T10:00:00Z',
          },
          {
            id: 'h-2',
            action: 'Evaluation Started by Engr. Carlos Santos',
            toStatus: 'Evaluating',
            staffName: 'Engr. Carlos Santos',
            staffRole: 'Evaluator',
            timestamp: '2026-09-20T10:30:00Z',
          },
          {
            id: 'h-3',
            action: 'Approved & Forwarded to Accountant',
            toStatus: 'ForAccountant',
            staffName: 'Engr. Carlos Santos',
            staffRole: 'Evaluator',
            timestamp: '2026-09-20T11:00:00Z',
          },
          {
            id: 'h-4',
            action: 'SOA Returned to Evaluator',
            toStatus: 'Returned',
            staffName: 'John Accountant',
            staffRole: 'Accountant',
            remarks: 'Re-calculate fees',
            timestamp: '2026-09-20T11:30:00Z',
          },
        ],
        correctionAuditTrails: [],
      };

      const uiForEvaluator = mapApplicationDtoToUI(returnedDto, 'Evaluator');
      const uiForAccountant = mapApplicationDtoToUI(returnedDto, 'Accountant');

      expect(uiForEvaluator.status).toBe('Returned');
      expect(uiForEvaluator.evaluatingOfficer).toBe('Engr. Carlos Santos');
      expect(uiForEvaluator.assignedTo).toBe('Engr. Carlos Santos');
      expect(uiForEvaluator.queueTab).toBe('pending');

      expect(uiForAccountant.status).toBe('Returned');
      expect(uiForAccountant.queueTab).toBe('history');
    });
  });
});
