import { ApiApplicantDetailsDto, ApiApplicantDto } from './applicationApiItemTypes';
import { ApiApplicationDto } from './applicationApiTypes';

export function isGenericCandidate(val?: string | null): boolean {
  if (!val || typeof val !== 'string') return true;
  const lower = val.trim().toLowerCase();
  if (
    [
      'applicant details',
      'applicant detail',
      'applicant',
      'unnamed applicant',
      'unnamed',
      'n/a',
      'na',
      'none',
      'juan dela cruz',
    ].includes(lower)
  ) {
    return true;
  }
  if (/^applicant(\s*#?\s*\d+)?$/i.test(lower)) return true;
  if (/^draft(\s+applicant)?(\s*#?\s*\d+)?$/i.test(lower)) return true;
  return false;
}

export function isValidCandidate(val?: string | null): val is string {
  return typeof val === 'string' && val.trim().length > 0 && !isGenericCandidate(val);
}

export function formatProperName(name?: string | null): string {
  if (!name || typeof name !== 'string') return '';
  const trimmed = name.trim();
  if (!trimmed) return '';

  return trimmed
    .split(/\s+/)
    .map((word) => {
      if (!word) return '';
      if (word.includes('-')) {
        return word
          .split('-')
          .map((part) => {
            if (!part) return '';
            return part === part.toLowerCase() ? part.charAt(0).toUpperCase() + part.slice(1) : part;
          })
          .join('-');
      }
      return word === word.toLowerCase() ? word.charAt(0).toUpperCase() + word.slice(1) : word;
    })
    .join(' ');
}

export function formatVariantAppType(val: string): string {
  const trimmed = val.trim();
  const lower = trimmed.toLowerCase();
  if (lower === 'firsttaker' || lower === 'first_taker') return 'First Taker';
  if (lower === 'civicactiongroup' || lower === 'civic_action_group') return 'Civic Action Group';
  const parenMatch = trimmed.match(
    /\((First\s*Taker|FirstTaker|Retaker|Renewal|Modification|Upgrading|Upgrade|Additional|New)\)\s*$/i
  );
  if (parenMatch && parenMatch[1]) {
    const inner = parenMatch[1].trim();
    return inner.toLowerCase() === 'firsttaker' ? 'First Taker' : inner;
  }
  return trimmed;
}

export function resolvePrimaryApplicantName(
  dto: ApiApplicationDto,
  firstApplicant: ApiApplicantDto | undefined,
  companyName: string
): string {
  const firstDetails = firstApplicant?.details || firstApplicant;
  const rawFirstAppCandidate =
    firstDetails?.firstName && firstDetails?.lastName
      ? [firstDetails.firstName, firstDetails.middleName, firstDetails.lastName].filter(Boolean).join(' ')
      : firstApplicant?.name;

  const firstDetailsComp = firstDetails?.companyName;
  const firstAppComp = firstApplicant?.companyName;
  const firstAppNestedComp = firstApplicant?.company?.name;

  if (isValidCandidate(dto.applicantName)) return formatProperName(dto.applicantName);
  if (isValidCandidate(rawFirstAppCandidate)) return formatProperName(rawFirstAppCandidate);
  if (isValidCandidate(firstDetailsComp)) return formatProperName(firstDetailsComp);
  if (isValidCandidate(firstAppComp)) return formatProperName(firstAppComp);
  if (isValidCandidate(firstAppNestedComp)) return formatProperName(firstAppNestedComp);
  if (isValidCandidate(companyName)) return formatProperName(companyName);
  return formatProperName(dto.filingUser?.name) || 'Applicant';
}

export interface ApplicantNameResolutionInput {
  ap: ApiApplicantDto;
  apDetails: ApiApplicantDetailsDto;
  idx: number;
  isBulk: boolean;
  isIndividualAp: boolean;
  compName?: string;
  repName?: string;
  filingUserName?: string;
  combinedFromFv: string;
  fvIndivNameCandidate?: string;
  fvCorpNameCandidate?: string;
}

export function resolveBulkApplicantDisplayName(input: ApplicantNameResolutionInput): string {
  const {
    ap,
    apDetails,
    idx,
    isBulk,
    isIndividualAp,
    compName,
    repName,
    filingUserName,
    combinedFromFv,
    fvIndivNameCandidate,
    fvCorpNameCandidate,
  } = input;

  const rawCandidate =
    apDetails.firstName && apDetails.lastName
      ? [apDetails.firstName, apDetails.middleName, apDetails.lastName].filter(Boolean).join(' ')
      : ap.name;

  const rawCandLower = typeof rawCandidate === 'string' ? rawCandidate.trim().toLowerCase() : '';
  const repLower = typeof repName === 'string' ? repName.trim().toLowerCase() : '';
  const filingLower = typeof filingUserName === 'string' ? filingUserName.trim().toLowerCase() : '';
  const isRawCandidateRep =
    rawCandLower.length > 0 &&
    ((repLower.length > 0 && rawCandLower === repLower) ||
      (isBulk &&
        filingLower.length > 0 &&
        rawCandLower === filingLower &&
        Boolean(combinedFromFv || fvIndivNameCandidate || fvCorpNameCandidate)));

  if (!isIndividualAp && isRawCandidateRep && isValidCandidate(fvCorpNameCandidate)) {
    return formatProperName(fvCorpNameCandidate);
  }
  if (!isIndividualAp && isRawCandidateRep && isValidCandidate(compName)) {
    return formatProperName(compName);
  }
  if (isValidCandidate(rawCandidate) && !isRawCandidateRep) {
    return formatProperName(rawCandidate);
  }
  if (isValidCandidate(combinedFromFv)) {
    return formatProperName(combinedFromFv);
  }
  if (isValidCandidate(fvIndivNameCandidate)) {
    return formatProperName(fvIndivNameCandidate);
  }
  if (!isIndividualAp && isValidCandidate(fvCorpNameCandidate)) {
    return formatProperName(fvCorpNameCandidate);
  }
  if (!isIndividualAp && isValidCandidate(compName)) {
    return formatProperName(compName);
  }
  if (isValidCandidate(rawCandidate)) {
    return formatProperName(rawCandidate);
  }
  if (isBulk) {
    return `Applicant #${idx + 1}`;
  }
  return formatProperName(filingUserName) || formatProperName(compName) || 'Applicant';
}
