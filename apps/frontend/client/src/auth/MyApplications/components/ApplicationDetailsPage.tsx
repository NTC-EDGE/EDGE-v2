import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  Platform,
  useWindowDimensions,
  Modal,
  Image,
} from 'react-native';
import { Icon, COLORS, TYPOGRAPHY, SPACING } from '@edge/ui';
import { useApi } from '../../../shared/hooks/useApi';
import { DocumentPreviewModal } from '../../../shared/components/DocumentPreviewModal';
import { OFFICIAL_LEGAL_DECLARATION } from '../../../shared/components/DeclarationCheckbox';
import {
  Application,
  SingleApplication,
  getStatusLabel,
  getStatusColor,
  getStatusBgColor,
  formatRelativeTime,
  getAppDocuments,
  ApplicationDocument,
  BulkApplicant,
  getEnrichedApplicant,
  getApplicantDocuments,
  RawRequirement,
  ApplicationStatus,
  mapApiApplicationToApplication,
} from '../data/applicationsData';

interface ApplicationDetailsPageProps {
  app: Application;
  onBack: () => void;
  onDownloadDoc?: (doc: ApplicationDocument) => void;
}

const normalizeStatus = (status: string): string => {
  if (!status) return 'PENDING';
  const s = status.toUpperCase().replace(/_/g, '');
  if (s === 'DRAFT') return 'PENDING';
  if (s === 'SUBMITTED' || s === 'FORVERIFICATION') return 'FOR_EVALUATION';
  if (s === 'FORAPPROVAL') return 'FOR_APPROVAL';
  if (s === 'APPROVED' || s === 'COMPLETED') return 'APPROVED';
  if (s === 'DECLINED') return 'DECLINED';
  if (s === 'EXPIRINGSOON') return 'EXPIRING_SOON';
  if (s === 'READYFORPAYMENT') return 'READY_FOR_PAYMENT';
  return status;
};

const isApplicationStatus = (status: string): status is ApplicationStatus => {
  return [
    'FOR_APPROVAL',
    'FOR_EVALUATION',
    'APPROVED',
    'DECLINED',
    'EXPIRING_SOON',
    'READY_FOR_PAYMENT',
    'PENDING',
  ].includes(status);
};

const safeGetStatusLabel = (status: string) => {
  const normalized = normalizeStatus(status);
  return getStatusLabel(isApplicationStatus(normalized) ? normalized : 'PENDING');
};

const safeGetStatusColor = (status: string) => {
  const normalized = normalizeStatus(status);
  return getStatusColor(isApplicationStatus(normalized) ? normalized : 'PENDING');
};

const safeGetStatusBgColor = (status: string) => {
  const normalized = normalizeStatus(status);
  return getStatusBgColor(isApplicationStatus(normalized) ? normalized : 'PENDING');
};

const getApplicantStepProgress = (status: string) => {
  const normalized = normalizeStatus(status);
  switch (normalized) {
    case 'PENDING':
      return 1;
    case 'FOR_EVALUATION':
      return 2;
    case 'FOR_APPROVAL':
      return 3;
    case 'APPROVED':
    case 'READY_FOR_PAYMENT':
      return 4;
    case 'DECLINED':
      return 4;
    case 'EXPIRING_SOON':
      return 2;
    default:
      return 3;
  }
};

const isGuid = (val?: string | null): boolean => {
  if (!val || typeof val !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val.trim());
};

interface RawFormFieldItem {
  fieldId?: string;
  fieldLabel?: string;
  label?: string;
  key?: string;
  value?: string;
}

interface RawApplicantDetails {
  fullName?: string;
  applicantName?: string;
  firstName?: string;
  lastName?: string;
  first_name?: string;
  last_name?: string;
  companyName?: string;
  representativeName?: string;
  notes?: string;
  birthDate?: string;
  birthMonth?: string;
  birthDay?: string;
  birthYear?: string;
  civilStatus?: string;
  sex?: 'Male' | 'Female';
  nationality?: string;
  streetAddress?: string;
  address?: string;
  barangay?: string;
  cityMunicipality?: string;
  province?: string;
  region?: string;
  zipCode?: string;
  mobileNumber?: string;
  contactNumber?: string;
  email?: string;
  emailAddress?: string;
  examineeType?: string;
  formFieldValues?: RawFormFieldItem[];
}

interface RawApplicantHolder {
  name?: string;
  applicantName?: string;
  applicationType?: string;
  applicantType?: string;
  details?: RawApplicantDetails;
  formFieldValues?: RawFormFieldItem[];
}

function extractApplicantFullName(
  app: Application | null | undefined,
  details: RawApplicantDetails | null | undefined,
  first: RawApplicantHolder | null | undefined
): string {
  if (first?.name && typeof first.name === 'string' && first.name.trim() && first.name !== 'Unnamed Applicant') {
    return first.name.trim();
  }
  if (first?.applicantName && typeof first.applicantName === 'string' && first.applicantName.trim()) {
    return first.applicantName.trim();
  }
  if (details?.fullName && typeof details.fullName === 'string' && details.fullName.trim()) {
    return details.fullName.trim();
  }
  if (details?.applicantName && typeof details.applicantName === 'string' && details.applicantName.trim()) {
    return details.applicantName.trim();
  }
  
  const firstName = details?.firstName || details?.first_name || (app as SingleApplication | undefined)?.applicantName || '';
  const lastName = details?.lastName || details?.last_name || '';
  const combinedName = `${firstName} ${lastName}`.trim();
  if (combinedName.length > 0) {
    return combinedName;
  }

  if (app?.applicantName && typeof app.applicantName === 'string' && app.applicantName.trim() && app.applicantName !== 'Unnamed Applicant') {
    return app.applicantName.trim();
  }

  const fvList: RawFormFieldItem[] =
    (Array.isArray(details?.formFieldValues) && details.formFieldValues) ||
    (Array.isArray(first?.formFieldValues) && first.formFieldValues) ||
    (Array.isArray(app?.formFieldValues) && app.formFieldValues) ||
    [];

  if (fvList.length > 0) {
    const knownFv = fvList.find((fv: RawFormFieldItem) => fv.fieldId === 'fd000000-0000-0000-0000-000000000001');
    if (knownFv && knownFv.value && knownFv.value.trim()) {
      return knownFv.value.trim();
    }

    const matchedFv = fvList.find((fv: RawFormFieldItem) => {
      const lbl = (fv.fieldLabel || fv.label || fv.key || fv.fieldId || '').toLowerCase();
      return (
        lbl.includes('full name') ||
        lbl.includes('applicant name') ||
        lbl.includes('name of applicant') ||
        lbl.includes('business name') ||
        lbl.includes('company name')
      );
    });
    if (matchedFv && matchedFv.value && matchedFv.value.trim()) {
      return matchedFv.value.trim();
    }
  }

  if (app?.companyName && typeof app.companyName === 'string' && app.companyName.trim()) {
    return app.companyName.trim();
  }

  return 'Juan dela Cruz';
}

