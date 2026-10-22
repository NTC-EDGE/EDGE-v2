import { resolveServiceCategoryFlags } from './generalReviewResolvers';
import { NTCService } from '../../../data/servicesData';

describe('GeneralReviewResolvers - Category Flags & CTC Suppression', () => {
  it('correctly classifies Copy of Permits service by code and title', () => {
    const copyPermitService: NTCService = {
      id: 'NTC_COPY_PERMITS',
      code: 'NTC_COPY_PERMITS',
      title: 'COPY OF PERMITS',
      category: 'Permits',
      description: 'Copy of Permits (Certified True Copy / Duplicate)',
      requirements: [],
      fee: 'Variable',
      time: '3 Working Days',
    };

    const flags = resolveServiceCategoryFlags(copyPermitService);
    expect(flags.isPermitService).toBe(true);
    expect(flags.isCopyOfPermitService).toBe(true);
    expect(flags.isExamService).toBe(false);
    expect(flags.isLicenseService).toBe(false);
    expect(flags.isCertificateService).toBe(false);
  });

  it('correctly classifies standard radio permits as non-copy permits', () => {
    const amateurPermitService: NTCService = {
      id: 'NTC_1_09',
      code: 'NTC_1_09',
      title: 'PERMITS IN THE AMATEUR SERVICE',
      category: 'Permits',
      description: 'Permits in the Amateur Service',
      requirements: [],
      fee: 'Php 130',
      time: '3 Working Days',
    };

    const flags = resolveServiceCategoryFlags(amateurPermitService);
    expect(flags.isPermitService).toBe(true);
    expect(flags.isCopyOfPermitService).toBe(false);
    expect(flags.isAmateurPermitService).toBe(true);
  });

  it('correctly classifies Copy of Licenses service', () => {
    const copyLicenseService: NTCService = {
      id: 'NTC_COPY_LICENSES',
      code: 'NTC_COPY_LICENSES',
      title: 'COPY OF LICENSES',
      category: 'Licenses',
      description: 'Copy of Licenses',
      requirements: [],
      fee: 'Variable',
      time: '3 Working Days',
    };

    const flags = resolveServiceCategoryFlags(copyLicenseService);
    expect(flags.isLicenseService).toBe(true);
    expect(flags.isPermitService).toBe(false);
    expect(flags.isExamService).toBe(false);
  });

  it('correctly classifies Exam and Certificate services', () => {
    const examService: NTCService = {
      id: 'NTC_1_01',
      code: 'NTC_1_01',
      title: 'Admission Slip for Radio Operator Examination',
      category: 'Exams',
      description: 'Radio Operator Examination',
      requirements: [],
      fee: 'Php 50',
      time: '1 Working Day',
    };

    const examFlags = resolveServiceCategoryFlags(examService);
    expect(examFlags.isExamService).toBe(true);
    expect(examFlags.isPermitService).toBe(false);

    const certService: NTCService = {
      id: 'NTC_1_02',
      code: 'NTC_1_02',
      title: 'RADIO OPERATOR CERTIFICATES (ROC)',
      category: 'Certificates',
      description: 'Commercial Radio Operator Certificate',
      requirements: [],
      fee: 'Php 180',
      time: '3 Working Days',
    };

    const certFlags = resolveServiceCategoryFlags(certService);
    expect(certFlags.isCertificateService).toBe(true);
    expect(certFlags.isExamService).toBe(false);
  });
});
