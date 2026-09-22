import { useState, useMemo, useEffect } from 'react';
import { useApi } from '../../../../shared/hooks/useApi';
import { Application, ApplicationDocument, BulkApplicant, getAppDocuments, RawRequirement, mapApiApplicationToApplication } from '../../data/applicationsData';
import { FIELD_ID_TYPE_OF_CERT, FIELD_ID_PERMIT_TYPE, FIELD_ID_APP_TYPE } from '../../../../shared/constants/fieldIds';
import { RawApplicantHolder, RawApplicantDetails, normalizeStatus } from './applicationDetailsTypes';
import { extractApplicantFullName, resolveBirthDate, resolveCivilStatus } from './applicationDetailsHelpers';

export function useApplicationDetailsData(initialApp: Application) {
  const api = useApi();
  const [app, setApp] = useState<Application>(initialApp);

  useEffect(() => {
    setApp(initialApp);
    if (initialApp.id) {
      let isMounted = true;
      const loadFullDetails = async () => {
        try {
          const res = await api.get<unknown>(`/api/v2/applications/${initialApp.id}`);
          if (isMounted && res !== null && typeof res === 'object') {
            const resObj = res as { succeeded?: boolean; data?: unknown };
            const payload = resObj.succeeded && resObj.data !== undefined ? resObj.data : res;
            if (payload !== null && typeof payload === 'object') {
              const mapped = mapApiApplicationToApplication(payload as Parameters<typeof mapApiApplicationToApplication>[0]);

              const rawPayload = payload as { applicants?: Array<{ id?: string; applicantId?: string; requirements?: RawRequirement[] }> };
              const payloadApplicants = Array.isArray(rawPayload.applicants) ? rawPayload.applicants : [];
              const applicantList = mapped.applicants || [];

              // Collect all applicant IDs from payload and mapped applicants
              const applicantIdSet = new Set<string>();
              for (const pa of payloadApplicants) {
                const aid = pa.id || pa.applicantId;
                if (typeof aid === 'string' && aid.trim() !== '') {
                  applicantIdSet.add(aid.trim());
                }
              }
              for (const ap of applicantList) {
                if (typeof ap.id === 'string' && ap.id.trim() !== '') {
                  applicantIdSet.add(ap.id.trim());
                }
              }

              const fetchedReqs: RawRequirement[] = [];
              for (const aid of applicantIdSet) {
                try {
                  const reqRes = await api.get<unknown>(`/api/v2/applications/${initialApp.id}/applicants/${aid}/requirements`);
                  if (reqRes !== null && typeof reqRes === 'object') {
                    const rObj = reqRes as { succeeded?: boolean; data?: unknown };
                    const rData = rObj.succeeded && rObj.data !== undefined ? rObj.data : reqRes;
                    if (Array.isArray(rData)) {
                      const currentApplicantReqs: RawRequirement[] = [];
                      rData.forEach((item: unknown) => {
                        if (item !== null && typeof item === 'object') {
                          const io = item as Record<string, unknown>;
                          const reqItem: RawRequirement = {
                            id: typeof io.submittedRequirementId === 'string' && io.submittedRequirementId.trim() !== ''
                              ? io.submittedRequirementId
                              : typeof io.id === 'string'
                                ? io.id
                                : typeof io.requirementId === 'string'
                                  ? io.requirementId
                                  : undefined,
                            requirementId: typeof io.requirementId === 'string' ? io.requirementId : undefined,
                            serviceVariantRequirementId: typeof io.serviceVariantRequirementId === 'string' ? io.serviceVariantRequirementId : undefined,
                            name: typeof io.requirementName === 'string' && io.requirementName.trim() !== ''
                              ? io.requirementName
                              : typeof io.name === 'string'
                                ? io.name
                                : typeof io.fileName === 'string'
                                  ? io.fileName
                                  : undefined,
                            fileName: typeof io.fileName === 'string' && io.fileName.trim() !== ''
                              ? io.fileName
                              : typeof io.requirementName === 'string'
                                ? io.requirementName
                                : typeof io.name === 'string'
                                  ? io.name
                                  : undefined,
                            storedFileId: typeof io.storedFileId === 'string' ? io.storedFileId : undefined,
                            url: typeof io.url === 'string' ? io.url : undefined,
                            fileSizeBytes: typeof io.fileSizeBytes === 'number' ? io.fileSizeBytes : undefined,
                            contentType: typeof io.contentType === 'string' ? io.contentType : undefined,
                            category: typeof io.category === 'string' ? io.category : 'ATTACHMENT',
                            isApproved: typeof io.isApproved === 'boolean' ? io.isApproved : undefined,
                            uploadedAt: typeof io.uploadedAt === 'string' ? io.uploadedAt : undefined,
                            applicantId: aid,
                          };
                          currentApplicantReqs.push(reqItem);
                          fetchedReqs.push(reqItem);
                        }
                      });

                      // Attach fresh applicant-specific requirements to this applicant in mapped.applicants
                      const matchedApp = mapped.applicants?.find((a) => a.id === aid);
                      if (matchedApp) {
                        matchedApp.requirements = currentApplicantReqs;
                        matchedApp.documents = currentApplicantReqs;
                      }
                    }
                  }
                } catch (rErr) {
                  console.warn(`[useApplicationDetailsData] Could not fetch live requirements for applicant "${aid}" (appId: "${initialApp.id}"):`, rErr);
                }
              }

              if (fetchedReqs.length > 0) {
                mapped.requirements = fetchedReqs;
                mapped.documents = fetchedReqs;
              }

              if (isMounted) {
                setApp(mapped);
              }
            }
          }
        } catch (err) {
          console.warn(`[useApplicationDetailsData] Could not fetch full application details (appId: "${initialApp.id}"):`, err);
        }
      };
      loadFullDetails();
      return () => { isMounted = false; };
    }
  }, [initialApp.id]);

  const isBulk = useMemo(() => (app.mode || '').toString().toUpperCase() === 'BULK', [app.mode]);

  const singleApplicant = useMemo(() => {
    if (app.mode === 'BULK') return null;
    const list = (app.applicants || app.Applicants || []) as RawApplicantHolder[];
    const first = list.length > 0 ? list[0] : null;
    const details: RawApplicantDetails | null = first ? (first.details || (first as unknown as RawApplicantDetails)) : null;
    const applicantName = extractApplicantFullName(app, details, first);
    const rawFormFields = (app.formFieldValues || first?.formFieldValues || details?.formFieldValues || []) as Array<{
      fieldId?: string; fieldLabel?: string; value?: string;
    }>;

    return {
      applicantName,
      sex: details?.sex || app.sex || 'N/A',
      nationality: details?.nationality || app.nationality || 'Filipino',
      streetAddress: details?.streetAddress || details?.address || app.streetAddress || 'N/A',
      barangay: details?.barangay || app.barangay || '',
      cityMunicipality: details?.cityMunicipality || app.cityMunicipality || 'N/A',
      province: details?.province || app.province || 'N/A',
      region: details?.region || app.region || 'N/A',
      zipCode: details?.zipCode || app.zipCode || '',
      mobileNumber: details?.mobileNumber || details?.contactNumber || app.mobileNumber || 'N/A',
      email: details?.email || details?.emailAddress || app.email || 'N/A',
      examineeType: details?.examineeType || first?.applicationType || first?.applicantType || app.element || app.examineeType || 'New',
      birthDate: resolveBirthDate(details, rawFormFields),
      civilStatus: resolveCivilStatus(details, rawFormFields),
      companyName: details?.companyName || app.companyName || (app.company as { name?: string })?.name || (app.Company as { Name?: string })?.Name || null,
      representativeName: details?.representativeName || (app.representativeName as string) || rawFormFields.find((fv) => (fv.fieldLabel || '').toLowerCase().includes('representative'))?.value || null,
      notes: details?.notes || app.remarks || null,
    };
  }, [app]);

  const isExamService = useMemo(() => {
    const cat = (app.serviceCategory || '').toLowerCase().trim();
    const title = (app.serviceName || '').toLowerCase().trim();
    return cat.includes('exam') || title.includes('exam') || title.includes('admission') || title.includes('operator examination');
  }, [app.serviceCategory, app.serviceName]);

  const scheduleSummaryText = useMemo(() => {
    if (app.schedule) {
      const parts = [
        app.schedule.date && app.schedule.date !== 'TBD' ? app.schedule.date : undefined,
        app.schedule.time && app.schedule.time !== 'TBD' ? app.schedule.time : undefined,
        app.schedule.venue || app.office || undefined,
      ].filter(Boolean);
      if (parts.length > 0) return parts.join(' • ');
    }
    return app.office ? `NTC Field Office • ${app.office}` : null;
  }, [app]);

  const variantLabel = useMemo(() => app.serviceVariantName || app.variant || app.element || singleApplicant?.examineeType || 'Standard', [app, singleApplicant]);

  const formFieldValues = useMemo(() => {
    if (app.formFieldValues && app.formFieldValues.length > 0) return app.formFieldValues;
    const rawList = app.applicants || app.Applicants || [];
    if (rawList.length > 0) {
      const first = rawList[0];
      if (first.formFieldValues && first.formFieldValues.length > 0) return first.formFieldValues;
      if (first.details && 'formFieldValues' in first.details) {
        const dF = (first.details as { formFieldValues?: Array<{ fieldId: string; fieldLabel: string; value: string }> }).formFieldValues;
        if (dF && dF.length > 0) return dF;
      }
    }
    return [];
  }, [app]);

  const appApplicants = useMemo<BulkApplicant[]>(() => {
    const rawApplicants = app.applicants || app.Applicants || [];
    return rawApplicants.map((ap: BulkApplicant) => ({
      id: ap.id || '',
      name: extractApplicantFullName(app, ap.details || ap, ap),
      applicationType: ap.applicationType || ap.applicantType || 'Individual',
      status: ap.status || 'PENDING',
      includedInSOA: ap.includedInSOA !== undefined ? ap.includedInSOA : (ap.includedInSoa !== undefined ? ap.includedInSoa : false),
      sex: ap.sex || ap.details?.sex,
      nationality: ap.nationality || ap.details?.nationality,
      streetAddress: ap.streetAddress || ap.details?.address,
      barangay: ap.barangay || ap.details?.barangay,
      cityMunicipality: ap.cityMunicipality || ap.details?.cityMunicipality,
      province: ap.province || ap.details?.province,
      region: ap.region || ap.details?.region,
      zipCode: ap.zipCode || ap.details?.zipCode,
      mobileNumber: ap.mobileNumber || ap.contactNumber || ap.details?.contactNumber,
      email: ap.email || ap.emailAddress || ap.details?.emailAddress,
      schedule: ap.schedule || undefined,
    }));
  }, [isBulk ? app.applicants : null, app.Applicants]);

  const totalSubmitted = isBulk ? appApplicants.length : 0;
  const approvedCount = isBulk ? appApplicants.filter((a) => normalizeStatus(a.status) === 'APPROVED').length : 0;
  const declinedCount = isBulk ? appApplicants.filter((a) => normalizeStatus(a.status) === 'DECLINED').length : 0;
  const pendingCount = isBulk ? appApplicants.filter((a) => { const s = normalizeStatus(a.status); return s !== 'APPROVED' && s !== 'DECLINED'; }).length : 0;

  const docs = useMemo<ApplicationDocument[]>(() => {
    const rawReqs: RawRequirement[] = [];
    const pushReq = (r: RawRequirement | undefined | null) => {
      if (r && !rawReqs.some((existing) => (r.id && existing.id === r.id) || (r.storedFileId && existing.storedFileId === r.storedFileId) || (r.url && existing.url === r.url))) {
        rawReqs.push(r);
      }
    };

    const topList =
      app.requirements ||
      app.Requirements ||
      app.applicationRequirements ||
      app.ApplicationRequirements ||
      app.documents ||
      app.Documents;

    if (Array.isArray(topList)) {
      topList.forEach(pushReq);
    }

    const appList = app.applicants || app.Applicants || [];
    if (Array.isArray(appList)) {
      appList.forEach((a) => {
        const aReqs =
          a.requirements ||
          a.Requirements ||
          a.documents ||
          a.Documents ||
          a.applicationRequirements ||
          a.ApplicationRequirements;
        if (Array.isArray(aReqs)) {
          aReqs.forEach(pushReq);
        }
        const aUploads = (a as { uploads?: Record<string, { name?: string; uri?: string } | string> }).uploads;
        if (aUploads && typeof aUploads === 'object') {
          Object.entries(aUploads).forEach(([k, up]) => {
            if (up) {
              const uName = typeof up === 'string' ? up : up.name || k;
              const uUri = typeof up === 'string' ? '' : up.uri || '';
              pushReq({
                id: `upload-${k}`,
                name: uName,
                fileName: uName,
                url: uUri,
                category: 'ATTACHMENT',
              });
            }
          });
        }
      });
    }

    if (rawReqs.length > 0) {
      return rawReqs.map((req: RawRequirement, index: number) => {
        const urlStr = req.url || '';
        const hasFile = Boolean(
          (urlStr && urlStr.trim() !== '' && urlStr.trim().toLowerCase() !== 'none' && urlStr.trim().toLowerCase() !== 'null') ||
          (req.storedFileId && req.storedFileId.trim() !== '' && req.storedFileId.trim().toLowerCase() !== 'none' && req.storedFileId.trim().toLowerCase() !== 'null')
        );

        const rawName = req.fileName || req.name || (urlStr ? urlStr.split('/').pop() : undefined) || (hasFile ? `Attachment_${index + 1}.pdf` : req.name || `Requirement_${index + 1}`);
        let cat: 'ATTACHMENT' | 'ISSUED_PERMIT' | 'RECEIPT' | 'SOA' | 'ADMISSION_SLIP' = 'ATTACHMENT';
        if (['ATTACHMENT','ISSUED_PERMIT','RECEIPT','SOA','ADMISSION_SLIP'].includes(req.category || '')) cat = req.category as typeof cat;
        const ext = rawName.toLowerCase().split('.').pop() || '';
        let typ: 'PDF' | 'IMAGE' | 'DOCX' | 'ZIP' = 'PDF';
        if (['jpg','jpeg','png','webp','gif','bmp','svg'].includes(ext)) typ = 'IMAGE';
        else if (['zip','rar','7z'].includes(ext)) typ = 'ZIP';
        else if (['doc','docx'].includes(ext)) typ = 'DOCX';

        let formattedSize = req.size;
        if (!formattedSize && req.fileSizeBytes) {
          formattedSize = req.fileSizeBytes >= 1024 * 1024
            ? `${(req.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB`
            : `${Math.round(req.fileSizeBytes / 1024)} KB`;
        }

        return {
          id: req.id || req.storedFileId || `doc-${index}`,
          name: rawName,
          type: typ,
          size: formattedSize || (hasFile ? '1.2 MB' : ''),
          category: cat,
          uploadedAt: req.uploadedAt || app.submittedAt || new Date().toISOString(),
          url: hasFile ? req.url : undefined,
          storedFileId: hasFile ? req.storedFileId : undefined,
        };
      });
    }
    return getAppDocuments(app);
  }, [app]);

  const primaryName = useMemo(() => {
    if (app.mode === 'BULK') return app.companyName || app.companyDetail?.name || extractApplicantFullName(app, null, null);
    return singleApplicant?.applicantName || extractApplicantFullName(app, null, null);
  }, [app, singleApplicant]);

  const resolvedServiceVariant = useMemo(() =>
    app.serviceVariantName || app.variant ||
    app.formFieldValues?.find((fv) =>
      fv.fieldId === FIELD_ID_TYPE_OF_CERT || fv.fieldId === FIELD_ID_PERMIT_TYPE || fv.fieldId === FIELD_ID_APP_TYPE ||
      (fv.fieldId !== undefined && fv.fieldId.toLowerCase().includes('variant')) ||
      (fv.fieldLabel !== undefined && (
        fv.fieldLabel.toLowerCase().includes('permit / license type') ||
        fv.fieldLabel.toLowerCase().includes('type of certificate') ||
        fv.fieldLabel.toLowerCase().includes('application variant') ||
        fv.fieldLabel.toLowerCase().includes('application type')
      ))
    )?.value ||
    (!isBulk && Array.isArray(app.applicants) && app.applicants.length > 0 && app.applicants[0].applicationType && app.applicants[0].applicationType !== 'Individual' ? app.applicants[0].applicationType : '') ||
    (app.element !== 'New' ? app.element : ''),
  [app, isBulk]);

  const currentStepIndex = useMemo(() => {
    switch (normalizeStatus(app.status)) {
      case 'PENDING': return 1;
      case 'FOR_EVALUATION': return 2;
      case 'FOR_APPROVAL': return 3;
      case 'APPROVED': case 'READY_FOR_PAYMENT': return 4;
      case 'DECLINED': case 'EXPIRING_SOON': return 2;
      default: return 3;
    }
  }, [app.status]);

  return {
    app,
    isBulk,
    singleApplicant,
    isExamService,
    scheduleSummaryText,
    variantLabel,
    formFieldValues,
    appApplicants,
    totalSubmitted,
    approvedCount,
    declinedCount,
    pendingCount,
    docs,
    primaryName,
    resolvedServiceVariant,
    currentStepIndex,
  };
}