export function ApplicationDetailsPage({
  app: initialApp,
  onBack,
  onDownloadDoc,
}: ApplicationDetailsPageProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isDesktop = width >= 768;

  const api = useApi();
  const [app, setApp] = useState<Application>(initialApp);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  useEffect(() => {
    setApp(initialApp);
    if (initialApp.id && (!initialApp.requirements || initialApp.requirements.length === 0)) {
      let isMounted = true;
      const loadFullDetails = async () => {
        try {
          setIsLoadingDetails(true);
          const res = await api.get<unknown>(`/api/v2/applications/${initialApp.id}`);
          if (isMounted && res !== null && typeof res === 'object') {
            const resObj = res as { succeeded?: boolean; data?: unknown };
            const payload = resObj.succeeded && resObj.data !== undefined ? resObj.data : res;
            if (payload !== null && typeof payload === 'object') {
              const mapped = mapApiApplicationToApplication(payload as Parameters<typeof mapApiApplicationToApplication>[0]);
              setApp(mapped);
            }
          }
        } catch (err) {
          console.warn('Could not fetch full application details:', err);
        } finally {
          if (isMounted) {
            setIsLoadingDetails(false);
          }
        }
      };
      loadFullDetails();
      return () => {
        isMounted = false;
      };
    }
  }, [initialApp.id]);

  const [activeTab, setActiveTab] = useState<'DETAILS' | 'DOCUMENTS'>('DETAILS');
  const [previewDoc, setPreviewDoc] = useState<ApplicationDocument | null>(null);
  const [previewCustomDoc, setPreviewCustomDoc] = useState<{ uri: string; name: string } | null>(null);
  const [previewLoadingId, setPreviewLoadingId] = useState<string | null>(null);

  const isBulk = useMemo(() => {
    const m = (app.mode || '').toString().toUpperCase();
    return m === 'BULK';
  }, [app.mode]);

  const singleApplicant = useMemo(() => {
    if (app.mode === 'BULK') return null;
    const list = (app.applicants || app.Applicants || []) as RawApplicantHolder[];
    let first: RawApplicantHolder | null = null;
    let details: RawApplicantDetails | null = null;
    if (list.length > 0) {
      first = list[0];
      details = first.details || (first as unknown as RawApplicantDetails);
    }
    
    const applicantName = extractApplicantFullName(app, details, first);
    const rawFormFields = (app.formFieldValues || first?.formFieldValues || details?.formFieldValues || []) as Array<{
      fieldId?: string;
      fieldLabel?: string;
      value?: string;
    }>;

    const birthDate =
      details?.birthDate ||
      (details?.birthMonth && details?.birthDay && details?.birthYear
        ? `${details.birthMonth} ${details.birthDay}, ${details.birthYear}`
        : rawFormFields.find((fv) => fv.fieldId === 'birthDate' || (fv.fieldLabel || '').toLowerCase().includes('birth'))?.value || null);

    const civilStatus =
      details?.civilStatus ||
      rawFormFields.find((fv) => fv.fieldId === 'civilStatus' || (fv.fieldLabel || '').toLowerCase().includes('civil') || (fv.fieldLabel || '').toLowerCase().includes('marital'))?.value || null;

    const companyName =
      details?.companyName || app.companyName || null;

    const representativeName =
      details?.representativeName ||
      rawFormFields.find((fv) => (fv.fieldLabel || '').toLowerCase().includes('representative'))?.value || null;

    const notes = details?.notes || app.remarks || null;

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
      birthDate,
      civilStatus,
      companyName,
      representativeName,
      notes,
    };
  }, [app]);

  const isExamService = useMemo(() => {
    const cat = (app.serviceCategory || '').toLowerCase().trim();
    const title = (app.serviceName || '').toLowerCase().trim();
    return (
      cat.includes('exam') ||
      title.includes('exam') ||
      title.includes('admission') ||
      title.includes('operator examination')
    );
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
    if (app.office) {
      return `NTC Field Office • ${app.office}`;
    }
    return null;
  }, [app]);

  const variantLabel = useMemo(() => {
    return (
      app.serviceVariantName ||
      app.variant ||
      app.element ||
      singleApplicant?.examineeType ||
      'Standard'
    );
  }, [app, singleApplicant]);

  const formFieldValues = useMemo(() => {
    if (app.formFieldValues && app.formFieldValues.length > 0) {
      return app.formFieldValues;
    }
    const rawList = app.applicants || app.Applicants || [];
    if (rawList.length > 0) {
      const first = rawList[0];
      if (first.formFieldValues && first.formFieldValues.length > 0) {
        return first.formFieldValues;
      }
      if (first.details && 'formFieldValues' in first.details) {
        const dF = (first.details as { formFieldValues?: Array<{ fieldId: string; fieldLabel: string; value: string }> }).formFieldValues;
        if (dF && dF.length > 0) return dF;
      }
    }
    return [];
  }, [app]);

  const appApplicants = useMemo<BulkApplicant[]>(() => {
    const rawApplicants = app.applicants || app.Applicants || [];
    return rawApplicants.map((ap: BulkApplicant) => {
      const name = extractApplicantFullName(app, ap.details || ap, ap);
        
      return {
        id: ap.id || '',
        name: name,
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
      };
    });
  }, [app.mode === 'BULK' ? app.applicants : null, app.Applicants]);

  // Bulk application table search, pagination & sub-page states
  const TABLE_PAGE_SIZE = 6;
  const [tableSearch, setTableSearch] = useState('');
  const [tablePage, setTablePage] = useState(1);
  const [selectedApplicant, setSelectedApplicant] = useState<BulkApplicant | null>(null);
  const [subActiveTab, setSubActiveTab] = useState<'DETAILS' | 'DOCUMENTS'>('DETAILS');

  // Bulk stats and calculations
  const totalSubmitted = isBulk ? appApplicants.length : 0;
  const approvedCount = isBulk ? appApplicants.filter((a: BulkApplicant) => {
    const s = normalizeStatus(a.status);
    return s === 'APPROVED';
  }).length : 0;
  const declinedCount = isBulk ? appApplicants.filter((a: BulkApplicant) => {
    const s = normalizeStatus(a.status);
    return s === 'DECLINED';
  }).length : 0;
  const pendingCount = isBulk ? appApplicants.filter((a: BulkApplicant) => {
    const s = normalizeStatus(a.status);
    return s !== 'APPROVED' && s !== 'DECLINED';
  }).length : 0;

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
    if (matched?.formFieldValues && matched.formFieldValues.length > 0) {
      return matched.formFieldValues;
    }
    return [];
  }, [selectedApplicant, app]);

  const filteredApplicants = useMemo<BulkApplicant[]>(() => {
    if (!isBulk) return [];
    if (tableSearch.trim() === '') return appApplicants;
    const q = tableSearch.toLowerCase();
    return appApplicants.filter(
      (a: BulkApplicant) =>
        a.name.toLowerCase().includes(q) ||
        a.applicationType.toLowerCase().includes(q) ||
        safeGetStatusLabel(a.status).toLowerCase().includes(q),
    );
  }, [appApplicants, isBulk, tableSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredApplicants.length / TABLE_PAGE_SIZE));
  const pagedApplicants = filteredApplicants.slice(
    (tablePage - 1) * TABLE_PAGE_SIZE,
    tablePage * TABLE_PAGE_SIZE,
  );
  const statusColor = safeGetStatusColor(app.status);
  const statusBg = safeGetStatusBgColor(app.status);
  
  const docs = useMemo<ApplicationDocument[]>(() => {
    const rawReqs = app.requirements || app.Requirements || app.documents || app.Documents;
    if (Array.isArray(rawReqs) && rawReqs.length > 0) {
      return rawReqs.map((req: RawRequirement, index: number) => {
        const urlStr = req.url || '';
        const fileName = req.name || req.fileName || (urlStr ? urlStr.split('/').pop() : undefined) || `Document_${index + 1}.pdf`;
        
        let cat: 'ATTACHMENT' | 'ISSUED_PERMIT' | 'RECEIPT' | 'SOA' | 'ADMISSION_SLIP' = 'ATTACHMENT';
        if (req.category === 'ATTACHMENT' || req.category === 'ISSUED_PERMIT' || req.category === 'RECEIPT' || req.category === 'SOA' || req.category === 'ADMISSION_SLIP') {
          cat = req.category;
        }

        const ext = fileName.toLowerCase().split('.').pop() || '';
        let typ: 'PDF' | 'DOCX' | 'ZIP' | 'IMAGE' = 'PDF';
        if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp'].includes(ext)) {
          typ = 'IMAGE';
        } else if (['zip', 'rar', '7z'].includes(ext)) {
          typ = 'ZIP';
        } else if (['doc', 'docx'].includes(ext)) {
          typ = 'DOCX';
        }

        let formattedSize = req.size;
        if (!formattedSize && req.fileSizeBytes) {
          formattedSize = (req.fileSizeBytes / (1024 * 1024)).toFixed(2) + ' MB';
        }

        return {
          id: req.id || `doc-${index}`,
          name: fileName,
          type: typ,
          size: formattedSize || '1.2 MB',
          category: cat,
          uploadedAt: req.uploadedAt || app.submittedAt || new Date().toISOString(),
          url: req.url,
          storedFileId: req.storedFileId,
        };
      });
    }
    return getAppDocuments(app);
  }, [app]);

  // Derived applicant info
  const primaryName = useMemo(() => {
    if (app.mode === 'BULK') {
      return app.companyName || app.companyDetail?.name || extractApplicantFullName(app, null, null);
    }
    return singleApplicant?.applicantName || extractApplicantFullName(app, null, null);
  }, [app, singleApplicant]);
  
  const submissionTime = formatRelativeTime(app.submittedAt);

  // Determine stepper progress indices (1 = Submitted, 2 = Evaluation, 3 = For Approval, 4 = Approved & Issued)
  const getStepProgress = () => {
    const normalized = normalizeStatus(app.status);
    switch (normalized) {
      case 'PENDING':
        return 1;
      case 'FOR_EVALUATION':
        return 2;
      case 'FOR_APPROVAL':
        return 3;
      case 'APPROVED':
      case 'READY_FOR_PAYMENT':
        return 4;
      case 'DECLINED':
      case 'EXPIRING_SOON':
        return 2;
      default:
        return 3;
    }
  };

  const currentStepIndex = getStepProgress();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={[styles.mainWrapper, { paddingHorizontal: isDesktop ? SPACING[32] : SPACING[16] }]}>
        {/* ── Top Back Button Bar ────────────────────────────────────────── */}
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <Icon name="arrow-left" size={18} color="#1D4ED8" />
          <Text style={styles.backBtnText}>Back to My Applications</Text>
        </TouchableOpacity>

        {/* ── Header Card ───────────────────────────────────────────────── */}
        <View style={styles.headerCard}>
          <View style={styles.badgeRow}>
            <View style={[styles.modeBadge, isBulk ? styles.bulkBadge : styles.singleBadge]}>
              <View style={[styles.modeDot, { backgroundColor: isBulk ? '#D97706' : '#1D4ED8' }]} />
              <Text style={[styles.modeBadgeText, { color: isBulk ? '#D97706' : '#1D4ED8' }]}>
                {isBulk ? `BULK APPLICATION (${appApplicants.length})` : 'SINGLE APPLICATION'}
              </Text>
            </View>

            <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.statusBadgeText, { color: statusColor }]}>
                {safeGetStatusLabel(app.status)}
              </Text>
            </View>
          </View>

          <Text style={styles.appRefId}>
            {isBulk ? `Bulk Application #${app.referenceNumber}` : `#${app.referenceNumber}`}
          </Text>
          <Text style={[styles.appTitle, { fontSize: isDesktop ? 24 : 20 }]}>{app.serviceName}</Text>
          {isBulk ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: -14, marginBottom: 16 }}>
              <Icon name="calendar" size={14} color="#64748B" />
              <Text style={[styles.appSubtitleCompany, { marginTop: 0, marginBottom: 0 }]}>
                {primaryName} [BULK] Submitted {formatRelativeTime(app.submittedAt)}
              </Text>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: -14, marginBottom: 16 }}>
              <Icon name="calendar" size={14} color="#64748B" />
              <Text style={[styles.appSubtitleCompany, { marginTop: 0, marginBottom: 0 }]}>
                Submitted {formatRelativeTime(app.submittedAt)}
              </Text>
            </View>
          )}

          {/* ── Navigation Tabs ─────────────────────────────────────────── */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              onPress={() => setActiveTab('DETAILS')}
              style={[styles.tabItem, activeTab === 'DETAILS' && styles.tabItemActive]}
              activeOpacity={0.8}
            >
              <Icon
                name="user"
                size={16}
                color={activeTab === 'DETAILS' ? '#1D4ED8' : '#64748B'}
              />
              <Text style={[styles.tabText, activeTab === 'DETAILS' && styles.tabTextActive]}>
                Applicant Details
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('DOCUMENTS')}
              style={[styles.tabItem, activeTab === 'DOCUMENTS' && styles.tabItemActive]}
              activeOpacity={0.8}
            >
              <Icon
                name="file-text"
                size={16}
                color={activeTab === 'DOCUMENTS' ? '#1D4ED8' : '#64748B'}
              />
              <Text style={[styles.tabText, activeTab === 'DOCUMENTS' && styles.tabTextActive]}>
                Documents ({docs.length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Tab Content: Applicant Details ────────────────────────────── */}
        {activeTab === 'DETAILS' && (
          <View style={styles.tabContentList}>
            {/* APPLICATION PROGRESS Stepper */}
            <View style={styles.sectionCard}>
              <Text style={styles.progressHeaderTitle}>APPLICATION PROGRESS</Text>
              <View style={styles.stepperRow}>
                {/* Step 1 */}
                <View style={styles.stepNode}>
                  <View
                    style={[
                      styles.stepCircle,
                      currentStepIndex >= 1 ? styles.stepCircleDone : styles.stepCirclePending,
                    ]}
                  >
                    {currentStepIndex >= 1 ? (
                      <Icon name="check" size={14} color="#FFFFFF" />
                    ) : (
                      <Text style={styles.stepNumber}>1</Text>
                    )}
                  </View>
                  <Text style={styles.stepLabel}>Submitted</Text>
                  <Text style={styles.stepSubLabel}>Application received</Text>
                </View>

                <View
                  style={[
                    styles.stepLine,
                    currentStepIndex >= 2 ? styles.stepLineDone : styles.stepLinePending,
                  ]}
                />

                {/* Step 2 */}
                <View style={styles.stepNode}>
                  <View
                    style={[
                      styles.stepCircle,
                      currentStepIndex >= 2 ? styles.stepCircleDone : styles.stepCirclePending,
                    ]}
                  >
                    {currentStepIndex >= 2 ? (
                      <Icon name="check" size={14} color="#FFFFFF" />
                    ) : (
                      <Text style={styles.stepNumber}>2</Text>
                    )}
                  </View>
                  <Text style={styles.stepLabel}>Evaluation</Text>
                  <Text style={styles.stepSubLabel}>Under review</Text>
                </View>

                <View
                  style={[
                    styles.stepLine,
                    currentStepIndex >= 3 ? styles.stepLineDone : styles.stepLinePending,
                  ]}
                />

                {/* Step 3 */}
                <View style={styles.stepNode}>
                  <View
                    style={[
                      styles.stepCircle,
                      currentStepIndex >= 3 ? styles.stepCircleDone : styles.stepCirclePending,
                    ]}
                  >
                    {currentStepIndex >= 3 ? (
                      <Icon name="check" size={14} color="#FFFFFF" />
                    ) : (
                      <Text style={styles.stepNumber}>3</Text>
                    )}
                  </View>
                  <Text style={styles.stepLabel}>For Approval</Text>
                  <Text style={styles.stepSubLabel}>Awaiting decision</Text>
                </View>

                <View
                  style={[
                    styles.stepLine,
                    currentStepIndex >= 4 ? styles.stepLineDone : styles.stepLinePending,
                  ]}
                />

                {/* Step 4 */}
                <View style={styles.stepNode}>
                  <View
                    style={[
                      styles.stepCircle,
                      currentStepIndex >= 4 ? styles.stepCircleDone : styles.stepCirclePending,
                    ]}
                  >
                    {currentStepIndex >= 4 ? (
                      <Icon name="check" size={14} color="#FFFFFF" />
                    ) : (
                      <Text style={styles.stepNumber}>4</Text>
                    )}
                  </View>
                  <Text style={styles.stepLabel}>Approved & Issued</Text>
                  <Text style={styles.stepSubLabel}>License ready</Text>
                </View>
              </View>
            </View>

            {isBulk ? (
              <>
                {/* ── Bulk Metrics Grid ──────────────────────────────────────── */}
                <View style={[styles.metricsGrid, { flexWrap: isDesktop ? 'nowrap' : 'wrap' }]}>
                  <View style={[styles.metricCard, { borderTopWidth: 3, borderTopColor: '#3B82F6' }]}>
                    <View style={styles.metricHeader}>
                      <Text style={styles.metricLabel}>TOTAL SUBMITTED</Text>
                      <Icon name="users" size={16} color="#475569" />
                    </View>
                    <Text style={styles.metricValue}>{totalSubmitted}</Text>
                    <Text style={styles.metricSub}>applicants</Text>
                  </View>

                  <View style={[styles.metricCard, { borderTopWidth: 3, borderTopColor: '#16A34A' }]}>
                    <View style={styles.metricHeader}>
                      <Text style={styles.metricLabel}>APPROVED</Text>
                      <Icon name="check-circle" size={16} color="#16A34A" />
                    </View>
                    <Text style={[styles.metricValue, { color: '#16A34A' }]}>{approvedCount}</Text>
                    <Text style={styles.metricSub}>applicants</Text>
                  </View>

                  <View style={[styles.metricCard, { borderTopWidth: 3, borderTopColor: '#DC2626' }]}>
                    <View style={styles.metricHeader}>
                      <Text style={styles.metricLabel}>DECLINED</Text>
                      <Icon name="x-circle" size={16} color="#DC2626" />
                    </View>
                    <Text style={[styles.metricValue, { color: '#DC2626' }]}>{declinedCount}</Text>
                    <Text style={styles.metricSub}>applicants</Text>
                  </View>

                  <View style={[styles.metricCard, { borderTopWidth: 3, borderTopColor: '#4F46E5' }]}>
                    <View style={styles.metricHeader}>
                      <Text style={styles.metricLabel}>GENERATED DOCUMENT</Text>
                      <Icon name="file-text" size={16} color="#2563EB" />
                    </View>
                    <Text style={styles.soaValue} numberOfLines={1}>
                      {app.soaNumber ?? `SOA #${app.referenceNumber}`}
                    </Text>
                    <TouchableOpacity
                      style={styles.viewSoaBtn}
                      onPress={() => {
                        if (onDownloadDoc) {
                          const soaDoc = docs.find((d) => d.category === 'SOA');
                          if (soaDoc) onDownloadDoc(soaDoc);
                        }
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.viewSoaBtnText}>View SOA</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* ── Alert Warning Banner ───────────────────────────────────── */}
                <View style={styles.alertBanner}>
                  <Icon name="alert-circle" size={16} color="#B45309" />
                  <Text style={styles.alertBannerText}>
                    {approvedCount} applicants were approved and included in the Statement of Account. {declinedCount} were declined.
                  </Text>
                </View>

                {/* ── Approved Applicants Table ───────────────────────────────── */}
                <View style={styles.tableSectionCard}>
                  <View style={styles.tableSectionHeader}>
                    <View style={styles.tableHeaderTitleRow}>
                      <Text style={styles.tableSectionTitle}>Approved Applicants</Text>
                      <View style={styles.tableCountBadge}>
                        <Text style={styles.tableCountBadgeText}>{filteredApplicants.length}</Text>
                      </View>
                    </View>

                    <View style={styles.tableSearchBox}>
                      <Icon name="search" size={14} color="#94A3B8" />
                      <TextInput
                        style={styles.tableSearchInput}
                        placeholder="Search approved..."
                        placeholderTextColor="#94A3B8"
                        value={tableSearch}
                        onChangeText={(text) => {
                          setTableSearch(text);
                          setTablePage(1);
                        }}
                      />
                      {tableSearch.length > 0 && (
                        <TouchableOpacity onPress={() => setTableSearch('')}>
                          <Icon name="x" size={14} color="#94A3B8" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>

                  {/* Responsive Grid/Table layout */}
                  <View style={styles.tableWrapper}>
                    <View style={styles.tableThRow}>
                      <Text style={[styles.thCol, { flex: 0.5 }]}>#</Text>
                      <Text style={[styles.thCol, { flex: 2.5 }]}>APPLICANT NAME</Text>
                      <Text style={[styles.thCol, { flex: 1.5 }]}>APPLICATION TYPE</Text>
                      <Text style={[styles.thCol, { flex: 1.5 }]}>STATUS</Text>
                      <Text style={[styles.thCol, { flex: 1.5 }]}>INCLUDED IN SOA</Text>
                      <Text style={[styles.thCol, { flex: 1.5, textAlign: 'right' }]}>ACTION</Text>
                    </View>

                    {pagedApplicants.length === 0 ? (
                      <View style={styles.emptyTableState}>
                        <Text style={styles.emptyTableText}>No applicants found matching "{tableSearch}"</Text>
                      </View>
                    ) : (
                      pagedApplicants.map((applicant, idx) => {
                        const absoluteIndex = (tablePage - 1) * TABLE_PAGE_SIZE + idx + 1;
                        return (
                          <View key={applicant.id} style={[styles.tableTdRow, idx % 2 === 1 && styles.tableTdRowAlt]}>
                            <Text style={[styles.tdCol, { flex: 0.5, color: '#64748B' }]}>{absoluteIndex}</Text>
                            <Text style={[styles.tdCol, { flex: 2.5, fontWeight: '600', color: '#0F172A' }]} numberOfLines={1}>
                              {applicant.name}
                            </Text>
                            <Text style={[styles.tdCol, { flex: 1.5 }]}>{applicant.applicationType}</Text>
                            <View style={{ flex: 1.5, alignItems: 'flex-start' }}>
                              <View style={[styles.tableStatusChip, { backgroundColor: safeGetStatusBgColor(applicant.status) }]}>
                                <Text style={[styles.tableStatusChipText, { color: safeGetStatusColor(applicant.status) }]}>
                                  {safeGetStatusLabel(applicant.status)}
                                </Text>
                              </View>
                            </View>
                            <Text style={[styles.tdCol, { flex: 1.5, fontWeight: '500', color: '#334155' }]}>
                              {applicant.includedInSOA ? 'Yes' : 'No'}
                            </Text>
                            <TouchableOpacity
                              onPress={() => {
                                setSelectedApplicant(applicant);
                                setSubActiveTab('DETAILS');
                              }}
                              style={{ flex: 1.5, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}
                              activeOpacity={0.7}
                            >
                              <Text style={styles.viewDetailsLinkText}>View Details</Text>
                              <Icon name="external-link" size={11} color="#1D4ED8" />
                            </TouchableOpacity>
                          </View>
                        );
                      })
                    )}
                  </View>

                  {/* Table Pagination */}
                  {totalPages > 1 && (
                    <View style={styles.tablePaginationBar}>
                      <Text style={styles.tablePaginationSummary}>
                        Showing {(tablePage - 1) * TABLE_PAGE_SIZE + 1} to{' '}
                        {Math.min(tablePage * TABLE_PAGE_SIZE, filteredApplicants.length)} of{' '}
                        {filteredApplicants.length} applicants
                      </Text>

                      <View style={styles.tablePaginationBtns}>
                        <TouchableOpacity
                          onPress={() => setTablePage((p) => Math.max(1, p - 1))}
                          disabled={tablePage === 1}
                          style={[styles.tablePageNavBtn, tablePage === 1 && styles.tablePageNavBtnDisabled]}
                        >
                          <Icon name="chevron-left" size={14} color={tablePage === 1 ? '#CBD5E1' : '#334155'} />
                        </TouchableOpacity>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                          <TouchableOpacity
                            key={pg}
                            onPress={() => setTablePage(pg)}
                            style={[styles.tablePageNumberBtn, pg === tablePage && styles.tablePageNumberBtnActive]}
                          >
                            <Text style={[styles.tablePageNumberText, pg === tablePage && styles.tablePageNumberTextActive]}>
                              {pg}
                            </Text>
                          </TouchableOpacity>
                        ))}

                        <TouchableOpacity
                          onPress={() => setTablePage((p) => Math.min(totalPages, p + 1))}
                          disabled={tablePage === totalPages}
                          style={[styles.tablePageNavBtn, tablePage === totalPages && styles.tablePageNavBtnDisabled]}
                        >
                          <Icon name="chevron-right" size={14} color={tablePage === totalPages ? '#CBD5E1' : '#334155'} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              </>
            ) : (
              <View style={{ gap: 20 }}>
                {/* ── Hero Review & Status Header ── */}
                <View
                  style={{
                    backgroundColor: '#0F2C59',
                    borderRadius: 14,
                    padding: 18,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 14,
                    marginBottom: 4,
                  }}
                >
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Icon name="check-circle" size={22} color="#FFFFFF" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontFamily: TYPOGRAPHY.fonts.primary,
                        fontSize: 16,
                        fontWeight: '700',
                        color: '#FFFFFF',
                        marginBottom: 2,
                      }}
                    >
                      Official Application Review & Summary
                    </Text>
                    <Text
                      style={{
                        fontFamily: TYPOGRAPHY.fonts.primary,
                        fontSize: 12,
                        color: 'rgba(255, 255, 255, 0.7)',
                      }}
                    >
                      Reference #{app.referenceNumber} • Submitted {submissionTime}
                    </Text>
                  </View>
                </View>

                {/* ── Section 1: Examination Details / Service & Jurisdiction Parameters ── */}
                <SectionCard
                  icon={isExamService ? 'file-text' : 'layers'}
                  title={isExamService ? '1. Examination Details & Service Parameters' : '1. Service & Jurisdiction Parameters'}
                  accentColor="#0F2C59"
                >
                  <View style={{ gap: 4 }}>
                    <SummaryRow label="Service Name" value={app.serviceName} />
                    <SummaryRow label="Service Category" value={app.serviceCategory} />

                    <View style={{ flexDirection: isDesktop ? 'row' : 'column', gap: 8 }}>
                      <View style={{ flex: 1 }}>
                        <SummaryRow
                          label="Target Region / Jurisdiction"
                          value={app.region || app.tenantName || 'NTC Regional Jurisdiction'}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <SummaryRow
                          label="Field Office"
                          value={app.office || (app.schedule?.venue) || 'Main Processing Office'}
                        />
                      </View>
                    </View>

                    <View style={{ flexDirection: isDesktop ? 'row' : 'column', gap: 8 }}>
                      <View style={{ flex: 1 }}>
                        <SummaryRow
                          label="Applicant Classification"
                          value={singleApplicant?.companyName ? `Company / Corporate (${singleApplicant.companyName})` : 'Individual Applicant'}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <SummaryRow
                          label="Filing Mode"
                          value="Single Applicant Filing"
                        />
                      </View>
                    </View>

                    <SummaryRow
                      label="Application Variant / Type"
                      value={variantLabel}
                    />

                    {scheduleSummaryText ? (
                      <View
                        style={{
                          backgroundColor: '#EFF6FF',
                          borderWidth: 1,
                          borderColor: '#BFDBFE',
                          borderRadius: 10,
                          padding: 12,
                          marginTop: 4,
                          marginBottom: 4,
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <Icon name="calendar" size={14} color="#1D4ED8" />
                          <Text
                            style={{
                              fontFamily: TYPOGRAPHY.fonts.primary,
                              fontSize: 11,
                              fontWeight: '700',
                              color: '#1D4ED8',
                              textTransform: 'uppercase',
                              letterSpacing: 0.5,
                            }}
                          >
                            EXAMINATION SCHEDULE & VENUE
                          </Text>
                        </View>
                        <Text
                          style={{
                            fontFamily: TYPOGRAPHY.fonts.primary,
                            fontSize: 13,
                            fontWeight: '700',
                            color: '#0F172A',
                          }}
                        >
                          {scheduleSummaryText}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </SectionCard>

                {/* ── Section 2: Applicant Details ── */}
                <SectionCard
                  icon="user"
                  title="2. Applicant Details"
                  accentColor="#1D4ED8"
                >
                  <View style={{ gap: 4 }}>
                    <SummaryRow label="Full Legal Name" value={primaryName} />

                    {singleApplicant?.companyName ? (
                      <SummaryRow label="Registered Business / Corporate Name" value={singleApplicant.companyName} />
                    ) : null}

                    {singleApplicant?.representativeName ? (
                      <SummaryRow label="Authorized Representative" value={singleApplicant.representativeName} />
                    ) : null}

                    <View style={{ flexDirection: isDesktop ? 'row' : 'column', gap: 8 }}>
                      <View style={{ flex: 1 }}>
                        <SummaryRow label="Email Address" value={singleApplicant?.email} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <SummaryRow label="Contact / Mobile Number" value={singleApplicant?.mobileNumber} />
                      </View>
                    </View>

                    <SummaryRow
                      label="Complete Residential / Office Address"
                      value={[
                        singleApplicant?.streetAddress,
                        singleApplicant?.barangay,
                        singleApplicant?.cityMunicipality,
                        singleApplicant?.province,
                        singleApplicant?.region,
                        singleApplicant?.zipCode,
                      ]
                        .filter(Boolean)
                        .filter((v) => v !== 'N/A' && v !== '')
                        .join(', ')}
                    />

                    <View style={{ flexDirection: isDesktop ? 'row' : 'column', gap: 8 }}>
                      {singleApplicant?.birthDate ? (
                        <View style={{ flex: 1 }}>
                          <SummaryRow label="Date of Birth" value={singleApplicant.birthDate} />
                        </View>
                      ) : null}
                      <View style={{ flex: 1 }}>
                        <SummaryRow label="Sex / Gender" value={singleApplicant?.sex} />
                      </View>
                    </View>

                    <View style={{ flexDirection: isDesktop ? 'row' : 'column', gap: 8 }}>
                      {singleApplicant?.civilStatus ? (
                        <View style={{ flex: 1 }}>
                          <SummaryRow label="Civil Status" value={singleApplicant.civilStatus} />
                        </View>
                      ) : null}
                      <View style={{ flex: 1 }}>
                        <SummaryRow label="Nationality / Citizenship" value={singleApplicant?.nationality} />
                      </View>
                    </View>

                    {singleApplicant?.notes ? (
                      <SummaryRow label="Special Notes / Remarks" value={singleApplicant.notes} />
                    ) : null}
                  </View>
                </SectionCard>

                {/* ── Section 3+: Submitted Form & Technical Specifications (Full Width) ── */}
                <View style={{ width: '100%' }}>
                  <SubmittedFormStructuredView
                    app={app}
                    primaryName={primaryName}
                    formFieldValues={formFieldValues}
                    onPreviewFile={(uri, name) => setPreviewCustomDoc({ uri, name })}
                    sectionNumber="3"
                  />
                </View>

                {/* ── Section 4: Attached Requirements & Document Proofs ── */}
                {docs.length > 0 && (
                  <SectionCard
                    icon="paperclip"
                    title="4. Attached Requirements & Document Proofs"
                    accentColor="#059669"
                  >
                    <View style={{ gap: 10 }}>
                      <Text
                        style={{
                          fontFamily: TYPOGRAPHY.fonts.primary,
                          fontSize: 12,
                          color: '#64748B',
                          marginBottom: 4,
                        }}
                      >
                        {docs.length} official document(s) and uploaded requirement proofs attached to this application:
                      </Text>

                      {docs.map((doc, dIdx) => (
                        <View
                          key={doc.id || `doc-req-${dIdx}`}
                          style={{
                            backgroundColor: '#F8FAFC',
                            borderWidth: 1,
                            borderColor: '#E2E8F0',
                            borderRadius: 10,
                            padding: 12,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 12,
                          }}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                            <View
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: 8,
                                backgroundColor: '#EFF6FF',
                                justifyContent: 'center',
                                alignItems: 'center',
                              }}
                            >
                              <Icon name="file-text" size={18} color="#1D4ED8" />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text
                                style={{
                                  fontFamily: TYPOGRAPHY.fonts.primary,
                                  fontSize: 13,
                                  fontWeight: '700',
                                  color: '#0F172A',
                                }}
                                numberOfLines={1}
                              >
                                {doc.name}
                              </Text>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                                <View
                                  style={{
                                    backgroundColor: '#EFF6FF',
                                    borderWidth: 1,
                                    borderColor: '#BFDBFE',
                                    borderRadius: 6,
                                    paddingHorizontal: 6,
                                    paddingVertical: 1,
                                  }}
                                >
                                  <Text
                                    style={{
                                      fontFamily: TYPOGRAPHY.fonts.primary,
                                      fontSize: 10,
                                      fontWeight: '700',
                                      color: '#1D4ED8',
                                      textTransform: 'uppercase',
                                    }}
                                  >
                                    {doc.category.replace('_', ' ')}
                                  </Text>
                                </View>
                                <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, color: '#64748B' }}>
                                  {doc.size}
                                </Text>
                              </View>
                            </View>
                          </View>

                          <TouchableOpacity
                            onPress={async () => {
                              const rawReq = (app.requirements ?? app.Requirements ?? []) as RawRequirement[];
                              const matched = rawReq.find(
                                (r) => r.id === doc.id || (r.url !== undefined && r.url.includes(doc.id)) || (r.storedFileId !== undefined && r.storedFileId === doc.storedFileId)
                              );
                              let fileUrl: string | undefined = doc.url ?? matched?.url ?? undefined;
                              if (!fileUrl && (doc.storedFileId || matched?.storedFileId)) {
                                const targetFileId = doc.storedFileId || matched?.storedFileId;
                                const tenantId = (app.tenantId && isGuid(app.tenantId)) ? app.tenantId : (app.region && isGuid(app.region) ? app.region : 'aa0cd342-7265-4d9e-9242-948fc7e3d0a8');
                                fileUrl = `/api/v2/tenants/${tenantId}/storage/files/${targetFileId}`;
                              }

                              if (fileUrl !== undefined && fileUrl !== '') {
                                setPreviewLoadingId(doc.id);
                                try {
                                  const baseUrl =
                                    (process.env.EXPO_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? '').trim();
                                  const fullUrl = fileUrl.startsWith('http') ? fileUrl : `${baseUrl}${fileUrl}`;
                                  const blob = await api.get<Blob>(fullUrl);
                                  const objectUrl =
                                    typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function'
                                      ? URL.createObjectURL(blob as unknown as Blob)
                                      : fullUrl;

                                  setPreviewCustomDoc({ uri: objectUrl, name: doc.name });
                                } catch (fetchErr) {
                                  console.warn('[ApplicationDetails] Could not fetch file preview:', fetchErr);
                                  setPreviewCustomDoc({ uri: fileUrl, name: doc.name });
                                } finally {
                                  setPreviewLoadingId(null);
                                }
                              } else {
                                setPreviewDoc(doc);
                              }
                            }}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              backgroundColor: '#EFF6FF',
                              borderWidth: 1,
                              borderColor: '#BFDBFE',
                              paddingVertical: 6,
                              paddingHorizontal: 12,
                              borderRadius: 8,
                              gap: 4,
                            }}
                            activeOpacity={0.8}
                          >
                            <Icon name="eye" size={13} color="#1D4ED8" />
                            <Text
                              style={{
                                fontFamily: TYPOGRAPHY.fonts.primary,
                                fontSize: 11,
                                fontWeight: '700',
                                color: '#1D4ED8',
                              }}
                            >
                              View Document
                            </Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  </SectionCard>
                )}
              </View>
            )}
          </View>
        )}

        {/* ── Tab Content: Documents ────────────────────────────────────── */}
        {activeTab === 'DOCUMENTS' && (
          <View style={styles.tabContentList}>
            <View style={styles.docHeaderContainer}>
              <Text style={styles.docHeaderTitle}>Attached & Issued Documents</Text>
              <Text style={styles.docHeaderSubtitle}>
                Preview official application documents, admission slips, receipts, and permits below.
              </Text>
            </View>

            {docs.map((doc) => {
              const isLoading = previewLoadingId === doc.id;

              const handlePreview = async () => {
                // If the doc has a real backend URL (from ApplicationRequirement.Url), fetch and stream it
                const rawReq = (app.requirements ?? app.Requirements ?? []) as RawRequirement[];
                const matched = rawReq.find(
                  (r) => r.id === doc.id || (r.url !== undefined && r.url.includes(doc.id))
                );
                const fileUrl: string | undefined = doc.url ?? matched?.url ?? undefined;

                if (fileUrl !== undefined && fileUrl !== '') {
                  setPreviewLoadingId(doc.id);
                  try {
                    const baseUrl =
                      (process.env.EXPO_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? '').trim();
                    const fullUrl = fileUrl.startsWith('http') ? fileUrl : `${baseUrl}${fileUrl}`;

                    // Fetch the authenticated file stream
                    const blob = await api.get<Blob>(fullUrl);
                    const objectUrl =
                      typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function'
                        ? URL.createObjectURL(blob as unknown as Blob)
                        : fullUrl;

                    setPreviewCustomDoc({ uri: objectUrl, name: doc.name });
                  } catch (fetchErr) {
                    console.warn('[ApplicationDetails] Could not fetch file preview:', fetchErr);
                    setPreviewCustomDoc({ uri: fileUrl, name: doc.name });
                  } finally {
                    setPreviewLoadingId(null);
                  }
                } else {
                  // Fallback for generated/legacy docs — open static preview modal
                  setPreviewDoc(doc);
                }
              };

              return (
                <View key={doc.id} style={styles.docRowCard}>
                  <View style={styles.docIconBox}>
                    <Icon name="file-text" size={20} color="#1D4ED8" />
                  </View>

                  <View style={styles.docInfoCol}>
                    <Text style={styles.docNameText} numberOfLines={1}>
                      {doc.name}
                    </Text>
                    <Text style={styles.docSubtext}>
                      {doc.category.replace('_', ' ')} · {doc.size} · {doc.type}
                    </Text>
                  </View>

                  <View style={styles.docActionsRowGroup}>
                    <TouchableOpacity
                      onPress={handlePreview}
                      style={styles.docPreviewPillBtn}
                      activeOpacity={0.8}
                      disabled={isLoading}
                    >
                      <Icon
                        name={isLoading ? 'loader' : 'eye'}
                        size={14}
                        color={isLoading ? '#94A3B8' : '#1D4ED8'}
                      />
                      <Text style={[styles.docPreviewPillBtnText, isLoading && { color: '#94A3B8' }]}>
                        {isLoading ? 'Loading...' : 'Preview'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        if (onDownloadDoc !== undefined) onDownloadDoc(doc);
                      }}
                      style={styles.docDownloadBtn}
                      activeOpacity={0.8}
                    >
                      <Icon name="download" size={14} color="#475569" />
                      <Text style={styles.docDownloadBtnText}>Download</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* ── Document Preview Modal ───────────────────────────────────────── */}
      <Modal
        visible={previewDoc !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPreviewDoc(null)}
      >
        {previewDoc !== null && (
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { maxWidth: isMobile ? '95%' : 600 }]}>
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderTitleGroup}>
                  <Icon name="file-text" size={20} color="#1D4ED8" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalTitle} numberOfLines={1}>
                      {previewDoc.name}
                    </Text>
                    <Text style={styles.modalSubtitle}>
                      {previewDoc.category.replace('_', ' ')} · {previewDoc.size} · {previewDoc.type}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => setPreviewDoc(null)}
                  style={styles.modalCloseBtn}
                >
                  <Icon name="x" size={18} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBodyScroll} contentContainerStyle={styles.modalBodyContent}>
                <View style={styles.docSheetHeader}>
                  <Text style={styles.docSheetGovText}>REPUBLIC OF THE PHILIPPINES</Text>
                  <Text style={styles.docSheetAgencyText}>NATIONAL TELECOMMUNICATIONS COMMISSION</Text>
                  <Text style={styles.docSheetSubAgency}>NTC Building, BIR Road, East Triangle, Diliman, Quezon City</Text>
                </View>

                <View style={styles.docSheetDivider} />

                <View style={styles.docSheetTitleBox}>
                  <Text style={styles.docSheetTitleText}>{previewDoc.name}</Text>
                  <Text style={styles.docSheetRefText}>REF NO: #{app.referenceNumber}</Text>
                </View>

                <View style={styles.docSheetDataGrid}>
                  <View style={styles.docSheetDataRow}>
                    <Text style={styles.docSheetLabel}>Service Name:</Text>
                    <Text style={styles.docSheetValue}>{app.serviceName}</Text>
                  </View>

                  <View style={styles.docSheetDataRow}>
                    <Text style={styles.docSheetLabel}>Applicant / Company:</Text>
                    <Text style={styles.docSheetValue}>{primaryName}</Text>
                  </View>

                  <View style={styles.docSheetDataRow}>
                    <Text style={styles.docSheetLabel}>Document Category:</Text>
                    <Text style={styles.docSheetValue}>{previewDoc.category.replace('_', ' ')}</Text>
                  </View>

                  <View style={styles.docSheetDataRow}>
                    <Text style={styles.docSheetLabel}>Uploaded Date:</Text>
                    <Text style={styles.docSheetValue}>{formatRelativeTime(previewDoc.uploadedAt)}</Text>
                  </View>
                </View>

                <View style={styles.docSheetStampRow}>
                  <View style={styles.officialStampBadge}>
                    <Icon name="check-circle" size={16} color="#16A34A" />
                    <Text style={styles.officialStampText}>OFFICIALLY VERIFIED & VALID</Text>
                  </View>
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  onPress={() => {
                    if (onDownloadDoc !== undefined) onDownloadDoc(previewDoc);
                  }}
                  style={styles.modalDownloadBtn}
                  activeOpacity={0.85}
                >
                  <Icon name="download" size={15} color="#FFFFFF" />
                  <Text style={styles.modalDownloadBtnText}>Download File</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setPreviewDoc(null)}
                  style={styles.modalCloseFooterBtn}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalCloseFooterBtnText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </Modal>

      {/* ── Selected Bulk Applicant Details Modal ────────────────────────── */}
      <Modal
        visible={selectedApplicant !== null}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedApplicant(null)}
      >
        {selectedApplicant !== null && (
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { maxWidth: isMobile ? '95%' : 780, maxHeight: '92%' }]}>
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderTitleGroup}>
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: '#EFF6FF',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Icon name="user" size={18} color="#1D4ED8" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalTitle} numberOfLines={1}>
                      {selectedApplicant.name}
                    </Text>
                    <Text style={styles.modalSubtitle}>
                      {selectedApplicant.applicationType} • {safeGetStatusLabel(selectedApplicant.status)}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => setSelectedApplicant(null)}
                  style={styles.modalCloseBtn}
                >
                  <Icon name="x" size={18} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBodyScroll} contentContainerStyle={styles.modalBodyContent}>
                <View style={{ gap: 16 }}>
                  {/* Section 1: Examination & Service Parameters */}
                  <SectionCard
                    icon={isExamService ? 'file-text' : 'layers'}
                    title={isExamService ? '1. Examination & Service Parameters' : '1. Service & Jurisdiction Parameters'}
                    accentColor="#0F2C59"
                  >
                    <View style={{ gap: 4 }}>
                      <SummaryRow label="Service Name" value={app.serviceName} />
                      <SummaryRow label="Service Category" value={app.serviceCategory} />
                      <View style={{ flexDirection: isDesktop ? 'row' : 'column', gap: 8 }}>
                        <View style={{ flex: 1 }}>
                          <SummaryRow
                            label="Target Region / Jurisdiction"
                            value={app.region || app.tenantName || 'NTC Regional Jurisdiction'}
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <SummaryRow
                            label="Field Office"
                            value={app.office || (app.schedule?.venue) || 'Main Processing Office'}
                          />
                        </View>
                      </View>
                      <SummaryRow label="Application Type" value={selectedApplicant.applicationType} />
                      {scheduleSummaryText ? (
                        <SummaryRow label="Exam Schedule & Venue" value={scheduleSummaryText} />
                      ) : null}
                    </View>
                  </SectionCard>

                  {/* Section 2: Applicant Details */}
                  <SectionCard
                    icon="user"
                    title="2. Applicant Details"
                    accentColor="#1D4ED8"
                  >
                    <View style={{ gap: 4 }}>
                      <SummaryRow label="Full Legal Name" value={selectedApplicant.name} />
                      <View style={{ flexDirection: isDesktop ? 'row' : 'column', gap: 8 }}>
                        <View style={{ flex: 1 }}>
                          <SummaryRow label="Email Address" value={selectedApplicant.email} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <SummaryRow label="Contact / Mobile Number" value={selectedApplicant.mobileNumber} />
                        </View>
                      </View>
                      <SummaryRow
                        label="Complete Address"
                        value={[
                          selectedApplicant.streetAddress,
                          selectedApplicant.barangay,
                          selectedApplicant.cityMunicipality,
                          selectedApplicant.province,
                          selectedApplicant.region,
                          selectedApplicant.zipCode,
                        ]
                          .filter(Boolean)
                          .filter((v) => v !== 'N/A' && v !== '')
                          .join(', ')}
                      />
                      <View style={{ flexDirection: isDesktop ? 'row' : 'column', gap: 8 }}>
                        <View style={{ flex: 1 }}>
                          <SummaryRow label="Sex / Gender" value={selectedApplicant.sex} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <SummaryRow label="Nationality" value={selectedApplicant.nationality} />
                        </View>
                      </View>
                    </View>
                  </SectionCard>

                  {/* Section 3: Dynamic Form Particulars */}
                  {selectedApplicantFormFields.length > 0 && (
                    <SubmittedFormStructuredView
                      app={app}
                      primaryName={selectedApplicant.name}
                      formFieldValues={selectedApplicantFormFields}
                      onPreviewFile={(uri, name) => setPreviewCustomDoc({ uri, name })}
                      sectionNumber="3"
                    />
                  )}
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  onPress={() => setSelectedApplicant(null)}
                  style={styles.modalCloseFooterBtn}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalCloseFooterBtnText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </Modal>

      {/* ── Custom Attached Document Preview Modal ───────────────────────── */}
      <DocumentPreviewModal
        visible={previewCustomDoc !== null}
        onClose={() => setPreviewCustomDoc(null)}
        file={previewCustomDoc}
        label={previewCustomDoc?.name}
      />
    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components & Helpers
