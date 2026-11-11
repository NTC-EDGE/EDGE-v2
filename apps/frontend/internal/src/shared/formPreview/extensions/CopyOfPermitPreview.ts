import { PreviewExtension } from '../core/formPreviewTypes';

export const CopyOfPermitPreview: PreviewExtension = {
  matchService: (s) => {
    const t = (s.title || s.name || '').toLowerCase();
    const c = (s.category || '').toLowerCase();
    return (
      (c.includes('permit') || t.includes('permit')) &&
      (t.includes('copy') || t.includes('duplicate'))
    );
  },
  skipFieldIds: [],
  skipFieldLabels: [],
};
