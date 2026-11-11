import { PreviewExtension } from '../core/formPreviewTypes';

export const DeviceRegistrationPreview: PreviewExtension = {
  matchService: (s) => {
    const t = (s.title || s.name || '').toLowerCase();
    const id = (s.id || '').toLowerCase();
    return (
      t.includes('rfid') ||
      t.includes('srd') ||
      t.includes('wdn') ||
      t.includes('indoor') ||
      t.includes('outdoor') ||
      id.includes('ntc_1_19') ||
      id.includes('ntc_1_22') ||
      id.includes('50000000-0000-0000-0000-000000000019') ||
      id.includes('50000000-0000-0000-0000-000000000022')
    );
  },
  skipFieldIds: [],
  skipFieldLabels: [],
};
