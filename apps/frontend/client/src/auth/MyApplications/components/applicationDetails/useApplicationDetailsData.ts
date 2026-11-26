import { useState, useMemo, useEffect, useCallback } from 'react';
import { applicationService } from '@edge/api';
import { useApi } from '../../../../shared/hooks/useApi';
import { Application, ApplicationDocument, BulkApplicant, getAppDocuments, RawRequirement, mapApiApplicationToApplication } from '../../data/applicationsData';
import { RawApplicantHolder, RawApplicantDetails, normalizeStatus } from './applicationDetailsTypes';
import { extractApplicantFullName, resolveBirthDate, resolveCivilStatus } from './applicationDetailsHelpers';
import {
  resolvePreviewVariant,
  resolvePreviewApplicationType,
  resolvePreviewElements,
  detectCanonicalForm,
} from '../../../../shared/formPreview';

function isRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null;
}

function getStringField(obj: unknown, key: string): string | undefined {
  if (!isRecord(obj)) return undefined;
  const val = obj[key];
  return typeof val === 'string' && val.trim().length > 0 ? val : undefined;
}

function getNestedStringField(obj: unknown, parentKey: string, childKey: string): string | undefined {
  if (!isRecord(obj)) return undefined;
  const parent = obj[parentKey];
  return getStringField(parent, childKey);
}

function normalizeSexValue(val: string | undefined): 'Male' | 'Female' | undefined {
  if (val === 'Male' || val === 'Female') return val;
  return undefined;
}

function normalizeDocCategory(
  val: string | undefined
): 'ATTACHMENT' | 'ISSUED_PERMIT' | 'RECEIPT' | 'SOA' | 'ADMISSION_SLIP' {
  if (
    val === 'ATTACHMENT' ||
    val === 'ISSUED_PERMIT' ||
    val === 'RECEIPT' ||
    val === 'SOA' ||
    val === 'ADMISSION_SLIP'
  ) {
    return val;
  }
  return 'ATTACHMENT';
}

