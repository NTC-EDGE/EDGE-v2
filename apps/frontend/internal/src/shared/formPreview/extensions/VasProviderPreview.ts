import { PreviewExtension } from '../core/formPreviewTypes';

export const VasProviderPreview: PreviewExtension = {
  matchService: (s) => {
    const t = (s.title || s.name || '').toLowerCase();
    const c = (s.category || '').toLowerCase();
    const id = (s.id || '').toLowerCase();
    return (
      t.includes('vas') ||
      t.includes('value-added') ||
      t.includes('value added') ||
      c.includes('vas') ||
      id.includes('ntc_1_20') ||
      id.includes('50000000-0000-0000-0000-000000000020')
    );
  },
};
