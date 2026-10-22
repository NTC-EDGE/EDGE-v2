import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Platform,
  useWindowDimensions,
} from 'react-native';
import {
  COLORS,
  SPACING,
  RADIUS,
  SHADOWS,
  TYPOGRAPHY,
  Icon as Lucide,
  useTheme,
  toast,
  DatePickerInput,
} from '@edge/ui';
import { applicationService, IssueApplicationRequest } from '@edge/api';
import { ApplicationData } from '../../../../types/application';
import { IssuedDocumentPrintModal } from './IssuedDocumentPrintModal';
import { DocumentPrintOptions } from '../../types/documentPrintTypes';
import {
  findMatchingTemplate,
  generateAccountableFormOverlayHtml,
  generateStatutoryDocumentHtml,
} from '../../utils/documentPrintGenerator';

interface IssueDocumentModalProps {
  visible: boolean;
  app: ApplicationData;
  currentOfficerName: string;
  onClose: () => void;
  onSuccess: () => Promise<void> | void;
}

export function IssueDocumentModal({
  visible,
  app,
  currentOfficerName,
  onClose,
  onSuccess,
}: IssueDocumentModalProps) {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 960;

  const [isLoadingDefaults, setIsLoadingDefaults] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Application type and variant resolution
  const applicationType =
    app.serviceName ||
    app.permitTitle ||
    app.category ||
    'Statutory License / Permit';

  const applicationVariant =
    app.serviceVariantName ||
    app.services?.[0]?.serviceVariantName ||
    '';

  // Form Fields
  const [documentType, setDocumentType] = useState<string>(applicationType);
  const [formNumber, setFormNumber] = useState<string>('');
  const [licenseNumber, setLicenseNumber] = useState<string>('');
  const [stationClass, setStationClass] = useState<string>('');
  const [frequencyBand, setFrequencyBand] = useState<string>('');
  const [issueDate, setIssueDate] = useState<string>(
    new Date().toISOString().split('T')[0] ?? ''
  );
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');

  // Auto-loaded metadata
  const [officialReceiptNumber, setOfficialReceiptNumber] = useState<string>('');
  const [originalEvaluatorName, setOriginalEvaluatorName] = useState<string>('');
  const [isAlternateIssuer, setIsAlternateIssuer] = useState<boolean>(false);

  // Live Preview State
  const [previewFormat, setPreviewFormat] = useState<'accountable' | 'pdf'>('accountable');
  const [mobileTab, setMobileTab] = useState<'form' | 'preview'>('form');
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState<boolean>(false);
  const [reloadKey, setReloadKey] = useState<number>(0);

  const isLicenseCategory =
    app.category === 'Licenses' ||
    (typeof app.serviceCategory === 'string' &&
      app.serviceCategory.toLowerCase().includes('license'));

  // Load recommended sequential control numbers
  useEffect(() => {
    if (!visible || !app.id) return;

    let isMounted = true;
    setIsLoadingDefaults(true);

    const loadRecommendations = async () => {
      const [res, err] = await applicationService.getNextDocumentNumbers(app.id);
      if (!isMounted) return;
      setIsLoadingDefaults(false);

      if (err === null && res?.data) {
        const d = res.data;
        setFormNumber(d.recommendedFormNumber ?? '');
        setLicenseNumber(d.recommendedLicenseNumber ?? '');
        setOfficialReceiptNumber(d.officialReceiptNumber ?? app.payment?.orNumber ?? '');
        setOriginalEvaluatorName(d.originalEvaluatorName ?? app.evaluatingOfficer ?? '');
        setDocumentType(applicationType);

        // Set default expiry date (e.g. 3 years for licenses, 1 year for certificates)
        const issue = new Date();
        const expiry = new Date();
        if (isLicenseCategory) {
          expiry.setFullYear(issue.getFullYear() + 3);
        } else {
          expiry.setFullYear(issue.getFullYear() + 1);
        }
        setExpiryDate(expiry.toISOString().split('T')[0] ?? '');

        // Detect alternate issuer status
        const orig = (d.originalEvaluatorName ?? app.evaluatingOfficer ?? '').trim().toLowerCase();
        const curr = currentOfficerName.trim().toLowerCase();
        if (orig.length > 0 && curr.length > 0 && orig !== curr) {
          setIsAlternateIssuer(true);
        } else {
          setIsAlternateIssuer(false);
        }
      } else {
        // Fallback default format
        const year = new Date().getFullYear();
        const officeCode = app.office ?? 'R07';
        setFormNumber(`NTC-${officeCode}-${year}-FORM-1001`);
        if (isLicenseCategory) {
          setLicenseNumber(`NTC-${officeCode}-${year}-LIC-1001`);
        }
        setOfficialReceiptNumber(app.payment?.orNumber ?? '');
        setDocumentType(applicationType);
      }
    };

    void loadRecommendations();

    return () => {
      isMounted = false;
    };
  }, [visible, app.id, app.office, app.payment?.orNumber, app.evaluatingOfficer, isLicenseCategory, currentOfficerName, applicationType]);

  // Active print options for live preview rendering
  const currentPrintOptions: DocumentPrintOptions = useMemo(() => {
    return {
      outputMode: previewFormat === 'accountable' ? 'accountable_form' : 'plain_paper',
      paperSize: 'letter',
      orientation: 'portrait',
      calibration: { offsetXmm: 0, offsetYmm: 0, scalePercent: 100 },
      issuedDocumentType: documentType || applicationType,
      formNumber: formNumber.trim(),
      licenseNumber: licenseNumber.trim(),
      stationClass: stationClass.trim(),
      frequencyBand: frequencyBand.trim(),
      issueDate,
      expiryDate,
      officialReceiptNumber,
      signatoryName: currentOfficerName,
      remarks: remarks.trim(),
    };
  }, [
    previewFormat,
    documentType,
    applicationType,
    formNumber,
    licenseNumber,
    stationClass,
    frequencyBand,
    issueDate,
    expiryDate,
    officialReceiptNumber,
    currentOfficerName,
    remarks,
  ]);

  const activeTemplate = useMemo(() => {
    return findMatchingTemplate(app);
  }, [app]);

  // Accountable Form Overlay HTML
  const accountableOverlayHtml = useMemo(() => {
    try {
      return generateAccountableFormOverlayHtml(app, currentPrintOptions, activeTemplate);
    } catch {
      return '';
    }
  }, [app, currentPrintOptions, activeTemplate]);

  // Full Statutory Document HTML (fallback or plain bond paper mode)
  const statutoryHtml = useMemo(() => {
    try {
      return generateStatutoryDocumentHtml(app, currentPrintOptions);
    } catch {
      return '';
    }
  }, [app, currentPrintOptions]);

  // Load PDF preview when PDF tab is selected
  useEffect(() => {
    let active = true;
    let createdUrl: string | null = null;

    if (visible && app?.id && Platform.OS === 'web' && previewFormat === 'pdf') {
      setIsLoadingPdf(true);

      const loadBlob = async () => {
        try {
          const [blob, err] = await applicationService.previewIssuedDocumentPdf(app.id, {
            formNumber: formNumber.trim(),
            licenseNumber: licenseNumber.trim(),
            issueDate,
            expiryDate,
            documentType: applicationType,
          });

          if (!active) return;

          if (err === null && blob !== null && typeof window !== 'undefined') {
            createdUrl = window.URL.createObjectURL(blob);
            setPdfBlobUrl(createdUrl);
          } else {
            setPdfBlobUrl(null);
          }
        } catch {
          if (!active) return;
          setPdfBlobUrl(null);
        } finally {
          if (active) {
            setIsLoadingPdf(false);
          }
        }
      };

      void loadBlob();
    } else {
      setIsLoadingPdf(false);
    }

    return () => {
      active = false;
      if (createdUrl !== null && typeof window !== 'undefined') {
        window.URL.revokeObjectURL(createdUrl);
      }
    };
  }, [visible, app.id, previewFormat, formNumber, licenseNumber, issueDate, expiryDate, applicationType, reloadKey]);

  const canSubmit = formNumber.trim().length > 0 && !isSubmitting && !isLoadingDefaults;

  const handleConfirm = async (openPrint = false) => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    const payload: IssueApplicationRequest = {
      formNumber: formNumber.trim(),
      documentType: documentType.trim() || applicationType,
      licenseNumber: licenseNumber.trim().length > 0 ? licenseNumber.trim() : undefined,
      stationClass: stationClass.trim().length > 0 ? stationClass.trim() : undefined,
      frequencyBand: frequencyBand.trim().length > 0 ? frequencyBand.trim() : undefined,
      issueDate: new Date(issueDate || Date.now()).toISOString(),
      expiryDate: expiryDate.trim().length > 0 ? new Date(expiryDate).toISOString() : undefined,
      remarks: remarks.trim().length > 0 ? remarks.trim() : undefined,
    };

    const [, err] = await applicationService.issueApplication(app.id, payload);
    setIsSubmitting(false);

    if (err !== null) {
      const errMsg =
        typeof err === 'object' && err !== null && Reflect.has(err, 'message')
          ? String(Reflect.get(err, 'message'))
          : 'Failed to issue document.';
      toast.error(errMsg);
      return;
    }

    toast.success('Statutory document and license issued successfully.');
    await onSuccess();

    if (openPrint) {
      setShowPrintModal(true);
    } else {
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.container,
            {
              backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
              maxWidth: isDesktop ? 1120 : 540,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View
                style={[
                  styles.iconWrapper,
                  { backgroundColor: isDark ? '#064E3B' : COLORS.semantic.successBg },
                ]}
              >
                <Lucide
                  name="check-circle"
                  size={24}
                  color={isDark ? '#34D399' : COLORS.semantic.success}
                />
              </View>
              <View style={styles.headerText}>
                <Text
                  style={[
                    styles.title,
                    { color: isDark ? colors.neutral[100] : COLORS.neutral[900] },
                  ]}
                >
                  Issue Statutory Document & License
                </Text>
                <Text
                  style={[
                    styles.subtitle,
                    { color: isDark ? colors.neutral[400] : COLORS.neutral[500] },
                  ]}
                >
                  Sign off, verify accountable form preview, and finalize issuance for{' '}
                  <Text
                    style={[
                      styles.highlightName,
                      { color: isDark ? colors.neutral[200] : COLORS.neutral[800] },
                    ]}
                  >
                    {app.applicant}
                  </Text>
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={[
                styles.closeButton,
                { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100] },
              ]}
              activeOpacity={0.7}
            >
              <Lucide name="x" size={18} color={isDark ? colors.neutral[300] : colors.neutral[600]} />
            </TouchableOpacity>
          </View>

          {/* Alternate Evaluator Disclaimer Banner */}
          {isAlternateIssuer && (
            <View
              style={[
                styles.alternateBanner,
                {
                  backgroundColor: isDark ? '#422006' : '#FEF3C7',
                  borderColor: isDark ? '#B45309' : '#F59E0B',
                },
              ]}
            >
              <Lucide name="alert-triangle" size={16} color={isDark ? '#FBBF24' : '#D97706'} />
              <Text
                style={[
                  styles.alternateBannerText,
                  { color: isDark ? '#FEF3C7' : '#92400E' },
                ]}
              >
                You are issuing as an <Text style={{ fontWeight: '700' }}>Alternate Issuing Officer</Text> on behalf of{' '}
                <Text style={{ fontWeight: '700' }}>{originalEvaluatorName || 'Primary Evaluator'}</Text>.
                Both officers will be logged in the permanent statutory audit trail.
              </Text>
            </View>
          )}

          {/* Mobile / Narrow Screen Tab Switcher */}
          {!isDesktop && (
            <View
              style={[
                styles.mobileTabsWrap,
                { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[100] },
              ]}
            >
              <TouchableOpacity
                onPress={() => setMobileTab('form')}
                style={[
                  styles.mobileTabBtn,
                  mobileTab === 'form' && {
                    backgroundColor: isDark ? colors.neutral[700] : COLORS.neutral.white,
                  },
                ]}
                activeOpacity={0.8}
              >
                <Lucide
                  name="edit-3"
                  size={14}
                  color={mobileTab === 'form' ? colors.brand[600] : colors.neutral[500]}
                />
                <Text
                  style={[
                    styles.mobileTabBtnText,
                    {
                      color:
                        mobileTab === 'form'
                          ? colors.brand[600]
                          : isDark
                            ? colors.neutral[400]
                            : colors.neutral[600],
                      fontWeight: mobileTab === 'form' ? '700' : '500',
                    },
                  ]}
                >
                  Issuance Details
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setMobileTab('preview')}
                style={[
                  styles.mobileTabBtn,
                  mobileTab === 'preview' && {
                    backgroundColor: isDark ? colors.neutral[700] : COLORS.neutral.white,
                  },
                ]}
                activeOpacity={0.8}
              >
                <Lucide
                  name="eye"
                  size={14}
                  color={mobileTab === 'preview' ? colors.brand[600] : colors.neutral[500]}
                />
                <Text
                  style={[
                    styles.mobileTabBtnText,
                    {
                      color:
                        mobileTab === 'preview'
                          ? colors.brand[600]
                          : isDark
                            ? colors.neutral[400]
                            : colors.neutral[600],
                      fontWeight: mobileTab === 'preview' ? '700' : '500',
                    },
                  ]}
                >
                  Document Preview
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {isLoadingDefaults ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.brand[600]} />
              <Text
                style={[
                  styles.loadingText,
                  { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                ]}
              >
                Generating sequential form & license numbers...
              </Text>
            </View>
          ) : (
            <View style={[styles.mainLayout, isDesktop && styles.desktopLayout]}>
              {/* Form Input Column */}
              {(isDesktop || mobileTab === 'form') && (
                <View style={[styles.formColumn, isDesktop && { flex: 1, maxWidth: 500 }]}>
                  <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
                    <View style={styles.fields}>
                      {/* Application Type & Variant Banner */}
                      <View
                        style={[
                          styles.appTypeCard,
                          {
                            backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50],
                            borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
                          },
                        ]}
                      >
                        <View style={styles.appTypeHeader}>
                          <View
                            style={[
                              styles.appTypeIconWrap,
                              { backgroundColor: isDark ? colors.brand[950] : colors.brand[50] },
                            ]}
                          >
                            <Lucide
                              name="award"
                              size={18}
                              color={isDark ? colors.brand[400] : COLORS.brand[700]}
                            />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text
                              style={[
                                styles.appTypeLabel,
                                { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                              ]}
                            >
                              APPLICATION TYPE &amp; VARIANT
                            </Text>
                            <Text
                              style={[
                                styles.appTypeTitle,
                                { color: isDark ? colors.neutral[100] : colors.neutral[900] },
                              ]}
                            >
                              {applicationType}
                            </Text>
                          </View>
                          {applicationVariant.trim().length > 0 && (
                            <View
                              style={[
                                styles.variantBadge,
                                {
                                  backgroundColor: isDark
                                    ? 'rgba(59, 130, 246, 0.18)'
                                    : '#EFF6FF',
                                  borderColor: isDark ? '#3B82F6' : '#93C5FD',
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.variantBadgeText,
                                  { color: isDark ? '#93C5FD' : '#1D4ED8' },
                                ]}
                              >
                                {applicationVariant}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>

                      {/* Official Receipt Cross-Reference Badge */}
                      {officialReceiptNumber.length > 0 && (
                        <View
                          style={[
                            styles.receiptBadge,
                            {
                              backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50],
                              borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
                            },
                          ]}
                        >
                          <Lucide
                            name="file-text"
                            size={14}
                            color={isDark ? colors.brand[400] : COLORS.brand[700]}
                          />
                          <Text
                            style={[
                              styles.receiptBadgeText,
                              { color: isDark ? colors.neutral[300] : colors.neutral[700] },
                            ]}
                          >
                            Payment Verified: <Text style={{ fontWeight: '700' }}>OR #{officialReceiptNumber}</Text>
                          </Text>
                        </View>
                      )}

                      {/* Control Numbers: Form Control Number & License/Permit Number */}
                      <View style={styles.row}>
                        <View style={[styles.fieldGroup, { flex: 1 }]}>
                          <Text
                            style={[
                              styles.label,
                              { color: isDark ? colors.neutral[200] : COLORS.neutral[700] },
                            ]}
                          >
                            Form Control Number <Text style={styles.required}>*</Text>
                          </Text>
                          <TextInput
                            style={[
                              styles.input,
                              styles.monoInput,
                              {
                                backgroundColor: isDark ? colors.neutral[900] : COLORS.neutral[50],
                                borderColor: isDark ? colors.neutral[700] : COLORS.neutral[300],
                                color: isDark ? colors.neutral[100] : COLORS.neutral[900],
                              },
                            ]}
                            value={formNumber}
                            onChangeText={setFormNumber}
                            placeholder="NTC-R07-2026-XXXX"
                            placeholderTextColor={isDark ? colors.neutral[500] : COLORS.neutral[400]}
                            autoCapitalize="characters"
                          />
                        </View>

                        <View style={[styles.fieldGroup, { flex: 1 }]}>
                          <Text
                            style={[
                              styles.label,
                              { color: isDark ? colors.neutral[200] : COLORS.neutral[700] },
                            ]}
                          >
                            License / Permit Number
                          </Text>
                          <TextInput
                            style={[
                              styles.input,
                              styles.monoInput,
                              {
                                backgroundColor: isDark ? colors.neutral[900] : COLORS.neutral[50],
                                borderColor: isDark ? colors.neutral[700] : COLORS.neutral[300],
                                color: isDark ? colors.neutral[100] : COLORS.neutral[900],
                              },
                            ]}
                            value={licenseNumber}
                            onChangeText={setLicenseNumber}
                            placeholder="e.g. NTC-R07-2026-LIC-0012"
                            placeholderTextColor={isDark ? colors.neutral[500] : COLORS.neutral[400]}
                            autoCapitalize="characters"
                          />
                        </View>
                      </View>

                      {/* Station Class & Frequency Band (if applicable) */}
                      {isLicenseCategory && (
                        <View style={styles.row}>
                          <View style={[styles.fieldGroup, { flex: 1 }]}>
                            <Text
                              style={[
                                styles.label,
                                { color: isDark ? colors.neutral[200] : COLORS.neutral[700] },
                              ]}
                            >
                              Station Class
                            </Text>
                            <TextInput
                              style={[
                                styles.input,
                                {
                                  backgroundColor: isDark ? colors.neutral[900] : COLORS.neutral[50],
                                  borderColor: isDark ? colors.neutral[700] : COLORS.neutral[300],
                                  color: isDark ? colors.neutral[100] : COLORS.neutral[900],
                                },
                              ]}
                              value={stationClass}
                              onChangeText={setStationClass}
                              placeholder="e.g. Fixed (FX) / Mobile (MO)"
                              placeholderTextColor={isDark ? colors.neutral[500] : COLORS.neutral[400]}
                            />
                          </View>

                          <View style={[styles.fieldGroup, { flex: 1 }]}>
                            <Text
                              style={[
                                styles.label,
                                { color: isDark ? colors.neutral[200] : COLORS.neutral[700] },
                              ]}
                            >
                              Frequency / Band
                            </Text>
                            <TextInput
                              style={[
                                styles.input,
                                {
                                  backgroundColor: isDark ? colors.neutral[900] : COLORS.neutral[50],
                                  borderColor: isDark ? colors.neutral[700] : COLORS.neutral[300],
                                  color: isDark ? colors.neutral[100] : COLORS.neutral[900],
                                },
                              ]}
                              value={frequencyBand}
                              onChangeText={setFrequencyBand}
                              placeholder="e.g. 144 - 146 MHz"
                              placeholderTextColor={isDark ? colors.neutral[500] : COLORS.neutral[400]}
                            />
                          </View>
                        </View>
                      )}

                      {/* Dates: Issue Date & Validity Date with DatePickerInput */}
                      <View style={styles.row}>
                        <View style={[styles.fieldGroup, { flex: 1 }]}>
                          <DatePickerInput
                            label="Issue Date"
                            required
                            value={issueDate}
                            onChangeText={setIssueDate}
                            placeholder="YYYY-MM-DD"
                          />
                        </View>

                        <View style={[styles.fieldGroup, { flex: 1 }]}>
                          <DatePickerInput
                            label="Validity Date"
                            value={expiryDate}
                            onChangeText={setExpiryDate}
                            placeholder="YYYY-MM-DD"
                          />
                        </View>
                      </View>

                      {/* Remarks */}
                      <View style={styles.fieldGroup}>
                        <Text
                          style={[
                            styles.label,
                            { color: isDark ? colors.neutral[200] : COLORS.neutral[700] },
                          ]}
                        >
                          Issuance Remarks / Endorsement Notes
                        </Text>
                        <TextInput
                          style={[
                            styles.input,
                            styles.textArea,
                            {
                              backgroundColor: isDark ? colors.neutral[900] : COLORS.neutral[50],
                              borderColor: isDark ? colors.neutral[700] : COLORS.neutral[300],
                              color: isDark ? colors.neutral[100] : COLORS.neutral[900],
                            },
                          ]}
                          value={remarks}
                          onChangeText={setRemarks}
                          placeholder="Optional sign-off remarks or condition specifications..."
                          placeholderTextColor={isDark ? colors.neutral[500] : COLORS.neutral[400]}
                          multiline
                          numberOfLines={2}
                        />
                      </View>
                    </View>
                  </ScrollView>

                  {/* Actions Bar */}
                  <View style={styles.actions}>
                    <Pressable
                      style={[
                        styles.cancelBtn,
                        { borderColor: isDark ? colors.neutral[600] : COLORS.neutral[300] },
                      ]}
                      onPress={onClose}
                      disabled={isSubmitting}
                    >
                      <Text
                        style={[
                          styles.cancelText,
                          { color: isDark ? colors.neutral[300] : COLORS.neutral[700] },
                        ]}
                      >
                        Cancel
                      </Text>
                    </Pressable>

                    <Pressable
                      style={[
                        styles.confirmBtn,
                        !canSubmit && styles.confirmBtnDisabled,
                        {
                          backgroundColor: canSubmit
                            ? isDark
                              ? '#166534'
                              : '#15803D'
                            : isDark
                              ? colors.neutral[700]
                              : COLORS.neutral[300],
                        },
                      ]}
                      onPress={() => void handleConfirm(false)}
                      disabled={!canSubmit}
                    >
                      {isSubmitting ? (
                        <ActivityIndicator size="small" color={COLORS.neutral.white} />
                      ) : (
                        <>
                          <Lucide name="check-circle" size={16} color={COLORS.neutral.white} />
                          <Text style={styles.confirmText}>Sign &amp; Issue</Text>
                        </>
                      )}
                    </Pressable>

                    <Pressable
                      style={[
                        styles.confirmBtn,
                        !canSubmit && styles.confirmBtnDisabled,
                        {
                          backgroundColor: canSubmit
                            ? isDark
                              ? '#1E40AF'
                              : '#1D4ED8'
                            : isDark
                              ? colors.neutral[700]
                              : COLORS.neutral[300],
                        },
                      ]}
                      onPress={() => void handleConfirm(true)}
                      disabled={!canSubmit}
                    >
                      <Lucide name="printer" size={16} color={COLORS.neutral.white} />
                      <Text style={styles.confirmText}>Issue &amp; Print</Text>
                    </Pressable>
                  </View>
                </View>
              )}

              {/* Live Preview Column */}
              {(isDesktop || mobileTab === 'preview') && (
                <View
                  style={[
                    styles.previewColumn,
                    {
                      backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50],
                      borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
                    },
                    isDesktop && { flex: 1.15 },
                  ]}
                >
                  {/* Preview Toolbar */}
                  <View
                    style={[
                      styles.previewToolbar,
                      { borderBottomColor: isDark ? colors.neutral[800] : colors.neutral[200] },
                    ]}
                  >
                    <View style={styles.previewToolbarLeft}>
                      <View
                        style={[
                          styles.templatePill,
                          {
                            backgroundColor: isDark
                              ? 'rgba(217, 119, 6, 0.15)'
                              : '#FEF3C7',
                            borderColor: isDark ? '#B45309' : '#F59E0B',
                          },
                        ]}
                      >
                        <Lucide name="file-text" size={12} color={isDark ? '#FBBF24' : '#D97706'} />
                        <Text
                          style={[
                            styles.templatePillText,
                            { color: isDark ? '#FBBF24' : '#B45309' },
                          ]}
                          numberOfLines={1}
                        >
                          {activeTemplate.code} • {activeTemplate.title}
                        </Text>
                      </View>
                    </View>

                    {/* Preview Type Segmented Buttons */}
                    <View style={styles.previewFormatSwitcher}>
                      <TouchableOpacity
                        onPress={() => setPreviewFormat('accountable')}
                        style={[
                          styles.formatBtn,
                          previewFormat === 'accountable' && styles.formatBtnActive,
                          {
                            backgroundColor:
                              previewFormat === 'accountable'
                                ? colors.brand[600]
                                : isDark
                                  ? colors.neutral[800]
                                  : colors.neutral[200],
                          },
                        ]}
                        activeOpacity={0.7}
                      >
                        <Lucide
                          name="layers"
                          size={12}
                          color={
                            previewFormat === 'accountable'
                              ? COLORS.neutral.white
                              : isDark
                                ? colors.neutral[400]
                                : colors.neutral[600]
                          }
                        />
                        <Text
                          style={[
                            styles.formatBtnText,
                            {
                              color:
                                previewFormat === 'accountable'
                                  ? COLORS.neutral.white
                                  : isDark
                                    ? colors.neutral[300]
                                    : colors.neutral[700],
                            },
                          ]}
                        >
                          Accountable Form
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => setPreviewFormat('pdf')}
                        style={[
                          styles.formatBtn,
                          previewFormat === 'pdf' && styles.formatBtnActive,
                          {
                            backgroundColor:
                              previewFormat === 'pdf'
                                ? colors.brand[600]
                                : isDark
                                  ? colors.neutral[800]
                                  : colors.neutral[200],
                          },
                        ]}
                        activeOpacity={0.7}
                      >
                        <Lucide
                          name="file"
                          size={12}
                          color={
                            previewFormat === 'pdf'
                              ? COLORS.neutral.white
                              : isDark
                                ? colors.neutral[400]
                                : colors.neutral[600]
                          }
                        />
                        <Text
                          style={[
                            styles.formatBtnText,
                            {
                              color:
                                previewFormat === 'pdf'
                                  ? COLORS.neutral.white
                                  : isDark
                                    ? colors.neutral[300]
                                    : colors.neutral[700],
                            },
                          ]}
                        >
                          Document PDF
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => setShowPrintModal(true)}
                        style={[
                          styles.formatBtn,
                          styles.traySetupBtn,
                          {
                            backgroundColor: isDark
                              ? colors.neutral[800]
                              : colors.neutral[200],
                          },
                        ]}
                        activeOpacity={0.7}
                      >
                        <Lucide
                          name="sliders"
                          size={12}
                          color={isDark ? colors.neutral[300] : colors.neutral[700]}
                        />
                        <Text
                          style={[
                            styles.formatBtnText,
                            { color: isDark ? colors.neutral[300] : colors.neutral[700] },
                          ]}
                        >
                          Calibration
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Preview Render Area */}
                  <View style={styles.previewFrameArea}>
                    {previewFormat === 'accountable' ? (
                      Platform.OS === 'web' ? (
                        React.createElement('iframe', {
                          srcDoc: accountableOverlayHtml,
                          style: {
                            width: '100%',
                            height: '100%',
                            minHeight: isDesktop ? '480px' : '400px',
                            border: 'none',
                            borderRadius: '6px',
                            backgroundColor: '#FFFFFF',
                          },
                          title: 'Accountable Form Live Overlay Preview',
                        })
                      ) : (
                        <View style={styles.previewFallback}>
                          <Text style={styles.previewFallbackText}>
                            Accountable form overlay preview is available on web.
                          </Text>
                        </View>
                      )
                    ) : isLoadingPdf ? (
                      <View style={styles.previewLoadingWrap}>
                        <ActivityIndicator size="small" color={colors.brand[600]} />
                        <Text
                          style={[
                            styles.previewLoadingText,
                            { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                          ]}
                        >
                          Generating official statutory document PDF...
                        </Text>
                      </View>
                    ) : pdfBlobUrl && Platform.OS === 'web' ? (
                      React.createElement('iframe', {
                        src: `${pdfBlobUrl}#toolbar=0&navpanes=0`,
                        style: {
                          width: '100%',
                          height: '100%',
                          minHeight: isDesktop ? '480px' : '400px',
                          border: 'none',
                          borderRadius: '6px',
                          backgroundColor: isDark ? '#1e293b' : '#525659',
                        },
                        title: 'Official Statutory Document PDF',
                      })
                    ) : Platform.OS === 'web' ? (
                      React.createElement('iframe', {
                        srcDoc: statutoryHtml,
                        style: {
                          width: '100%',
                          height: '100%',
                          minHeight: isDesktop ? '480px' : '400px',
                          border: 'none',
                          borderRadius: '6px',
                          backgroundColor: '#FFFFFF',
                        },
                        title: 'Statutory Document Preview',
                      })
                    ) : (
                      <View style={styles.previewFallback}>
                        <Text style={styles.previewFallbackText}>
                          Statutory document preview is available on web.
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )}
            </View>
          )}
        </View>
      </View>

      {/* Interactive Full Print & Physical Tray Calibration Modal */}
      {showPrintModal && (
        <IssuedDocumentPrintModal
          visible={showPrintModal}
          app={app}
          initialOptions={{
            issuedDocumentType: documentType || applicationType,
            formNumber,
            licenseNumber,
            stationClass,
            frequencyBand,
            issueDate,
            expiryDate,
            officialReceiptNumber,
            signatoryName: currentOfficerName,
            remarks,
          }}
          onClose={() => {
            setShowPrintModal(false);
          }}
        />
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING[16],
  },
  container: {
    borderRadius: RADIUS.dialog,
    padding: SPACING[20],
    width: '100%',
    maxHeight: '94%',
    ...SHADOWS.modal,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: SPACING[12],
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING[12],
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING[12],
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 18,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: 3,
  },
  subtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    lineHeight: 18,
  },
  highlightName: {
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  alternateBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING[8],
    padding: SPACING[10],
    borderRadius: RADIUS.input,
    borderWidth: 1,
    marginBottom: SPACING[12],
  },
  alternateBannerText: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    lineHeight: 16,
  },
  mobileTabsWrap: {
    flexDirection: 'row',
    borderRadius: RADIUS.sm,
    padding: 4,
    gap: 4,
    marginBottom: SPACING[12],
  },
  mobileTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: RADIUS.sm,
    gap: 6,
  },
  mobileTabBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12.5,
  },
  mainLayout: {
    flexDirection: 'column',
    gap: SPACING[16],
  },
  desktopLayout: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  formColumn: {
    flexDirection: 'column',
  },
  scrollArea: {
    maxHeight: 460,
    marginBottom: SPACING[12],
  },
  fields: {
    gap: SPACING[12],
  },
  appTypeCard: {
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[10],
  },
  appTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[10],
  },
  appTypeIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appTypeLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  appTypeTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  variantBadge: {
    paddingHorizontal: SPACING[8],
    paddingVertical: 3,
    borderRadius: RADIUS.circle,
    borderWidth: 1,
  },
  variantBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: '600',
  },
  receiptBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
    paddingHorizontal: SPACING[10],
    paddingVertical: SPACING[6],
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  receiptBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11.5,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING[12],
  },
  fieldGroup: {
    gap: SPACING[4],
  },
  label: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  required: {
    color: COLORS.semantic.error,
  },
  input: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    borderWidth: 1,
    borderRadius: RADIUS.input,
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[8],
  },
  monoInput: {
    fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }),
    fontWeight: '600',
  },
  textArea: {
    minHeight: 50,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING[10],
    marginTop: SPACING[4],
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: SPACING[10],
    borderRadius: RADIUS.button,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13.5,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  confirmBtn: {
    flex: 1.8,
    paddingVertical: SPACING[10],
    borderRadius: RADIUS.button,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING[6],
  },
  confirmBtnDisabled: {
    opacity: 0.5,
  },
  confirmText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13.5,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral.white,
  },
  previewColumn: {
    borderRadius: RADIUS.card,
    borderWidth: 1,
    padding: SPACING[12],
    flexDirection: 'column',
  },
  previewToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: SPACING[10],
    borderBottomWidth: 1,
    marginBottom: SPACING[10],
    flexWrap: 'wrap',
    gap: SPACING[8],
  },
  previewToolbarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
    flex: 1,
    minWidth: 160,
  },
  templatePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SPACING[8],
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  templatePillText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  previewFormatSwitcher: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  formatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: SPACING[10],
    paddingVertical: 5,
    borderRadius: RADIUS.sm,
  },
  formatBtnActive: {},
  traySetupBtn: {
    borderWidth: 1,
    borderColor: 'transparent',
  },
  formatBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11.5,
    fontWeight: '600',
  },
  previewFrameArea: {
    flex: 1,
    minHeight: 460,
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
  },
  previewFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING[24],
  },
  previewFallbackText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[500],
    textAlign: 'center',
  },
  previewLoadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING[10],
    padding: SPACING[32],
  },
  previewLoadingText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
  },
  loadingContainer: {
    paddingVertical: SPACING[32],
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING[12],
  },
  loadingText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
  },
});
