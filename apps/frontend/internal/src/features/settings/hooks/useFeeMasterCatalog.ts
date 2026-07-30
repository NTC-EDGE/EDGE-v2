import { useMemo, useState } from 'react';
import { useAdminFees, Fee } from '@edge/api';

export interface FeeMasterEntity {
  id: string;
  code: string;
  name: string;
  description: string;
  feeType: string;
  defaultAmount?: number;
}

export const DEFAULT_FEE_CATALOG: FeeMasterEntity[] = [
  {
    id: 'fee_filing',
    code: 'FILING_FEE',
    name: 'Filing & Application Processing Fee',
    description: 'Standard mandatory filing fee charged upon submission of application documents.',
    feeType: 'Filing Fee',
    defaultAmount: 180,
  },
  {
    id: 'fee_inspection',
    code: 'INSP_FEE',
    name: 'Technical Site Inspection Fee',
    description: 'On-site technical evaluation and radio station inspection fee.',
    feeType: 'Inspection Fee',
    defaultAmount: 500,
  },
  {
    id: 'fee_license_rights',
    code: 'LIC_RIGHTS_FEE',
    name: 'Spectrum & License Rights Fee',
    description: 'Radio frequency spectrum rights and operational permit fee.',
    feeType: 'License Rights Fee',
    defaultAmount: 1500,
  },
  {
    id: 'fee_permit_issuance',
    code: 'PERMIT_ISSUE_FEE',
    name: 'Permit & Certificate Issuance Fee',
    description: 'Official document printing and certificate issuance charge.',
    feeType: 'Permit Fee',
    defaultAmount: 300,
  },
  {
    id: 'fee_exam_registration',
    code: 'EXAM_REG_FEE',
    name: 'Operator Competency Exam Fee',
    description: 'Registration fee for commercial and amateur radio operator examinations.',
    feeType: 'Exam Fee',
    defaultAmount: 250,
  },
  {
    id: 'fee_surcharge_late',
    code: 'SURCHARGE_LATE_FEE',
    name: 'Late Filing Surcharge & Penalty',
    description: 'Administrative surcharge penalty for late permit renewal applications.',
    feeType: 'Penalty Fee',
    defaultAmount: 200,
  },
];

export function useFeeMasterCatalog() {
  const { fees: apiFees, isLoading, isError, refetch } = useAdminFees();
  const [selectedFeeId, setSelectedFeeId] = useState<string>('');

  // Map API fee entities straight from backend Fee Entity endpoint (/api/v2/fees)
  const feeEntities: FeeMasterEntity[] = useMemo(() => {
    return (apiFees || []).map((f: Fee) => ({
      id: f.id,
      code: f.code || 'FEE_CODE',
      name: f.name || 'Administrative Fee',
      description: f.description || 'Master fee entity from backend endpoint.',
      feeType: 'Backend Fee Entity',
    }));
  }, [apiFees]);

  // Compute currently selected fee entity
  const selectedFeeEntity = useMemo(() => {
    if (!selectedFeeId) return null;
    return feeEntities.find((f) => f.id === selectedFeeId) || null;
  }, [feeEntities, selectedFeeId]);

  return {
    feeEntities,
    selectedFeeId,
    setSelectedFeeId,
    selectedFeeEntity,
    isLoading,
    isError,
    refetch,
  };
}
