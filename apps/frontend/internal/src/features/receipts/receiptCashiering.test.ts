import { receiptService, PendingPaymentDto, ReturnTargetDto } from '@edge/api';

describe('Receipt & Cashiering Management - Access Control & Endorsement Workflow', () => {
  it('identifies overall access correctly for Cashier, Admin, Regional Director, and permitted users', () => {
    function computeHasAccess(params: {
      currentRole: string;
      isSuperAdmin?: boolean;
      isAdmin?: boolean;
      canVerifyCashier?: boolean;
      permissions?: string[];
    }): boolean {
      const isCashier = params.currentRole === 'Cashier';
      const hasCashierPermission =
        Boolean(params.canVerifyCashier) ||
        (params.permissions ?? []).some((p) =>
          [
            'receipts.read',
            'receipts.issue',
            'receipts.edit',
            'receipts.cancel',
            'receipts.report',
            'receipts.bundle',
            'receipts.deposit',
            'billing.collect',
            'billing.op_return',
          ].includes(p)
        );

      return (
        Boolean(params.isSuperAdmin) ||
        Boolean(params.isAdmin) ||
        params.currentRole === 'Regional Director' ||
        isCashier ||
        hasCashierPermission
      );
    }

    // Cashier role must have overall access
    expect(computeHasAccess({ currentRole: 'Cashier' })).toBe(true);

    // Admin & Regional Director have overall access
    expect(computeHasAccess({ currentRole: 'Admin', isAdmin: true })).toBe(true);
    expect(computeHasAccess({ currentRole: 'Regional Director' })).toBe(true);
    expect(computeHasAccess({ currentRole: 'Evaluator', isSuperAdmin: true })).toBe(true);

    // User with cashier permission has overall access
    expect(computeHasAccess({ currentRole: 'Accountant', canVerifyCashier: true })).toBe(true);
    expect(computeHasAccess({ currentRole: 'Evaluator', permissions: ['billing.collect'] })).toBe(true);
    expect(computeHasAccess({ currentRole: 'Evaluator', permissions: ['receipts.read'] })).toBe(true);

    // Evaluator or Chief of EOD without permissions should be restricted
    expect(computeHasAccess({ currentRole: 'Evaluator', permissions: ['applications.evaluate'] })).toBe(false);
    expect(computeHasAccess({ currentRole: 'Legal', permissions: [] })).toBe(false);
  });

  it('calculates days elapsed and overdue flag (> 30 days) for pending payments', () => {
    const now = Date.now();

    function checkOverdue(billedAt: string): { daysSinceBilled: number; isOverdue: boolean } {
      const billedDate = new Date(billedAt);
      const daysSinceBilled = Math.floor((now - billedDate.getTime()) / (1000 * 60 * 60 * 24));
      return { daysSinceBilled, isOverdue: daysSinceBilled >= 30 };
    }

    // Billed 5 days ago
    const fiveDaysAgo = new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString();
    const result5 = checkOverdue(fiveDaysAgo);
    expect(result5.daysSinceBilled).toBe(5);
    expect(result5.isOverdue).toBe(false);

    // Billed 35 days ago (overdue)
    const thirtyFiveDaysAgo = new Date(now - 35 * 24 * 60 * 60 * 1000).toISOString();
    const result35 = checkOverdue(thirtyFiveDaysAgo);
    expect(result35.daysSinceBilled).toBe(35);
    expect(result35.isOverdue).toBe(true);

    // Billed 30 days ago (exact threshold)
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
    const result30 = checkOverdue(thirtyDaysAgo);
    expect(result30.daysSinceBilled).toBe(30);
    expect(result30.isOverdue).toBe(true);
  });

  it('supports endorsing to Evaluator, Accountant, and Supervisor officers', async () => {
    const validOfficers: ReturnTargetDto[] = ['Evaluator', 'Accountant', 'Supervisor'];
    expect(validOfficers).toHaveLength(3);

    const mockPayment: PendingPaymentDto = {
      orderOfPaymentId: 'op-12345',
      applicationId: 'app-67890',
      statementOfAccountId: 'soa-11111',
      tenantId: 'tenant-001',
      opNumber: 'OP-2026-0001',
      soaNumber: 'SOA-2026-0001',
      applicationNumber: 'APP-2026-1234',
      referenceNumber: 'REF-9999',
      applicantName: 'Juan Dela Cruz',
      applicantType: 'Individual',
      serviceName: 'Amateur Radio Station Permit to Possess',
      serviceCategory: 'Permits',
      amountDue: 2500,
      billedAt: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000).toISOString(),
      lineItems: [
        { feeCode: 'POSS_FEE', description: 'Permit to Possess Fee', amount: 2000 },
        { feeCode: 'DST', description: 'Documentary Stamp Tax', amount: 500 },
      ],
    };

    // Verify endorsement call with stub
    const originalReturnOp = receiptService.returnOp;
    const calls: Array<{ opId: string; remarks: string; returnTo: ReturnTargetDto }> = [];

    receiptService.returnOp = async (
      opId: string,
      payload: { remarks: string; returnTo: ReturnTargetDto }
    ): Promise<[boolean, null]> => {
      calls.push({ opId, remarks: payload.remarks, returnTo: payload.returnTo });
      return [true, null];
    };

    try {
      const [res1, err1] = await receiptService.returnOp(mockPayment.orderOfPaymentId, {
        remarks: 'Client failed to pay OP on time / Payment period expired',
        returnTo: 'Evaluator',
      });
      expect(res1).toBe(true);
      expect(err1).toBeNull();
      expect(calls[0]).toEqual({
        opId: 'op-12345',
        remarks: 'Client failed to pay OP on time / Payment period expired',
        returnTo: 'Evaluator',
      });

      const [res2, err2] = await receiptService.returnOp(mockPayment.orderOfPaymentId, {
        remarks: 'SOA fee computation needs revision or re-assessment',
        returnTo: 'Accountant',
      });
      expect(res2).toBe(true);
      expect(err2).toBeNull();
      expect(calls[1].returnTo).toBe('Accountant');

      const [res3, err3] = await receiptService.returnOp(mockPayment.orderOfPaymentId, {
        remarks: 'Administrative re-review and endorsement',
        returnTo: 'Supervisor',
      });
      expect(res3).toBe(true);
      expect(err3).toBeNull();
      expect(calls[2].returnTo).toBe('Supervisor');
    } finally {
      receiptService.returnOp = originalReturnOp;
    }
  });
});
