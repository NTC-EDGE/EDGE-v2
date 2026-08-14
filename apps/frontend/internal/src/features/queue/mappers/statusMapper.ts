import { ApplicationStatus, QueueTab } from '../../../types/application';

const STATUS_MAP: Record<string, ApplicationStatus> = {
  Draft: 'Draft',
  Submitted: 'Submitted',
  Evaluating: 'Evaluating',
  Returned: 'Returned',
  Approved: 'Approved',
  Completed: 'Completed',
};

export function mapBEStatusToFE(status: string | undefined): ApplicationStatus {
  if (status !== undefined && status in STATUS_MAP) {
    const mapped = STATUS_MAP[status];
    if (mapped !== undefined) {
      return mapped;
    }
  }
  return 'Submitted';
}

export function deriveQueueTab(status: ApplicationStatus): QueueTab {
  if (status === 'Submitted' || status === 'Evaluating') {
    return 'pending';
  }
  if (status === 'Approved' || status === 'Returned' || status === 'Completed') {
    return 'history';
  }
  return 'activity';
}

export function formatDateLabel(isoDate: string | undefined): string {
  if (!isoDate) {
    return '';
  }
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) {
    return '';
  }
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}
