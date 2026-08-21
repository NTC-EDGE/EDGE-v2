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
  skipFieldIds: [
    'fd000000-0000-0000-0000-000000000084', // makeTypeModel
    'fd000000-0000-0000-0000-000000000085', // deviceType
    'fd000000-0000-0000-0000-000000000087', // serialNumbers
    'fd000000-0000-0000-0000-000000000086', // dtiSecRegistration
  ],
  skipFieldLabels: [
    'sec / dti registration number',
    'make / type / model',
    'device / equipment type',
    'serial number(s)',
    'registered devices',
  ],
};
