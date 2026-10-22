import React from 'react';
import { ConfirmationModal } from '@edge/ui';

export type BatchActionType = 'MarkAllComplete' | 'MarkAllForEndorsement';

export interface BatchConfirmationModalProps {
  visible: boolean;
  actionType: BatchActionType | null;
  applicantCount: number;
  onConfirm: (action: BatchActionType) => void;
  onCancel: () => void;
}

export function BatchConfirmationModal({
  visible,
  actionType,
  applicantCount,
  onConfirm,
  onCancel,
}: BatchConfirmationModalProps) {
  if (!visible || actionType === null) return null;

  const isAllComplete = actionType === 'MarkAllComplete';

  const title = isAllComplete ? 'Mark All Applicants as Complete?' : 'Endorse All Applicants?';
  const subtitle = isAllComplete
    ? `You are about to mark all ${applicantCount} applicants in this batch roster as Complete. This confirms requirements for all records have been inspected.`
    : `You are about to route all ${applicantCount} applicants in this batch for specialized endorsement.`;

  const variant = isAllComplete ? 'success' : 'purple';
  const confirmText = isAllComplete ? `Confirm All Complete (${applicantCount})` : `Confirm All (${applicantCount})`;

  return (
    <ConfirmationModal
      visible={visible}
      title={title}
      subtitle={subtitle}
      variant={variant}
      confirmText={confirmText}
      onConfirm={() => onConfirm(actionType)}
      onCancel={onCancel}
    />
  );
}
