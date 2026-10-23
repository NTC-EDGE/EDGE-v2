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
  skipFieldIds: [
    'detailsservice',
    'details_service',
    'targetpermittype',
    'target_permit_type',
    'permitno',
    'permit_no',
    'noofcopies',
    'no_of_copies',
    'copytype',
    'copy_type',
    'circumstances',
    'circumstances_section',
    'permitcopyparticulars',
    'permit_copy_particulars',
    'fd000000-0000-0000-0000-000000000244',
    'fd000000-0000-0000-0000-000000000245',
    'fd000000-0000-0000-0000-000000000246',
    'fd000000-0000-0000-0000-000000000243',
    'fd000000-0000-0000-0000-000000000037',
  ],
  skipFieldLabels: [
    'detailsservice',
    'details service',
    'type',
    'permit no.',
    'permit no',
    'permit number',
    'no. of copies',
    'no of copies',
    'number of copies',
    'copy type',
    'circumstances',
    'circumstances relating to lost/mutilation of permit',
    'circumstances of loss/damage',
    'circumstances relating to lost/mutilation of permit/license/certificate',
  ],
};
