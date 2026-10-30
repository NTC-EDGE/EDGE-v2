import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  useWindowDimensions,
  Platform,
  ActivityIndicator,
  Animated,
  Linking,
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
import { applicationService, storageService, ApplicantRequirementItemDto } from '@edge/api';
import { useAuthContext } from '../../../auth/context/AuthContext';
import { ApplicationData } from '../../../../types/application';
import {
  PaperSize,
  PrintOutputMode,
  PageOrientation,
  DocumentPrintOptions,
  PAPER_DIMENSIONS,
  ACCOUNTABLE_FORM_TEMPLATES,
  AccountableFormTemplate,
  loadUserReportPrintConfig,
  saveUserReportPrintConfig,
} from '../../types/documentPrintTypes';
import {
  findMatchingTemplate,
  getEligibleTemplatesForApplication,
  generateStatutoryDocumentHtml,
  generateAccountableFormOverlayHtml,
  generateAlignmentTestSheetHtml,
  openDocumentPrintWindow,
} from '../../utils/documentPrintGenerator';

const AVAILABLE_PAPER_SIZES: readonly PaperSize[] = ['letter', 'a4', 'folio', 'legal'];

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

interface IssuedDocumentPrintModalProps {
  visible: boolean;
  app: ApplicationData;
  initialOptions?: Partial<DocumentPrintOptions>;
  onClose: () => void;
}

export type IssuedPrintTargetMode = 'pdf' | 'accountable' | 'calibration';

