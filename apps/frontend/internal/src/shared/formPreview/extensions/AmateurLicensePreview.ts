import { PreviewExtension } from '../core/formPreviewTypes';

export const AmateurLicensePreview: PreviewExtension = {
  matchService: (s) => {
    const t = (s.title || s.name || '').toLowerCase();
    const c = (s.category || '').toLowerCase();
    const id = (s.id || '').toLowerCase();
    return (
      (c.includes('certificate') && t.includes('amateur')) ||
      id.includes('ntc_1_03') ||
      id.includes('50000000-0000-0000-0000-000000000103')
    );
  },
};
