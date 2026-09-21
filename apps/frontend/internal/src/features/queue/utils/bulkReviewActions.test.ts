import { ApplicantItem } from '../../../types/application';

function applyBatchVerdict(
  applicants: ApplicantItem[],
  action: 'MarkAllComplete' | 'MarkAllForEndorsement'
): ApplicantItem[] {
  const targetStatus = action === 'MarkAllComplete' ? 'Complete' : 'ForEndorsement';
  return applicants.map((applicant) => ({
    ...applicant,
    status: targetStatus,
  }));
}

function applySingleApplicantVerdict(
  applicants: ApplicantItem[],
  targetIndex: number,
  newVerdict: 'Complete' | 'Incomplete' | 'ForEndorsement',
  remarks?: string
): ApplicantItem[] {
  return applicants.map((applicant, idx) => {
    if (idx !== targetIndex) return applicant;
    return {
      ...applicant,
      status: newVerdict,
      evaluationRemarks: remarks !== undefined && remarks.trim().length > 0 ? remarks.trim() : applicant.evaluationRemarks,
    };
  });
}

function cleanupBlobObjectUrl(uri?: string | null): boolean {
  if (
    typeof uri === 'string' &&
    uri.startsWith('blob:') &&
    typeof URL !== 'undefined' &&
    typeof URL.revokeObjectURL === 'function'
  ) {
    try {
      URL.revokeObjectURL(uri);
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

describe('Bulk Review Action Transitions', () => {
  const sampleApplicants: ApplicantItem[] = [
    {
      id: 'app-1',
      name: 'Alpha Communications Corp',
      applicantType: 'Company',
      status: 'Incomplete',
      evaluationRemarks: 'Missing SEC docs',
      contactNumber: '09171234567',
      email: 'alpha@example.com',
      address: 'Quezon City',
      streetAddress: 'Quezon City',
      barangay: 'Central',
      city: 'Quezon City',
      province: 'Metro Manila',
      zipCode: '1100',
      requirements: [],
    },
    {
      id: 'app-2',
      name: 'Beta Radio Services Inc',
      applicantType: 'Company',
      status: 'ForEndorsement',
      evaluationRemarks: 'Ready for evaluation',
      contactNumber: '09181234567',
      email: 'beta@example.com',
      address: 'Makati City',
      streetAddress: 'Makati City',
      barangay: 'Bel-Air',
      city: 'Makati City',
      province: 'Metro Manila',
      zipCode: '1209',
      requirements: [],
    },
    {
      id: 'app-3',
      name: 'Gamma Broadcast Ltd',
      applicantType: 'Company',
      status: 'Complete',
      evaluationRemarks: '',
      contactNumber: '09191234567',
      email: 'gamma@example.com',
      address: 'Pasig City',
      streetAddress: 'Pasig City',
      barangay: 'San Antonio',
      city: 'Pasig City',
      province: 'Metro Manila',
      zipCode: '1600',
      requirements: [],
    },
  ];

  it('should transition all applicants to Complete when MarkAllComplete is executed', () => {
    const updated = applyBatchVerdict(sampleApplicants, 'MarkAllComplete');

    expect(updated).toHaveLength(3);
    expect(updated.every((a) => a.status === 'Complete')).toBe(true);
    // Preserves other details
    const firstApplicant = updated[0];
    if (firstApplicant !== undefined) {
      expect(firstApplicant.name).toBe('Alpha Communications Corp');
      expect(firstApplicant.evaluationRemarks).toBe('Missing SEC docs');
    }
  });

  it('should transition all applicants to ForEndorsement when MarkAllForEndorsement is executed', () => {
    const updated = applyBatchVerdict(sampleApplicants, 'MarkAllForEndorsement');

    expect(updated).toHaveLength(3);
    expect(updated.every((a) => a.status === 'ForEndorsement')).toBe(true);
    const secondApplicant = updated[1];
    if (secondApplicant !== undefined) {
      expect(secondApplicant.email).toBe('beta@example.com');
    }
  });

  it('should transition a single targeted applicant to Incomplete with specific discrepancy remarks', () => {
    const updated = applySingleApplicantVerdict(
      sampleApplicants,
      1,
      'Incomplete',
      'Missing supervising PECE certificate'
    );

    const first = updated[0];
    const second = updated[1];
    const third = updated[2];

    if (first !== undefined) {
      expect(first.status).toBe('Incomplete'); // unchanged
    }
    if (second !== undefined) {
      expect(second.status).toBe('Incomplete'); // updated
      expect(second.evaluationRemarks).toBe('Missing supervising PECE certificate');
    }
    if (third !== undefined) {
      expect(third.status).toBe('Complete'); // unchanged
    }
  });

  it('should transition a single targeted applicant to ForEndorsement while preserving remarks if empty', () => {
    const updated = applySingleApplicantVerdict(
      sampleApplicants,
      0,
      'ForEndorsement',
      ''
    );

    const first = updated[0];
    if (first !== undefined) {
      expect(first.status).toBe('ForEndorsement');
      expect(first.evaluationRemarks).toBe('Missing SEC docs'); // preserved
    }
  });
});

describe('Document Preview Object URL Revocation', () => {
  it('should invoke URL.revokeObjectURL for blob URLs and return true', () => {
    const originalRevoke = globalThis.URL.revokeObjectURL;
    let revokedUrl: string | undefined;
    globalThis.URL.revokeObjectURL = (url: string) => {
      revokedUrl = url;
    };

    const result = cleanupBlobObjectUrl('blob:http://localhost:3000/123-abc-456');

    expect(result).toBe(true);
    expect(revokedUrl).toBe('blob:http://localhost:3000/123-abc-456');

    globalThis.URL.revokeObjectURL = originalRevoke;
  });

  it('should not invoke URL.revokeObjectURL for standard https URLs or data URIs', () => {
    let callCount = 0;
    const originalRevoke = globalThis.URL.revokeObjectURL;
    globalThis.URL.revokeObjectURL = () => {
      callCount += 1;
    };

    expect(cleanupBlobObjectUrl('https://example.com/file.pdf')).toBe(false);
    expect(cleanupBlobObjectUrl('data:image/png;base64,iVBORw...')).toBe(false);
    expect(cleanupBlobObjectUrl(null)).toBe(false);
    expect(cleanupBlobObjectUrl('')).toBe(false);

    expect(callCount).toBe(0);

    globalThis.URL.revokeObjectURL = originalRevoke;
  });
});
