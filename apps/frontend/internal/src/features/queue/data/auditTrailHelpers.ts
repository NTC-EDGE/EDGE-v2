import { ApplicationDto, ApplicationSummaryDto } from '@edge/api';
import { AuditTrailEntry } from '../../../types/application';

export function deriveStaffRoleFromAction(
  staffRole?: string | null,
  action?: string | null,
  toStatus?: string | null
): string {
  if (staffRole !== null && staffRole !== undefined && staffRole.trim().length > 0) {
    return staffRole.trim();
  }

  const actionLower = (action || '').toLowerCase();
  const toStatusLower = (toStatus || '').toLowerCase();

  if (actionLower.includes('approve') || toStatusLower.includes('approve')) {
    return 'Approving Officer';
  }
  if (actionLower.includes('return') || actionLower.includes('decline') || toStatusLower.includes('return') || toStatusLower.includes('decline')) {
    return 'Return Officer';
  }
  if (actionLower.includes('accountant') || toStatusLower.includes('accountant')) {
    return 'Accountant / Assessor';
  }
  if (actionLower.includes('cashier') || actionLower.includes('payment') || toStatusLower.includes('payment')) {
    return 'Cashiering Officer';
  }
  if (actionLower.includes('evaluat') || toStatusLower.includes('evaluat')) {
    return 'Evaluating Officer';
  }
  if (actionLower.includes('soa') || actionLower.includes('statement of account')) {
    return 'Evaluating Officer';
  }
  if (actionLower.includes('submit')) {
    return 'Filing Submitter';
  }
  return 'Processing Officer';
}

function formatAuditTimestamp(isoString?: string | null): string {
  if (isoString === null || isoString === undefined || isoString.trim().length === 0) {
    return '';
  }
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return isoString;
  }
}

interface StagedAuditTrailEntry {
  id: string;
  action: string;
  staff: string;
  role: string;
  remarks?: string;
  status?: string;
  isoDate: string;
}

export function buildAuditTrailList(
  dto: ApplicationDto | ApplicationSummaryDto,
  submitterName?: string
): AuditTrailEntry[] {
  const stagedEntries: StagedAuditTrailEntry[] = [];
  const hasInitialSubmission = dto.histories?.some(
    (h) =>
      h.toStatus === 'Submitted' ||
      h.fromStatus === 'Submitted' ||
      (h.action !== null && h.action !== undefined && h.action.toLowerCase().includes('submit'))
  );

  if (hasInitialSubmission !== true) {
    const submitter = submitterName || 'Applicant';
    const modeText = dto.submissionMode ? ` (${dto.submissionMode})` : '';
    const submissionIso = dto.createdAt || new Date().toISOString();
    stagedEntries.push({
      id: `init-${dto.id || 'initial-submission'}`,
      action: `Application Submitted${modeText}`,
      staff: submitter,
      role: 'Filing Submitter',
      status: 'Submitted',
      isoDate: submissionIso,
    });
  }

  if (dto.histories && dto.histories.length > 0) {
    for (const h of dto.histories) {
      const rawAction = h.action && h.action.trim().length > 0
        ? h.action
        : (h.toStatus ? `Status: ${h.toStatus}` : 'Application Event');

      const derivedRole = deriveStaffRoleFromAction(h.staffRole, rawAction, h.toStatus);

      stagedEntries.push({
        id: h.id,
        action: rawAction,
        staff: h.staffName || 'Authorized Officer',
        role: derivedRole,
        remarks: h.remarks || undefined,
        status: h.toStatus || undefined,
        isoDate: h.timestamp || '',
      });
    }
  }

  // Include SOA generation from statementsOfAccount if not already recorded in histories
  if ('statementsOfAccount' in dto && Array.isArray(dto.statementsOfAccount)) {
    for (const soa of dto.statementsOfAccount) {
      if (soa.histories && Array.isArray(soa.histories) && soa.histories.length > 0) {
        for (const sh of soa.histories) {
          const actionText = sh.action || 'Statement of Account (SOA) Generated';
          const isAlreadyPresent = stagedEntries.some(
            (e) => e.id === sh.id || (e.action.toLowerCase().includes('soa') && e.action.toLowerCase().includes('generat'))
          );
          if (!isAlreadyPresent) {
            stagedEntries.push({
              id: sh.id || `soa-hist-${soa.id}`,
              action: actionText.toLowerCase().includes('soa') ? actionText : `Statement of Account (SOA): ${actionText}`,
              staff: sh.staffName || 'Evaluating Officer',
              role: deriveStaffRoleFromAction(sh.staffRole, actionText, sh.toStatus),
              remarks: sh.remarks || (soa.soaNumber ? `SOA Number: ${soa.soaNumber}` : undefined),
              status: sh.toStatus || 'Pending',
              isoDate: sh.timestamp || soa.createdAt || '',
            });
          }
        }
      } else if (soa.createdAt) {
        const isAlreadyPresent = stagedEntries.some(
          (e) => e.action.toLowerCase().includes('soa') && (e.action.toLowerCase().includes('generat') || e.action.toLowerCase().includes('creat'))
        );
        if (!isAlreadyPresent) {
          stagedEntries.push({
            id: `soa-gen-${soa.id}`,
            action: 'Statement of Account (SOA) Generated',
            staff: 'Evaluating Officer',
            role: 'Evaluating Officer',
            remarks: soa.soaNumber ? `Statement of Account (${soa.soaNumber}) generated.` : 'Statement of Account generated.',
            status: soa.status || 'Pending',
            isoDate: soa.createdAt,
          });
        }
      }
    }
  }

  // Sort staged entries chronologically
  stagedEntries.sort((a, b) => {
    const timeA = a.isoDate.length > 0 ? new Date(a.isoDate).getTime() : 0;
    const timeB = b.isoDate.length > 0 ? new Date(b.isoDate).getTime() : 0;
    return timeA - timeB;
  });

  return stagedEntries.map((e) => ({
    id: e.id,
    action: e.action,
    staff: e.staff,
    role: e.role,
    remarks: e.remarks,
    status: e.status,
    timestamp: formatAuditTimestamp(e.isoDate),
  }));
}
