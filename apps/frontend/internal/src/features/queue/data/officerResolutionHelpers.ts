import { ApplicationDto, ApplicationSummaryDto, SYSTEM_ROLES } from '@edge/api';
import {
  ApplicationStatus,
  ApplicationCategory,
  QueueTab,
} from '../../../types/application';

export function parseApplicationCategory(cat?: string, serviceName?: string): ApplicationCategory {
  const valid: ApplicationCategory[] = ['Exams', 'Permits', 'Licenses', 'Accreditations', 'Certificates', 'Complaints and Request'];
  if (cat && typeof cat === 'string') {
    const trimmed = cat.trim();
    const exact = valid.find((c) => c.toLowerCase() === trimmed.toLowerCase());
    if (exact) return exact;

    const lower = trimmed.toLowerCase();
    if (lower.includes('cert') || lower.includes('roc') || lower.includes('goc')) return 'Certificates';
    if (lower.includes('licen') || lower.includes('rsl') || lower.includes('amateur')) return 'Licenses';
    if (lower.includes('exam') || lower.includes('admission') || lower.includes('operator examination')) return 'Exams';
    if (lower.includes('accredit') || lower.includes('dealer') || lower.includes('manufacturer') || lower.includes('service center')) return 'Accreditations';
    if (lower.includes('permit') || lower.includes('purchase') || lower.includes('possess') || lower.includes('import')) return 'Permits';
    if (lower.includes('complaint') || lower.includes('request')) return 'Complaints and Request';
  }

  if (serviceName && typeof serviceName === 'string') {
    const s = serviceName.trim().toLowerCase();
    if (s.includes('cert') || s.includes('roc') || s.includes('goc') || s.includes('radio operator')) return 'Certificates';
    if (s.includes('license') || s.includes('rsl') || s.includes('amateur radio')) return 'Licenses';
    if (s.includes('exam') || s.includes('admission') || s.includes('operator examination')) return 'Exams';
    if (s.includes('accredit') || s.includes('dealer') || s.includes('manufacturer') || s.includes('service center')) return 'Accreditations';
    if (s.includes('permit') || s.includes('purchase') || s.includes('possess') || s.includes('import')) return 'Permits';
    if (s.includes('complaint') || s.includes('request')) return 'Complaints and Request';
  }

  return 'Permits';
}

export function mapBEStatusToFE(status: string): ApplicationStatus {
  const map: Record<string, ApplicationStatus> = {
    Draft: 'Draft',
    Submitted: 'Submitted',
    Evaluating: 'Evaluating',
    Returned: 'Returned',
    Approved: 'Approved',
    Completed: 'Completed',
    ForAccountant: 'ForAccountant',
    PendingPayment: 'PendingPayment',
    ForIssuance: 'ForIssuance',
  };
  return map[status] ?? 'Submitted';
}

export function isGenericOfficer(name?: string | null, office?: string | null): boolean {
  if (!name) return true;
  const n = name.trim().toLowerCase();
  return (
    n.length === 0 ||
    n === 'unassigned' ||
    n === 'authorized officer' ||
    n === 'officer' ||
    n === 'evaluating officer' ||
    n === 'ntc officer' ||
    n === 'admin' ||
    n === 'system admin' ||
    n === (office ?? '').toLowerCase()
  );
}

