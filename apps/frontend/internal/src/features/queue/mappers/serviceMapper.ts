import { ApplicantDto, ApplicationFeedServiceDto } from '@edge/api';
import { ApplicantItem, ApplicationServiceItem } from '../../../types/application';

/**
 * Derives a generic human-readable service name for the application from ApplicantDto list.
 * Replaces the legacy "Permit Title" concept with a generic "Service Name".
 */
export function deriveServiceName(
  applicants: ApplicantDto[] | undefined,
  isBulk: boolean
): string {
  if (!applicants || applicants.length === 0) {
    return '';
  }

  if (isBulk) {
    const titles = applicants
      .slice(0, 2)
      .map((applicant) => applicant.serviceId ?? '')
      .filter((serviceId) => serviceId.trim().length > 0);

    return titles.join(', ');
  }

  const firstApplicant = applicants[0];
  return firstApplicant?.serviceId ?? '';
}

/**
 * Derives a generic human-readable service name from the feed services list [{ name, variant }].
 */
export function deriveServiceNameFromFeed(
  services: ApplicationFeedServiceDto[] | undefined,
  isBulk: boolean
): string {
  if (!services || services.length === 0) {
    return '';
  }

  if (isBulk) {
    const titles = services
      .slice(0, 2)
      .map((s) => s.name)
      .filter((name) => name.trim().length > 0);

    return titles.join(', ');
  }

  const firstService = services[0];
  return firstService?.name ?? '';
}

/**
 * Maps application services directly from the applicant items list.
 * Since each applicant holds its own service, this resolves the service item for each applicant.
 */
export function mapApplicationServices(
  applicantsList: ApplicantItem[]
): ApplicationServiceItem[] {
  return applicantsList.map((applicant) => ({
    id: applicant.id,
    applicantId: applicant.id,
    serviceId: applicant.serviceId ?? '',
    serviceVariantId: applicant.serviceVariantId,
    submissionId: applicant.submissionId,
  }));
}
