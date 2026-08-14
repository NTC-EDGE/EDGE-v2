import { ApplicationHistoryDto, CorrectionAuditTrailDto } from '@edge/api';
import { AuditTrailEntry } from '../../../types/application';

/**
 * Maps correction audit trails.
 */
export function mapCorrectionAuditTrail(
  correctionAuditTrails: CorrectionAuditTrailDto[] | undefined
): AuditTrailEntry[] {
  if (!correctionAuditTrails) {
    return [];
  }

  return correctionAuditTrails.map((trail) => ({
    id: trail.id,
    action: `${trail.fieldName}: ${trail.oldValue} → ${trail.newValue}`,
    staff: trail.correctedByStaff,
    timestamp: trail.correctedAt,
  }));
}

/**
 * Maps application action history.
 */
export function mapHistory(
  histories: ApplicationHistoryDto[] | undefined
): AuditTrailEntry[] {
  if (!histories) {
    return [];
  }

  return histories.map((history) => {
    let formattedTimestamp = '';
    if (history.timestamp) {
      const date = new Date(history.timestamp);
      formattedTimestamp = isNaN(date.getTime()) ? '' : date.toLocaleString();
    }

    return {
      id: history.id,
      action: history.action || `Status: ${history.toStatus}`,
      staff: history.staffName || 'System',
      timestamp: formattedTimestamp,
    };
  });
}
