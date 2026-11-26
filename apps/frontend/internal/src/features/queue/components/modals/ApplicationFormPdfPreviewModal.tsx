import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  Platform,
  Linking,
  Animated,
  useWindowDimensions,
} from 'react-native';
import {
  COLORS,
  useTheme,
  Icon as Lucide,
  SPACING,
  RADIUS,
  SHADOWS,
  TYPOGRAPHY,
  toast,
} from '@edge/ui';
import { applicationService } from '@edge/api';
import { ApplicationData } from '../../../../types/application';
import {
  detectCanonicalForm,
  CanonicalFormMetadata,
  resolvePreviewVariant,
} from '../../../../shared/formPreview';

interface PdfLoadBarProps {
  height?: number;
}

function PdfLoadBar({ height = 5 }: PdfLoadBarProps) {
  const { colors, isDark } = useTheme();
  const anim = useRef(new Animated.Value(0)).current;
  const [containerWidth, setContainerWidth] = useState(300);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(anim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: false,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-containerWidth * 0.4, containerWidth],
  });

  return (
    <View
      onLayout={(e) => {
        const w = e.nativeEvent.layout.width;
        if (w > 0) {
          setContainerWidth(w);
        }
      }}
      style={{
        width: '100%',
        height,
        backgroundColor: isDark ? colors.neutral[800] : colors.neutral[200],
        borderRadius: height / 2,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          width: '35%',
          backgroundColor: isDark ? colors.brand[400] : colors.brand[600],
          borderRadius: height / 2,
          transform: [{ translateX }],
        }}
      />
    </View>
  );
}

export interface ApplicationFormPdfPreviewModalProps {
  visible: boolean;
  app: ApplicationData;
  initialApplicantId?: string;
  canonicalForm?: CanonicalFormMetadata | null;
  onClose: () => void;
}

