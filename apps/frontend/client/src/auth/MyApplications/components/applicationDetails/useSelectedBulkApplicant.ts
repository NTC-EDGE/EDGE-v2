import { useState, useMemo } from 'react';
import { Application, ApplicationDocument, BulkApplicant, RawRequirement } from '../../data/applicationsData';
import { RawApplicantHolder } from './applicationDetailsTypes';

export function useSelectedBulkApplicant(app: Application, selectedApplicant: BulkApplicant | null) {
  const selectedApplicantFormFields = useMemo(() => {
    if (!selectedApplicant) return [];
    if (selectedApplicant.formFieldValues && selectedApplicant.formFieldValues.length > 0) {
      return selectedApplicant.formFieldValues;
    }
    if (selectedApplicant.details?.formFieldValues && selectedApplicant.details.formFieldValues.length > 0) {
      return selectedApplicant.details.formFieldValues;
    }
    const rawList = app.applicants || app.Applicants || [];
    const matched = rawList.find((a) => a.id === selectedApplicant.id);
    return matched?.formFieldValues && matched.formFieldValues.length > 0 ? matched.formFieldValues : [];
  }, [selectedApplicant, app]);

  const selectedApplicantDocs = useMemo<ApplicationDocument[]>(() => {
    if (!selectedApplicant) return [];
    const rawReqs = (app.requirements ||
      app.Requirements ||
      (app as { applicationRequirements?: RawRequirement[] }).applicationRequirements ||
      (app as { ApplicationRequirements?: RawRequirement[] }).ApplicationRequirements ||
      app.documents ||
      app.Documents ||
      []) as RawRequirement[];

    const matchedReqs = rawReqs.filter((r) => r.applicantId === selectedApplicant.id);
    const rawApplicants = (app.applicants || app.Applicants || []) as RawApplicantHolder[];
    const rawMatch = rawApplicants.find((a) => a.id === selectedApplicant.id);
    const directReqs: RawRequirement[] =
      (rawMatch?.requirements as RawRequirement[]) ||
      ((rawMatch as { Requirements?: RawRequirement[] })?.Requirements as RawRequirement[]) ||
      [];
    const candidateReqs =
      matchedReqs.length > 0
        ? matchedReqs
        : directReqs.length > 0
          ? directReqs
          : rawReqs;

    return candidateReqs.map((req, idx) => {
      const urlStr = req.url || '';
      const hasFile = Boolean(
        (urlStr && urlStr.trim() !== '' && urlStr.trim().toLowerCase() !== 'none' && urlStr.trim().toLowerCase() !== 'null') ||
        (req.storedFileId && req.storedFileId.trim() !== '' && req.storedFileId.trim().toLowerCase() !== 'none' && req.storedFileId.trim().toLowerCase() !== 'null')
      );

      const rawName =
        req.fileName || req.name || (urlStr ? urlStr.split('/').pop() : undefined) || (hasFile ? `Attachment_${idx + 1}.pdf` : req.name || `Requirement_${idx + 1}`);
      const ext = rawName.toLowerCase().split('.').pop() || '';
      let typ: 'PDF' | 'IMAGE' | 'DOCX' | 'ZIP' = 'PDF';
      if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'svg'].includes(ext)) typ = 'IMAGE';
      else if (['zip', 'rar', '7z'].includes(ext)) typ = 'ZIP';
      else if (['doc', 'docx'].includes(ext)) typ = 'DOCX';

      let sizeFormatted = req.size;
      if (!sizeFormatted && req.fileSizeBytes) {
        sizeFormatted =
          req.fileSizeBytes >= 1024 * 1024
            ? `${(req.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB`
            : `${Math.round(req.fileSizeBytes / 1024)} KB`;
      }

      let category: ApplicationDocument['category'] = 'ATTACHMENT';
      if (typeof req.category === 'string') {
        const catUpper = req.category.toUpperCase();
        if (catUpper === 'ISSUED_PERMIT' || catUpper === 'RECEIPT' || catUpper === 'SOA' || catUpper === 'ADMISSION_SLIP') {
          category = catUpper;
        }
      }

      return {
        id: req.id || req.storedFileId || `applicant-doc-${idx + 1}`,
        name: rawName,
        type: typ,
        size: sizeFormatted || (hasFile ? '350 KB' : ''),
        category,
        uploadedAt: req.uploadedAt || app.submittedAt,
        url: hasFile ? req.url : undefined,
        storedFileId: hasFile ? req.storedFileId : undefined,
      };
    });
  }, [selectedApplicant, app]);

  return {
    selectedApplicantFormFields,
    selectedApplicantDocs,
  };
}
