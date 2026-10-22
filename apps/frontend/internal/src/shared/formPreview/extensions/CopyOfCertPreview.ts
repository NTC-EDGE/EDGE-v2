import { PreviewExtension } from '../core/formPreviewTypes';

export const CopyOfCertPreview: PreviewExtension = {
  matchService: (s) => {
    const t = (s.title || s.name || '').toLowerCase();
    const c = (s.category || '').toLowerCase();
    return (
      (t.includes('copy of cert') ||
        t.includes('copy of license') ||
        t.includes('duplicate cert') ||
        (t.includes('copy') && t.includes('cert')) ||
        (c.includes('certificate') && (t.includes('copy') || t.includes('duplicate')))) &&
      !t.includes('permit') &&
      !c.includes('permit')
    );
  },
  skipFieldIds: [
    'targetservice',
    'target_service',
    'targetcertificatetype',
    'target_certificate_type',
    'certificateno',
    'certificate_no',
    'numberofcopies',
    'number_of_copies',
    'copytype',
    'copy_type',
  ],
  skipFieldLabels: [
    'copy type',
    'service',
    'type',
    'certificate number',
    'certificate no.',
    'no. of copies',
    'number of copies',
  ],
};
