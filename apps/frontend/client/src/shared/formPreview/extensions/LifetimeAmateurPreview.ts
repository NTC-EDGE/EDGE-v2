import { PreviewExtension } from '../core/formPreviewTypes';

export const LifetimeAmateurPreview: PreviewExtension = {
  matchService: (s) => {
    const t = (s.title || s.name || '').toLowerCase();
    return t.includes('lifetime') && t.includes('amateur');
  },
};
