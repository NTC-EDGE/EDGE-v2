import { PreviewExtension } from '../core/formPreviewTypes';

export const CopyOfCertPreview: PreviewExtension = {
  matchService: (s) => {
    const t = (s.title || s.name || '').toLowerCase();
    return t.includes('copy of cert') || t.includes('copy of license') || t.includes('duplicate cert');
  },
};
