import { ApplicationDocument, RawRequirement } from './applicationBaseTypes';
import { BulkApplicant, EnrichedBulkApplicant } from './applicationApplicantTypes';
import { Application } from './applicationModelTypes';

function resolveDocType(ext: string): 'PDF' | 'IMAGE' | 'DOCX' | 'ZIP' {
  if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'svg'].includes(ext)) return 'IMAGE';
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return 'ZIP';
  if (['doc', 'docx'].includes(ext)) return 'DOCX';
  return 'PDF';
}

function formatFileSize(size: string | undefined, fileSizeBytes: number | undefined, fallback: string): string {
  if (size) return size;
  if (fileSizeBytes) {
    if (fileSizeBytes >= 1024 * 1024) {
      return `${(fileSizeBytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    return `${Math.round(fileSizeBytes / 1024)} KB`;
  }
  return fallback;
}

function hasValidFileRef(urlStr: string, storedFileId?: string): boolean {
  const cleanUrl = urlStr.trim().toLowerCase();
  const cleanFileId = (storedFileId || '').trim().toLowerCase();
  return Boolean(
    (cleanUrl !== '' && cleanUrl !== 'none' && cleanUrl !== 'null') ||
      (cleanFileId !== '' && cleanFileId !== 'none' && cleanFileId !== 'null')
  );
}

function resolveDocCategory(rawCategory: string | undefined, rawName: string): ApplicationDocument['category'] {
  const catLower = (rawCategory || '').toLowerCase();
  const nameLower = rawName.toLowerCase();
  if (catLower.includes('admission') || nameLower.includes('admission')) return 'ADMISSION_SLIP';
  if (catLower.includes('receipt') || nameLower.includes('receipt') || nameLower.includes('official_receipt')) {
    return 'RECEIPT';
  }
  if (catLower.includes('soa') || nameLower.includes('soa') || nameLower.includes('statement_of_account')) {
    return 'SOA';
  }
  if (
    catLower.includes('permit') ||
    catLower.includes('license') ||
    nameLower.includes('license') ||
    nameLower.includes('certificate')
  ) {
    return 'ISSUED_PERMIT';
  }
  return 'ATTACHMENT';
}

export function getAppDocuments(app: Application): ApplicationDocument[] {
  const docs: ApplicationDocument[] = [];
  const rawList: RawRequirement[] =
    app.requirements ||
    app.Requirements ||
    app.applicationRequirements ||
    app.ApplicationRequirements ||
    app.documents ||
    app.Documents ||
    [];

  if (rawList.length > 0) {
    return rawList.map((req, idx) => {
      const urlStr = req.url || '';
      const hasFile = hasValidFileRef(urlStr, req.storedFileId);
      const rawName =
        req.fileName ||
        req.requirementName ||
        req.name ||
        (urlStr ? urlStr.split('/').pop() : undefined) ||
        (hasFile ? `Attachment_${idx + 1}.pdf` : `Requirement_${idx + 1}`);
      const reqDisplayName = req.requirementName || req.name || rawName;
      const ext = rawName.toLowerCase().split('.').pop() || '';

      return {
        id: req.id || req.storedFileId || `req-doc-${idx + 1}`,
        name: rawName,
        requirementName: reqDisplayName,
        applicantId: req.applicantId,
        requirementId: req.requirementId,
        serviceVariantRequirementId: req.serviceVariantRequirementId,
        type: resolveDocType(ext),
        size: formatFileSize(req.size, req.fileSizeBytes, hasFile ? '350 KB' : ''),
        category: resolveDocCategory(req.category, rawName),
        uploadedAt: req.uploadedAt || app.submittedAt,
        url: hasFile ? req.url : undefined,
        storedFileId: hasFile ? req.storedFileId : undefined,
      };
    });
  }

  const rawApplicants = app.applicants || app.Applicants || [];
  for (let aIdx = 0; aIdx < rawApplicants.length; aIdx++) {
    const ap = rawApplicants[aIdx];
    const apReqs: RawRequirement[] = ap.requirements || ap.Requirements || [];
    for (let rIdx = 0; rIdx < apReqs.length; rIdx++) {
      const req = apReqs[rIdx];
      const urlStr = req.url || '';
      const hasFile = hasValidFileRef(urlStr, req.storedFileId);
      const rawName =
        req.fileName ||
        req.requirementName ||
        req.name ||
        (urlStr ? urlStr.split('/').pop() : undefined) ||
        (hasFile ? `${ap.name || 'Applicant'}_Attachment_${rIdx + 1}.pdf` : `Requirement_${rIdx + 1}`);
      const reqDisplayName = req.requirementName || req.name || rawName;
      const ext = rawName.toLowerCase().split('.').pop() || '';

      docs.push({
        id: req.id || req.storedFileId || `ap-${aIdx}-req-${rIdx + 1}`,
        name: rawName,
        requirementName: reqDisplayName,
        applicantId: req.applicantId || ap.id,
        requirementId: req.requirementId,
        serviceVariantRequirementId: req.serviceVariantRequirementId,
        type: resolveDocType(ext),
        size: formatFileSize(req.size, req.fileSizeBytes, hasFile ? '350 KB' : ''),
        category: 'ATTACHMENT',
        uploadedAt: req.uploadedAt || app.submittedAt,
        url: hasFile ? req.url : undefined,
        storedFileId: hasFile ? req.storedFileId : undefined,
      });
    }
  }

  return docs;
}

export function getApplicantDocuments(applicant: BulkApplicant): ApplicationDocument[] {
  const rawReqs: RawRequirement[] = applicant.requirements || applicant.Requirements || [];
  if (rawReqs.length === 0) return [];

  return rawReqs.map((req, idx) => {
    const urlStr = req.url || '';
    const rawName =
      req.fileName ||
      req.name ||
      (urlStr ? urlStr.split('/').pop() : undefined) ||
      `${applicant.name || 'Applicant'}_Attachment_${idx + 1}.pdf`;
    const ext = rawName.toLowerCase().split('.').pop() || '';

    return {
      id: req.id || req.storedFileId || `${applicant.id}-req-${idx + 1}`,
      name: rawName,
      type: resolveDocType(ext),
      size: formatFileSize(req.size, req.fileSizeBytes, '350 KB'),
      category: 'ATTACHMENT',
      uploadedAt: req.uploadedAt || new Date().toISOString(),
      url: req.url,
      storedFileId: req.storedFileId,
    };
  });
}

export function getEnrichedApplicant(applicant: BulkApplicant, _serviceName: string): EnrichedBulkApplicant {
  const hash = (applicant.id + applicant.name)
    .split('')
    .reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
  const sex = hash % 2 === 0 ? 'Female' : 'Male';
  const cities = ['Manila', 'Quezon City', 'Cebu City', 'Davao City', 'San Fernando'];
  const provinces = ['Metro Manila', 'Metro Manila', 'Cebu', 'Davao del Sur', 'Pampanga'];
  const regions = [
    'NCR – National Capital Region',
    'NCR – National Capital Region',
    'Region VII – Central Visayas',
    'Region XI – Davao Region',
    'Region III – Central Luzon',
  ];
  const index = hash % cities.length;

  return {
    id: applicant.id,
    name: applicant.name,
    applicationType: applicant.applicationType,
    status: applicant.status,
    includedInSOA: applicant.includedInSOA,
    sex: applicant.sex ?? sex,
    nationality: applicant.nationality ?? 'Filipino',
    streetAddress: applicant.streetAddress ?? `${100 + (hash % 900)} Rizal Avenue`,
    barangay: applicant.barangay ?? `Barangay ${100 + (hash % 800)}`,
    cityMunicipality: applicant.cityMunicipality ?? cities[index],
    province: applicant.province ?? provinces[index],
    region: applicant.region ?? regions[index],
    zipCode: applicant.zipCode ?? `${1000 + (hash % 8999)}`,
    mobileNumber: applicant.mobileNumber ?? `+63 917 ${100 + (hash % 900)} ${1000 + (hash % 8999)}`,
    email: applicant.email ?? `${applicant.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@email.com`,
    schedule: applicant.schedule ?? {
      date: 'August 28, 2026',
      time: '09:00 AM',
      venue: `NTC Region ${index + 1} Office, ${cities[index]}`,
    },
  };
}
