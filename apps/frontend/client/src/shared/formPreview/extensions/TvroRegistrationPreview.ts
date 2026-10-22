import { PreviewExtension } from '../core/formPreviewTypes';

export const TvroRegistrationPreview: PreviewExtension = {
  matchService: (s) => {
    const t = (s.title || s.name || '').toLowerCase();
    const id = (s.id || '').toLowerCase();
    return (
      t.includes('tvro') ||
      id.includes('ntc_1_18') ||
      id.includes('50000000-0000-0000-0000-000000000018')
    );
  },
};