// ─────────────────────────────────────────────────────────────────────────────

function isRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}

const formatFieldKey = (key: string): string => {
  const map: Record<string, string> = {
    firstname: 'First Name',
    lastname: 'Last Name',
    middlename: 'Middle Name',
    email: 'Email Address',
    mobilenumber: 'Mobile Number',
    contactnumber: 'Contact Number',
    streetaddress: 'Street Address',
    barangay: 'Barangay',
    citymunicipality: 'City / Municipality',
    province: 'Province',
    region: 'Region',
    zipcode: 'Zip Code',
    nationality: 'Nationality',
    sex: 'Sex / Gender',
    civilstatus: 'Civil Status',
    schoolattended: 'School Attended',
    coursecompleted: 'Course / Degree Completed',
    yeargraduated: 'Year Graduated',
    educationalattainment: 'Educational Attainment',
    specialneeds: 'Special Needs / Accommodation',
  };

  const lower = key.toLowerCase().replace(/[-_]/g, '');
  if (map[lower]) return map[lower];

  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

function SectionCard({
  icon,
  title,
  accentColor = '#0F2C59',
  children,
}: {
  icon: React.ComponentProps<typeof Icon>['name'];
  title: string;
  accentColor?: string;
  children: React.ReactNode;
}) {
  return (
    <View
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 18,
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderLeftWidth: 5,
        borderLeftColor: accentColor,
        marginBottom: 16,
        ...Platform.select({
          web: {
            boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.04)',
          },
        }),
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          marginBottom: 14,
        }}
      >
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: `${accentColor}12`,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Icon name={icon} size={14} color={accentColor} />
        </View>
        <Text
          style={{
            fontFamily: TYPOGRAPHY.fonts.primary,
            fontSize: 14,
            fontWeight: '700',
            color: '#0F2C59',
          }}
        >
          {title}
        </Text>
      </View>
      {children}
    </View>
  );
}

