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

function extractApplicantFullName(app: any, details: any, first: any): string {
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
  
  const firstName = details?.firstName || details?.first_name || app?.firstName || app?.first_name || '';
  const lastName = details?.lastName || details?.last_name || app?.lastName || app?.last_name || '';
  const combinedName = `${firstName} ${lastName}`.trim();
  if (combinedName.length > 0) {
    return combinedName;
  }

  if (app?.applicantName && typeof app.applicantName === 'string' && app.applicantName.trim() && app.applicantName !== 'Unnamed Applicant') {
    return app.applicantName.trim();
  }

  const fvList =
    (Array.isArray(details?.formFieldValues) && details.formFieldValues) ||
    (Array.isArray(first?.formFieldValues) && first.formFieldValues) ||
    (Array.isArray(app?.formFieldValues) && app.formFieldValues) ||
    [];

  if (fvList.length > 0) {
    const knownFv = fvList.find((fv: any) => fv.fieldId === 'fd000000-0000-0000-0000-000000000001');
    if (knownFv && knownFv.value && knownFv.value.trim()) {
      return knownFv.value.trim();
    }

    const matchedFv = fvList.find((fv: any) => {
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

  // Active Tab: 'DETAILS' | 'DOCUMENTS'
  const [activeTab, setActiveTab] = useState<'DETAILS' | 'DOCUMENTS'>('DETAILS');
  const [previewDoc, setPreviewDoc] = useState<ApplicationDocument | null>(null);
  const [previewCustomDoc, setPreviewCustomDoc] = useState<{ uri: string; name: string } | null>(null);

  const isBulk = useMemo(() => {
    const m = (app.mode || '').toString().toUpperCase();
    return m === 'BULK';
  }, [app.mode]);

  // Safely extract single applicant details supporting both mock structure and backend API structure
  const singleApplicant = useMemo(() => {
    if (app.mode === 'BULK') return null;
    const list = app.applicants || app.Applicants || [];
    let first: any = null;
    let details: any = null;
    if (list.length > 0) {
      first = list[0];
      details = first.details || first;
    }
    
    const applicantName = extractApplicantFullName(app, details, first);

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
    };
  }, [app]);

  // Safely extract form field values returned from the form submission
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

        let typ: 'PDF' | 'DOCX' | 'ZIP' | 'IMAGE' = fileName.toLowerCase().endsWith('.zip') ? 'ZIP' : 'PDF';
        if (req.category === 'ISSUED_PERMIT' && fileName.toLowerCase().endsWith('.zip')) {
          typ = 'ZIP';
        }

        return {
          id: req.id || `doc-${index}`,
          name: fileName,
          type: typ,
          size: req.size || '1.2 MB',
          category: cat,
          uploadedAt: req.uploadedAt || app.submittedAt || new Date().toISOString(),
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
                {/* ── Top Section: Applicant Details (3 Cards in a Row on Desktop) ── */}
                <View
                  style={{
                    flexDirection: isDesktop ? 'row' : 'column',
                    gap: 16,
                    alignItems: 'stretch',
                  }}
                >
                  {/* Card 1: Applicant Profile */}
                  <View style={[styles.sectionCard, isDesktop && { flex: 1, marginBottom: 0 }]}>
                    <View style={styles.sectionCardHeader}>
                      <Icon name="user" size={18} color="#1D4ED8" />
                      <Text style={styles.sectionCardTitle}>1. Applicant Profile</Text>
                    </View>

                    <View style={styles.sectionCardBody}>
                      <DetailRow label="Full Name" value={primaryName} />
                      <DetailRow label="Sex" value={singleApplicant?.sex} />
                      <DetailRow label="Nationality" value={singleApplicant?.nationality} />
                      <DetailRow label="Element Type" value={singleApplicant?.examineeType || app.element} />
                      <DetailRow label="Submission Date" value={submissionTime} isLast />
                    </View>
                  </View>

                  {/* Card 2: Contact Details */}
                  <View style={[styles.sectionCard, isDesktop && { flex: 1, marginBottom: 0 }]}>
                    <View style={styles.sectionCardHeader}>
                      <Icon name="mail" size={18} color="#1D4ED8" />
                      <Text style={styles.sectionCardTitle}>2. Contact Details</Text>
                    </View>

                    <View style={styles.sectionCardBody}>
                      <DetailRow label="Mobile Number" value={singleApplicant?.mobileNumber} />
                      <DetailRow label="Email Address" value={singleApplicant?.email} />
                      <DetailRow label="Verification Status" value="Verified & Active" isLast />
                    </View>
                  </View>

                  {/* Card 3: Permanent Address */}
                  <View style={[styles.sectionCard, isDesktop && { flex: 1, marginBottom: 0 }]}>
                    <View style={styles.sectionCardHeader}>
                      <Icon name="map-pin" size={18} color="#1D4ED8" />
                      <Text style={styles.sectionCardTitle}>3. Permanent Address</Text>
                    </View>

                    <View style={styles.sectionCardBody}>
                      <DetailRow label="Street Address" value={singleApplicant?.streetAddress} />
                      <DetailRow label="Barangay" value={singleApplicant?.barangay} />
                      <DetailRow label="City / Municipality" value={singleApplicant?.cityMunicipality} />
                      <DetailRow label="Province" value={singleApplicant?.province} />
                      <DetailRow label="Region" value={singleApplicant?.region} />
                      <DetailRow label="Zip Code" value={singleApplicant?.zipCode} isLast />
                    </View>
                  </View>
                </View>

                {/* ── Bottom Section: 4. Submitted Form & Technical Specifications (Full Width) ── */}
                <View style={{ width: '100%' }}>
                  <SubmittedFormStructuredView
                    app={app}
                    primaryName={primaryName}
                    formFieldValues={formFieldValues}
                    onPreviewFile={(uri, name) => setPreviewCustomDoc({ uri, name })}
                    sectionNumber="4"
                  />
                </View>
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

            {docs.map((doc) => (
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
                    onPress={() => setPreviewDoc(doc)}
                    style={styles.docPreviewPillBtn}
                    activeOpacity={0.8}
                  >
                    <Icon name="eye" size={14} color="#1D4ED8" />
                    <Text style={styles.docPreviewPillBtnText}>Preview</Text>
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
            ))}
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
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

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
  sectionNumber = '4',
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
        val.startsWith('typed:cursive:');

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
        const isDoc =
          val.startsWith('data:application/pdf') ||
          val.startsWith('blob:') ||
          val.toLowerCase().endsWith('.pdf') ||
          val.toLowerCase().endsWith('.png') ||
          val.toLowerCase().endsWith('.jpg') ||
          val.toLowerCase().endsWith('.jpeg');

        let parsedArray: Array<Record<string, unknown>> | null = null;
        if ((val.startsWith('[') && val.endsWith(']')) || (val.startsWith('{') && val.endsWith('}'))) {
          try {
            const parsed: unknown = JSON.parse(val);
            if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object' && parsed[0] !== null) {
              parsedArray = parsed as Array<Record<string, unknown>>;
            } else if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
              parsedArray = [parsed as Record<string, unknown>];
            }
          } catch {
            // Ignored
          }
        }

        if (parsedArray !== null && parsedArray.length > 0) {
          return (
            <View
              key={field.fieldId || `fld-grid-${idx}`}
              style={{
                width: '100%',
                backgroundColor: '#F8FAFC',
                borderWidth: 1,
                borderColor: '#CBD5E1',
                borderRadius: 10,
                padding: 14,
                marginBottom: 4,
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
                    letterSpacing: 0.3,
                  }}
                >
                  {field.fieldLabel || field.fieldId}
                </Text>
                <View style={{ backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 1 }}>
                  <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 10, fontWeight: '700', color: '#1D4ED8' }}>
                    {parsedArray.length} {parsedArray.length === 1 ? 'Entry' : 'Entries'}
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
                      key={row._id ? String(row._id) : `r-${rIdx}`}
                      style={{
                        backgroundColor: '#FFFFFF',
                        borderWidth: 1,
                        borderColor: '#E2E8F0',
                        borderRadius: 8,
                        padding: 10,
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6, paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}>
                        <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: '#0F2C59', justifyContent: 'center', alignItems: 'center' }}>
                          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 9, fontWeight: '700', color: '#FFFFFF' }}>
                            {rIdx + 1}
                          </Text>
                        </View>
                        <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, fontWeight: '700', color: '#0F2C59' }}>
                          Item #{rIdx + 1}
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                        {entries.map(([k, v]) => (
                          <View
                            key={k}
                            style={{
                              minWidth: '45%',
                              flex: 1,
                              backgroundColor: '#F8FAFC',
                              padding: 6,
                              borderRadius: 4,
                              borderWidth: 1,
                              borderColor: '#F1F5F9',
                            }}
                          >
                            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 9, fontWeight: '700', color: '#64748B' }}>
                              {k.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/\b\w/g, (c) => c.toUpperCase())}
                            </Text>
                            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, fontWeight: '600', color: '#0F172A' }}>
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

        return (
          <View
            key={field.fieldId || `fld-grid-${idx}`}
            style={{
              width: isDesktop ? '31.8%' : '100%',
              backgroundColor: '#FFFFFF',
              borderWidth: 1,
              borderColor: '#E2E8F0',
              borderRadius: 8,
              padding: 12,
              justifyContent: 'space-between',
              minHeight: 70,
            }}
          >
            <Text
              style={{
                fontFamily: TYPOGRAPHY.fonts.primary,
                fontSize: 11,
                fontWeight: '600',
                color: '#64748B',
                textTransform: 'uppercase',
                letterSpacing: 0.3,
              }}
            >
              {field.fieldLabel || field.fieldId}
            </Text>

            {isDoc ? (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 6,
                }}
              >
                <Text
                  style={{
                    fontFamily: TYPOGRAPHY.fonts.primary,
                    fontSize: 12,
                    fontWeight: '600',
                    color: '#0F172A',
                    flex: 1,
                  }}
                  numberOfLines={1}
                >
                  {val}
                </Text>
                {onPreviewFile && (
                  <TouchableOpacity
                    onPress={() => onPreviewFile(val, field.fieldLabel || field.fieldId)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: '#EFF6FF',
                      borderWidth: 1,
                      borderColor: '#BFDBFE',
                      paddingVertical: 3,
                      paddingHorizontal: 8,
                      borderRadius: 6,
                      gap: 4,
                      marginLeft: 8,
                    }}
                  >
                    <Icon name="eye" size={11} color="#1D4ED8" />
                    <Text
                      style={{
                        fontFamily: TYPOGRAPHY.fonts.primary,
                        fontSize: 11,
                        fontWeight: '700',
                        color: '#1D4ED8',
                      }}
                    >
                      View
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <Text
                style={{
                  fontFamily: TYPOGRAPHY.fonts.primary,
                  fontSize: 13,
                  fontWeight: '700',
                  color: '#0F172A',
                  marginTop: 4,
                }}
              >
                {val}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );

  return (
    <View style={{ gap: 16 }}>
      {/* ── Section Header Banner ────────────────────────────────────────── */}
      <View
        style={{
          backgroundColor: '#FFFFFF',
          borderWidth: 1,
          borderColor: '#E2E8F0',
          borderRadius: 10,
          padding: 16,
          borderLeftWidth: 4,
          borderLeftColor: '#1D4ED8',
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: '#EFF6FF',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="file-text" size={18} color="#1D4ED8" />
            </View>
            <View>
              <Text
                style={{
                  fontFamily: TYPOGRAPHY.fonts.primary,
                  fontSize: 16,
                  fontWeight: '700',
                  color: '#0F172A',
                }}
              >
                {sectionNumber}. Submitted Form & Technical Specifications
              </Text>
              <Text
                style={{
                  fontFamily: TYPOGRAPHY.fonts.primary,
                  fontSize: 12,
                  color: '#64748B',
                  marginTop: 2,
                }}
              >
                Full parameters, technical specifications, legal declarations, and authenticated digital signature.
              </Text>
            </View>
          </View>

          <View
            style={{
              backgroundColor: '#EFF6FF',
              borderWidth: 1,
              borderColor: '#BFDBFE',
              borderRadius: 14,
              paddingHorizontal: 10,
              paddingVertical: 4,
            }}
          >
            <Text
              style={{
                fontFamily: TYPOGRAPHY.fonts.primary,
                fontSize: 11,
                fontWeight: '700',
                color: '#1D4ED8',
              }}
            >
              {formFieldValues.length + 4} PARAMETERS RECORDED
            </Text>
          </View>
        </View>

        {/* 4-column overview metadata strip */}
        <View
          style={{
            backgroundColor: '#F8FAFC',
            borderWidth: 1,
            borderColor: '#E2E8F0',
            borderRadius: 8,
            padding: 12,
            flexDirection: isDesktop ? 'row' : 'column',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: TYPOGRAPHY.fonts.primary,
                fontSize: 10,
                fontWeight: '700',
                color: '#64748B',
                textTransform: 'uppercase',
              }}
            >
              Service Application
            </Text>
            <Text
              style={{
                fontFamily: TYPOGRAPHY.fonts.primary,
                fontSize: 13,
                fontWeight: '700',
                color: '#0F172A',
                marginTop: 2,
              }}
            >
              {app.serviceName}
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: TYPOGRAPHY.fonts.primary,
                fontSize: 10,
                fontWeight: '700',
                color: '#64748B',
                textTransform: 'uppercase',
              }}
            >
              Service Category
            </Text>
            <Text
              style={{
                fontFamily: TYPOGRAPHY.fonts.primary,
                fontSize: 13,
                fontWeight: '600',
                color: '#334155',
                marginTop: 2,
              }}
            >
              {app.serviceCategory}
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: TYPOGRAPHY.fonts.primary,
                fontSize: 10,
                fontWeight: '700',
                color: '#64748B',
                textTransform: 'uppercase',
              }}
            >
              Reference Number
            </Text>
            <Text
              style={{
                fontFamily: TYPOGRAPHY.fonts.primary,
                fontSize: 13,
                fontWeight: '700',
                color: '#1D4ED8',
                marginTop: 2,
              }}
            >
              #{app.referenceNumber}
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: TYPOGRAPHY.fonts.primary,
                fontSize: 10,
                fontWeight: '700',
                color: '#64748B',
                textTransform: 'uppercase',
              }}
            >
              Regional Office
            </Text>
            <Text
              style={{
                fontFamily: TYPOGRAPHY.fonts.primary,
                fontSize: 13,
                fontWeight: '600',
                color: '#334155',
                marginTop: 2,
              }}
            >
              {app.schedule?.venue || 'NTC Regional Office'}
            </Text>
          </View>
        </View>
      </View>

      {/* ── Sub-card A: Technical & Equipment Specifications ─────────────── */}
      {technicalSpecs.length > 0 && (
        <View style={styles.sectionCard}>
          <View style={styles.sectionCardHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Icon name="cpu" size={18} color="#1D4ED8" />
              <Text style={styles.sectionCardTitle}>Technical & Equipment Specifications</Text>
            </View>
            <View
              style={{
                backgroundColor: '#EFF6FF',
                borderWidth: 1,
                borderColor: '#BFDBFE',
                borderRadius: 12,
                paddingHorizontal: 8,
                paddingVertical: 2,
              }}
            >
              <Text
                style={{
                  fontFamily: TYPOGRAPHY.fonts.primary,
                  fontSize: 10.5,
                  fontWeight: '700',
                  color: '#1D4ED8',
                }}
              >
                {technicalSpecs.length} SPECIFICATIONS
              </Text>
            </View>
          </View>

          <View style={styles.sectionCardBody}>
            {renderParamGrid(technicalSpecs)}
          </View>
        </View>
      )}

      {/* ── Sub-card B: Academic & Professional Background ────────────────── */}
      {academicSpecs.length > 0 && (
        <View style={styles.sectionCard}>
          <View style={styles.sectionCardHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Icon name="book-open" size={18} color="#1D4ED8" />
              <Text style={styles.sectionCardTitle}>Academic & Professional Background</Text>
            </View>
            <View
              style={{
                backgroundColor: '#EFF6FF',
                borderWidth: 1,
                borderColor: '#BFDBFE',
                borderRadius: 12,
                paddingHorizontal: 8,
                paddingVertical: 2,
              }}
            >
              <Text
                style={{
                  fontFamily: TYPOGRAPHY.fonts.primary,
                  fontSize: 10.5,
                  fontWeight: '700',
                  color: '#1D4ED8',
                }}
              >
                {academicSpecs.length} RECORDS
              </Text>
            </View>
          </View>

          <View style={styles.sectionCardBody}>
            {renderParamGrid(academicSpecs)}
          </View>
        </View>
      )}

      {/* ── Sub-card C: Operational & Additional Particulars ──────────────── */}
      {operationalSpecs.length > 0 && (
        <View style={styles.sectionCard}>
          <View style={styles.sectionCardHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Icon name="layers" size={18} color="#1D4ED8" />
              <Text style={styles.sectionCardTitle}>Operational & Additional Particulars</Text>
            </View>
            <View
              style={{
                backgroundColor: '#EFF6FF',
                borderWidth: 1,
                borderColor: '#BFDBFE',
                borderRadius: 12,
                paddingHorizontal: 8,
                paddingVertical: 2,
              }}
            >
              <Text
                style={{
                  fontFamily: TYPOGRAPHY.fonts.primary,
                  fontSize: 10.5,
                  fontWeight: '700',
                  color: '#1D4ED8',
                }}
              >
                {operationalSpecs.length} PARAMETERS
              </Text>
            </View>
          </View>

          <View style={styles.sectionCardBody}>
            {renderParamGrid(operationalSpecs)}
          </View>
        </View>
      )}

      {/* ── Sub-card D: Legal Declarations & Affirmations ─────────────────── */}
      {declarations.length > 0 && (
        <View style={styles.sectionCard}>
          <View style={styles.sectionCardHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Icon name="check-circle" size={18} color="#16A34A" />
              <Text style={styles.sectionCardTitle}>Legal Declarations & Affirmations</Text>
            </View>
            <View
              style={{
                backgroundColor: '#DCFCE7',
                borderWidth: 1,
                borderColor: '#86EFAC',
                borderRadius: 12,
                paddingHorizontal: 8,
                paddingVertical: 2,
              }}
            >
              <Text
                style={{
                  fontFamily: TYPOGRAPHY.fonts.primary,
                  fontSize: 10.5,
                  fontWeight: '700',
                  color: '#15803D',
                }}
              >
                OFFICIALLY ATTESTED
              </Text>
            </View>
          </View>

          <View style={styles.sectionCardBody}>
            <View style={{ gap: 10 }}>
              {declarations.map((dec, idx) => {
                const val = dec.value.trim().toLowerCase();
                const isConfirmed = val === 'true' || val === 'agreed' || val === 'yes' || val === '1';

                return (
                  <View
                    key={dec.fieldId || `dec-${idx}`}
                    style={{
                      backgroundColor: isConfirmed ? '#F0FDF4' : '#FEF2F2',
                      borderWidth: 1,
                      borderColor: isConfirmed ? '#BBF7D0' : '#FECACA',
                      borderRadius: 8,
                      padding: 14,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                      <View
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 6,
                          backgroundColor: isConfirmed ? '#16A34A' : '#DC2626',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginTop: 1,
                        }}
                      >
                        <Icon name={isConfirmed ? "check" : "x"} size={14} color="#FFFFFF" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontFamily: TYPOGRAPHY.fonts.primary,
                            fontSize: 13,
                            fontWeight: '700',
                            color: isConfirmed ? '#166534' : '#991B1B',
                          }}
                        >
                          {(dec.fieldLabel || dec.fieldId).toLowerCase().startsWith('i hereby declare')
                            ? OFFICIAL_LEGAL_DECLARATION
                            : (dec.fieldLabel || dec.fieldId)}
                        </Text>
                        <Text
                          style={{
                            fontFamily: TYPOGRAPHY.fonts.primary,
                            fontSize: 11.5,
                            color: isConfirmed ? '#15803D' : '#B91C1C',
                            marginTop: 4,
                            lineHeight: 16,
                          }}
                        >
                          {isConfirmed
                            ? '✓ The applicant officially confirmed and certified under oath that all submitted information is true, accurate, and complete.'
                            : '✗ Not confirmed by the applicant.'}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      )}

      {/* ── Sub-card E: Official Electronic Signature Certificate ──────────── */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionCardHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Icon name="shield" size={18} color="#1D4ED8" />
            <Text style={styles.sectionCardTitle}>Official Electronic Signature Certificate</Text>
          </View>
          <View
            style={{
              backgroundColor: '#EFF6FF',
              borderWidth: 1,
              borderColor: '#BFDBFE',
              borderRadius: 12,
              paddingHorizontal: 8,
              paddingVertical: 2,
            }}
          >
            <Text
              style={{
                fontFamily: TYPOGRAPHY.fonts.primary,
                fontSize: 10.5,
                fontWeight: '700',
                color: '#1D4ED8',
              }}
            >
              AUTHENTICATED
            </Text>
          </View>
        </View>

        <View style={styles.sectionCardBody}>
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
            {/* Render signature */}
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

            {/* Signature Underline and Signer Particulars */}
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

            {/* Legal Notice */}
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
        </View>
      </View>
    </View>
  );
}

interface DetailRowProps {
  label: string;
  value: string | undefined | null;
  isLast?: boolean;
  onPreviewFile?: (file: string, label: string) => void;
}

function DetailRow({ label, value, isLast = false, onPreviewFile }: DetailRowProps) {
  if (value === undefined || value === null || value.trim() === '') {
    return (
      <View style={[styles.detailRow, isLast && styles.detailRowLast]}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>—</Text>
      </View>
    );
  }

  const trimmedVal = value.trim();
  const labelLower = label.toLowerCase();

  const isSignature =
    labelLower.includes('signature') ||
    trimmedVal.startsWith('data:image') ||
    trimmedVal.startsWith('typed:cursive:');

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
      <View style={[{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }, isLast && styles.detailRowLast]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={styles.detailLabel}>{label}</Text>
          <View style={{ backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 }}>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 10, fontWeight: '700', color: '#1D4ED8' }}>
              SIGNATURE RECORDED
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
              minHeight: 80,
            }}
          >
            <Image
              source={{ uri: trimmedVal }}
              style={{ width: '100%', height: 75 }}
              resizeMode="contain"
            />
            <View style={{ width: '80%', height: 1, backgroundColor: '#CBD5E1', marginTop: 4 }} />
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 10, color: '#94A3B8', marginTop: 2 }}>
              Digital Signature Recorded
            </Text>
          </View>
        ) : (
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderWidth: 1,
              borderColor: '#E2E8F0',
              borderRadius: 8,
              padding: 12,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                fontFamily: TYPOGRAPHY.fonts.primary,
                fontSize: 20,
                fontStyle: 'italic',
                fontWeight: '700',
                color: '#0F2C59',
                letterSpacing: 1,
              }}
            >
              {typedText}
            </Text>
            <View style={{ width: '80%', height: 1, backgroundColor: '#0F2C59', marginTop: 4 }} />
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 10, color: '#64748B', marginTop: 2 }}>
              Electronically Signed
            </Text>
          </View>
        )}
      </View>
    );
  }

  if (isCheckbox) {
    const isChecked =
      trimmedVal.toLowerCase() === 'true' ||
      trimmedVal.toLowerCase() === 'agreed' ||
      trimmedVal.toLowerCase() === 'yes' ||
      trimmedVal === '1';

    return (
      <View
        style={[
          {
            backgroundColor: isChecked ? '#F0FDF4' : '#FEF2F2',
            padding: 10,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: isChecked ? '#BBF7D0' : '#FECACA',
            marginVertical: 6,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          },
          isLast && styles.detailRowLast,
        ]}
      >
        <View
          style={{
            width: 20,
            height: 20,
            borderRadius: 4,
            backgroundColor: isChecked ? '#16A34A' : '#FFFFFF',
            borderWidth: 1.5,
            borderColor: isChecked ? '#16A34A' : '#DC2626',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {isChecked && <Icon name="check" size={12} color="#FFFFFF" />}
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: TYPOGRAPHY.fonts.primary,
              fontSize: 12,
              fontWeight: '600',
              color: isChecked ? '#166534' : '#991B1B',
            }}
          >
            {label}
          </Text>
          <Text
            style={{
              fontFamily: TYPOGRAPHY.fonts.primary,
              fontSize: 9.5,
              fontWeight: '700',
              color: isChecked ? '#15803D' : '#B91C1C',
              marginTop: 1,
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
        style={[
          {
            backgroundColor: '#F8FAFC',
            padding: 10,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#E2E8F0',
            marginVertical: 4,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          },
          isLast && styles.detailRowLast,
        ]}
      >
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.detailLabel}>{label}</Text>
          <Text style={styles.detailValue} numberOfLines={1}>
            {trimmedVal}
          </Text>
        </View>
        {onPreviewFile && (
          <TouchableOpacity
            onPress={() => onPreviewFile(trimmedVal, label)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#EFF6FF',
              borderWidth: 1,
              borderColor: '#BFDBFE',
              paddingVertical: 4,
              paddingHorizontal: 8,
              borderRadius: 6,
              gap: 4,
            }}
          >
            <Icon name="eye" size={12} color="#1D4ED8" />
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, fontWeight: '700', color: '#1D4ED8' }}>
              View
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.detailRow, isLast && styles.detailRowLast]}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{trimmedVal}</Text>
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
