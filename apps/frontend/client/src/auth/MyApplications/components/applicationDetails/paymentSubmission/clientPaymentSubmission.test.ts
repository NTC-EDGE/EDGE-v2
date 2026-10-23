import {
  serializePaymentBreakdown,
  parsePaymentBreakdown,
  PaymentBreakdown,
  SubmitPaymentRequest,
} from '@edge/api';
import { CheckProofFile, CombinationRow } from './paymentSubmissionTypes';

describe('Client Payment Submission & Check Proof', () => {
  it('serializes single check payment breakdown with proof of check metadata', () => {
    const breakdown: PaymentBreakdown = {
      isCombination: false,
      totalAmount: 5000,
      items: [
        {
          id: 'chk-1',
          mode: 'Check',
          amount: 5000,
          checkNumber: '00098765',
          checkBank: 'Land Bank of the Philippines',
          checkDate: '2026-10-25',
          proofFileId: 'stored-file-123',
          proofFileName: 'check_scan_00098765.jpg',
          proofFileUri: 'file:///tmp/check_scan_00098765.jpg',
        },
      ],
      payorName: 'Juan Dela Cruz',
      userNotes: 'Urgent station permit processing',
      proofOfPaymentFileId: 'stored-file-123',
      proofFileName: 'check_scan_00098765.jpg',
      proofFileUri: 'file:///tmp/check_scan_00098765.jpg',
    };

    const serialized = serializePaymentBreakdown(breakdown);
    expect(serialized).toContain('Check (Land Bank of the Philippines #00098765, 2026-10-25)');
    expect(serialized).toContain('stored-file-123');
    expect(serialized).toContain('check_scan_00098765.jpg');

    const parsed = parsePaymentBreakdown(serialized);
    expect(parsed).not.toBeNull();
    expect(parsed?.isCombination).toBe(false);
    expect(parsed?.totalAmount).toBe(5000);
    expect(parsed?.items[0]?.mode).toBe('Check');
    expect(parsed?.items[0]?.checkNumber).toBe('00098765');
    expect(parsed?.items[0]?.checkBank).toBe('Land Bank of the Philippines');
    expect(parsed?.items[0]?.proofFileId).toBe('stored-file-123');
    expect(parsed?.items[0]?.proofFileName).toBe('check_scan_00098765.jpg');
    expect(parsed?.proofOfPaymentFileId).toBe('stored-file-123');
  });

  it('serializes combination payment breakdown with check proof attached', () => {
    const breakdown: PaymentBreakdown = {
      isCombination: true,
      totalAmount: 10000,
      items: [
        {
          id: 'comb-1',
          mode: 'Cash',
          amount: 4000,
        },
        {
          id: 'comb-2',
          mode: 'Check',
          amount: 6000,
          checkNumber: 'CHK-44321',
          checkBank: 'BDO Unibank',
          checkDate: '2026-10-26',
          proofFileId: 'stored-proof-chk-44321',
          proofFileName: 'bdo_check_44321.pdf',
        },
      ],
      payorName: 'Acme Radio Communications Inc.',
      proofOfPaymentFileId: 'stored-proof-chk-44321',
    };

    const serialized = serializePaymentBreakdown(breakdown);
    expect(serialized).toContain('Combination Payment:');
    expect(serialized).toContain('Cash: ₱4,000.00');
    expect(serialized).toContain('Check (BDO Unibank #CHK-44321, 2026-10-26): ₱6,000.00');

    const parsed = parsePaymentBreakdown(serialized);
    expect(parsed).not.toBeNull();
    expect(parsed?.isCombination).toBe(true);
    expect(parsed?.items.length).toBe(2);

    const checkItem = parsed?.items.find((i) => i.mode === 'Check');
    expect(checkItem).not.toBeUndefined();
    expect(checkItem?.checkNumber).toBe('CHK-44321');
    expect(checkItem?.checkBank).toBe('BDO Unibank');
    expect(checkItem?.proofFileId).toBe('stored-proof-chk-44321');
    expect(checkItem?.proofFileName).toBe('bdo_check_44321.pdf');
    expect(parsed?.proofOfPaymentFileId).toBe('stored-proof-chk-44321');
  });

  it('correctly maps SubmitPaymentRequest with proofOfPaymentFileId for single and combination modes', () => {
    const singlePayload: SubmitPaymentRequest = {
      orderOfPaymentId: 'op-001',
      paymentMethod: 'Check',
      referenceNumber: '00012345',
      payorName: 'Santos Maria',
      amountPaid: 3500,
      checkNumber: '00012345',
      checkBank: 'Bank of the Philippine Islands',
      checkDate: '2026-10-24',
      proofOfPaymentFileId: 'stored-file-check-proof-abc',
      remarks: 'Single check payment with proof',
    };

    expect(singlePayload.paymentMethod).toBe('Check');
    expect(singlePayload.proofOfPaymentFileId).toBe('stored-file-check-proof-abc');
    expect(singlePayload.checkNumber).toBe('00012345');

    const combinationRows: CombinationRow[] = [
      {
        id: 'r-1',
        mode: 'Cash',
        amount: '1500',
        checkNumber: '',
        checkBank: '',
        checkDate: '',
        referenceNumber: '',
        checkProofFile: null,
      },
      {
        id: 'r-2',
        mode: 'Check',
        amount: '2000',
        checkNumber: '0008899',
        checkBank: 'Security Bank',
        checkDate: '2026-10-25',
        referenceNumber: '',
        checkProofFile: {
          name: 'sec_bank_check.png',
          uri: 'file:///data/sec_bank_check.png',
          type: 'image/png',
          size: 102400,
        },
      },
    ];

    const checkRow = combinationRows.find((r) => r.mode === 'Check');
    expect(checkRow?.checkProofFile?.name).toBe('sec_bank_check.png');
    expect(checkRow?.checkProofFile?.type).toBe('image/png');
  });
});