function SummaryRow({
  label,
  value,
  onPreviewFile,
}: {
  label: string;
  value?: string | null;
  onPreviewFile?: (file: string, label: string) => void;
}) {
  if (
    !value ||
    value.trim() === '' ||
    value.trim().toUpperCase() === 'N/A' ||
    value.trim().toUpperCase() === 'NA' ||
    value.trim() === '-' ||
    value.trim() === '[]' ||
    value.trim() === '{}'
  ) {
    return null;
  }

  const trimmedVal = value.trim();
  const labelLower = label.toLowerCase();

  // Check if value is a JSON array or object (e.g. from repeater tables)
  let parsedArray: Array<Record<string, unknown>> | null = null;
  if (
    (trimmedVal.startsWith('[') && trimmedVal.endsWith(']')) ||
    (trimmedVal.startsWith('{') && trimmedVal.endsWith('}'))
  ) {
    try {
      const parsed: unknown = JSON.parse(trimmedVal);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const validRows = parsed.filter(isRecord);
        if (validRows.length > 0) {
          parsedArray = validRows;
        }
      } else if (isRecord(parsed)) {
        parsedArray = [parsed];
      }
    } catch {
      // Ignored if not JSON
    }
  }

  if (parsedArray !== null && parsedArray.length > 0) {
    return (
      <View
        style={{
          backgroundColor: '#F8FAFC',
          padding: 14,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: '#CBD5E1',
          marginBottom: 12,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <Text
            style={{
              fontFamily: TYPOGRAPHY.fonts.primary,
              fontSize: 11,
              fontWeight: '700',
              color: '#475569',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            {label}
          </Text>
          <View
            style={{
              backgroundColor: '#EFF6FF',
              borderWidth: 1,
              borderColor: '#BFDBFE',
              borderRadius: 10,
              paddingHorizontal: 8,
              paddingVertical: 2,
            }}
          >
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 10, fontWeight: '700', color: '#1D4ED8' }}>
              {parsedArray.length} {parsedArray.length === 1 ? 'ENTRY RECORDED' : 'ENTRIES RECORDED'}
            </Text>
          </View>
        </View>

        <View style={{ gap: 8 }}>
          {parsedArray.map((row, rIdx) => {
            const entries = Object.entries(row).filter(
              ([k, v]) =>
                k !== '_id' &&
                k !== 'id' &&
                k !== 'key' &&
                v !== null &&
                v !== undefined &&
                String(v).trim() !== ''
            );

            if (entries.length === 0) return null;

            return (
              <View
                key={row._id ? String(row._id) : `row-${rIdx}`}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderWidth: 1,
                  borderColor: '#E2E8F0',
                  borderRadius: 8,
                  padding: 12,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    marginBottom: 8,
                    paddingBottom: 6,
                    borderBottomWidth: 1,
                    borderBottomColor: '#F1F5F9',
                  }}
                >
                  <View
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 9,
                      backgroundColor: '#0F2C59',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 10, fontWeight: '700', color: '#FFFFFF' }}>
                      {rIdx + 1}
                    </Text>
                  </View>
                  <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, fontWeight: '700', color: '#0F2C59' }}>
                    Item #{rIdx + 1}
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {entries.map(([k, v]) => (
                    <View
                      key={k}
                      style={{
                        minWidth: '45%',
                        flex: 1,
                        backgroundColor: '#F8FAFC',
                        padding: 8,
                        borderRadius: 6,
                        borderWidth: 1,
                        borderColor: '#F1F5F9',
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: TYPOGRAPHY.fonts.primary,
                          fontSize: 10,
                          fontWeight: '700',
                          color: '#64748B',
                          marginBottom: 2,
                        }}
                      >
                        {formatFieldKey(k)}
                      </Text>
                      <Text
                        style={{
                          fontFamily: TYPOGRAPHY.fonts.primary,
                          fontSize: 12.5,
                          fontWeight: '600',
                          color: '#0F172A',
                        }}
                      >
                        {String(v)}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  }

  const isSignature =
    labelLower.includes('signature') ||
    trimmedVal.startsWith('data:image') ||
    trimmedVal.startsWith('typed:cursive:') ||
    trimmedVal.startsWith('blob:');

  const isCheckbox =
    labelLower.includes('declare') ||
    labelLower.includes('certify') ||
    labelLower.includes('agreement') ||
    labelLower.includes('declaration') ||
    trimmedVal.toLowerCase() === 'true' ||
    trimmedVal.toLowerCase() === 'false' ||
    trimmedVal.toLowerCase() === 'agreed' ||
    trimmedVal.toLowerCase() === 'yes' ||
    trimmedVal.toLowerCase() === 'no';

  const isDocumentFile =
    !isSignature &&
    (trimmedVal.startsWith('data:application/pdf') ||
      trimmedVal.startsWith('blob:') ||
      trimmedVal.toLowerCase().endsWith('.pdf') ||
      trimmedVal.toLowerCase().endsWith('.png') ||
      trimmedVal.toLowerCase().endsWith('.jpg') ||
      trimmedVal.toLowerCase().endsWith('.jpeg'));

  if (isSignature) {
    const isImageSignature =
      trimmedVal.startsWith('data:image') ||
      trimmedVal.startsWith('blob:') ||
      trimmedVal.startsWith('http://') ||
      trimmedVal.startsWith('https://');

    const typedText = trimmedVal.startsWith('typed:cursive:')
      ? trimmedVal.replace('typed:cursive:', '').trim()
      : trimmedVal;

    return (
      <View
        style={{
          backgroundColor: '#F8FAFC',
          padding: 14,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: '#CBD5E1',
          marginBottom: 10,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text
            style={{
              fontFamily: TYPOGRAPHY.fonts.primary,
              fontSize: 11,
              fontWeight: '700',
              color: '#475569',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            {label}
          </Text>
          <View style={{ backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 }}>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 10, fontWeight: '700', color: '#1D4ED8' }}>
              APPLICANT SIGNATURE
            </Text>
          </View>
        </View>

        {isImageSignature ? (
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderWidth: 1,
              borderColor: '#E2E8F0',
              borderRadius: 8,
              padding: 8,
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 90,
            }}
          >
            <Image
              source={{ uri: trimmedVal }}
              style={{ width: '100%', height: 80 }}
              resizeMode="contain"
            />
            <View style={{ width: '80%', height: 1, backgroundColor: '#CBD5E1', marginTop: 6 }} />
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 10, color: '#94A3B8', marginTop: 4 }}>
              Digital Handwritten Signature Recorded
            </Text>
          </View>
        ) : (
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderWidth: 1,
              borderColor: '#E2E8F0',
              borderRadius: 8,
              padding: 14,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                fontFamily: TYPOGRAPHY.fonts.primary,
                fontSize: 22,
                fontStyle: 'italic',
                fontWeight: '700',
                color: '#0F2C59',
                letterSpacing: 1,
              }}
            >
              {typedText}
            </Text>
            <View style={{ width: '80%', height: 1, backgroundColor: '#0F2C59', marginTop: 6 }} />
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 10, color: '#64748B', marginTop: 4 }}>
              Digitally / Electronically Signed
            </Text>
          </View>
        )}
      </View>
    );
  }

  if (isCheckbox) {
    const isChecked = trimmedVal.toLowerCase() === 'true' || trimmedVal.toLowerCase() === 'agreed' || trimmedVal.toLowerCase() === 'yes' || trimmedVal === '1';
    const displayLabel = labelLower.startsWith('i hereby declare')
      ? OFFICIAL_LEGAL_DECLARATION
      : label;

    return (
      <View
        style={{
          backgroundColor: isChecked ? '#F0FDF4' : '#FEF2F2',
          padding: 12,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: isChecked ? '#BBF7D0' : '#FECACA',
          marginBottom: 8,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <View
          style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            backgroundColor: isChecked ? '#16A34A' : '#FFFFFF',
            borderWidth: 1.5,
            borderColor: isChecked ? '#16A34A' : '#DC2626',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {isChecked && <Icon name="check" size={14} color="#FFFFFF" />}
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: TYPOGRAPHY.fonts.primary,
              fontSize: 12.5,
              fontWeight: '600',
              color: isChecked ? '#166534' : '#991B1B',
              lineHeight: 18,
            }}
          >
            {displayLabel}
          </Text>
          <Text
            style={{
              fontFamily: TYPOGRAPHY.fonts.primary,
              fontSize: 10,
              fontWeight: '700',
              color: isChecked ? '#15803D' : '#B91C1C',
              marginTop: 2,
              textTransform: 'uppercase',
            }}
          >
            {isChecked ? '✓ Confirmed & Agreed' : '✗ Not Agreed'}
          </Text>
        </View>
      </View>
    );
  }

  if (isDocumentFile) {
    return (
      <View
        style={{
          backgroundColor: '#F8FAFC',
          padding: 12,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: '#E2E8F0',
          marginBottom: 8,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text
            style={{
              fontFamily: TYPOGRAPHY.fonts.primary,
              fontSize: 10,
              fontWeight: '700',
              color: '#64748B',
              marginBottom: 3,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            {label}
          </Text>
          <Text
            style={{
              fontFamily: TYPOGRAPHY.fonts.primary,
              fontSize: 12,
              fontWeight: '600',
              color: '#0F172A',
            }}
            numberOfLines={1}
          >
            {trimmedVal}
          </Text>
        </View>
        {onPreviewFile !== undefined && (
          <TouchableOpacity
            onPress={() => onPreviewFile(trimmedVal, label)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#EFF6FF',
              borderWidth: 1,
              borderColor: '#BFDBFE',
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: 8,
              gap: 4,
            }}
          >
            <Icon name="eye" size={13} color="#1D4ED8" />
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, fontWeight: '700', color: '#1D4ED8' }}>
              View Document
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View
      style={{
        backgroundColor: '#F8FAFC',
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: 8,
      }}
    >
      <Text
        style={{
          fontFamily: TYPOGRAPHY.fonts.primary,
          fontSize: 10,
          fontWeight: '700',
          color: '#64748B',
          marginBottom: 3,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontFamily: TYPOGRAPHY.fonts.primary,
          fontSize: 13,
          fontWeight: '600',
          color: '#0F172A',
        }}
      >
        {value}
      </Text>
    </View>
  );
}

// Retain DetailRow for backward compatibility
function DetailRow({
  label,
  value,
  onPreviewFile,
}: {
  label: string;
  value?: string | null;
  isLast?: boolean;
  onPreviewFile?: (file: string, label: string) => void;
}) {
  return <SummaryRow label={label} value={value} onPreviewFile={onPreviewFile} />;
}

interface SubmittedFormStructuredViewProps {
  app: Application;
  primaryName: string;
  formFieldValues: Array<{ fieldId: string; fieldLabel: string; value: string }>;
  onPreviewFile?: (uri: string, name: string) => void;
  sectionNumber?: string;
}

function SubmittedFormStructuredView({
  app,
  primaryName,
  formFieldValues,
  onPreviewFile,
  sectionNumber = '3',
}: SubmittedFormStructuredViewProps) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const {
    technicalSpecs,
    academicSpecs,
    operationalSpecs,
    declarations,
    signatures,
  } = useMemo(() => {
    const tech: Array<{ fieldId: string; fieldLabel: string; value: string }> = [];
    const acad: Array<{ fieldId: string; fieldLabel: string; value: string }> = [];
    const oper: Array<{ fieldId: string; fieldLabel: string; value: string }> = [];
    const decs: Array<{ fieldId: string; fieldLabel: string; value: string }> = [];
    const sigs: Array<{ fieldId: string; fieldLabel: string; value: string }> = [];

    for (const field of formFieldValues) {
      if (!field.value || field.value.trim() === '') continue;
      const val = field.value.trim();
      const valLower = val.toLowerCase();
      const labelLower = (field.fieldLabel || field.fieldId).toLowerCase();

      const isSig =
        labelLower.includes('signature') ||
        val.startsWith('data:image') ||
        val.startsWith('typed:cursive:') ||
        val.startsWith('blob:');

      const isDec =
        !isSig &&
        (labelLower.includes('declare') ||
          labelLower.includes('certify') ||
          labelLower.includes('agreement') ||
          labelLower.includes('declaration') ||
          labelLower.includes('affirm') ||
          valLower === 'true' ||
          valLower === 'false' ||
          valLower === 'agreed' ||
          valLower === 'yes' ||
          valLower === 'no');

      if (isSig) {
        sigs.push(field);
      } else if (isDec) {
        decs.push(field);
      } else if (
        labelLower.includes('school') ||
        labelLower.includes('university') ||
        labelLower.includes('college') ||
        labelLower.includes('course') ||
        labelLower.includes('degree') ||
        labelLower.includes('graduate') ||
        labelLower.includes('education') ||
        labelLower.includes('tin') ||
        labelLower.includes('sss') ||
        labelLower.includes('gsis') ||
        labelLower.includes('profession') ||
        labelLower.includes('occupation') ||
        labelLower.includes('employer')
      ) {
        acad.push(field);
      } else if (
        labelLower.includes('power') ||
        labelLower.includes('frequency') ||
        labelLower.includes('antenna') ||
        labelLower.includes('channel') ||
        labelLower.includes('transmitter') ||
        labelLower.includes('receiver') ||
        labelLower.includes('model') ||
        labelLower.includes('serial') ||
        labelLower.includes('equipment') ||
        labelLower.includes('call sign') ||
        labelLower.includes('callsign') ||
        labelLower.includes('bandwidth') ||
        labelLower.includes('emission') ||
        labelLower.includes('station') ||
        labelLower.includes('class') ||
        labelLower.includes('element')
      ) {
        tech.push(field);
      } else {
        oper.push(field);
      }
    }

    return {
      technicalSpecs: tech,
      academicSpecs: acad,
      operationalSpecs: oper,
      declarations: decs,
      signatures: sigs,
    };
  }, [formFieldValues]);

  const renderParamGrid = (
    fields: Array<{ fieldId: string; fieldLabel: string; value: string }>
  ) => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
      {fields.map((field, idx) => {
        const val = field.value.trim();
        return (
          <View
            key={field.fieldId || `fld-grid-${idx}`}
            style={{ width: isDesktop ? '48.5%' : '100%' }}
          >
            <SummaryRow
              label={field.fieldLabel || formatFieldKey(field.fieldId)}
              value={val}
              onPreviewFile={onPreviewFile}
            />
          </View>
        );
      })}
    </View>
  );

  return (
    <View style={{ gap: 16 }}>
      {/* ── Sub-card A: Technical & Equipment Specifications ─────────────── */}
      {technicalSpecs.length > 0 && (
        <SectionCard
          icon="cpu"
          title={`${sectionNumber}. Technical & Equipment Specifications`}
          accentColor="#0284C7"
        >
          {renderParamGrid(technicalSpecs)}
        </SectionCard>
      )}

      {/* ── Sub-card B: Academic & Professional Background ────────────────── */}
      {academicSpecs.length > 0 && (
        <SectionCard
          icon="book-open"
          title={`${sectionNumber}. Academic & Professional Background`}
          accentColor="#7C3AED"
        >
          {renderParamGrid(academicSpecs)}
        </SectionCard>
      )}

      {/* ── Sub-card C: Operational & Additional Particulars ──────────────── */}
      {operationalSpecs.length > 0 && (
        <SectionCard
          icon="layers"
          title={`${sectionNumber}. Operational & Application Particulars`}
          accentColor="#4F46E5"
        >
          {renderParamGrid(operationalSpecs)}
        </SectionCard>
      )}

      {/* ── Sub-card D: Legal Declarations & Affirmations ─────────────────── */}
      {declarations.length > 0 && (
        <SectionCard
          icon="check-circle"
          title="Legal Declarations & Affirmations"
          accentColor="#16A34A"
        >
          <View style={{ gap: 8 }}>
            {declarations.map((dec, idx) => (
              <SummaryRow
                key={dec.fieldId || `dec-${idx}`}
                label={dec.fieldLabel || dec.fieldId}
                value={dec.value}
              />
            ))}
          </View>
        </SectionCard>
      )}

      {/* ── Sub-card E: Official Electronic Signature Certificate ──────────── */}
      <SectionCard
        icon="shield"
        title="Official Electronic Signature & Certificate"
        accentColor="#0F2C59"
      >
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderWidth: 1.5,
            borderColor: '#E2E8F0',
            borderRadius: 8,
            padding: 20,
            alignItems: 'center',
          }}
        >
          {signatures.length > 0 ? (
            signatures.map((sig, idx) => {
              const val = sig.value.trim();
              const isImage =
                val.startsWith('data:image') ||
                val.startsWith('blob:') ||
                val.startsWith('http://') ||
                val.startsWith('https://');

              const typedText = val.startsWith('typed:cursive:')
                ? val.replace('typed:cursive:', '').trim()
                : val;

              return (
                <View key={sig.fieldId || `sig-${idx}`} style={{ width: '100%', alignItems: 'center', marginVertical: 4 }}>
                  {isImage ? (
                    <Image
                      source={{ uri: val }}
                      style={{ width: 260, height: 85 }}
                      resizeMode="contain"
                    />
                  ) : (
                    <Text
                      style={{
                        fontFamily: TYPOGRAPHY.fonts.primary,
                        fontSize: 26,
                        fontStyle: 'italic',
                        fontWeight: '700',
                        color: '#0F2C59',
                        letterSpacing: 1,
                        marginVertical: 8,
                      }}
                    >
                      {typedText}
                    </Text>
                  )}
                </View>
              );
            })
          ) : (
            <Text
              style={{
                fontFamily: TYPOGRAPHY.fonts.primary,
                fontSize: 24,
                fontStyle: 'italic',
                fontWeight: '700',
                color: '#0F2C59',
                letterSpacing: 1,
                marginVertical: 8,
              }}
            >
              {primaryName}
            </Text>
          )}

          <View style={{ width: 280, height: 1.5, backgroundColor: '#0F2C59', marginTop: 8, marginBottom: 8 }} />
          <Text
            style={{
              fontFamily: TYPOGRAPHY.fonts.primary,
              fontSize: 14,
              fontWeight: '700',
              color: '#0F172A',
            }}
          >
            {primaryName}
          </Text>
          <Text
            style={{
              fontFamily: TYPOGRAPHY.fonts.primary,
              fontSize: 11.5,
              color: '#64748B',
              marginTop: 2,
            }}
          >
            Authorized Signatory / Applicant
          </Text>

          <View
            style={{
              marginTop: 14,
              borderTopWidth: 1,
              borderTopColor: '#F1F5F9',
              paddingTop: 12,
              width: '100%',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontFamily: TYPOGRAPHY.fonts.primary,
                fontSize: 10.5,
                color: '#94A3B8',
                textAlign: 'center',
                lineHeight: 15,
                maxWidth: 600,
              }}
            >
              Digitally authenticated and officially recorded under Republic Act No. 8792 (Electronic Commerce Act) and NTC Online Filing Guidelines.
            </Text>
          </View>
        </View>
      </SectionCard>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contentContainer: {
    flexGrow: 1,
  },
  mainWrapper: {
    flex: 1,
    width: '100%',
    paddingTop: SPACING[24],
    paddingBottom: 40,
  },

  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 16,
  },
  backBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#1D4ED8',
  },

  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderTopWidth: 4,
    borderTopColor: '#1D4ED8',
    paddingTop: 20,
    paddingHorizontal: 24,
    marginBottom: 20,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.04)',
      },
    }),
  },

  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  singleBadge: {
    backgroundColor: '#EFF6FF',
  },
  bulkBadge: {
    backgroundColor: '#FFFBEB',
  },
  modeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  modeBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
  },

  appRefId: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#475569',
    marginBottom: 4,
  },
  appTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 22,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0F172A',
    marginBottom: 20,
    lineHeight: 30,
  },

  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 24,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: '#1D4ED8',
  },
  tabText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: '#64748B',
  },
  tabTextActive: {
    color: '#1D4ED8',
    fontWeight: TYPOGRAPHY.weights.bold,
  },

  tabContentList: {
    gap: 16,
  },

  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 3,
    borderLeftColor: '#1D4ED8',
    padding: 20,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.02)',
      },
    }),
  },

  progressHeaderTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#475569',
    letterSpacing: 0.8,
    marginBottom: 16,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  stepNode: {
    alignItems: 'center',
    gap: 6,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleDone: {
    backgroundColor: '#16A34A',
  },
  stepCirclePending: {
    backgroundColor: '#E2E8F0',
  },
  stepCircleDeclined: {
    backgroundColor: '#DC2626',
  },
  stepNumber: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#64748B',
  },
  stepLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0F172A',
  },
  stepSubLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    color: '#64748B',
    marginTop: -2,
  },
  stepLine: {
    flex: 1,
    height: 3,
    marginBottom: 20,
  },
  stepLineDone: {
    backgroundColor: '#16A34A',
  },
  stepLinePending: {
    backgroundColor: '#E2E8F0',
  },
  stepLineDeclined: {
    backgroundColor: '#DC2626',
  },

  sectionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  sectionCardTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0F172A',
  },
  sectionCardBody: {},

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailRowLast: {
    borderBottomWidth: 0,
  },
  detailLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: '#64748B',
  },
  detailValue: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0F172A',
    textAlign: 'right',
  },
  twoColRow: { 
    flexDirection: 'row', 
    gap: 16, 
    alignItems: 'flex-start' 
  },
  twoColLeft: { 
    flex: 1, 
    gap: 16 
  },
  twoColRight: { 
    flex: 1, 
    gap: 16 
  },

  bulkApplicantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  bulkApplicantName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0F172A',
  },
  bulkApplicantMeta: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: '#64748B',
  },

  docHeaderContainer: {
    marginBottom: 8,
  },
  docHeaderTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0F172A',
    marginBottom: 4,
  },
  docHeaderSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: '#64748B',
  },

  docRowCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.02)',
      },
    }),
  },
  docIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docInfoCol: {
    flex: 1,
  },
  docNameText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0F172A',
    marginBottom: 3,
  },
  docSubtext: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#2563EB',
    letterSpacing: 0.4,
  },
  docActionsRowGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  docPreviewPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    gap: 6,
  },
  docPreviewPillBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#1D4ED8',
  },
  docDownloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  docDownloadBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#475569',
  },

  /* Modal Overlay & Sheet */
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: 16,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    maxHeight: '90%',
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  modalHeaderTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  modalTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0F172A',
  },
  modalSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
  },
  modalBodyScroll: {
    maxHeight: 450,
  },
  modalBodyContent: {
    padding: 20,
  },
  docSheetMockup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 24,
  },
  docSheetHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  docSheetGovText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#475569',
    letterSpacing: 0.6,
  },
  docSheetAgencyText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#1D4ED8',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  docSheetSubAgency: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  docSheetDivider: {
    height: 2,
    backgroundColor: '#1D4ED8',
    marginVertical: 12,
  },
  docSheetTitleBox: {
    alignItems: 'center',
    marginBottom: 16,
  },
  docSheetTitleText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0F172A',
  },
  docSheetRefText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: '#64748B',
    marginTop: 2,
  },
  docSheetDataGrid: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    gap: 8,
    marginBottom: 16,
  },
  docSheetDataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  docSheetLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: '#64748B',
  },
  docSheetValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0F172A',
  },
  docSheetStampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  officialStampBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  officialStampText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#16A34A',
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    gap: 12,
  },
  modalDownloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1D4ED8',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalDownloadBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#FFFFFF',
  },
  modalCloseFooterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  modalCloseFooterBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: '#334155',
  },

  // ── Redesigned Bulk Application Details Styles ───────────────────────
  appSubtitleCompany: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: '#64748B',
    marginTop: -14,
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  metricCard: {
    flex: 1,
    minWidth: 180,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 4px -1px rgba(0,0,0,0.02)',
      },
    }),
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metricLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#64748B',
    letterSpacing: 0.5,
  },
  metricValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 24,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0F172A',
  },
  metricSub: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  soaValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#1D4ED8',
    marginBottom: 4,
  },
  viewSoaBtn: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  viewSoaBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#1D4ED8',
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
    padding: 14,
    borderRadius: 12,
    gap: 10,
    marginBottom: 16,
  },
  alertBannerText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: '#B45309',
    fontWeight: '500',
    flex: 1,
  },
  tableSectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
    marginBottom: 16,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 4px -1px rgba(0,0,0,0.02)',
      },
    }),
  },
  tableSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  tableHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tableSectionTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0F172A',
  },
  tableCountBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tableCountBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  tableSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
    minWidth: 180,
  },
  tableSearchInput: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: '#0F172A',
    flex: 1,
    padding: 0,
  },
  tableWrapper: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  tableThRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  thCol: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  tableTdRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tableTdRowAlt: {
    backgroundColor: '#FAFAFA',
  },
  tdCol: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: '#475569',
  },
  tableStatusChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  tableStatusChipText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: '700',
  },
  viewDetailsLinkText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: '600',
    color: '#1D4ED8',
  },
  emptyTableState: {
    padding: 24,
    alignItems: 'center',
  },
  emptyTableText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: '#64748B',
  },
  tablePaginationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    flexWrap: 'wrap',
    gap: 12,
  },
  tablePaginationSummary: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: '#64748B',
  },
  tablePaginationBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tablePageNavBtn: {
    width: 28,
    height: 28,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  tablePageNavBtnDisabled: {
    backgroundColor: '#F1F5F9',
    borderColor: '#F1F5F9',
  },
  tablePageNumberBtn: {
    width: 28,
    height: 28,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  tablePageNumberBtnActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#1D4ED8',
  },
  tablePageNumberText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  tablePageNumberTextActive: {
    color: '#1D4ED8',
    fontWeight: '700',
  },
  subModalSection: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 14,
  },
  subModalSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 8,
    marginBottom: 10,
  },
  subModalSectionTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  subModalSectionBody: {
    gap: 8,
  },
});
