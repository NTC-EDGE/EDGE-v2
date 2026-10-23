import {
  mapApiApplicationToApplication,
  isApplicationPaymentSubmitted,
  getStatusLabel,
  getStatusColor,
  getStatusBgColor,
  ApiApplicationDto,
  Application,
} from '../data/applicationsData';

describe('Application Card and Details Status Synchronization', () => {
  it('identifies an application with payment submitted and awaiting Cashier verification', () => {
    const appWithProcessingOp: Partial<Application> = {
      id: 'app-1',
      referenceNumber: 'NTC-2026-0001',
      status: 'READY_FOR_PAYMENT',
      remarks: 'Payment submitted via GCash. Ref: 987654. Awaiting Cashier verification.',
      op: {
        id: 'op-1',
        opNumber: 'OP-2026-0001',
        status: 'Processing',
        amountDue: 1380,
        amountReceived: 1380,
      },
    };

    expect(isApplicationPaymentSubmitted(appWithProcessingOp as Application)).toBe(true);
  });

  it('maps DTO with OpStatus="Processing" to PAYMENT_SUBMITTED status and mappedOp.status="Processing"', () => {
    const dto: ApiApplicationDto = {
      id: 'app-sync-1',
      referenceNumber: 'NTC-SYNC-001',
      status: 'PendingPayment',
      opStatus: 'Processing',
      opNumber: 'OP-SYNC-001',
      amountPaid: 1500,
      remarks: 'Payment submitted via Check. Waiting for Cashier verification.',
      histories: [
        {
          id: 'h-1',
          action: 'Client submitted payment via Check (Bank: BDO). Awaiting Cashier verification.',
          toStatus: 'PendingPayment',
          timestamp: '2026-10-23T10:00:00Z',
        },
      ],
    };

    const mapped = mapApiApplicationToApplication(dto);

    // Status on the application model
    expect(mapped.status).toBe('PAYMENT_SUBMITTED');
    expect(getStatusLabel(mapped.status)).toBe('Verification in Progress');
    expect(getStatusColor(mapped.status)).toBe('#0284C7');
    expect(getStatusBgColor(mapped.status)).toBe('#E0F2FE');

    // OpData on the mapped model
    expect(mapped.op).toBeDefined();
    expect(mapped.op?.status).toBe('Processing');
    expect(mapped.op?.opNumber).toBe('OP-SYNC-001');

    // Helper evaluation
    expect(isApplicationPaymentSubmitted(mapped)).toBe(true);
  });

  it('does NOT treat application with Official Receipt issued as payment submitted', () => {
    const paidDto: ApiApplicationDto = {
      id: 'app-paid-1',
      referenceNumber: 'NTC-PAID-001',
      status: 'ForIssuance',
      officialReceiptNumber: 'OR-88888',
      opStatus: 'Paid',
      remarks: 'Payment submitted previously. OR officially issued.',
    };

    const mapped = mapApiApplicationToApplication(paidDto);
    expect(isApplicationPaymentSubmitted(mapped)).toBe(false);
  });

  it('keeps READY_FOR_PAYMENT for newly billed applications before client submits payment', () => {
    const unpaidDto: ApiApplicationDto = {
      id: 'app-unpaid-1',
      referenceNumber: 'NTC-UNPAID-001',
      status: 'PendingPayment',
      opStatus: 'Billed',
      opNumber: 'OP-UNPAID-001',
      soaNumber: 'SOA-UNPAID-001',
    };

    const mapped = mapApiApplicationToApplication(unpaidDto);
    expect(mapped.status).toBe('READY_FOR_PAYMENT');
    expect(getStatusLabel(mapped.status)).toBe('For Payment');
    expect(isApplicationPaymentSubmitted(mapped)).toBe(false);
  });

  it('detects payment submission from remarks even when OpStatus was not yet populated', () => {
    const remarksOnlyDto: ApiApplicationDto = {
      id: 'app-remarks-1',
      referenceNumber: 'NTC-REM-001',
      status: 'PendingPayment',
      remarks: 'Payment submitted via GCash (Ref: 12345). Awaiting cashier verification.',
    };

    const mapped = mapApiApplicationToApplication(remarksOnlyDto);
    expect(mapped.status).toBe('PAYMENT_SUBMITTED');
    expect(isApplicationPaymentSubmitted(mapped)).toBe(true);
    expect(mapped.op?.status).toBe('Processing');
  });
});