export function useApplicationDetailsData(initialApp: Application) {
  const api = useApi();
  const [app, setApp] = useState<Application>(initialApp);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refetch = useCallback(() => {
    setRefreshTrigger((k) => k + 1);
  }, []);

  useEffect(() => {
    setApp(initialApp);
    if (initialApp.id) {
      let isMounted = true;
      const loadFullDetails = async () => {
        try {
          const res = await api.get<unknown>(`/api/v2/applications/${initialApp.id}`);
          if (isMounted && isRecord(res)) {
            const payload = res.succeeded === true && isRecord(res.data) ? res.data : res;
            if (isRecord(payload)) {
              const mapped = mapApiApplicationToApplication(payload);

              const payloadApplicants = Array.isArray(payload.applicants) ? payload.applicants : [];
              const applicantList = mapped.applicants || [];

              // Collect all applicant IDs from payload and mapped applicants
              const applicantIdSet = new Set<string>();
              for (const pa of payloadApplicants) {
                if (isRecord(pa)) {
                  const aid = getStringField(pa, 'id') || getStringField(pa, 'applicantId');
                  if (typeof aid === 'string' && aid.trim() !== '') {
                    applicantIdSet.add(aid.trim());
                  }
                }
              }
              for (const ap of applicantList) {
                if (typeof ap.id === 'string' && ap.id.trim() !== '') {
                  applicantIdSet.add(ap.id.trim());
                }
              }
              if (applicantIdSet.size === 0 && typeof initialApp.id === 'string' && initialApp.id.trim() !== '') {
                applicantIdSet.add(initialApp.id.trim());
              }

              const fetchedReqs: RawRequirement[] = [];
              for (const aid of applicantIdSet) {
                try {
                  const reqRes = await api.get<unknown>(`/api/v2/applications/${initialApp.id}/applicants/${aid}/requirements`);
                  if (reqRes !== null && typeof reqRes === 'object') {
                    const rData = isRecord(reqRes) && reqRes.succeeded === true && reqRes.data !== undefined
                      ? reqRes.data
                      : reqRes;
                    if (Array.isArray(rData)) {
                      const currentApplicantReqs: RawRequirement[] = [];
                      rData.forEach((item: unknown) => {
                        if (isRecord(item)) {
                          const io = item;
                          const reqItem: RawRequirement = {
                            id: typeof io.submittedRequirementId === 'string' && io.submittedRequirementId.trim() !== ''
                              ? io.submittedRequirementId
                              : typeof io.id === 'string'
                                ? io.id
                                : typeof io.requirementId === 'string'
                                  ? io.requirementId
                                  : undefined,
                            requirementId: typeof io.requirementId === 'string' ? io.requirementId : undefined,
                            requirementName: typeof io.requirementName === 'string' && io.requirementName.trim() !== '' ? io.requirementName : undefined,
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
                // Merge with any existing requirements from mapped.requirements or payload.requirements
                const existingDocs = Array.isArray(mapped.requirements) ? mapped.requirements : [];
                const mergedReqs: RawRequirement[] = [...fetchedReqs];

                for (const existingDoc of existingDocs) {
                  const hasExistingFile = Boolean(
                    (existingDoc.url && existingDoc.url.trim() !== '' && existingDoc.url.toLowerCase() !== 'none' && existingDoc.url.toLowerCase() !== 'null') ||
                    (existingDoc.storedFileId && existingDoc.storedFileId.trim() !== '' && existingDoc.storedFileId.toLowerCase() !== 'none' && existingDoc.storedFileId.toLowerCase() !== 'null')
                  );
                  if (!hasExistingFile) continue;

                  const existingLabelLower = (existingDoc.requirementName || existingDoc.name || '').trim().toLowerCase();

                  // Check if this existing doc already matches an item in fetchedReqs for the same applicant
                  const matched = mergedReqs.find((r) => {
                    const sameApplicant =
                      !r.applicantId ||
                      !existingDoc.applicantId ||
                      r.applicantId === existingDoc.applicantId ||
                      (applicantIdSet.size <= 1 && existingDoc.applicantId === initialApp.id);
                    if (!sameApplicant) return false;

                    const rLabelLower = (r.requirementName || r.name || '').trim().toLowerCase();
                    return (
                      (r.id && existingDoc.id && r.id === existingDoc.id) ||
                      (r.storedFileId && existingDoc.storedFileId && r.storedFileId === existingDoc.storedFileId) ||
                      (r.requirementId && existingDoc.requirementId && r.requirementId === existingDoc.requirementId) ||
                      (r.serviceVariantRequirementId && existingDoc.serviceVariantRequirementId && r.serviceVariantRequirementId === existingDoc.serviceVariantRequirementId) ||
                      (rLabelLower !== '' && existingLabelLower !== '' && rLabelLower === existingLabelLower)
                    );
                  });

                  if (matched) {
                    if (!matched.storedFileId && existingDoc.storedFileId) matched.storedFileId = existingDoc.storedFileId;
                    if (!matched.url && existingDoc.url) matched.url = existingDoc.url;
                    if (!matched.fileName && existingDoc.fileName) matched.fileName = existingDoc.fileName;
                    if (!matched.requirementName && existingDoc.requirementName) matched.requirementName = existingDoc.requirementName;
                    if (!matched.fileSizeBytes && existingDoc.fileSizeBytes) matched.fileSizeBytes = existingDoc.fileSizeBytes;
                    if (!matched.contentType && existingDoc.contentType) matched.contentType = existingDoc.contentType;
                  } else {
                    mergedReqs.push(existingDoc);
                  }
                }

                mapped.requirements = mergedReqs;
                mapped.documents = mergedReqs;
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

      return () => {
        isMounted = false;
      };
    }
  }, [initialApp.id, initialApp.status, initialApp.remarks, refreshTrigger]);

  const isBulk = useMemo(() => (app.mode || '').toString().toUpperCase() === 'BULK', [app.mode]);

  const singleApplicant = useMemo(() => {
    if (app.mode === 'BULK') return null;
    const list: RawApplicantHolder[] = app.applicants || app.Applicants || [];
    const first = list.length > 0 ? list[0] : null;
    const details: RawApplicantDetails | null = first ? (first.details || first) : null;
    const applicantName = extractApplicantFullName(app, details, first);
    const rawFormFields: Array<{
      fieldId?: string; fieldLabel?: string; value?: string;
    }> = app.formFieldValues || first?.formFieldValues || details?.formFieldValues || [];

    const findField = (predicate: (label: string, id: string) => boolean) => {
      return rawFormFields.find((fv) => {
        const l = (fv.fieldLabel || '').toLowerCase();
        const id = (fv.fieldId || '').toLowerCase();
        return predicate(l, id);
      })?.value;
    };

    const resolvedSex =
      (details?.sex && details.sex !== 'N/A' ? details.sex : null) ||
      (app.sex || null) ||
      findField((l) => l === 'sex' || l === 'gender' || l.includes('sex / gender')) ||
      '';

    const resolvedNationality =
      (details?.nationality && details.nationality !== 'N/A' ? details.nationality : null) ||
      (app.nationality && app.nationality !== 'N/A' ? app.nationality : null) ||
      findField((l) => l.includes('nationality') || l.includes('citizenship')) ||
      'Filipino';

    const resolvedStreet =
      (details?.streetAddress && details.streetAddress !== 'N/A' ? details.streetAddress : null) ||
      (details?.address && details.address !== 'N/A' ? details.address : null) ||
      (app.streetAddress && app.streetAddress !== 'N/A' ? app.streetAddress : null) ||
      findField((l) => (l.includes('street') || l === 'address') && !l.includes('seller') && !l.includes('dealer') && !l.includes('station') && !l.includes('installation') && !l.includes('provider')) ||
      '';

    const resolvedBarangay =
      (details?.barangay && details.barangay !== 'N/A' ? details.barangay : null) ||
      (details?.barangayName && details.barangayName !== 'N/A' ? details.barangayName : null) ||
      (app.barangay && app.barangay !== 'N/A' ? app.barangay : null) ||
      findField((l) => l.includes('barangay')) ||
      '';

    const resolvedCity =
      (details?.cityMunicipality && details.cityMunicipality !== 'N/A' ? details.cityMunicipality : null) ||
      (details?.city && details.city !== 'N/A' ? details.city : null) ||
      (app.cityMunicipality && app.cityMunicipality !== 'N/A' ? app.cityMunicipality : null) ||
      findField((l) => l.includes('city') || l.includes('municipality')) ||
      '';

    const resolvedProvince =
      (details?.province && details.province !== 'N/A' ? details.province : null) ||
      (app.province && app.province !== 'N/A' ? app.province : null) ||
      findField((l) => l.includes('province')) ||
      '';

    const resolvedRegion =
      (details?.region && details.region !== 'N/A' ? details.region : null) ||
      (app.region && app.region !== 'N/A' ? app.region : null) ||
      findField((l) => l.includes('region')) ||
      '';

    const resolvedZip =
      (details?.zipCode && details.zipCode !== 'N/A' ? details.zipCode : null) ||
      (app.zipCode && app.zipCode !== 'N/A' ? app.zipCode : null) ||
      findField((l) => l.includes('zip') || l.includes('postal')) ||
      '';

    const resolvedMobile =
      (details?.mobileNumber && details.mobileNumber !== 'N/A' ? details.mobileNumber : null) ||
      (details?.contactNumber && details.contactNumber !== 'N/A' ? details.contactNumber : null) ||
      (app.mobileNumber && app.mobileNumber !== 'N/A' ? app.mobileNumber : null) ||
      findField((l) => l.includes('contact') || l.includes('mobile') || l.includes('phone')) ||
      '';

    const resolvedEmail =
      (details?.email && details.email !== 'N/A' ? details.email : null) ||
      (details?.emailAddress && details.emailAddress !== 'N/A' ? details.emailAddress : null) ||
      (app.email && app.email !== 'N/A' ? app.email : null) ||
      findField((l) => l.includes('email')) ||
      '';

    const resolvedSchool =
      (details !== null && typeof details === 'object' && 'schoolAttended' in details && typeof details.schoolAttended === 'string' ? details.schoolAttended : null) ||
      (details !== null && typeof details === 'object' && 'schoolName' in details && typeof details.schoolName === 'string' ? details.schoolName : null) ||
      findField((l) => l.includes('school') || l.includes('university')) ||
      null;

    const resolvedCourse =
      (details !== null && typeof details === 'object' && 'courseTaken' in details && typeof details.courseTaken === 'string' ? details.courseTaken : null) ||
      (details !== null && typeof details === 'object' && 'courseDegree' in details && typeof details.courseDegree === 'string' ? details.courseDegree : null) ||
      findField((l) => l.includes('course') || l.includes('degree') || l.includes('program')) ||
      null;

    const resolvedYearGrad =
      (details !== null && typeof details === 'object' && 'yearGraduated' in details && typeof details.yearGraduated === 'string' ? details.yearGraduated : null) ||
      findField((l) => l.includes('graduat') || l.includes('year graduated')) ||
      null;

    const resolvedSpecialOrderNo =
      (details !== null && typeof details === 'object' && 'specialOrderNo' in details && typeof details.specialOrderNo === 'string' ? details.specialOrderNo : null) ||
      findField((l) => l.includes('special order') || l.includes('so number')) ||
      null;

    const rawAppType =
      first?.applicantType ||
      first?.applicationType ||
      getStringField(app, 'applicantType') ||
      details?.applicantType ||
      'Individual';

    const isCompany = rawAppType.toLowerCase() === 'company';

    const resolvedSignature =
      details?.eSignature ||
      details?.signatureUrl ||
      first?.eSignature ||
      first?.signatureUrl ||
      findField((l) => l.includes('signature')) ||
      null;

    const resolvedCompName =
      details?.companyName ||
      first?.companyName ||
      app.companyName ||
      getNestedStringField(app, 'company', 'name') ||
      getNestedStringField(app, 'Company', 'Name') ||
      findField((l) => l.includes('company name') || l.includes('business name') || l.includes('corporate name')) ||
      null;

    const resolvedRepName =
      details?.representativeName ||
      first?.representativeName ||
      getStringField(app, 'representativeName') ||
      findField((l) => l.includes('representative')) ||
      null;

    const resolvedExamineeType =
      app.serviceVariantType ||
      (first?.applicationType && first.applicationType.toLowerCase() !== 'individual' && first.applicationType.toLowerCase() !== 'company' ? first.applicationType : null) ||
      (details?.examineeType && details.examineeType !== 'New' ? details.examineeType : null) ||
      findField((l, id) =>
        id === 'fd000000-0000-0000-0000-000000000008' ||
        id === 'fd000000-0000-0000-0000-000000000007' ||
        l.includes('examinee type') ||
        l.includes('type of application') ||
        l.includes('application type')
      ) ||
      details?.examineeType ||
      app.examineeType ||
      app.serviceVariantName ||
      'New';

    return {
      id: first?.id,
      serviceId: getStringField(first, 'serviceId') || app.serviceId,
      serviceVariantId: getStringField(first, 'serviceVariantId') || app.serviceVariantId,
      serviceVariantName: getStringField(first, 'serviceVariantName') || app.serviceVariantName,
      applicantName,
      applicantType: isCompany ? 'Company' : 'Individual',
      sex: resolvedSex,
      nationality: resolvedNationality,
      streetAddress: resolvedStreet,
      barangay: resolvedBarangay,
      cityMunicipality: resolvedCity,
      province: resolvedProvince,
      region: resolvedRegion,
      zipCode: resolvedZip,
      mobileNumber: resolvedMobile,
      email: resolvedEmail,
      examineeType: resolvedExamineeType,
      birthDate: resolveBirthDate(details, rawFormFields) || getStringField(first, 'birthDate') || getStringField(app, 'birthDate') || null,
      civilStatus: resolveCivilStatus(details, rawFormFields) || getStringField(first, 'civilStatus') || getStringField(app, 'civilStatus') || null,
      companyName: isCompany || Boolean(resolvedCompName) ? resolvedCompName : null,
      representativeName: isCompany || Boolean(resolvedCompName) ? resolvedRepName : null,
      notes: details?.notes || app.remarks || null,
      schoolAttended: resolvedSchool,
      schoolName: resolvedSchool,
      courseTaken: resolvedCourse,
      courseDegree: resolvedCourse,
      yearGraduated: resolvedYearGrad,
      specialOrderNo: resolvedSpecialOrderNo,
      signatureUrl: resolvedSignature,
      eSignature: resolvedSignature,
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

  const formFieldValues = useMemo(() => {
    let baseValues: Array<{ fieldId: string; fieldLabel: string; value: string }> = [];
    if (app.formFieldValues && app.formFieldValues.length > 0) {
      baseValues = app.formFieldValues;
    } else {
      const rawList = app.applicants || app.Applicants || [];
      if (rawList.length > 0) {
        const first = rawList[0];
        if (first.formFieldValues && first.formFieldValues.length > 0) {
          baseValues = first.formFieldValues;
        } else if (first.details && first.details.formFieldValues && first.details.formFieldValues.length > 0) {
          baseValues = first.details.formFieldValues;
        }
      }
    }
    return baseValues;
  }, [app]);

  const variantLabel = useMemo(() => {
    return resolvePreviewVariant({
      serviceVariantName: app.serviceVariantName,
      variant: app.variant,
      element: app.element,
      examineeType: singleApplicant?.examineeType,
      formFieldValues,
      fallback: 'Standard',
    });
  }, [app.serviceVariantName, app.variant, app.element, singleApplicant?.examineeType, formFieldValues]);

  const applicationTypeLabel = useMemo(() => {
    const firstAp = (app.applicants || app.Applicants || [])[0];
    const rawAppType =
      app.serviceVariantType ||
      (firstAp?.applicationType && firstAp.applicationType.toLowerCase() !== 'individual' && firstAp.applicationType.toLowerCase() !== 'company' ? firstAp.applicationType : undefined) ||
      (singleApplicant?.applicantType === 'Company' ? undefined : singleApplicant?.examineeType);
    return resolvePreviewApplicationType({
      applicationType: rawAppType,
      examineeType: singleApplicant?.examineeType,
      element: app.element,
      formFieldValues,
    });
  }, [app.serviceVariantType, app.applicants, app.Applicants, singleApplicant?.applicantType, singleApplicant?.examineeType, app.element, formFieldValues]);

  const elementsLabel = useMemo(() => {
    return resolvePreviewElements({
      element: app.element,
      formFieldValues,
      variantName: variantLabel,
    });
  }, [app.element, formFieldValues, variantLabel]);


  const appApplicants = useMemo<BulkApplicant[]>(() => {
    const rawApplicants = app.applicants || app.Applicants || [];
    return rawApplicants.map((ap: BulkApplicant) => {
      const details: RawApplicantDetails = ap.details || ap;
      const apFormFields = ap.formFieldValues || ap.details?.formFieldValues || [];
      const findApField = (predicate: (l: string, id: string) => boolean) =>
        apFormFields.find((fv) => predicate((fv.fieldLabel || '').toLowerCase(), (fv.fieldId || '').toLowerCase()))?.value;

      const resolvedBirth = ap.birthDate || resolveBirthDate(details, apFormFields) || undefined;
      const resolvedCivil = ap.civilStatus || resolveCivilStatus(details, apFormFields) || undefined;
      const resolvedSchool =
        ap.schoolAttended ||
        ap.schoolName ||
        details?.schoolAttended ||
        details?.schoolName ||
        findApField((l) => l.includes('school') || l.includes('university')) ||
        undefined;
      const resolvedCourse =
        ap.courseTaken ||
        ap.courseDegree ||
        details?.courseTaken ||
        details?.courseDegree ||
        findApField((l) => l.includes('course') || l.includes('degree') || l.includes('program')) ||
        undefined;
      const resolvedYearGrad =
        ap.yearGraduated ||
        details?.yearGraduated ||
        findApField((l) => l.includes('graduat')) ||
        undefined;
      const resolvedSoNo =
        ap.specialOrderNo ||
        details?.specialOrderNo ||
        findApField((l) => l.includes('special order') || l.includes('so number')) ||
        undefined;
      const resolvedSig =
        ap.eSignature ||
        ap.signatureUrl ||
        details?.eSignature ||
        details?.signatureUrl ||
        findApField((l) => l.includes('signature')) ||
        undefined;

      return {
        ...ap,
        id: ap.id || '',
        name: extractApplicantFullName(app, ap.details || ap, ap),
        applicantType: ap.applicantType || (ap.applicationType?.toLowerCase() === 'company' ? 'Company' : 'Individual'),
        applicationType: ap.applicationType || ap.applicantType || 'Individual',
        status: ap.status || 'PENDING',
        includedInSOA: ap.includedInSOA !== undefined ? ap.includedInSOA : (ap.includedInSoa !== undefined ? ap.includedInSoa : false),
        sex: ap.sex || normalizeSexValue(ap.details?.sex) || normalizeSexValue(findApField((l) => l === 'sex' || l === 'gender' || l.includes('sex / gender'))),
        nationality: ap.nationality || ap.details?.nationality || findApField((l) => l.includes('nationality') || l.includes('citizenship')),
        streetAddress: ap.streetAddress || ap.details?.streetAddress || ap.details?.address || findApField((l) => (l.includes('street') || l === 'address') && !l.includes('email') && !l.includes('station') && !l.includes('seller')),
        barangay: ap.barangay || ap.details?.barangay || findApField((l) => l.includes('barangay')),
        cityMunicipality: ap.cityMunicipality || ap.details?.cityMunicipality || findApField((l) => l.includes('city') || l.includes('municipality')),
        province: ap.province || ap.details?.province || findApField((l) => l.includes('province')),
        region: ap.region || ap.details?.region || findApField((l) => l.includes('region')),
        zipCode: ap.zipCode || ap.details?.zipCode || findApField((l) => l.includes('zip') || l.includes('postal')),
        mobileNumber: ap.mobileNumber || ap.contactNumber || ap.details?.contactNumber || ap.details?.mobileNumber || findApField((l) => l.includes('contact') || l.includes('mobile') || l.includes('phone')),
        email: ap.email || ap.emailAddress || ap.details?.emailAddress || ap.details?.email || findApField((l) => l.includes('email')),
        birthDate: resolvedBirth,
        civilStatus: resolvedCivil,
        companyName: ap.companyName || ap.details?.companyName || app.companyName,
        representativeName: ap.representativeName || ap.details?.representativeName || app.representativeName,
        notes: ap.notes || ap.details?.notes,
        schoolAttended: resolvedSchool,
        schoolName: resolvedSchool,
        courseTaken: resolvedCourse,
        courseDegree: resolvedCourse,
        yearGraduated: resolvedYearGrad,
        specialOrderNo: resolvedSoNo,
        eSignature: resolvedSig,
        signatureUrl: resolvedSig,
        schedule: ap.schedule || undefined,
      };
    });
  }, [isBulk ? app.applicants : null, app.Applicants, app]);

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
        const aUploads = isRecord(a) && isRecord(a.uploads) ? a.uploads : undefined;
        if (aUploads) {
          Object.entries(aUploads).forEach(([k, up]) => {
            if (up) {
              const uName = typeof up === 'string' ? up : getStringField(up, 'name') || k;
              const uUri = typeof up === 'string' ? '' : getStringField(up, 'uri') || '';
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

    let resolvedDocs: ApplicationDocument[] = [];
    if (rawReqs.length > 0) {
      resolvedDocs = rawReqs.map((req: RawRequirement, index: number) => {
        const urlStr = req.url || '';
        const hasFile = Boolean(
          (urlStr && urlStr.trim() !== '' && urlStr.trim().toLowerCase() !== 'none' && urlStr.trim().toLowerCase() !== 'null') ||
          (req.storedFileId && req.storedFileId.trim() !== '' && req.storedFileId.trim().toLowerCase() !== 'none' && req.storedFileId.trim().toLowerCase() !== 'null')
        );

        const rawName = req.fileName || req.requirementName || req.name || (urlStr ? urlStr.split('/').pop() : undefined) || (hasFile ? `Attachment_${index + 1}.pdf` : `Requirement_${index + 1}`);
        const reqDisplayName = req.requirementName || req.name || rawName;
        const cat = normalizeDocCategory(req.category);
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
          requirementName: reqDisplayName,
          applicantId: req.applicantId,
          requirementId: req.requirementId,
          serviceVariantRequirementId: req.serviceVariantRequirementId,
          type: typ,
          size: formattedSize || (hasFile ? '1.2 MB' : ''),
          category: cat,
          uploadedAt: req.uploadedAt || app.submittedAt || new Date().toISOString(),
          url: hasFile ? req.url : undefined,
          storedFileId: hasFile ? req.storedFileId : undefined,
        };
      });
    } else {
      resolvedDocs = getAppDocuments(app);
    }

    // When application is completed, guarantee official issued permit document entry
    const statusLower = (typeof app.status === 'string' ? app.status : normalizeStatus(app.status)).toLowerCase();
    const rawBeStatusLower = (typeof app.rawStatus === 'string' ? app.rawStatus : '').toLowerCase();
    const isCompleted =
      statusLower === 'completed' ||
      statusLower === 'approved' ||
      rawBeStatusLower === 'completed' ||
      rawBeStatusLower === 'approved';

    if (isCompleted && typeof app.id === 'string' && app.id.trim().length > 0) {
      const alreadyHasIssued = resolvedDocs.some(
        (d) => d.category === 'ISSUED_PERMIT' && d.id.includes('official-issued-license')
      );
      if (!alreadyHasIssued) {
        const permitTitle = app.serviceName || 'Statutory Permit & License';
        const safeTitle = `Official_${permitTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
        const issuedDocEntry: ApplicationDocument = {
          id: `official-issued-license-${app.id}`,
          name: safeTitle,
          type: 'PDF',
          size: '1.4 MB',
          category: 'ISSUED_PERMIT',
          uploadedAt: app.submittedAt || new Date().toISOString(),
          url: applicationService.getIssuedDocumentPrintUrl(app.id),
        };
        resolvedDocs = [issuedDocEntry, ...resolvedDocs];
      }
    }

    // Include official printable application form for all 13 canonical NTC forms
    if (typeof app.id === 'string' && app.id.trim().length > 0) {
      const canonicalForm = detectCanonicalForm(
        {
          id: singleApplicant?.serviceId || app.serviceId,
          title: app.serviceName,
          category: app.serviceCategory,
        },
        variantLabel
      );
      const formCodeLabel = canonicalForm
        ? canonicalForm.formNumber.replace(/\s+/g, '_')
        : 'NTC_Application_Form';
      const formDocName = `Official_Application_Form_${formCodeLabel}.pdf`;

      const alreadyHasForm = resolvedDocs.some(
        (d) => d.id === `official-application-form-${app.id}` || d.name === formDocName
      );

      if (!alreadyHasForm) {
        const primaryApplicantId =
          typeof singleApplicant?.id === 'string' && singleApplicant.id.trim().length > 0
            ? singleApplicant.id.trim()
            : undefined;
        const formDocEntry: ApplicationDocument = {
          id: `official-application-form-${app.id}`,
          name: formDocName,
          requirementName: canonicalForm
            ? `Official Application Form (${canonicalForm.formNumber})`
            : 'Official Application Form',
          applicantId: primaryApplicantId,
          type: 'PDF',
          size: '1.2 MB',
          category: 'ATTACHMENT',
          uploadedAt: app.submittedAt || new Date().toISOString(),
          url: applicationService.getApplicationFormPrintUrl(app.id.trim(), primaryApplicantId),
        };
        resolvedDocs = [formDocEntry, ...resolvedDocs];
      }
    }

    return resolvedDocs;
  }, [app, singleApplicant, variantLabel]);

  const primaryName = useMemo(() => {
    if (app.mode === 'BULK') return app.companyName || app.companyDetail?.name || extractApplicantFullName(app, null, null);
    return singleApplicant?.applicantName || extractApplicantFullName(app, null, null);
  }, [app, singleApplicant]);

  const resolvedServiceVariant = useMemo(() =>
    resolvePreviewVariant({
      serviceVariantName: app.serviceVariantName,
      variant: app.variant,
      element: app.element,
      examineeType: singleApplicant?.examineeType,
      formFieldValues,
      fallback: '',
    }),
  [app.serviceVariantName, app.variant, app.element, singleApplicant?.examineeType, formFieldValues]);

  const isAssessmentOnly = Boolean(app.isAssessmentOnly || app.intent === 'AssessmentOnly');

  const currentStepIndex = useMemo(() => {
    const rawStatus = (typeof app.status === 'string' ? app.status : normalizeStatus(app.status)).toLowerCase();
    const rawBeStatus = (typeof app.rawStatus === 'string' ? app.rawStatus : '').toLowerCase();
    const remarksLower = (typeof app.remarks === 'string' ? app.remarks : '').toLowerCase();
    const opStatus = (app.op && typeof app.op.status === 'string' ? app.op.status : '').toLowerCase();
    const soaStatus = (app.soa && typeof app.soa.status === 'string' ? app.soa.status : '').toLowerCase();

    // ── Pre-Assessment (3-step lifecycle) ──────────────────────────────────
    if (isAssessmentOnly) {
      if (
        rawStatus === 'completed' ||
        rawStatus === 'approved' ||
        rawBeStatus === 'completed' ||
        rawBeStatus === 'approved' ||
        Boolean(app.assessedAt)
      ) {
        return 3;
      }

      if (
        rawStatus === 'for_evaluation' ||
        rawStatus === 'evaluating' ||
        rawBeStatus === 'evaluating'
      ) {
        return 2;
      }

      return 1;
    }

    // ── Official Application (5-step lifecycle) ───────────────────────────
    // 1. Completed / Approved -> Step 5
    if (
      rawStatus === 'approved' ||
      rawStatus === 'completed' ||
      rawBeStatus === 'completed' ||
      rawBeStatus === 'approved'
    ) {
      return 5;
    }

    // 2. Issuance -> Step 4
    if (
      rawStatus === 'for_approval' ||
      rawStatus === 'forissuance' ||
      rawBeStatus === 'forissuance' ||
      rawBeStatus === 'for_issuance' ||
      opStatus === 'paid' ||
      remarksLower.includes('payment verified') ||
      remarksLower.includes('for issuance') ||
      remarksLower.includes('issuance in progress')
    ) {
      return 4;
    }

    // 3. Active Evaluator review / Submitted / Returned -> Step 2
    if (
      rawBeStatus === 'submitted' ||
      rawBeStatus === 'evaluating' ||
      rawBeStatus === 'returned' ||
      rawStatus === 'submitted' ||
      rawStatus === 'evaluating' ||
      rawStatus === 'declined'
    ) {
      return 2;
    }

    // 4. Payment / Accountant review -> Step 3
    const isPaymentSubmitted =
      remarksLower.includes('payment submitted') ||
      remarksLower.includes('waiting for cashier verification') ||
      remarksLower.includes('verification in progress') ||
      opStatus === 'processing' ||
      opStatus === 'pending';

    if (
      rawStatus === 'ready_for_payment' ||
      rawStatus === 'pendingpayment' ||
      rawBeStatus === 'pendingpayment' ||
      rawStatus === 'foraccountant' ||
      rawBeStatus === 'foraccountant' ||
      isPaymentSubmitted ||
      soaStatus === 'fororderofpayment' ||
      soaStatus === 'approved'
    ) {
      return 3;
    }

    // 5. Evaluation fallback -> Step 2
    if (rawStatus === 'for_evaluation') {
      return 2;
    }

    // 6. Draft / Initial Submission -> Step 1
    if (rawStatus === 'draft' || rawStatus === 'pending') {
      return 1;
    }

    return 2;
  }, [app.status, app.rawStatus, app.soa, app.remarks, app.op, isAssessmentOnly, app.assessedAt]);

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
    applicationTypeLabel,
    elementsLabel,
    currentStepIndex,
    isAssessmentOnly,
    refetch,
  };
}
