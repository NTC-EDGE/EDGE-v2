import { PreviewExtension } from '../core/formPreviewTypes';

export const PermitPreview: PreviewExtension = {
  matchService: (s) => {
    const c = (s.category || '').toLowerCase();
    const t = (s.title || s.name || '').toLowerCase();
    return (
      (c.includes('permit') || t.includes('permit')) &&
      !t.includes('copy') &&
      !t.includes('duplicate')
    );
  },
};
