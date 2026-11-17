import { mapApplicationDtoToUI, mapActivityDtoToUI } from './applicationMapper';
import { ApplicationDto, ApplicationSummaryDto, ApplicationActivityDto } from '@edge/api';
import { computeOfficerEvaluationState } from '../utils/officerEvaluationHelper';

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

    it('correctly treats application as unclaimed for Accountant and does not attribute evaluatingOfficer as accountingOfficer when forwarded to Accountant', () => {
      const forwardedDto: ApplicationDto = {
        id: 'app-fwd-1',
        tenantId: 'tenant-1',
        applicationNumber: 'APP-FWD-001',
        referenceNumber: 'REF-FWD-001',
        status: 'ForAccountant',
        submissionMode: 'Single',
        isGuest: false,
        createdAt: '2026-09-20T10:00:00Z',
        office: 'Regional Main Office',
        remarks: 'Evaluation approved. Forwarded to Accountant.',
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
              emailAddress: 'juan@example.com',
            },
            formFieldValues: [],
          },
        ],
        services: [
          {
            id: 'srv-1',
            serviceId: 'srv-1',
            serviceName: 'Radio Station Permit',
            serviceCategory: 'Permits',
          },
        ],
        histories: [
          {
            id: 'h-1',
            timestamp: '2026-09-20T10:00:00Z',
            action: 'Evaluation Started',
            staffName: 'Engr. Maria Santos',
            staffRole: 'Evaluating Officer',
            remarks: 'Evaluation started by Engr. Maria Santos.',
            toStatus: 'Evaluating',
          },
          {
            id: 'h-2',
            timestamp: '2026-09-20T10:30:00Z',
            action: 'Approved & Forwarded to Accountant',
            staffName: 'Engr. Maria Santos',
            staffRole: 'Evaluating Officer',
            remarks: 'Evaluation approved. Forwarded to Accountant.',
            toStatus: 'ForAccountant',
          },
        ],
        statementsOfAccount: [],
        ordersOfPayment: [],
        correctionAuditTrails: [],
      };

      const ui = mapApplicationDtoToUI(forwardedDto, 'Accountant');

      // 1. Evaluating officer is Engr. Maria Santos
      expect(ui.evaluatingOfficer).toBe('Engr. Maria Santos');
      // 2. Accounting officer must be undefined (unclaimed)
      expect(ui.accountingOfficer).toBeUndefined();
      // 3. Assigned to must NOT be Engr. Maria Santos
      expect(ui.assignedTo).not.toBe('Engr. Maria Santos');

      // 4. Test stage evaluation state for an Accountant user: Must be unclaimed so they can click "Take Application"!
      const acctState = computeOfficerEvaluationState({
        application: ui,
        identifiers: ['ann accountant', 'accountant@ntc.gov.ph'],
      });
      expect(acctState.isStageUnclaimed).toBe(true);
      expect(acctState.isStageClaimedByOther).toBe(false);
      expect(acctState.isStageClaimedByMe).toBe(false);
    });

    it('correctly transitions to claimed by Accountant when Accountant takes application (Financial Review Started)', () => {
      const claimedDto: ApplicationDto = {
        id: 'app-fwd-2',
        tenantId: 'tenant-1',
        submissionMode: 'Single',
        isGuest: false,
        referenceNumber: 'REF-2026-FWD2',
        applicationNumber: 'APP-2026-FWD2',
        status: 'ForAccountant',
        office: 'NTC Central Office',
        createdAt: '2026-03-30T10:00:00.000Z',
        lastModifiedAt: '2026-03-30T10:30:00.000Z',
        intent: 'Regular',
        services: [],
        applicants: [],
        histories: [
          {
            id: 'h1',
            action: 'Evaluation Started',
            staffName: 'Engr. Maria Santos',
            staffRole: 'Evaluating Officer',
            timestamp: '2026-03-30T10:00:00.000Z',
            fromStatus: 'Submitted',
            toStatus: 'Evaluating',
          },
          {
            id: 'h2',
            action: 'Approved & Forwarded to Accountant',
            staffName: 'Engr. Maria Santos',
            staffRole: 'Evaluating Officer',
            remarks: 'Approved and forwarded to Accountant for review.',
            timestamp: '2026-03-30T10:15:00.000Z',
            fromStatus: 'Evaluating',
            toStatus: 'ForAccountant',
          },
          {
            id: 'h3',
            action: 'Financial Review Started',
            staffName: 'Ann Accountant',
            staffRole: 'Accountant',
            remarks: 'Financial review started by Ann Accountant. Authority claimed.',
            timestamp: '2026-03-30T10:30:00.000Z',
            fromStatus: 'ForAccountant',
            toStatus: 'ForAccountant',
          },
        ],
        statementsOfAccount: [],
        ordersOfPayment: [],
        correctionAuditTrails: [],
      };

      const ui = mapApplicationDtoToUI(claimedDto, 'Accountant');

      // 1. Evaluating officer is still Engr. Maria Santos
      expect(ui.evaluatingOfficer).toBe('Engr. Maria Santos');
      // 2. Accounting officer is now Ann Accountant
      expect(ui.accountingOfficer).toBe('Ann Accountant');
      // 3. Assigned to is Ann Accountant
      expect(ui.assignedTo).toBe('Ann Accountant');

      // 4. Test stage evaluation state for Ann Accountant: Must be claimed by me!
      const acctState = computeOfficerEvaluationState({
        application: ui,
        identifiers: ['ann accountant', 'accountant@ntc.gov.ph'],
      });
      expect(acctState.isStageUnclaimed).toBe(false);
      expect(acctState.isStageClaimedByOther).toBe(false);
      expect(acctState.isStageClaimedByMe).toBe(true);

      // 5. Test stage evaluation state for another user: Must be locked / claimed by other!
      const otherState = computeOfficerEvaluationState({
        application: ui,
        identifiers: ['other accountant', 'other@ntc.gov.ph'],
      });
      expect(otherState.isStageUnclaimed).toBe(false);
      expect(otherState.isStageClaimedByOther).toBe(true);
      expect(otherState.isStageClaimedByMe).toBe(false);
    });

    it('correctly transitions to unclaimed when Accountant releases application (Financial Review Released)', () => {
      const releasedDto: ApplicationDto = {
        id: 'app-fwd-release',
        tenantId: 'tenant-1',
        submissionMode: 'Single',
        isGuest: false,
        referenceNumber: 'REF-2026-REL1',
        applicationNumber: 'APP-2026-REL1',
        status: 'ForAccountant',
        office: 'NTC Central Office',
        createdAt: '2026-03-30T10:00:00.000Z',
        lastModifiedAt: '2026-03-30T10:45:00.000Z',
        intent: 'Regular',
        services: [],
        applicants: [],
        histories: [
          {
            id: 'h1',
            action: 'Evaluation Started',
            staffName: 'Engr. Maria Santos',
            staffRole: 'Evaluating Officer',
            timestamp: '2026-03-30T10:00:00.000Z',
            fromStatus: 'Submitted',
            toStatus: 'Evaluating',
          },
          {
            id: 'h2',
            action: 'Approved & Forwarded to Accountant',
            staffName: 'Engr. Maria Santos',
            staffRole: 'Evaluating Officer',
            timestamp: '2026-03-30T10:15:00.000Z',
            fromStatus: 'Evaluating',
            toStatus: 'ForAccountant',
          },
          {
            id: 'h3',
            action: 'Financial Review Started',
            staffName: 'Ann Accountant',
            staffRole: 'Accountant',
            remarks: 'Financial review started by Ann Accountant. Authority claimed.',
            timestamp: '2026-03-30T10:30:00.000Z',
            fromStatus: 'ForAccountant',
            toStatus: 'ForAccountant',
          },
          {
            id: 'h4',
            action: 'Financial Review Released',
            staffName: 'Ann Accountant',
            staffRole: 'Accountant',
            remarks: 'Financial review released by Ann Accountant. Returned to queue.',
            timestamp: '2026-03-30T10:45:00.000Z',
            fromStatus: 'ForAccountant',
            toStatus: 'ForAccountant',
          },
        ],
        statementsOfAccount: [],
        ordersOfPayment: [],
        correctionAuditTrails: [],
      };

      const ui = mapApplicationDtoToUI(releasedDto, 'Accountant');

      // 1. Accounting officer should be undefined / cleared
      expect(ui.accountingOfficer).toBeUndefined();
      // 2. AssignedTo should be office (not Ann Accountant)
      expect(ui.assignedTo).toBe('NTC Central Office');

      // 3. Test stage evaluation state for Ann Accountant: Must be unclaimed!
      const acctState = computeOfficerEvaluationState({
        application: ui,
        identifiers: ['ann accountant', 'accountant@ntc.gov.ph'],
      });
      expect(acctState.isStageUnclaimed).toBe(true);
      expect(acctState.isStageClaimedByOther).toBe(false);
      expect(acctState.isStageClaimedByMe).toBe(false);

      // 4. Test stage evaluation state for another accountant: Must also be unclaimed so they can take it!
      const otherState = computeOfficerEvaluationState({
        application: ui,
        identifiers: ['other accountant', 'other@ntc.gov.ph'],
      });
      expect(otherState.isStageUnclaimed).toBe(true);
      expect(otherState.isStageClaimedByOther).toBe(false);
      expect(otherState.isStageClaimedByMe).toBe(false);
    });

    it('correctly transitions to unclaimed when Cashier releases application (Payment Verification Released)', () => {
      const cashierReleasedDto: ApplicationDto = {
        id: 'app-cashier-release',
        tenantId: 'tenant-1',
        submissionMode: 'Single',
        isGuest: false,
        referenceNumber: 'REF-2026-REL2',
        applicationNumber: 'APP-2026-REL2',
        status: 'PendingPayment',
        office: 'NTC Central Office',
        createdAt: '2026-03-30T10:00:00.000Z',
        lastModifiedAt: '2026-03-30T11:00:00.000Z',
        intent: 'Regular',
        services: [],
        applicants: [],
        histories: [
          {
            id: 'h1',
            action: 'Payment Verification Started',
            staffName: 'Carlos Cashier',
            staffRole: 'Cashier',
            remarks: 'Payment verification started by Carlos Cashier. Authority claimed.',
            timestamp: '2026-03-30T10:45:00.000Z',
            fromStatus: 'PendingPayment',
            toStatus: 'PendingPayment',
          },
          {
            id: 'h2',
            action: 'Payment Verification Released',
            staffName: 'Carlos Cashier',
            staffRole: 'Cashier',
            remarks: 'Payment verification released by Carlos Cashier. Returned to queue.',
            timestamp: '2026-03-30T11:00:00.000Z',
            fromStatus: 'PendingPayment',
            toStatus: 'PendingPayment',
          },
        ],
        statementsOfAccount: [],
        ordersOfPayment: [],
        correctionAuditTrails: [],
      };

      const ui = mapApplicationDtoToUI(cashierReleasedDto, 'Cashier');

      // 1. Cashier officer should be undefined / cleared
      expect(ui.cashierOfficer).toBeUndefined();
      // 2. AssignedTo should be office
      expect(ui.assignedTo).toBe('NTC Central Office');

      // 3. Test stage evaluation state for Carlos: Must be unclaimed!
      const cashierState = computeOfficerEvaluationState({
        application: ui,
        identifiers: ['carlos cashier', 'cashier@ntc.gov.ph'],
      });
      expect(cashierState.isStageUnclaimed).toBe(true);
      expect(cashierState.isStageClaimedByOther).toBe(false);
      expect(cashierState.isStageClaimedByMe).toBe(false);

      // 4. Test stage evaluation state for another cashier: Must also be unclaimed so they can take it!
      const otherCashierState = computeOfficerEvaluationState({
        application: ui,
        identifiers: ['other cashier', 'other.cashier@ntc.gov.ph'],
      });
      expect(otherCashierState.isStageUnclaimed).toBe(true);
      expect(otherCashierState.isStageClaimedByOther).toBe(false);
      expect(otherCashierState.isStageClaimedByMe).toBe(false);
    });
  });

  describe('mapActivityDtoToUI', () => {
    it('correctly maps minimal ApplicationActivityDto to ApplicationData for activities feed', () => {
      const dto: ApplicationActivityDto = {
        id: 'act-1',
        referenceNumber: 'APP-2026-001',
        applicationNumber: 'APP-2026-001',
        applicantName: 'Juan Dela Cruz',
        applicantType: 'Individual',
        serviceName: 'Radio Station License',
        serviceCategory: 'Licenses',
        serviceVariantName: 'New',
        element: 'VHF',
        status: 'Evaluating',
        queueTab: 'pending',
        fieldOffice: 'NCR - Central Office',
        officerInCharge: 'Engr. Evaluator',
        assignedTo: 'Engr. Evaluator',
        evaluatingOfficer: 'Engr. Evaluator',
        accountingOfficer: undefined,
        cashierOfficer: undefined,
        issuingOfficer: undefined,
        endorsedTo: undefined,
        submittedAt: '2026-11-05T08:00:00Z',
        createdAt: '2026-11-05T08:00:00Z',
        updatedAt: '2026-11-05T08:30:00Z',
        submissionMode: 'Single',
        isPinned: false,
        isArchived: false,
        officialReceiptNumber: 'OR-99881',
      };

      const ui = mapActivityDtoToUI(dto, 'Evaluator');

      expect(ui.id).toBe('act-1');
      expect(ui.applicant).toBe('Juan Dela Cruz');
      expect(ui.applicantType).toBe('Individual');
      expect(ui.referenceNumber).toBe('APP-2026-001');
      expect(ui.applicationNumber).toBe('APP-2026-001');
      expect(ui.serviceName).toBe('Radio Station License');
      expect(ui.serviceCategory).toBe('Licenses');
      expect(ui.serviceVariantName).toBe('New');
      expect(ui.permitTitle).toBe('Radio Station License - New');
      expect(ui.element).toBe('VHF');
      expect(ui.category).toBe('Licenses');
      expect(ui.status).toBe('Evaluating');
      expect(ui.queueTab).toBe('pending');
      expect(ui.office).toBe('NCR - Central Office');
      expect(ui.assignedTo).toBe('Engr. Evaluator');
      expect(ui.evaluatingOfficer).toBe('Engr. Evaluator');
      expect(ui.createdAt).toBe('2026-11-05T08:00:00Z');
      expect(ui.officialReceiptNumber).toBe('OR-99881');
      expect(ui.isPinned).toBe(false);
      expect(ui.isArchived).toBe(false);
    });

    it('falls back to serviceName when serviceVariantName is not provided', () => {
      const dto: ApplicationActivityDto = {
        id: 'act-2',
        referenceNumber: 'APP-2026-002',
        applicationNumber: 'APP-2026-002',
        applicantName: 'Acme Corp',
        applicantType: 'Company',
        serviceName: 'Dealer Permit',
        serviceCategory: 'Permits',
        status: 'Submitted',
        fieldOffice: 'Region VII',
        submittedAt: '2026-11-05T09:00:00Z',
        createdAt: '2026-11-05T09:00:00Z',
        submissionMode: 'Single',
        isPinned: false,
        isArchived: false,
      };

      const ui = mapActivityDtoToUI(dto);

      expect(ui.applicant).toBe('Acme Corp');
      expect(ui.applicantType).toBe('Company');
      expect(ui.permitTitle).toBe('Dealer Permit');
      expect(ui.category).toBe('Permits');
      expect(ui.office).toBe('Region VII');
      expect(ui.status).toBe('Submitted');
    });

    it('maps serviceVariantName, serviceVariantType, applicationType, and element across application, services, and applicantsList', () => {
      const dto: ApplicationDto = {
        id: 'app-exam-full-1',
        tenantId: 'tenant-1',
        applicationNumber: 'APP-EXAM-001',
        referenceNumber: 'REF-EXAM-001',
        status: 'Submitted',
        submissionMode: 'Single',
        isGuest: false,
        createdAt: '2026-11-10T10:00:00Z',
        serviceId: 'svc-exam-1',
        serviceName: 'Radio Operator Examination Admission',
        serviceCategory: 'Exams',
        serviceVariantName: 'Amateur',
        serviceVariantType: 'First Taker',
        element: 'Class C — Elements 2, 3 & 4',
        services: [
          {
            id: 'svc-item-exam-1',
            applicantId: 'applicant-exam-1',
            serviceId: 'svc-exam-1',
            serviceName: 'Radio Operator Examination Admission',
            serviceCategory: 'Exams',
            serviceVariantName: 'Amateur',
            applicationType: 'First Taker',
            element: 'Class C — Elements 2, 3 & 4',
          },
        ],
        applicants: [
          {
            id: 'applicant-exam-1',
            tenantId: 'tenant-1',
            isGuest: false,
            applicantType: 'Individual',
            serviceVariantName: 'Amateur',
            applicationType: 'First Taker',
            element: 'Class C — Elements 2, 3 & 4',
          },
        ],
        statementsOfAccount: [],
        ordersOfPayment: [],
        histories: [],
        correctionAuditTrails: [],
      };

      const ui = mapApplicationDtoToUI(dto);
      expect(ui.serviceName).toBe('Radio Operator Examination Admission');
      expect(ui.serviceVariantName).toBe('Amateur');
      expect(ui.serviceVariantType).toBe('First Taker');
      expect(ui.element).toBe('Class C — Elements 2, 3 & 4');
      expect(ui.services?.[0]?.serviceVariantName).toBe('Amateur');
      expect(ui.services?.[0]?.applicationType).toBe('First Taker');
      expect(ui.services?.[0]?.element).toBe('Class C — Elements 2, 3 & 4');
      expect(ui.applicantsList?.[0]?.serviceVariantName).toBe('Amateur');
      expect(ui.applicantsList?.[0]?.applicationType).toBe('First Taker');
      expect(ui.applicantsList?.[0]?.element).toBe('Class C — Elements 2, 3 & 4');
    });

    it('populates basicInfo (firstName, middleName, lastName, extensionName, dob, sex, civilStatus, nationality) and companyDetails on applicantsList items for EditApplicantProfileModal', () => {
      const dto: ApplicationDto = {
        id: 'app-profile-edit-1',
        tenantId: 'tenant-1',
        applicationNumber: 'APP-PROF-001',
        referenceNumber: 'REF-PROF-001',
        status: 'Evaluating',
        submissionMode: 'Single',
        isGuest: false,
        createdAt: '2026-11-10T10:00:00Z',
        filingUser: {
          id: 'user-1',
          name: 'Maria Clara De Los Santos Jr.',
          email: 'maria.santos@example.com',
          accountType: 'Individual',
        },
        applicants: [
          {
            id: 'applicant-prof-1',
            tenantId: 'tenant-1',
            isGuest: false,
            applicantType: 'Individual',
            details: {
              id: 'det-1',
              address: '45 Mabini St',
              barangayName: 'Poblacion',
              cityMunicipalityName: 'Makati City',
              provinceName: 'Metro Manila',
              regionName: 'NCR',
              zipCode: '1210',
              firstName: '',
              lastName: '',
              nationality: 'Filipino',
              sex: 'Female',
              civilStatus: 'Single',
              birthDate: '1995-08-20',
              contactNumber: '09171234567',
              emailAddress: 'maria.santos@example.com',
            },
          },
        ],
        statementsOfAccount: [],
        ordersOfPayment: [],
        histories: [],
        correctionAuditTrails: [],
      };

      const ui = mapApplicationDtoToUI(dto);
      const item = ui.applicantsList?.[0];
      expect(item).toBeDefined();
      expect(item?.basicInfo?.firstName).toBe('Maria');
      expect(item?.basicInfo?.middleName).toBe('Clara');
      expect(item?.basicInfo?.lastName).toBe('De Los Santos');
      expect(item?.basicInfo?.extensionName).toBe('Jr.');
      expect(item?.basicInfo?.dob).toBe('1995-08-20');
      expect(item?.basicInfo?.sex).toBe('Female');
      expect(item?.basicInfo?.civilStatus).toBe('Single');
      expect(item?.basicInfo?.nationality).toBe('Filipino');
      expect(item?.barangay).toBe('Poblacion');
      expect(item?.city).toBe('Makati City');
      expect(item?.province).toBe('Metro Manila');
      expect(item?.region).toBe('NCR');
      expect(item?.zipCode).toBe('1210');
    });
  });
});
