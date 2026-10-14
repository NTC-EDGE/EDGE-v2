import { ApplicationDto, ApplicationSummaryDto } from '@edge/api';
import { AuditTrailEntry } from '../../../types/application';

export function deriveStaffRoleFromAction(
  staffRole?: string | null,
  action?: string | null,
  toStatus?: string | null
): string {
  if (staffRole && staffRole.trim().length > 0) {
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
  if (actionLower.includes('submit')) {
    return 'Filing Submitter';
  }
  return 'Processing Officer';
}

export function buildAuditTrailList(
  dto: ApplicationDto | ApplicationSummaryDto,
  submitterName?: string
): AuditTrailEntry[] {
  const list: AuditTrailEntry[] = [];
  const hasInitialSubmission = dto.histories?.some(
    (h) =>
      h.toStatus === 'Submitted' ||
      h.fromStatus === 'Submitted' ||
      (h.action !== null && h.action !== undefined && h.action.toLowerCase().includes('submit'))
  );

  if (hasInitialSubmission !== true) {
    const submitter = submitterName || 'Applicant';
    const modeText = dto.submissionMode ? ` (${dto.submissionMode})` : '';
    const submissionTime = dto.createdAt ? new Date(dto.createdAt) : new Date();
    list.push({
      id: `init-${dto.id || 'initial-submission'}`,
      action: `Application Submitted${modeText}`,
      staff: submitter,
      role: 'Filing Submitter',
      status: 'Submitted',
      timestamp: submissionTime.toLocaleString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
    });
  }

  if (dto.histories && dto.histories.length > 0) {
    for (const h of dto.histories) {
      const rawAction = h.action && h.action.trim().length > 0
        ? h.action
        : (h.toStatus ? `Status: ${h.toStatus}` : 'Application Event');

      const derivedRole = deriveStaffRoleFromAction(h.staffRole, rawAction, h.toStatus);

      list.push({
        id: h.id,
        action: rawAction,
        staff: h.staffName || 'Authorized Officer',
        role: derivedRole,
        remarks: h.remarks || undefined,
        status: h.toStatus || undefined,
        timestamp: h.timestamp
          ? new Date(h.timestamp).toLocaleString('en-US', {
              month: 'short',
              day: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            })
          : '',
      });
    }
  }

  return list;
}
