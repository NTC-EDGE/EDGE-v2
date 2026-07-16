import React from 'react';
import AdmissionSlip from '@templates/homepage/applications/admission-slip';

const AdmissionNavigation =  (props: any) => {
  return <AdmissionSlip {...props} />
};

export default React.memo(AdmissionNavigation)
