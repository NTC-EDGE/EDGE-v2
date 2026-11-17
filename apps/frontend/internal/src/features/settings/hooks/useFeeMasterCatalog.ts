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
    code: 'FF',
    name: 'Filing Fee',
    description: 'Standard mandatory filing fee charged upon submission of application documents.',
    feeType: 'Filing Fee',
    defaultAmount: 180,
  },
  {
    id: 'fee_inspection',
    code: 'IF',
    name: 'Inspection Fee',
    description: 'On-site technical evaluation and radio station inspection fee.',
    feeType: 'Inspection Fee',
    defaultAmount: 720,
  },
  {
    id: 'fee_license_rights',
    code: 'LF',
    name: 'License Fee',
    description: 'Statutory radio station license fee.',
    feeType: 'License Fee',
    defaultAmount: 500,
  },
  {
    id: 'fee_permit_issuance',
    code: 'PF',
    name: 'Permit Fee',
    description: 'Statutory operational permit fee.',
    feeType: 'Permit Fee',
    defaultAmount: 300,
  },
  {
    id: 'fee_exam',
    code: 'EXAM',
    name: 'Examination Fee',
    description: 'Radio Operator Examination Admission Fee.',
    feeType: 'Exam Fee',
    defaultAmount: 50,
  },
  {
    id: 'fee_surcharge_late',
    code: 'SUR',
    name: 'Late Renewal Surcharge',
    description: 'Administrative surcharge penalty for late permit renewal applications.',
    feeType: 'Penalty Fee',
    defaultAmount: 200,
  },
];

function normalizeCatalogFeeCode(rawCode?: string | null, rawName?: string | null): string {
  const code = (rawCode || '').trim().toUpperCase();
  switch (code) {
    case 'FF':
    case 'FILING_FEE':
    case 'BULK_FILING_FEE':
    case 'FILING':
      return 'FF';
    case 'AF':
    case 'APP_FEE':
    case 'APPLICATION_FEE':
      return 'AF';
    case 'IF':
    case 'INSP_FEE':
    case 'INSPECTION_FEE':
      return 'IF';
    case 'LF':
    case 'LIC':
    case 'LIC_RIGHTS_FEE':
    case 'LICENSE_FEE':
      return 'LF';
    case 'PF':
    case 'PERMIT':
    case 'PERMIT_ISSUE_FEE':
    case 'PERMIT_FEE':
      return 'PF';
    case 'POS':
    case 'POSS_PERMIT':
    case 'POSSESS_PERMIT':
    case 'POSSESS_FEE':
      return 'POS';
    case 'PUR':
    case 'PURCHASE_PERMIT':
    case 'PURCHASE_FEE':
      return 'PUR';
    case 'STF':
    case 'SELL_TRANSFER':
    case 'SELL_TRANSFER_FEE':
      return 'STF';
    case 'EXAM':
    case 'EXAM_REG_FEE':
    case 'EXAM_FEE':
    case 'EXAMFEE':
      return 'EXAM';
    case 'SUR':
    case 'SURCHARGE':
    case 'SURCHARGE_LATE_FEE':
      return 'SUR';
    case 'DST':
    case 'DOC_STAMP_TAX':
    case 'DST_FEE':
      return 'DST';
    case 'MOD':
    case 'MOD_FEE':
    case 'MODIFICATION_FEE':
      return 'MOD';
    default: {
      const name = (rawName || '').trim().toLowerCase();
      if (name.includes('exam')) return 'EXAM';
      if (name === 'filing fee' || name === 'filling fee') return 'FF';
      if (name === 'inspection fee') return 'IF';
      if (name === 'license fee') return 'LF';
      if (name === 'permit fee') return 'PF';
      if (name === 'possess permit fee') return 'POS';
      return code || 'FEE_CODE';
    }
  }
}

export function useFeeMasterCatalog() {
  const { fees: apiFees, isLoading, isError, refetch } = useAdminFees();
  const [selectedFeeId, setSelectedFeeId] = useState<string>('');

  // Map API fee entities straight from backend Fee Entity endpoint (/api/v2/fees),
  // deduplicating any legacy/synonym fee codes so the same fee never appears twice.
  const feeEntities: FeeMasterEntity[] = useMemo(() => {
    const seenCodes = new Set<string>();
    const seenNames = new Set<string>();
    const result: FeeMasterEntity[] = [];

    for (const f of apiFees || []) {
      const canonicalCode = normalizeCatalogFeeCode(f.code, f.name);
      const normName = (f.name || '').trim().toLowerCase();
      if (seenCodes.has(canonicalCode) || (normName.length > 0 && seenNames.has(normName))) {
        continue;
      }
      seenCodes.add(canonicalCode);
      if (normName.length > 0) seenNames.add(normName);
      result.push({
        id: f.id,
        code: canonicalCode,
        name: f.name || 'Administrative Fee',
        description: f.description || 'Master fee entity from backend endpoint.',
        feeType: 'Backend Fee Entity',
      });
    }

    return result;
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