export function IssuedDocumentPrintModal({
  visible,
  app,
  initialOptions,
  onClose,
}: IssuedDocumentPrintModalProps) {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 992;
  const { user, clerkUser } = useAuthContext();
  const activeUserId = user?.id ?? clerkUser?.id ?? null;

  const eligibleTemplates = useMemo(() => {
    return getEligibleTemplatesForApplication(app, 'issuance');
  }, [app]);

  const defaultTemplate = useMemo(() => {
    return eligibleTemplates[0] ?? findMatchingTemplate(app);
  }, [eligibleTemplates, app]);

  // Primary active print target mode: Defaults to real cloud PDF template preview
  const [activeTarget, setActiveTarget] = useState<IssuedPrintTargetMode>('pdf');

  // Printing Configurations
  const [outputMode, setOutputMode] = useState<PrintOutputMode>(
    initialOptions?.outputMode || 'plain_paper'
  );
  const [paperSize, setPaperSize] = useState<PaperSize>(
    initialOptions?.paperSize || defaultTemplate.defaultPaperSize || 'letter'
  );
  const [orientation, setOrientation] = useState<PageOrientation>(
    initialOptions?.orientation || defaultTemplate.defaultOrientation || 'portrait'
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    initialOptions?.selectedTemplateId || defaultTemplate.id
  );

  // Calibration Offsets
  const [offsetXmm, setOffsetXmm] = useState<number>(initialOptions?.calibration?.offsetXmm || 0);
  const [offsetYmm, setOffsetYmm] = useState<number>(initialOptions?.calibration?.offsetYmm || 0);
  const [showGhostWatermark, setShowGhostWatermark] = useState<boolean>(true);

  // Custom Size Inputs
  const [customWidthMm, setCustomWidthMm] = useState<string>('215.9');
  const [customHeightMm, setCustomHeightMm] = useState<string>('279.4');

  // Real Cloud PDF Preview State
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState<boolean>(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState<number>(0);

  // Load official statutory PDF from backend / cloud template
  useEffect(() => {
    let active = true;
    let createdUrl: string | null = null;

    if (visible && app?.id && Platform.OS === 'web' && activeTarget === 'pdf') {
      setIsLoadingPdf(true);
      setPdfError(null);
      setPdfBlobUrl(null);

      const loadBlob = async () => {
        try {
          const [blob, err] = await applicationService.previewIssuedDocumentPdf(app.id, {
            formNumber: initialOptions?.formNumber,
            licenseNumber: initialOptions?.licenseNumber,
            issueDate: initialOptions?.issueDate,
            expiryDate: initialOptions?.expiryDate,
            documentType: initialOptions?.issuedDocumentType,
          });

          if (!active) return;

          if (err !== null || blob === null) {
            const errDetail =
              typeof err === 'string' && err.trim().length > 0
                ? err
                : 'Failed to load official statutory PDF template from cloud.';
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
            fetchErr instanceof Error ? fetchErr.message : 'Error loading official document template';
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
  }, [visible, app.id, activeTarget, initialOptions, reloadKey]);

  // Applicant 1x1 Photo URL for accountable form / admission slip
  const [applicantPhotoUrl, setApplicantPhotoUrl] = useState<string | null>(
    initialOptions?.applicantPhotoUrl ?? null
  );

  // Auto-detect applicant 1x1 photo from application requirements or query API
  useEffect(() => {
    let active = true;

    // 1. Check pre-loaded requirements on app
    if (app.requirements && app.requirements.length > 0) {
      const match = app.requirements.find((r) => {
        const lbl = (r.label || '').toLowerCase();
        const fname = (r.filename || '').toLowerCase();
        return (
          lbl.includes('1x1') ||
          lbl.includes('photo') ||
          lbl.includes('picture') ||
          fname.includes('1x1') ||
          fname.includes('photo')
        );
      });
      if (match?.thumbnailUri || match?.url) {
        setApplicantPhotoUrl(match.thumbnailUri || match.url || null);
        return;
      }
    }

    // 2. Otherwise fetch from applicant requirements API if modal is visible
    if (visible && app?.id) {
      const activeApplicantId = app.applicantsList?.[0]?.id ?? app.id;
      const loadReqs = async () => {
        try {
          const [res, err] = await applicationService.getApplicantRequirements(
            app.id,
            activeApplicantId
          );
          if (!active) return;
          if (err === null && res?.data && Array.isArray(res.data)) {
            const photoItem = res.data.find((item: ApplicantRequirementItemDto) => {
              const name = (item.requirementName || '').toLowerCase();
              return (
                name.includes('1x1') ||
                name.includes('photo') ||
                name.includes('picture') ||
                name.includes('id pic') ||
                item.requirementId === '70000000-0000-0000-0000-000000000003' ||
                item.requirementId === '70000000-0000-0000-0000-000000000033'
              );
            });

            if (photoItem) {
              if (
                typeof photoItem.storedFileId === 'string' &&
                photoItem.storedFileId.trim() !== '' &&
                photoItem.storedFileId !== 'null'
              ) {
                const downloadUrl = storageService.getFileDownloadUrl(
                  photoItem.storedFileId,
                  app.tenantId
                );
                setApplicantPhotoUrl(downloadUrl);
              } else if (
                typeof photoItem.url === 'string' &&
                photoItem.url.trim() !== '' &&
                photoItem.url !== 'null'
              ) {
                setApplicantPhotoUrl(photoItem.url.trim());
              }
            }
          }
        } catch {
          // Graceful fallback if requirements fetch fails
        }
      };

      void loadReqs();
    }

    return () => {
      active = false;
    };
  }, [visible, app.id, app.requirements, app.applicantsList, app.tenantId]);

  // Load workstation saved preferences for this specific report/template and user
  useEffect(() => {
    if (!visible) return;
    const saved = loadUserReportPrintConfig(selectedTemplateId, activeUserId);
    if (saved) {
      if (saved.paperSize) setPaperSize(saved.paperSize);
      if (saved.outputMode) setOutputMode(saved.outputMode);
      if (saved.orientation) setOrientation(saved.orientation);
      if (typeof saved.customWidthMm === 'number') setCustomWidthMm(String(saved.customWidthMm));
      if (typeof saved.customHeightMm === 'number') setCustomHeightMm(String(saved.customHeightMm));
      if (typeof saved.calibration?.offsetXmm === 'number') setOffsetXmm(saved.calibration.offsetXmm);
      if (typeof saved.calibration?.offsetYmm === 'number') setOffsetYmm(saved.calibration.offsetYmm);
    }
  }, [visible, selectedTemplateId, activeUserId]);

  const activeTemplate = useMemo(() => {
    return ACCOUNTABLE_FORM_TEMPLATES.find((t) => t.id === selectedTemplateId) || defaultTemplate;
  }, [selectedTemplateId, defaultTemplate]);

  const currentPrintOptions = useMemo<DocumentPrintOptions>(() => ({
    paperSize,
    outputMode: activeTarget === 'accountable' ? 'accountable_form' : outputMode,
    orientation,
    customWidthMm: parseFloat(customWidthMm) || 215.9,
    customHeightMm: parseFloat(customHeightMm) || 279.4,
    calibration: {
      offsetXmm,
      offsetYmm,
      scalePercent: 100,
    },
    showGhostWatermark,
    selectedTemplateId: activeTemplate.id,
    issuedDocumentType: initialOptions?.issuedDocumentType || app.serviceName || 'Statutory License & Certificate',
    formNumber: initialOptions?.formNumber || app.applicationNumber,
    licenseNumber: initialOptions?.licenseNumber || app.applicationNumber,
    stationClass: initialOptions?.stationClass || 'Commercial Fixed / Mobile Station',
    frequencyBand: initialOptions?.frequencyBand || '144.0000 MHz - 146.0000 MHz',
    issueDate: initialOptions?.issueDate || new Date().toISOString(),
    expiryDate: initialOptions?.expiryDate || new Date(Date.now() + 3 * 365 * 24 * 3600 * 1000).toISOString(),
    officialReceiptNumber: initialOptions?.officialReceiptNumber || app.payment?.orNumber || 'OR-RECORDED',
    signatoryName: initialOptions?.signatoryName || app.issuingOfficer || app.evaluatingOfficer || 'REGIONAL DIRECTOR',
    signatoryTitle: 'Regional Director / Authorized Officer',
    remarks: initialOptions?.remarks || app.note || 'Standard statutory authorization',
    applicantPhotoUrl: applicantPhotoUrl || initialOptions?.applicantPhotoUrl,
    qrCodeValue: initialOptions?.qrCodeValue || `NTC-VERIFY-${app.referenceNumber || app.applicationNumber || app.id.slice(0, 8).toUpperCase()}`,
  }), [
    paperSize,
    outputMode,
    activeTarget,
    orientation,
    customWidthMm,
    customHeightMm,
    offsetXmm,
    offsetYmm,
    showGhostWatermark,
    activeTemplate.id,
    applicantPhotoUrl,
    initialOptions,
    app,
  ]);

  // Accountable Form Overlay HTML
  const accountableOverlayHtml = useMemo(() => {
    try {
      return generateAccountableFormOverlayHtml(app, currentPrintOptions, activeTemplate);
    } catch {
      return '';
    }
  }, [app, currentPrintOptions, activeTemplate]);

  // Alignment test sheet HTML
  const alignmentTestHtml = useMemo(() => {
    try {
      return generateAlignmentTestSheetHtml(currentPrintOptions, activeTemplate);
    } catch {
      return '';
    }
  }, [currentPrintOptions, activeTemplate]);

  const handlePrint = async () => {
    if (activeTarget === 'pdf') {
      try {
        const [pdfBlob, err] = await applicationService.previewIssuedDocumentPdf(app.id, {
          formNumber: initialOptions?.formNumber,
          licenseNumber: initialOptions?.licenseNumber,
          issueDate: initialOptions?.issueDate,
          expiryDate: initialOptions?.expiryDate,
          documentType: initialOptions?.issuedDocumentType,
        });

        if (pdfBlob !== null && err === null && Platform.OS === 'web' && typeof window !== 'undefined') {
          const blobUrl = window.URL.createObjectURL(pdfBlob);
          const printWindow = window.open(blobUrl, '_blank');
          if (printWindow !== null) {
            printWindow.focus();
          }
          return;
        }
      } catch (err) {
        console.warn('Direct blob fetch failed, falling back to direct URL open:', err);
      }

      const url = applicationService.getIssuedDocumentPrintUrl(app.id);
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const printWindow = window.open(url, '_blank');
        if (printWindow !== null) {
          printWindow.focus();
        }
        return;
      }
    } else if (activeTarget === 'accountable') {
      const html = generateAccountableFormOverlayHtml(app, currentPrintOptions, activeTemplate);
      openDocumentPrintWindow(html);
    } else {
      const html = generateAlignmentTestSheetHtml(currentPrintOptions, activeTemplate);
      openDocumentPrintWindow(html);
    }
  };

  const handleDownload = async () => {
    try {
      const [pdfBlob, err] = await applicationService.downloadIssuedDocumentPdf(app.id, {
        formNumber: initialOptions?.formNumber,
        licenseNumber: initialOptions?.licenseNumber,
        issueDate: initialOptions?.issueDate,
        expiryDate: initialOptions?.expiryDate,
        documentType: initialOptions?.issuedDocumentType,
      });

      if (
        pdfBlob !== null &&
        err === null &&
        Platform.OS === 'web' &&
        typeof window !== 'undefined' &&
        typeof document !== 'undefined'
      ) {
        const blobUrl = window.URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = blobUrl;
        const docTitle = (initialOptions?.issuedDocumentType || app.serviceName || 'Document').replace(
          /\s+/g,
          '_'
        );
        const ref =
          initialOptions?.licenseNumber ||
          initialOptions?.formNumber ||
          app.referenceNumber ||
          app.id.slice(0, 8);
        link.download = `${docTitle}_${ref}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => window.URL.revokeObjectURL(blobUrl), 10000);
        toast.success('Official statutory document downloaded successfully.');
        return;
      }
    } catch (err) {
      console.warn('Direct blob download failed, falling back to direct URL open:', err);
    }

    const url = applicationService.getIssuedDocumentDownloadUrl(app.id);
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.open(url, '_blank');
    } else {
      void Linking.openURL(url);
    }
  };

  const handleSavePreferences = () => {
    const widthNum = parseFloat(customWidthMm);
    const heightNum = parseFloat(customHeightMm);

    saveUserReportPrintConfig(
      selectedTemplateId,
      {
        paperSize,
        outputMode,
        orientation,
        customWidthMm: Number.isNaN(widthNum) ? 215.9 : widthNum,
        customHeightMm: Number.isNaN(heightNum) ? 279.4 : heightNum,
        offsetXmm,
        offsetYmm,
      },
      activeUserId
    );

    toast.success(`Print settings saved for ${activeTemplate.title}!`);
  };

  const handleResetCalibration = () => {
    setOffsetXmm(0);
    setOffsetYmm(0);
    toast.info('Calibration offsets reset to 0 mm.');
  };

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
          {/* Top Header Bar: Title, Subtitle, and Window Actions */}
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
                  name="award"
                  size={22}
                  color={isDark ? colors.brand[400] : colors.brand[600]}
                />
              </View>
              <View style={styles.headerTitleWrap}>
                <Text
                  style={[
                    styles.modalTitle,
                    { color: isDark ? colors.neutral[100] : colors.neutral[900] },
                  ]}
                  numberOfLines={1}
                >
                  Statutory Document & Accountable Form Printing
                </Text>
                <Text
                  style={[
                    styles.modalSubtitle,
                    { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                  ]}
                  numberOfLines={1}
                >
                  Authentic statutory license, certificate, or permit filled from official cloud template for{' '}
                  <Text
                    style={{
                      fontWeight: '700',
                      color: isDark ? colors.neutral[200] : colors.neutral[800],
                    }}
                  >
                    {app.applicant}
                  </Text>
                </Text>
              </View>
            </View>

            {/* Header Right Window Action Buttons */}
            <View style={styles.headerRightActions}>
              <TouchableOpacity
                onPress={() => setReloadKey((k) => k + 1)}
                style={[
                  styles.actionIconBtn,
                  {
                    backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100],
                    borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
                  },
                ]}
                activeOpacity={0.7}
                accessibilityLabel="Refresh Document Preview"
              >
                <Lucide
                  name="refresh-cw"
                  size={15}
                  color={isDark ? colors.neutral[300] : colors.neutral[700]}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => void handleDownload()}
                style={[
                  styles.downloadBtn,
                  {
                    backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100],
                    borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
                  },
                ]}
                activeOpacity={0.7}
              >
                <Lucide
                  name="download"
                  size={14}
                  color={isDark ? colors.neutral[200] : colors.neutral[800]}
                />
                <Text
                  style={[
                    styles.downloadBtnText,
                    { color: isDark ? colors.neutral[200] : colors.neutral[800] },
                  ]}
                >
                  Download PDF
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => void handlePrint()}
                style={[styles.printBtn, { backgroundColor: colors.brand[600] }]}
                activeOpacity={0.7}
              >
                <Lucide name="printer" size={15} color={COLORS.neutral.white} />
                <Text style={styles.printBtnText}>Print Document</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onClose}
                style={[
                  styles.closeBtn,
                  { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] },
                ]}
                activeOpacity={0.7}
                accessibilityLabel="Close Print Dialog"
              >
                <Lucide
                  name="x"
                  size={18}
                  color={isDark ? colors.neutral[400] : colors.neutral[600]}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Sub-Header Toolbar: Dedicated Mode & Target Options Bar */}
          <View
            style={[
              styles.modeSubHeader,
              {
                backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50],
                borderBottomColor: isDark ? colors.neutral[800] : colors.neutral[200],
              },
            ]}
          >
            {/* Target / Mode Switcher Pills */}
            <View
              style={[
                styles.modePillGroup,
                { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[200] },
              ]}
            >
              <TouchableOpacity
                onPress={() => setActiveTarget('pdf')}
                style={[
                  styles.modePill,
                  activeTarget === 'pdf' && {
                    backgroundColor: isDark ? colors.brand[700] : COLORS.neutral.white,
                    ...SHADOWS.card,
                  },
                ]}
                activeOpacity={0.7}
              >
                <Lucide
                  name="file-text"
                  size={13}
                  color={
                    activeTarget === 'pdf'
                      ? isDark
                        ? colors.neutral[100]
                        : colors.brand[600]
                      : colors.neutral[500]
                  }
                />
                <Text
                  style={[
                    styles.modePillText,
                    {
                      color:
                        activeTarget === 'pdf'
                          ? isDark
                            ? colors.neutral[100]
                            : colors.brand[700]
                          : isDark
                            ? colors.neutral[400]
                            : colors.neutral[600],
                      fontWeight: activeTarget === 'pdf' ? '700' : '500',
                    },
                  ]}
                >
                  Official Cloud PDF
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActiveTarget('accountable')}
                style={[
                  styles.modePill,
                  activeTarget === 'accountable' && {
                    backgroundColor: isDark ? colors.brand[700] : COLORS.neutral.white,
                    ...SHADOWS.card,
                  },
                ]}
                activeOpacity={0.7}
              >
                <Lucide
                  name="layers"
                  size={13}
                  color={
                    activeTarget === 'accountable'
                      ? isDark
                        ? colors.neutral[100]
                        : colors.brand[600]
                      : colors.neutral[500]
                  }
                />
                <Text
                  style={[
                    styles.modePillText,
                    {
                      color:
                        activeTarget === 'accountable'
                          ? isDark
                            ? colors.neutral[100]
                            : colors.brand[700]
                          : isDark
                            ? colors.neutral[400]
                            : colors.neutral[600],
                      fontWeight: activeTarget === 'accountable' ? '700' : '500',
                    },
                  ]}
                >
                  Accountable Form
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActiveTarget('calibration')}
                style={[
                  styles.modePill,
                  activeTarget === 'calibration' && {
                    backgroundColor: isDark ? colors.brand[700] : COLORS.neutral.white,
                    ...SHADOWS.card,
                  },
                ]}
                activeOpacity={0.7}
              >
                <Lucide
                  name="sliders"
                  size={13}
                  color={
                    activeTarget === 'calibration'
                      ? isDark
                        ? colors.neutral[100]
                        : colors.brand[600]
                      : colors.neutral[500]
                  }
                />
                <Text
                  style={[
                    styles.modePillText,
                    {
                      color:
                        activeTarget === 'calibration'
                          ? isDark
                            ? colors.neutral[100]
                            : colors.brand[700]
                          : isDark
                            ? colors.neutral[400]
                            : colors.neutral[600],
                      fontWeight: activeTarget === 'calibration' ? '700' : '500',
                    },
                  ]}
                >
                  Tray Calibration
                </Text>
              </TouchableOpacity>
            </View>

            {/* Context Badge / Status indicator */}
            <View style={styles.subHeaderContextWrap}>
              <Text
                style={[
                  styles.subHeaderContextText,
                  { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                ]}
                numberOfLines={1}
              >
                {activeTarget === 'pdf'
                  ? 'Official PDF Template • Pre-formatted Cloud Document'
                  : activeTarget === 'accountable'
                    ? `Pre-Printed Stationery Overlay • ${activeTemplate.code} (${activeTemplate.defaultPaperSize.toUpperCase()})`
                    : `Hardware Tray Feed Offsets • X: ${offsetXmm > 0 ? `+${offsetXmm}` : offsetXmm} mm, Y: ${offsetYmm > 0 ? `+${offsetYmm}` : offsetYmm} mm`}
              </Text>
            </View>
          </View>

          {/* Animated Progress Bar during PDF generation from Cloud */}
          {activeTarget === 'pdf' && isLoadingPdf && (
            <View style={{ width: '100%', height: 3, overflow: 'hidden' }}>
              <PdfLoadBar height={3} />
            </View>
          )}

          {/* Modal Main View */}
          <View style={styles.modalBody}>
            {/* Mode 1: Authentic Official Cloud PDF (Default) */}
            {activeTarget === 'pdf' && (
              <View style={styles.pdfFullViewerWrapper}>
                {isLoadingPdf ? (
                  <View
                    style={[
                      styles.pdfLoadingCard,
                      {
                        backgroundColor: isDark ? colors.neutral[900] : '#ffffff',
                        borderColor: isDark ? colors.neutral[800] : colors.neutral[200],
                      },
                    ]}
                  >
                    <View style={styles.loadingInnerContent}>
                      <View
                        style={[
                          styles.loadingIconCircle,
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

                      <View style={{ alignItems: 'center', gap: 6 }}>
                        <Text
                          style={[
                            styles.loadingTitle,
                            { color: isDark ? colors.neutral[100] : colors.neutral[900] },
                          ]}
                        >
                          Generating Authentic Statutory Document from Cloud Template...
                        </Text>
                        <Text
                          style={[
                            styles.loadingDesc,
                            { color: isDark ? colors.neutral[400] : colors.neutral[600] },
                          ]}
                        >
                          Fetching official statutory template from Cloudflare R2 / NTC repository and overlaying AcroForm vector fields.
                        </Text>
                      </View>

                      <View style={{ width: '100%', marginTop: SPACING[8] }}>
                        <PdfLoadBar height={6} />
                      </View>

                      <View
                        style={[
                          styles.templateStatusBadge,
                          {
                            backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100],
                            borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.templateStatusBadgeText,
                            { color: isDark ? colors.neutral[300] : colors.neutral[700] },
                          ]}
                        >
                          Target: {activeTemplate.code} • {activeTemplate.title}
                        </Text>
                      </View>
                    </View>
                  </View>
                ) : pdfError ? (
                  <View
                    style={[
                      styles.pdfErrorCard,
                      {
                        backgroundColor: isDark ? colors.neutral[900] : '#ffffff',
                        borderColor: isDark ? colors.neutral[800] : colors.neutral[200],
                      },
                    ]}
                  >
                    <Lucide name="alert-triangle" size={36} color="#EF4444" />
                    <Text
                      style={[
                        styles.pdfErrorTitle,
                        { color: isDark ? colors.neutral[100] : colors.neutral[900] },
                      ]}
                    >
                      Unable to Load Cloud PDF Template
                    </Text>
                    <Text style={styles.pdfErrorSubtitle}>{pdfError}</Text>
                    <TouchableOpacity
                      onPress={() => setReloadKey((k) => k + 1)}
                      style={[styles.retryBtn, { backgroundColor: colors.brand[600] }]}
                      activeOpacity={0.8}
                    >
                      <Lucide name="refresh-cw" size={14} color={COLORS.neutral.white} />
                      <Text style={styles.retryBtnText}>Retry Loading Cloud PDF</Text>
                    </TouchableOpacity>
                  </View>
                ) : pdfBlobUrl && Platform.OS === 'web' ? (
                  <View style={styles.pdfFrameHolder}>
                    {React.createElement('iframe', {
                      src: `${pdfBlobUrl}#toolbar=0&navpanes=0`,
                      style: {
                        width: '100%',
                        height: '100%',
                        minHeight: '660px',
                        border: 'none',
                        borderRadius: '8px',
                        backgroundColor: isDark ? '#1e293b' : '#525659',
                      },
                      title: 'Authentic Official Statutory Document PDF',
                    })}
                  </View>
                ) : (
                  <View style={styles.pdfLoadingCard}>
                    <ActivityIndicator size="small" color={colors.brand[600]} />
                    <Text
                      style={[
                        styles.pdfLoadingText,
                        { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                      ]}
                    >
                      Preparing document preview...
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Mode 2: Pre-Printed Accountable Form (Physical Stationery Overlay) */}
            {activeTarget === 'accountable' && (
              <View style={[styles.splitBody, isDesktop ? styles.desktopSplit : styles.mobileSplit]}>
                {/* Left Controls: Select Accountable Form Stationery */}
                <View
                  style={[
                    styles.sideConfigPanel,
                    {
                      backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50],
                      borderColor: isDark ? colors.neutral[800] : colors.neutral[200],
                    },
                    isDesktop && { width: 340 },
                  ]}
                >
                  <Text
                    style={[
                      styles.sectionHeading,
                      { color: isDark ? colors.neutral[300] : colors.neutral[700] },
                    ]}
                  >
                    ACCOUNTABLE FORM TEMPLATE
                  </Text>
                  <ScrollView style={{ maxHeight: 360 }} showsVerticalScrollIndicator={false}>
                    <View style={{ gap: SPACING[8] }}>
                      {eligibleTemplates.map((tmpl) => {
                        const isSelected = selectedTemplateId === tmpl.id;
                        return (
                          <TouchableOpacity
                            key={tmpl.id}
                            onPress={() => setSelectedTemplateId(tmpl.id)}
                            style={[
                              styles.templateOptionRow,
                              isSelected && {
                                borderColor: '#D97706',
                                backgroundColor: isDark
                                  ? 'rgba(217, 119, 6, 0.15)'
                                  : '#FEF3C7',
                              },
                              {
                                backgroundColor: isDark
                                  ? colors.neutral[800]
                                  : colors.neutral[100],
                                borderColor: isSelected
                                  ? '#D97706'
                                  : isDark
                                    ? colors.neutral[700]
                                    : colors.neutral[200],
                              },
                            ]}
                            activeOpacity={0.7}
                          >
                            <View style={{ flex: 1 }}>
                              <Text
                                style={[
                                  styles.templateOptionCode,
                                  {
                                    color: isSelected
                                      ? '#D97706'
                                      : isDark
                                        ? colors.neutral[200]
                                        : colors.neutral[800],
                                  },
                                ]}
                              >
                                {tmpl.code} • {tmpl.title}
                              </Text>
                              <Text
                                style={[
                                  styles.templateOptionMeta,
                                  {
                                    color: isDark
                                      ? colors.neutral[400]
                                      : colors.neutral[500],
                                  },
                                ]}
                              >
                                {tmpl.dimensions.widthMm} x {tmpl.dimensions.heightMm} mm ({tmpl.defaultPaperSize.toUpperCase()})
                              </Text>
                            </View>
                            {isSelected && <Lucide name="check" size={16} color="#D97706" />}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </ScrollView>

                  <View style={{ marginTop: SPACING[16], gap: SPACING[8] }}>
                    <Text
                      style={[
                        styles.sectionHeading,
                        { color: isDark ? colors.neutral[300] : colors.neutral[700] },
                      ]}
                    >
                      PAPER SIZE
                    </Text>
                    <View style={styles.paperSizePillsWrap}>
                      {AVAILABLE_PAPER_SIZES.map((sizeKey) => {
                        const isSelected = paperSize === sizeKey;
                        return (
                          <TouchableOpacity
                            key={sizeKey}
                            onPress={() => setPaperSize(sizeKey)}
                            style={[
                              styles.paperPill,
                              isSelected && {
                                borderColor: colors.brand[600],
                                backgroundColor: isDark
                                  ? colors.brand[900]
                                  : colors.brand[50],
                              },
                              {
                                backgroundColor: isDark
                                  ? colors.neutral[800]
                                  : colors.neutral[100],
                                borderColor: isSelected
                                  ? colors.brand[600]
                                  : isDark
                                    ? colors.neutral[700]
                                    : colors.neutral[200],
                              },
                            ]}
                            activeOpacity={0.7}
                          >
                            <Text
                              style={[
                                styles.paperPillText,
                                isSelected && { color: colors.brand[600], fontWeight: '700' },
                              ]}
                            >
                              {sizeKey.toUpperCase()}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                </View>

                {/* Right Frame: Live HTML Stationery Overlay */}
                <View style={styles.overlayFrameHolder}>
                  {Platform.OS === 'web' ? (
                    React.createElement('iframe', {
                      srcDoc: accountableOverlayHtml,
                      style: {
                        width: '100%',
                        height: '100%',
                        minHeight: '640px',
                        border: 'none',
                        borderRadius: '8px',
                        backgroundColor: '#FFFFFF',
                      },
                      title: 'Pre-Printed Accountable Form Live Overlay',
                    })
                  ) : (
                    <View style={styles.pdfLoadingCard}>
                      <Text style={styles.loadingDesc}>
                        Accountable form live overlay preview is available on web.
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Mode 3: Workstation Tray Calibration & Alignment Sheet */}
            {activeTarget === 'calibration' && (
              <View style={[styles.splitBody, isDesktop ? styles.desktopSplit : styles.mobileSplit]}>
                {/* Calibration Controls Panel */}
                <View
                  style={[
                    styles.sideConfigPanel,
                    {
                      backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50],
                      borderColor: isDark ? colors.neutral[800] : colors.neutral[200],
                    },
                    isDesktop && { width: 360 },
                  ]}
                >
                  <Text
                    style={[
                      styles.sectionHeading,
                      { color: isDark ? colors.neutral[300] : colors.neutral[700] },
                    ]}
                  >
                    WORKSTATION TRAY OFFSET CALIBRATION
                  </Text>
                  <Text
                    style={[
                      styles.calibrationHelperText,
                      { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                    ]}
                  >
                    Fine-tune hardware margins to compensate for printer tractor feed or paper guide variance.
                  </Text>

                  {/* Horizontal Offset X */}
                  <View style={styles.nudgeControlRow}>
                    <Text
                      style={[
                        styles.nudgeLabel,
                        { color: isDark ? colors.neutral[300] : colors.neutral[700] },
                      ]}
                    >
                      X Offset (Horizontal)
                    </Text>
                    <View style={styles.nudgeBtnGroup}>
                      <TouchableOpacity
                        onPress={() => setOffsetXmm((v) => Math.round((v - 0.5) * 10) / 10)}
                        style={styles.nudgeBtn}
                      >
                        <Text style={styles.nudgeBtnText}>-0.5</Text>
                      </TouchableOpacity>
                      <View style={styles.nudgeValueDisplay}>
                        <Text
                          style={[
                            styles.nudgeValueText,
                            { color: offsetXmm !== 0 ? colors.brand[600] : '#334155' },
                          ]}
                        >
                          {offsetXmm > 0 ? `+${offsetXmm}` : offsetXmm} mm
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => setOffsetXmm((v) => Math.round((v + 0.5) * 10) / 10)}
                        style={styles.nudgeBtn}
                      >
                        <Text style={styles.nudgeBtnText}>+0.5</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Vertical Offset Y */}
                  <View style={styles.nudgeControlRow}>
                    <Text
                      style={[
                        styles.nudgeLabel,
                        { color: isDark ? colors.neutral[300] : colors.neutral[700] },
                      ]}
                    >
                      Y Offset (Vertical)
                    </Text>
                    <View style={styles.nudgeBtnGroup}>
                      <TouchableOpacity
                        onPress={() => setOffsetYmm((v) => Math.round((v - 0.5) * 10) / 10)}
                        style={styles.nudgeBtn}
                      >
                        <Text style={styles.nudgeBtnText}>-0.5</Text>
                      </TouchableOpacity>
                      <View style={styles.nudgeValueDisplay}>
                        <Text
                          style={[
                            styles.nudgeValueText,
                            { color: offsetYmm !== 0 ? colors.brand[600] : '#334155' },
                          ]}
                        >
                          {offsetYmm > 0 ? `+${offsetYmm}` : offsetYmm} mm
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => setOffsetYmm((v) => Math.round((v + 0.5) * 10) / 10)}
                        style={styles.nudgeBtn}
                      >
                        <Text style={styles.nudgeBtnText}>+0.5</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.calibActionButtonsRow}>
                    <TouchableOpacity
                      onPress={handleResetCalibration}
                      style={[
                        styles.resetBtn,
                        {
                          backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100],
                          borderColor: isDark ? colors.neutral[700] : colors.neutral[300],
                        },
                      ]}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.resetBtnText,
                          { color: isDark ? colors.neutral[300] : colors.neutral[700] },
                        ]}
                      >
                        Reset Offsets
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={handleSavePreferences}
                      style={[styles.savePrefsBtn, { backgroundColor: colors.brand[600] }]}
                      activeOpacity={0.8}
                    >
                      <Lucide name="save" size={13} color={COLORS.neutral.white} />
                      <Text style={styles.savePrefsBtnText}>Save Preferences</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Right Frame: Live Alignment Test Sheet */}
                <View style={styles.overlayFrameHolder}>
                  {Platform.OS === 'web' ? (
                    React.createElement('iframe', {
                      srcDoc: alignmentTestHtml,
                      style: {
                        width: '100%',
                        height: '100%',
                        minHeight: '640px',
                        border: 'none',
                        borderRadius: '8px',
                        backgroundColor: '#FFFFFF',
                      },
                      title: 'Printer Alignment Test Sheet Preview',
                    })
                  ) : (
                    <View style={styles.pdfLoadingCard}>
                      <Text style={styles.loadingDesc}>
                        Alignment test sheet preview is available on web.
                      </Text>
                    </View>
                  )}
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
    padding: SPACING[16],
  },
  modalContainer: {
    width: '100%',
    maxWidth: 1240,
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
    paddingHorizontal: SPACING[20],
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
  headerTitleWrap: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  modalTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16.5,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  modalSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    marginTop: 2,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
    flexShrink: 0,
  },
  modeSubHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[20],
    paddingVertical: SPACING[8],
    borderBottomWidth: 1,
    flexWrap: 'wrap',
    gap: SPACING[12],
  },
  subHeaderContextWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subHeaderContextText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: '500',
  },
  modePillGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.circle,
    padding: 3,
    gap: 3,
  },
  modePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[10],
    paddingVertical: 5,
    borderRadius: RADIUS.circle,
    gap: 6,
  },
  modePillText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
  },
  actionIconBtn: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SPACING[12],
    paddingVertical: 7,
    borderRadius: RADIUS.button,
    borderWidth: 1,
  },
  downloadBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12.5,
    fontWeight: '600',
  },
  printBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SPACING[16],
    paddingVertical: 7,
    borderRadius: RADIUS.button,
  },
  printBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.neutral.white,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING[4],
  },
  modalBody: {
    flex: 1,
    minHeight: 660,
  },
  pdfFullViewerWrapper: {
    flex: 1,
    padding: SPACING[16],
  },
  pdfFrameHolder: {
    flex: 1,
    minHeight: 660,
    borderRadius: RADIUS.card,
    overflow: 'hidden',
  },
  pdfLoadingCard: {
    flex: 1,
    minHeight: 640,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    padding: SPACING[24],
  },
  loadingInnerContent: {
    width: '100%',
    maxWidth: 480,
    alignItems: 'center',
    gap: SPACING[16],
  },
  loadingIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  loadingTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  loadingDesc: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12.5,
    textAlign: 'center',
    lineHeight: 18,
  },
  templateStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.circle,
    borderWidth: 1,
  },
  templateStatusBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11.5,
    fontWeight: '600',
  },
  pdfErrorCard: {
    flex: 1,
    minHeight: 640,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    padding: SPACING[32],
    gap: SPACING[12],
  },
  pdfErrorTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  pdfErrorSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: '#EF4444',
    textAlign: 'center',
    maxWidth: 440,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SPACING[16],
    paddingVertical: SPACING[8],
    borderRadius: RADIUS.button,
    marginTop: SPACING[8],
  },
  retryBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.neutral.white,
  },
  pdfLoadingText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
  },
  splitBody: {
    flex: 1,
    padding: SPACING[16],
    gap: SPACING[16],
  },
  desktopSplit: {
    flexDirection: 'row',
  },
  mobileSplit: {
    flexDirection: 'column',
  },
  sideConfigPanel: {
    borderRadius: RADIUS.card,
    borderWidth: 1,
    padding: SPACING[16],
    gap: SPACING[12],
  },
  sectionHeading: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  templateOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING[10],
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    gap: SPACING[8],
  },
  templateOptionCode: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  templateOptionMeta: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10.5,
    marginTop: 2,
  },
  paperSizePillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  paperPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  paperPillText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: '#64748B',
  },
  overlayFrameHolder: {
    flex: 1,
    minHeight: 640,
    borderRadius: RADIUS.card,
    overflow: 'hidden',
  },
  calibrationHelperText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11.5,
    lineHeight: 16,
  },
  nudgeControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING[6],
  },
  nudgeLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: '500',
  },
  nudgeBtnGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  nudgeBtn: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  nudgeBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  nudgeValueDisplay: {
    minWidth: 64,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 6,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  nudgeValueText: {
    fontFamily: 'monospace',
    fontSize: 11.5,
    fontWeight: 'bold',
  },
  calibActionButtonsRow: {
    flexDirection: 'row',
    gap: SPACING[8],
    marginTop: SPACING[12],
  },
  resetBtn: {
    flex: 1,
    paddingVertical: SPACING[8],
    borderRadius: RADIUS.button,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  savePrefsBtn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: SPACING[8],
    borderRadius: RADIUS.button,
  },
  savePrefsBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.neutral.white,
  },
});