export function ApplicationFormPdfPreviewModal({
  visible,
  app,
  initialApplicantId,
  canonicalForm: propCanonicalForm,
  onClose,
}: ApplicationFormPdfPreviewModalProps) {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const applicantsList = useMemo(() => app.applicantsList ?? [], [app.applicantsList]);
  const hasMultipleApplicants = applicantsList.length > 1;

  const defaultApplicantId = useMemo(() => {
    if (initialApplicantId && applicantsList.some((a) => a.id === initialApplicantId)) {
      return initialApplicantId;
    }
    return applicantsList[0]?.id ?? app.id;
  }, [initialApplicantId, applicantsList, app.id]);

  const [selectedApplicantId, setSelectedApplicantId] = useState<string>(defaultApplicantId);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState<number>(0);

  useEffect(() => {
    if (visible) {
      setSelectedApplicantId(defaultApplicantId);
    }
  }, [visible, defaultApplicantId]);

  const selectedApplicant = useMemo(() => {
    return applicantsList.find((a) => a.id === selectedApplicantId) ?? applicantsList[0];
  }, [applicantsList, selectedApplicantId]);

  const effectiveApplicantIdForApi = useMemo(() => {
    if (selectedApplicant && selectedApplicant.id && selectedApplicant.id !== app.id) {
      return selectedApplicant.id;
    }
    if (hasMultipleApplicants && selectedApplicantId) {
      return selectedApplicantId;
    }
    return undefined;
  }, [selectedApplicant, app.id, hasMultipleApplicants, selectedApplicantId]);

  const resolvedCanonicalForm = useMemo<CanonicalFormMetadata | null>(() => {
    if (propCanonicalForm) return propCanonicalForm;
    const effectiveVariant = resolvePreviewVariant({
      variantName: selectedApplicant?.serviceVariantName || app.serviceVariantName,
      serviceVariantName: app.services?.[0]?.serviceVariantName,
      formFieldValues: selectedApplicant?.formFieldValues ?? app.formFieldValues,
    });
    return detectCanonicalForm(
      {
        id: selectedApplicant?.serviceId || app.serviceId || '',
        title: app.serviceName || app.permitTitle,
        category: app.serviceCategory || app.category,
      },
      effectiveVariant
    );
  }, [propCanonicalForm, selectedApplicant, app]);

  const formCodeLabel = resolvedCanonicalForm?.formNumber || 'NTC Application Form';
  const formTitleLabel =
    resolvedCanonicalForm?.title ||
    app.serviceName ||
    app.permitTitle ||
    'Official Application Form';

  useEffect(() => {
    let active = true;
    let createdUrl: string | null = null;

    if (visible && app.id && Platform.OS === 'web') {
      setIsLoadingPdf(true);
      setPdfError(null);
      setPdfBlobUrl(null);

      const loadBlob = async () => {
        try {
          const [blob, err] = await applicationService.previewApplicationFormPdf(
            app.id,
            effectiveApplicantIdForApi
          );

          if (!active) return;

          if (err !== null || blob === null) {
            const errDetail =
              typeof err === 'string' && err.trim().length > 0
                ? err
                : `Failed to generate official ${formCodeLabel} PDF document.`;
            setPdfError(errDetail);
            setIsLoadingPdf(false);
            return;
          }

          if (typeof window !== 'undefined') {
            createdUrl = window.URL.createObjectURL(blob);
            setPdfBlobUrl(createdUrl);
            setIsLoadingPdf(false);
          }
        } catch (fetchErr: unknown) {
          if (!active) return;
          const msg =
            fetchErr instanceof Error
              ? fetchErr.message
              : 'Error generating official application form PDF';
          setPdfError(msg);
          setIsLoadingPdf(false);
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
  }, [visible, app.id, effectiveApplicantIdForApi, reloadKey, formCodeLabel]);

  const buildDownloadFileName = useCallback(() => {
    const cleanCode = (resolvedCanonicalForm?.code || 'NTC_Form').replace(/[^a-zA-Z0-9_-]/g, '_');
    const rawRef =
      app.referenceNumber ||
      app.applicationNumber ||
      (app.id ? app.id.slice(0, 8).toUpperCase() : 'APP');
    const cleanRef = rawRef.replace(/[^a-zA-Z0-9_-]/g, '_');
    if (hasMultipleApplicants && selectedApplicant?.name) {
      const cleanName = selectedApplicant.name.trim().replace(/[^a-zA-Z0-9_-]/g, '_');
      return `${cleanCode}_${cleanRef}_${cleanName}.pdf`;
    }
    return `${cleanCode}_${cleanRef}.pdf`;
  }, [resolvedCanonicalForm, app.referenceNumber, app.applicationNumber, app.id, hasMultipleApplicants, selectedApplicant]);

  const handleOpenInNewTab = useCallback(async () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      if (pdfBlobUrl) {
        const win = window.open(pdfBlobUrl, '_blank');
        if (win !== null) {
          win.focus();
          return;
        }
      }
      try {
        const [blob, err] = await applicationService.previewApplicationFormPdf(
          app.id,
          effectiveApplicantIdForApi
        );
        if (blob !== null && err === null) {
          const blobUrl = window.URL.createObjectURL(blob);
          const win = window.open(blobUrl, '_blank');
          if (win !== null) {
            win.focus();
            return;
          }
        }
      } catch {
        // Fallback to direct print URL
      }
      const url = applicationService.getApplicationFormPrintUrl(app.id, effectiveApplicantIdForApi);
      const win = window.open(url, '_blank');
      if (win !== null) {
        win.focus();
      }
    } else {
      const url = applicationService.getApplicationFormPrintUrl(app.id, effectiveApplicantIdForApi);
      void Linking.openURL(url);
    }
  }, [pdfBlobUrl, app.id, effectiveApplicantIdForApi]);

  const handleDownloadPdf = useCallback(async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      const [blob, err] = await applicationService.downloadApplicationFormPdf(
        app.id,
        effectiveApplicantIdForApi
      );
      if (
        blob !== null &&
        err === null &&
        Platform.OS === 'web' &&
        typeof window !== 'undefined' &&
        typeof document !== 'undefined'
      ) {
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = buildDownloadFileName();
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => window.URL.revokeObjectURL(blobUrl), 10000);
        toast.success(`${formCodeLabel} downloaded successfully.`);
        setIsDownloading(false);
        return;
      }
    } catch {
      // Fallback to direct download URL
    }
    setIsDownloading(false);
    const url = applicationService.getApplicationFormDownloadUrl(app.id, effectiveApplicantIdForApi);
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.open(url, '_blank');
    } else {
      void Linking.openURL(url);
    }
  }, [isDownloading, app.id, effectiveApplicantIdForApi, buildDownloadFileName, formCodeLabel]);

  const activeApplicantDisplayName =
    selectedApplicant?.name || app.applicant || 'Applicant';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContainer,
            {
              backgroundColor: isDark ? colors.neutral[900] : COLORS.neutral.white,
              borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
            },
          ]}
        >
          {/* Top Header Bar */}
          <View
            style={[
              styles.modalHeader,
              { borderBottomColor: isDark ? colors.neutral[800] : colors.neutral[200] },
            ]}
          >
            <View style={styles.headerLeft}>
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: isDark ? colors.brand[900] : colors.brand[50] },
                ]}
              >
                <Lucide
                  name="file-text"
                  size={20}
                  color={isDark ? colors.brand[400] : colors.brand[600]}
                />
              </View>
              <View style={styles.headerTitleWrap}>
                <View style={styles.titleBadgeRow}>
                  <View
                    style={[
                      styles.formCodeBadge,
                      { backgroundColor: isDark ? colors.brand[700] : '#0F2C59' },
                    ]}
                  >
                    <Text style={styles.formCodeBadgeText}>{formCodeLabel}</Text>
                  </View>
                  <Text
                    style={[
                      styles.modalTitle,
                      { color: isDark ? colors.neutral[100] : colors.neutral[900] },
                    ]}
                    numberOfLines={1}
                  >
                    {formTitleLabel}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.modalSubtitle,
                    { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                  ]}
                  numberOfLines={1}
                >
                  Ref #{app.referenceNumber || app.id.slice(0, 8).toUpperCase()} • Applicant:{' '}
                  <Text
                    style={{
                      fontWeight: '700',
                      color: isDark ? colors.neutral[200] : colors.neutral[800],
                    }}
                  >
                    {activeApplicantDisplayName}
                  </Text>
                </Text>
              </View>
            </View>

            {/* Header Actions */}
            <View style={styles.headerRightActions}>
              {Platform.OS === 'web' && (
                <Pressable
                  onPress={() => setReloadKey((k) => k + 1)}
                  style={[
                    styles.actionIconBtn,
                    {
                      backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100],
                      borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
                    },
                  ]}
                  accessibilityLabel="Reload Form PDF"
                >
                  <Lucide
                    name="refresh-cw"
                    size={14}
                    color={isDark ? colors.neutral[300] : colors.neutral[700]}
                  />
                </Pressable>
              )}

              <Pressable
                onPress={() => void handleDownloadPdf()}
                disabled={isDownloading}
                style={[
                  styles.downloadBtn,
                  {
                    backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100],
                    borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
                    opacity: isDownloading ? 0.6 : 1,
                  },
                ]}
              >
                <Lucide
                  name="download"
                  size={14}
                  color={isDark ? colors.neutral[200] : colors.neutral[800]}
                />
                {!isMobile && (
                  <Text
                    style={[
                      styles.downloadBtnText,
                      { color: isDark ? colors.neutral[200] : colors.neutral[800] },
                    ]}
                  >
                    {isDownloading ? 'Downloading...' : 'Download PDF'}
                  </Text>
                )}
              </Pressable>

              <Pressable
                onPress={() => void handleOpenInNewTab()}
                style={[
                  styles.printBtn,
                  { backgroundColor: isDark ? colors.brand[600] : colors.brand[700] },
                ]}
              >
                <Lucide name="printer" size={14} color={COLORS.neutral.white} />
                {!isMobile && <Text style={styles.printBtnText}>Print Form</Text>}
              </Pressable>

              <Pressable
                onPress={onClose}
                style={[
                  styles.closeBtn,
                  { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] },
                ]}
                accessibilityLabel="Close Form Preview"
              >
                <Lucide
                  name="x"
                  size={18}
                  color={isDark ? colors.neutral[400] : colors.neutral[600]}
                />
              </Pressable>
            </View>
          </View>

          {/* Bulk Applicants Switcher Bar */}
          {hasMultipleApplicants && (
            <View
              style={[
                styles.bulkSwitcherBar,
                {
                  backgroundColor: isDark ? colors.neutral[800] : colors.brand[50],
                  borderBottomColor: isDark ? colors.neutral[700] : colors.brand[200],
                  borderLeftColor: isDark ? '#818cf8' : '#4f46e5',
                },
              ]}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '700',
                  color: isDark ? colors.brand[300] : colors.brand[800],
                }}
              >
                APPLICANTS ({applicantsList.length}):
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
              >
                {applicantsList.map((appItem, idx) => {
                  const isSelected = selectedApplicant?.id === appItem.id;
                  return (
                    <Pressable
                      key={appItem.id || `form-applicant-${idx}`}
                      onPress={() => setSelectedApplicantId(appItem.id)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 5,
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 6,
                        backgroundColor: isSelected
                          ? isDark
                            ? colors.brand[600]
                            : colors.brand[700]
                          : isDark
                            ? colors.neutral[900]
                            : '#FFFFFF',
                        borderWidth: 1,
                        borderColor: isSelected
                          ? isDark
                            ? colors.brand[400]
                            : colors.brand[700]
                          : isDark
                            ? colors.neutral[700]
                            : '#CBD5E1',
                      }}
                    >
                      <Lucide
                        name="user"
                        size={11}
                        color={isSelected ? '#FFFFFF' : isDark ? colors.neutral[400] : '#64748B'}
                      />
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: isSelected ? '700' : '500',
                          color: isSelected
                            ? '#FFFFFF'
                            : isDark
                              ? colors.neutral[200]
                              : '#334155',
                        }}
                      >
                        {appItem.name || `Applicant #${idx + 1}`}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Mobile Quick Action Banner so small screens never break */}
          {isMobile && (
            <View
              style={[
                styles.mobileQuickBar,
                {
                  backgroundColor: isDark ? colors.neutral[800] : '#F8FAFC',
                  borderBottomColor: isDark ? colors.neutral[700] : colors.neutral[200],
                },
              ]}
            >
              <Pressable
                onPress={() => void handleOpenInNewTab()}
                style={[
                  styles.mobileQuickBtn,
                  {
                    backgroundColor: isDark ? colors.brand[600] : colors.brand[700],
                  },
                ]}
              >
                <Lucide name="external-link" size={13} color="#FFFFFF" />
                <Text style={styles.mobileQuickBtnPrimaryText}>Open PDF in New Tab</Text>
              </Pressable>
              <Pressable
                onPress={() => void handleDownloadPdf()}
                disabled={isDownloading}
                style={[
                  styles.mobileQuickBtn,
                  {
                    backgroundColor: isDark ? colors.neutral[900] : '#FFFFFF',
                    borderWidth: 1,
                    borderColor: isDark ? colors.neutral[700] : colors.neutral[300],
                  },
                ]}
              >
                <Lucide
                  name="download"
                  size={13}
                  color={isDark ? colors.neutral[200] : colors.neutral[800]}
                />
                <Text
                  style={[
                    styles.mobileQuickBtnSecondaryText,
                    { color: isDark ? colors.neutral[200] : colors.neutral[800] },
                  ]}
                >
                  {isDownloading ? 'Downloading...' : 'Download PDF'}
                </Text>
              </Pressable>
            </View>
          )}

          {/* Animated Load Bar */}
          {Platform.OS === 'web' && isLoadingPdf && (
            <View style={{ width: '100%', height: 3, overflow: 'hidden' }}>
              <PdfLoadBar height={3} />
            </View>
          )}

          {/* Main Viewer Body */}
          <View style={styles.modalBody}>
            {Platform.OS === 'web' ? (
              isLoadingPdf ? (
                <View
                  style={[
                    styles.stateCard,
                    {
                      backgroundColor: isDark ? colors.neutral[900] : '#ffffff',
                      borderColor: isDark ? colors.neutral[800] : colors.neutral[200],
                    },
                  ]}
                >
                  <View style={styles.stateInnerContent}>
                    <View
                      style={[
                        styles.stateIconCircle,
                        {
                          backgroundColor: isDark ? colors.brand[900] : colors.brand[50],
                          borderColor: isDark ? colors.brand[700] : colors.brand[200],
                        },
                      ]}
                    >
                      <Lucide
                        name="file-text"
                        size={28}
                        color={isDark ? colors.brand[400] : colors.brand[600]}
                      />
                    </View>
                    <Text
                      style={[
                        styles.stateTitle,
                        { color: isDark ? colors.neutral[100] : colors.neutral[900] },
                      ]}
                    >
                      Generating Official {formCodeLabel} PDF...
                    </Text>
                    <Text
                      style={[
                        styles.stateDesc,
                        { color: isDark ? colors.neutral[400] : colors.neutral[600] },
                      ]}
                    >
                      Populating official NTC application form template with applicant details and technical specifications.
                    </Text>
                    <View style={{ width: '100%', marginTop: SPACING[8] }}>
                      <PdfLoadBar height={6} />
                    </View>
                  </View>
                </View>
              ) : pdfError !== null ? (
                <View
                  style={[
                    styles.stateCard,
                    {
                      backgroundColor: isDark ? colors.neutral[900] : '#fef2f2',
                      borderColor: isDark ? '#7f1d1d' : '#fecaca',
                    },
                  ]}
                >
                  <View style={styles.stateInnerContent}>
                    <Lucide name="alert-triangle" size={36} color="#DC2626" />
                    <Text
                      style={[
                        styles.stateTitle,
                        { color: isDark ? '#fca5a5' : '#991b1b' },
                      ]}
                    >
                      Unable to Load {formCodeLabel} PDF
                    </Text>
                    <Text
                      style={[
                        styles.stateDesc,
                        { color: isDark ? colors.neutral[400] : colors.neutral[600] },
                      ]}
                    >
                      {pdfError}
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 }}>
                      <Pressable
                        onPress={() => setReloadKey((k) => k + 1)}
                        style={[
                          styles.retryBtn,
                          { backgroundColor: isDark ? colors.brand[600] : colors.brand[700] },
                        ]}
                      >
                        <Lucide name="refresh-cw" size={14} color={COLORS.neutral.white} />
                        <Text style={styles.retryBtnText}>Retry Loading</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => void handleDownloadPdf()}
                        style={[
                          styles.retryBtn,
                          {
                            backgroundColor: isDark ? colors.neutral[800] : colors.neutral[200],
                          },
                        ]}
                      >
                        <Lucide
                          name="download"
                          size={14}
                          color={isDark ? colors.neutral[100] : colors.neutral[800]}
                        />
                        <Text
                          style={[
                            styles.retryBtnText,
                            { color: isDark ? colors.neutral[100] : colors.neutral[800] },
                          ]}
                        >
                          Download Directly
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              ) : pdfBlobUrl !== null ? (
                <View style={styles.pdfFrameHolder}>
                  {React.createElement('iframe', {
                    src: pdfBlobUrl,
                    style: {
                      width: '100%',
                      height: '100%',
                      minHeight: isMobile ? '460px' : '660px',
                      border: 'none',
                      borderRadius: '8px',
                      backgroundColor: isDark ? '#1e293b' : '#525659',
                    },
                    title: `${formCodeLabel} - ${formTitleLabel}`,
                  })}
                </View>
              ) : null
            ) : (
              /* Native mobile fallback card */
              <View
                style={[
                  styles.stateCard,
                  {
                    backgroundColor: isDark ? colors.neutral[900] : '#ffffff',
                    borderColor: isDark ? colors.neutral[800] : colors.neutral[200],
                  },
                ]}
              >
                <View style={styles.stateInnerContent}>
                  <View
                    style={[
                      styles.stateIconCircle,
                      {
                        backgroundColor: isDark ? colors.brand[900] : colors.brand[50],
                        borderColor: isDark ? colors.brand[700] : colors.brand[200],
                      },
                    ]}
                  >
                    <Lucide
                      name="file-text"
                      size={28}
                      color={isDark ? colors.brand[400] : colors.brand[600]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.stateTitle,
                      { color: isDark ? colors.neutral[100] : colors.neutral[900] },
                    ]}
                  >
                    {formCodeLabel} — {formTitleLabel}
                  </Text>
                  <Text
                    style={[
                      styles.stateDesc,
                      { color: isDark ? colors.neutral[400] : colors.neutral[600] },
                    ]}
                  >
                    Applicant: {activeApplicantDisplayName} • Ref #{app.referenceNumber}
                  </Text>
                  <Pressable
                    onPress={() => void handleDownloadPdf()}
                    style={[
                      styles.retryBtn,
                      { backgroundColor: isDark ? colors.brand[600] : colors.brand[700] },
                    ]}
                  >
                    <Lucide name="download" size={14} color={COLORS.neutral.white} />
                    <Text style={styles.retryBtnText}>Open / Download Official Form PDF</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING[12],
  },
  modalContainer: {
    width: '100%',
    maxWidth: 1180,
    maxHeight: '94%',
    borderRadius: RADIUS.dialog,
    borderWidth: 1,
    overflow: 'hidden',
    flexDirection: 'column',
    ...SHADOWS.modal,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[16],
    paddingVertical: SPACING[12],
    borderBottomWidth: 1,
    gap: SPACING[12],
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[12],
    flex: 1,
    minWidth: 0,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  headerTitleWrap: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  formCodeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  formCodeBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  modalTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
    fontWeight: TYPOGRAPHY.weights.bold,
    flexShrink: 1,
  },
  modalSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
    flexShrink: 0,
  },
  actionIconBtn: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.button,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    height: 34,
    borderRadius: RADIUS.button,
    borderWidth: 1,
  },
  downloadBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  printBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    height: 34,
    borderRadius: RADIUS.button,
  },
  printBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bulkSwitcherBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: SPACING[16],
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderLeftWidth: 4,
  },
  mobileQuickBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: SPACING[12],
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  mobileQuickBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: RADIUS.button,
  },
  mobileQuickBtnPrimaryText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  mobileQuickBtnSecondaryText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  modalBody: {
    flex: 1,
    minHeight: 520,
    padding: SPACING[12],
  },
  pdfFrameHolder: {
    flex: 1,
    width: '100%',
    minHeight: 500,
    borderRadius: 8,
    overflow: 'hidden',
  },
  stateCard: {
    flex: 1,
    minHeight: 460,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING[24],
  },
  stateInnerContent: {
    width: '100%',
    maxWidth: 460,
    alignItems: 'center',
    gap: SPACING[12],
  },
  stateIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  stateDesc: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: RADIUS.button,
  },
  retryBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