export function formatDateLabel(isoDate: string): string {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function parseBackendQueueTab(tab?: string): QueueTab | null {
  if (!tab || typeof tab !== 'string') return null;
  const trimmed = tab.trim().toLowerCase();
  if (trimmed === 'pending') return 'pending';
  if (trimmed === 'issuance' || trimmed === 'forissuance') return 'issuance';
  if (trimmed === 'history' || trimmed === 'archived') return 'history';
  if (trimmed === 'activity' || trimmed === 'all') return 'activity';
  return null;
}

export function isAccountantRole(role?: string): boolean {
  if (!role) return false;
  const lower = role.trim().toLowerCase();
  return lower === SYSTEM_ROLES.Accountant.toLowerCase();
}

export function isCashierRole(role?: string): boolean {
  if (!role) return false;
  const lower = role.trim().toLowerCase();
  return lower === SYSTEM_ROLES.Cashier.toLowerCase();
}

export function isEvaluatorOrSupervisorRole(role?: string): boolean {
  if (!role) return false;
  const lower = role.trim().toLowerCase();
  return (
    lower === SYSTEM_ROLES.Evaluator.toLowerCase() ||
    lower === SYSTEM_ROLES.ChiefOfEod.toLowerCase() ||
    lower === SYSTEM_ROLES.RegionalDirector.toLowerCase()
  );
}

export function deriveQueueTab(
  status: ApplicationStatus,
  role?: string,
  context?: {
    hasSoa?: boolean;
    hasOp?: boolean;
    hasAccountantHistory?: boolean;
    hasCashierHistory?: boolean;
    remarks?: string;
  }
): QueueTab {
  if (isAccountantRole(role)) {
    if (status === 'ForAccountant') return 'pending';
    const hasAccountantTouch =
      context?.hasSoa === true ||
      context?.hasAccountantHistory === true ||
      (typeof context?.remarks === 'string' && context.remarks.toLowerCase().includes('accountant')) ||
      status === 'PendingPayment' ||
      status === 'ForIssuance' ||
      status === 'Approved' ||
      status === 'Completed' ||
      status === 'Returned';
    if (hasAccountantTouch) return 'history';
    return 'activity';
  }

  if (isCashierRole(role)) {
    if (status === 'PendingPayment') return 'pending';
    const hasCashierTouch =
      context?.hasOp === true ||
      context?.hasCashierHistory === true ||
      (typeof context?.remarks === 'string' && context.remarks.toLowerCase().includes('cashier')) ||
      status === 'ForIssuance' ||
      status === 'Completed' ||
      status === 'Approved' ||
      status === 'Returned';
    if (hasCashierTouch) return 'history';
    return 'activity';
  }

  if (status === 'ForIssuance') {
    return 'issuance';
  }

  if (isEvaluatorOrSupervisorRole(role)) {
    if (status === 'Submitted' || status === 'Evaluating' || status === 'Returned') return 'pending';
    if (status === 'ForAccountant' || status === 'PendingPayment' || status === 'Approved' || status === 'Completed') return 'history';
    return 'activity';
  }

  if (status === 'Submitted' || status === 'Evaluating' || status === 'Returned' || status === 'ForAccountant' || status === 'PendingPayment') {
    return 'pending';
  }
  if (status === 'Approved' || status === 'Completed') {
    return 'history';
  }
  return 'activity';
}

export interface EndorsementState {
  endorsedTo?: string;
  endorsedBy?: string;
  isActivelyEndorsed: boolean;
}

export function parseEndorsementState(dto: ApplicationDto | ApplicationSummaryDto): EndorsementState {
  const histories = 'histories' in dto && Array.isArray(dto.histories) ? dto.histories : [];
  if (histories.length > 0) {
    const sorted = [...histories].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    const reversed = [...sorted].reverse();
    const latestEndorseIdx = reversed.findIndex(
      (h) => (h.action && h.action.toLowerCase().includes('endorsed to')) || (h.remarks && h.remarks.toLowerCase().includes('endorsed to'))
    );

    if (latestEndorseIdx !== -1) {
      const subsequentEntries = reversed.slice(0, latestEndorseIdx);
      const wasReturnedOrAdvanced = subsequentEntries.some(
        (h) =>
          (h.action && (h.action.toLowerCase().includes('returned') || h.action.toLowerCase().includes('approved') || h.action.toLowerCase().includes('forwarded'))) ||
          (h.remarks && h.remarks.toLowerCase().includes('returned')) ||
          h.toStatus === 'Returned' ||
          h.toStatus === 'ForAccountant' ||
          h.toStatus === 'PendingPayment' ||
          h.toStatus === 'Completed' ||
          h.toStatus === 'Approved'
      );

      if (!wasReturnedOrAdvanced) {
        const endorseEntry = reversed[latestEndorseIdx];
        const endorsedBy = endorseEntry.staffName || undefined;

        let endorsedTo: string | undefined = undefined;
        if (endorseEntry.action && endorseEntry.action.toLowerCase().includes('endorsed to')) {
          const match = endorseEntry.action.match(/endorsed to\s+([^,.(]+)/i);
          if (match && match[1]) {
            endorsedTo = match[1].trim();
          }
        }
        if (!endorsedTo && endorseEntry.remarks && endorseEntry.remarks.toLowerCase().includes('endorsed to')) {
          const match = endorseEntry.remarks.match(/endorsed to\s+([^,(.]+)/i);
          if (match && match[1]) {
            endorsedTo = match[1].trim();
          }
        }

        if (endorsedTo) {
          return { endorsedTo, endorsedBy, isActivelyEndorsed: true };
        }
      }
    }
  }

  // Fallback: Check dto.remarks if histories not populated or in summary DTO
  if (dto.remarks && dto.remarks.toLowerCase().includes('endorsed to') && !dto.remarks.toLowerCase().includes('returned')) {
    const match = dto.remarks.match(/endorsed to\s+([^,(.]+)/i);
    if (match && match[1]) {
      return {
        endorsedTo: match[1].trim(),
        endorsedBy: undefined,
        isActivelyEndorsed: true,
      };
    }
  }

  return { endorsedTo: undefined, endorsedBy: undefined, isActivelyEndorsed: false };
}

export type ApplicationHistoryLike = {
  action?: string | null;
  remarks?: string | null;
  staffName?: string | null;
  staffRole?: string | null;
  toStatus?: string | null;
  timestamp: string;
};

export function resolveAccountingOfficer(reversedHistories: ApplicationHistoryLike[]): string | undefined {
  const match = reversedHistories.find((h) => {
    if (!h.staffName || h.staffName.trim().length === 0) return false;
    const actionLower = (h.action || '').toLowerCase();
    const remarksLower = (h.remarks || '').toLowerCase();
    const roleLower = (h.staffRole || '').toLowerCase();

    return (
      roleLower.includes('accountant') ||
      actionLower.includes('financial review') ||
      actionLower.includes('soa approved') ||
      actionLower.includes('approved by accountant') ||
      actionLower.includes('returned by accountant') ||
      remarksLower.includes('financial review started') ||
      remarksLower.includes('approved by accountant') ||
      remarksLower.includes('returned by accountant')
    );
  });
  if (match?.staffName && match.staffName.trim().length > 0) return match.staffName.trim();
  return undefined;
}

export function resolveCashierOfficer(reversedHistories: ApplicationHistoryLike[]): string | undefined {
  const match = reversedHistories.find((h) => {
    if (!h.staffName || h.staffName.trim().length === 0) return false;
    const actionLower = (h.action || '').toLowerCase();
    const remarksLower = (h.remarks || '').toLowerCase();
    const roleLower = (h.staffRole || '').toLowerCase();

    return (
      roleLower.includes('cashier') ||
      actionLower.includes('payment verification') ||
      actionLower.includes('payment verified') ||
      actionLower.includes('official receipt') ||
      actionLower.includes('or issued') ||
      actionLower.includes('returned by cashier') ||
      remarksLower.includes('payment verification started') ||
      remarksLower.includes('official receipt') ||
      remarksLower.includes('returned by cashier')
    );
  });
  if (match?.staffName && match.staffName.trim().length > 0) return match.staffName.trim();
  return undefined;
}

export function resolveIssuingOfficer(reversedHistories: ApplicationHistoryLike[]): string | undefined {
  const match = reversedHistories.find((h) => {
    if (!h.staffName || h.staffName.trim().length === 0) return false;
    const actionLower = (h.action || '').toLowerCase();
    const remarksLower = (h.remarks || '').toLowerCase();

    return (
      actionLower.includes('document issuance') ||
      actionLower.includes('issuance started') ||
      actionLower.includes('document & license issued') ||
      actionLower.includes('license issued') ||
      actionLower.includes('statutory document') ||
      actionLower.includes('issued by') ||
      remarksLower.includes('document release process started') ||
      remarksLower.includes('statutory document and license issued') ||
      h.toStatus === 'Completed'
    );
  });
  if (match?.staffName && match.staffName.trim().length > 0) return match.staffName.trim();
  return undefined;
}

export function resolveEvaluatingOfficer(
  dto: ApplicationDto | ApplicationSummaryDto,
  reversedHistories: ApplicationHistoryLike[],
  endorsementState: EndorsementState
): string | undefined {
  if (endorsementState.isActivelyEndorsed && endorsementState.endorsedTo) {
    return endorsementState.endorsedTo;
  }

  // Find the latest evaluation entry by an Evaluator (excluding downstream return entries by accountant/cashier)
  const latestEval = reversedHistories.find((h) => {
    const roleLower = (h.staffRole || '').toLowerCase();
    const actionLower = (h.action || '').toLowerCase();
    const remLower = (h.remarks || '').toLowerCase();

    // Exclude return actions performed by accountant/cashier/releasing
    const isReturnByDownstream =
      roleLower.includes('accountant') ||
      roleLower.includes('cashier') ||
      actionLower.includes('soa return') ||
      actionLower.includes('returned by accountant') ||
      actionLower.includes('returned by cashier') ||
      remLower.includes('returned by accountant') ||
      remLower.includes('returned by cashier');

    if (isReturnByDownstream) return false;

    const isEvaluatorRole =
      roleLower.includes('evaluat') ||
      roleLower.includes('engineer') ||
      roleLower.includes('chief') ||
      roleLower.includes('director');

    const isEvaluationAction =
      actionLower.includes('evaluation started') ||
      actionLower.includes('approved & forwarded') ||
      actionLower.includes('forwarded to accountant') ||
      actionLower.includes('evaluated');

    const isForAccountantHandoff = h.toStatus === 'ForAccountant';
    const isEvaluatingState = h.toStatus === 'Evaluating' && !actionLower.includes('return');

    return (
      (isForAccountantHandoff || isEvaluatingState || isEvaluationAction || isEvaluatorRole) &&
      Boolean(h.staffName && h.staffName.trim().length > 0 && !isGenericOfficer(h.staffName, dto.office))
    );
  });

  if (latestEval?.staffName && latestEval.staffName.trim().length > 0) {
    return latestEval.staffName.trim();
  }

  if (dto.remarks && dto.remarks.toLowerCase().includes('evaluation started by')) {
    const match = dto.remarks.match(/evaluation started by\s+([^,.(]+)/i);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  // Secondary fallback in history: any evaluator entry with a staff name that isn't generic
  const anyEvaluator = reversedHistories.find((h) => {
    const roleLower = (h.staffRole || '').toLowerCase();
    const actionLower = (h.action || '').toLowerCase();
    return (
      (roleLower.includes('evaluat') || actionLower.includes('evaluat')) &&
      !roleLower.includes('accountant') &&
      !roleLower.includes('cashier') &&
      !(actionLower.includes('return') && roleLower.includes('accountant')) &&
      Boolean(h.staffName && h.staffName.trim().length > 0 && !isGenericOfficer(h.staffName, dto.office))
    );
  });

  if (anyEvaluator?.staffName && anyEvaluator.staffName.trim().length > 0) {
    return anyEvaluator.staffName.trim();
  }

  return undefined;
}

export function resolveAssignedTo(
  feStatus: ApplicationStatus,
  evaluatingOfficer: string | undefined,
  accountingOfficer: string | undefined,
  cashierOfficer: string | undefined,
  issuingOfficer: string | undefined,
  endorsementState: EndorsementState,
  office?: string
): string {
  if (endorsementState.isActivelyEndorsed && endorsementState.endorsedTo) {
    return endorsementState.endorsedTo;
  }
  if (feStatus === 'Evaluating' || feStatus === 'Returned') {
    if (evaluatingOfficer && !isGenericOfficer(evaluatingOfficer, office)) {
      return evaluatingOfficer;
    }
    return office ?? '';
  }
  if (feStatus === 'ForAccountant') {
    if (accountingOfficer && !isGenericOfficer(accountingOfficer, office)) {
      return accountingOfficer;
    }
    return office ?? '';
  }
  if (feStatus === 'PendingPayment') {
    if (cashierOfficer && !isGenericOfficer(cashierOfficer, office)) {
      return cashierOfficer;
    }
    return office ?? '';
  }
  if (feStatus === 'ForIssuance') {
    if (issuingOfficer && !isGenericOfficer(issuingOfficer, office)) {
      return issuingOfficer;
    }
    return office ?? '';
  }
  if (feStatus === 'Completed' || feStatus === 'Approved') {
    if (issuingOfficer && !isGenericOfficer(issuingOfficer, office)) {
      return issuingOfficer;
    }
    if (evaluatingOfficer && !isGenericOfficer(evaluatingOfficer, office)) {
      return evaluatingOfficer;
    }
    return office ?? '';
  }
  return office ?? '';
}
