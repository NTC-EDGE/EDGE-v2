import { PreviewExtension } from '../core/formPreviewTypes';

export const RadioCertPreview: PreviewExtension = {
  matchService: (s) => {
    const t = (s.title || s.name || '').toLowerCase();
    const c = (s.category || '').toLowerCase();
    return (
      (t.includes('radio operator') && t.includes('certificate')) ||
      t.includes('roc') ||
      t.includes('rroc') ||
      t.includes('goc') ||
      t.includes('operator certificate') ||
      (c.includes('certificate') && (t.includes('radio') || t.includes('operator'))) ||
      c === 'certificates'
    );
  },
};
