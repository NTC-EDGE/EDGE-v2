import {
  ApplicantDto,
  ApplicationDetailDto,
  ApplicationFeedDto,
  OrderOfPaymentDto,
  StatementOfAccountDto,
} from '@edge/api';
import {
  deriveQueueTab,
  deriveServiceName,
  formatDateLabel,
  mapBEStatusToFE,
  mapPaymentDetails,
  mapSoaItems,
  mapStatementsOfAccount,
  computeConsolidatedSoa,
  mapToApplicationData,
} from '../index';

describe('Queue Application Mappers (applicationUiMapper & sub-mappers)', () => {
  describe('serviceMapper', () => {
    it('derives single service name correctly', () => {
      const applicants: ApplicantDto[] = [
        {
          id: 'app-1',
          tenantId: 't-1',
          isGuest: false,
          applicantType: 'Individual',
          serviceId: 'Radio Station License',
        },
      ];
      expect(deriveServiceName(applicants, false)).toBe('Radio Station License');
    });

    it('derives bulk service names combined up to 2 items', () => {
      const applicants: ApplicantDto[] = [
        {
          id: 'app-1',
          tenantId: 't-1',
          isGuest: false,
          applicantType: 'Individual',
          serviceId: 'Service A',
        },
        {
          id: 'app-2',
          tenantId: 't-1',
          isGuest: false,
          applicantType: 'Individual',
          serviceId: 'Service B',
        },
        {
          id: 'app-3',
          tenantId: 't-1',
          isGuest: false,
          applicantType: 'Individual',
          serviceId: 'Service C',
        },
      ];
      expect(deriveServiceName(applicants, true)).toBe('Service A, Service B');
    });

    it('returns empty string if applicants are undefined or empty', () => {
      expect(deriveServiceName(undefined, false)).toBe('');
      expect(deriveServiceName([], true)).toBe('');
    });
  });

  describe('statusMapper', () => {
    it('maps known BE statuses to FE statuses', () => {
      expect(mapBEStatusToFE('Evaluating')).toBe('Evaluating');
      expect(mapBEStatusToFE('Approved')).toBe('Approved');
      expect(mapBEStatusToFE('Returned')).toBe('Returned');
    });

    it('falls back to Submitted for unknown statuses', () => {
      expect(mapBEStatusToFE('UnknownStatus')).toBe('Submitted');
      expect(mapBEStatusToFE(undefined)).toBe('Submitted');
    });

    it('derives correct queue tabs', () => {
      expect(deriveQueueTab('Submitted')).toBe('pending');
      expect(deriveQueueTab('Evaluating')).toBe('pending');
      expect(deriveQueueTab('Approved')).toBe('history');
      expect(deriveQueueTab('Returned')).toBe('history');
      expect(deriveQueueTab('Completed')).toBe('history');
      expect(deriveQueueTab('Draft')).toBe('activity');
    });

    it('formats date label gracefully', () => {
      expect(formatDateLabel('2026-08-14T00:00:00Z')).toBe('Aug 14, 2026');
      expect(formatDateLabel(undefined)).toBe('');
      expect(formatDateLabel('invalid-date')).toBe('');
    });
  });

  describe('financialMapper', () => {
    it('maps SOA line items cleanly', () => {
      const soas: StatementOfAccountDto[] = [
        {
          id: 'soa-1',
          applicationId: 'app-1',
          soaNumber: 'SOA-001',
          totalAmount: 500,
          status: 'Pending',
          dueDate: '2026-09-01',
          issuedToType: 'Individual',
          issuedToName: 'John Doe',
          lineItems: [
            {
              id: 'item-1',
              particular: 'Filing Fee',
              itemCode: 'FF-01',
              noOfUnits: 1,
              feeRate: 500,
              amount: 500,
              validityYears: 1,
            },
          ],
          histories: [],
        },
      ];
      const items = mapSoaItems(soas);
      expect(items).toHaveLength(1);
      expect(items[0]).toEqual({
        id: 'item-1',
        particular: 'Filing Fee',
        validityYears: 1,
        percentage: 0,
        noOfUnits: 1,
        fees: 500,
        amount: 500,
        code: 'FF-01',
        description: undefined,
        applicantId: undefined,
        applicantName: 'John Doe',
      });
    });

    it('maps statements of account and computes dynamic consolidated SOA', () => {
      const soas: StatementOfAccountDto[] = [
        {
          id: 'soa-1',
          applicationId: 'app-1',
          applicantId: 'applicant-1',
          soaNumber: 'SOA-001',
          totalAmount: 500,
          status: 'Pending',
          dueDate: '2026-09-01T00:00:00Z',
          issuedToType: 'Individual',
          issuedToName: 'John Doe',
          lineItems: [
            {
              id: 'item-1',
              particular: 'Filing Fee',
              itemCode: 'FF-01',
              noOfUnits: 1,
              feeRate: 500,
              amount: 500,
              validityYears: 1,
            },
          ],
          histories: [],
        },
        {
          id: 'soa-2',
          applicationId: 'app-1',
          applicantId: 'applicant-2',
          soaNumber: 'SOA-002',
          totalAmount: 300,
          status: 'Pending',
          dueDate: '2026-09-01T00:00:00Z',
          issuedToType: 'Individual',
          issuedToName: 'Jane Smith',
          lineItems: [
            {
              id: 'item-2',
              particular: 'Processing Fee',
              itemCode: 'PF-01',
              noOfUnits: 1,
              feeRate: 300,
              amount: 300,
              validityYears: 1,
            },
          ],
          histories: [],
        },
      ];

      const mappedSoas = mapStatementsOfAccount(soas);
      expect(mappedSoas).toHaveLength(2);
      expect(mappedSoas[0].totalAmount).toBe(500);
      expect(mappedSoas[1].totalAmount).toBe(300);

      const consolidated = computeConsolidatedSoa(mappedSoas, 'APP-2026-001', 'Acme Corp');
      expect(consolidated.id).toBe('consolidated');
      expect(consolidated.totalAmount).toBe(800);
      expect(consolidated.lineItems).toHaveLength(2);
      expect(consolidated.issuedToName).toBe('Acme Corp');
    });

    it('maps Payment Details cleanly', () => {
      const oops: OrderOfPaymentDto[] = [
        {
          id: 'oop-1',
          applicationId: 'app-1',
          statementOfAccountId: 'soa-1',
          opNumber: 'OP-001',
          status: 'Paid',
          amountDue: 500,
          amountReceived: 500,
          paymentMethod: 'Check',
          officialReceiptNumber: 'OR-12345',
          checkNumber: 'CHK-999',
          checkName: 'Bank of EDGE',
          histories: [],
        },
      ];
      const payment = mapPaymentDetails(oops);
      expect(payment.method).toBe('check');
      expect(payment.orNumber).toBe('OR-12345');
      expect(payment.checkNumber).toBe('CHK-999');
    });
  });

  describe('mapToApplicationData', () => {
    it('maps ApplicationDetailDto with separated applicants list into ApplicationData', () => {
      const mockDetailDto: ApplicationDetailDto = {
        id: '11111111-2222-3333-4444-555555555555',
        tenantId: 'tenant-1',
        status: 'Evaluating',
        submissionMode: 'Single',
        isGuest: false,
        createdAt: '2026-08-14T08:00:00Z',
        filingUser: {
          id: 'u-1',
          name: 'Jane Smith',
          email: 'jane@example.com',
          accountType: 'Individual',
        },
        statementsOfAccount: [],
        ordersOfPayment: [],
        histories: [],
        correctionAuditTrails: [],
      };

      const mockApplicants: ApplicantDto[] = [
        {
          id: 'app-1',
          tenantId: 'tenant-1',
          isGuest: false,
          applicantType: 'Individual',
          serviceId: 'Dealer Permit',
          details: {
            id: 'det-1',
            firstName: 'Jane',
            lastName: 'Smith',
            nationality: 'Filipino',
            sex: 'Female',
            contactNumber: '09123456789',
            email: 'jane@example.com',
            address: '123 Main St',
          },
        },
      ];

      const result = mapToApplicationData(mockDetailDto, mockApplicants);

      expect(result.id).toBe('11111111-2222-3333-4444-555555555555');
      expect(result.applicant).toBe('Jane Smith');
      expect(result.serviceName).toBe('Dealer Permit');
      expect(result.status).toBe('Evaluating');
      expect(result.queueTab).toBe('pending');
      expect(result.applicationType).toBe('SINGLE');
      expect(result.applicantsList).toHaveLength(1);
    });

    it('maps ApplicationFeedDto into ApplicationData directly', () => {
      const mockFeedDto: ApplicationFeedDto = {
        id: '22222222-3333-4444-5555-666666666666',
        status: 'Submitted',
        submissionMode: 'Single',
        isGuest: false,
        createdAt: '2026-08-14T09:00:00Z',
        applicantCount: 1,
        services: [
          {
            name: 'Builder Permit',
            variant: 'New',
          },
        ],
        filingUser: {
          id: 'u-2',
          name: 'Bob Builder',
          email: 'bob@example.com',
          accountType: 'Individual',
        },
      };

      const result = mapToApplicationData(mockFeedDto);

      expect(result.id).toBe('22222222-3333-4444-5555-666666666666');
      expect(result.applicant).toBe('Bob Builder');
      expect(result.serviceName).toBe('Builder Permit');
      expect(result.status).toBe('Submitted');
      expect(result.queueTab).toBe('pending');
      expect(result.applicationType).toBe('SINGLE');
    });
  });
});
