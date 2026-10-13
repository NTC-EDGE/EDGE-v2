import React, { useState, useEffect, useMemo } from 'react';
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

const STORAGE_CALIBRATION_KEY = 'ntc_edge_printer_calibration_prefs';

interface IssuedDocumentPrintModalProps {
  visible: boolean;
  app: ApplicationData;
  initialOptions?: Partial<DocumentPrintOptions>;
  onClose: () => void;
}

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
    outputMode,
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
    issuedDocumentType: app.serviceName || 'Statutory License & Certificate',
    formNumber: app.applicationNumber,
    licenseNumber: app.applicationNumber,
    callSign: app.formFieldValues?.find((f) => f.fieldLabel.toLowerCase().includes('call sign'))?.value || 'DX7NTC',
    stationClass: 'Commercial Fixed / Mobile Station',
    frequencyBand: '144.0000 MHz - 146.0000 MHz',
    issueDate: new Date().toISOString(),
    expiryDate: new Date(Date.now() + 3 * 365 * 24 * 3600 * 1000).toISOString(),
    officialReceiptNumber: app.payment?.orNumber || 'OR-PENDING',
    signatoryName: app.issuingOfficer || app.evaluatingOfficer || 'REGIONAL DIRECTOR',
    signatoryTitle: 'Regional Director / Authorized Officer',
    remarks: app.note || 'Standard statutory authorization',
  }), [paperSize, outputMode, orientation, customWidthMm, customHeightMm, offsetXmm, offsetYmm, showGhostWatermark, activeTemplate.id, app]);

  const handlePrint = () => {
    let html = '';
    if (outputMode === 'plain_paper') {
      html = generateStatutoryDocumentHtml(app, currentPrintOptions);
    } else if (outputMode === 'accountable_form') {
      html = generateAccountableFormOverlayHtml(app, currentPrintOptions, activeTemplate);
    } else {
      html = generateAlignmentTestSheetHtml(currentPrintOptions, activeTemplate);
    }
    openDocumentPrintWindow(html);
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

  const currentPaperDim = PAPER_DIMENSIONS[paperSize] || PAPER_DIMENSIONS.letter;

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
          {/* Header */}
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
                <Lucide name="printer" size={22} color={isDark ? colors.brand[400] : colors.brand[600]} />
              </View>
              <View>
                <Text
                  style={[
                    styles.modalTitle,
                    { color: isDark ? colors.neutral[100] : colors.neutral[900] },
                  ]}
                >
                  Statutory Document &amp; Accountable Form Printing
                </Text>
                <Text
                  style={[
                    styles.modalSubtitle,
                    { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                  ]}
                >
                  Configure output target, paper size, and physical tray coordinate calibration for{' '}
                  <Text style={{ fontWeight: '700', color: isDark ? colors.neutral[200] : colors.neutral[800] }}>
                    {app.applicant}
                  </Text>
                </Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Lucide name="x" size={20} color={isDark ? colors.neutral[400] : colors.neutral[600]} />
            </TouchableOpacity>
          </View>

          {/* Modal Main Content */}
          <View style={[styles.modalBody, isDesktop ? styles.desktopBody : styles.mobileBody]}>
            {/* Left Column: Configuration Controls */}
            <ScrollView style={styles.configColumn} showsVerticalScrollIndicator={false}>
              {/* 1. Print Target / Mode */}
              <View style={styles.controlGroup}>
                <Text style={[styles.sectionHeading, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>
                  1. SELECT OUTPUT TARGET
                </Text>
                <View style={styles.modeCardsWrap}>
                  <TouchableOpacity
                    onPress={() => setOutputMode('plain_paper')}
                    style={[
                      styles.modeCard,
                      outputMode === 'plain_paper' && styles.modeCardActive,
                      {
                        backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50],
                        borderColor: outputMode === 'plain_paper' ? colors.brand[600] : isDark ? colors.neutral[700] : colors.neutral[200],
                      },
                    ]}
                    activeOpacity={0.8}
                  >
                    <View style={styles.modeCardHeader}>
                      <Lucide
                        name="file-text"
                        size={18}
                        color={outputMode === 'plain_paper' ? colors.brand[600] : colors.neutral[500]}
                      />
                      <Text
                        style={[
                          styles.modeCardTitle,
                          { color: outputMode === 'plain_paper' ? colors.brand[600] : isDark ? colors.neutral[200] : colors.neutral[800] },
                        ]}
                      >
                        Plain Bond Paper
                      </Text>
                    </View>
                    <Text style={[styles.modeCardDesc, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                      Prints full document with Republic of the Philippines seal, NTC letterhead, decorative borders, and dynamic data.
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setOutputMode('accountable_form')}
                    style={[
                      styles.modeCard,
                      outputMode === 'accountable_form' && styles.modeCardActive,
                      {
                        backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50],
                        borderColor: outputMode === 'accountable_form' ? '#D97706' : isDark ? colors.neutral[700] : colors.neutral[200],
                      },
                    ]}
                    activeOpacity={0.8}
                  >
                    <View style={styles.modeCardHeader}>
                      <Lucide
                        name="layers"
                        size={18}
                        color={outputMode === 'accountable_form' ? '#D97706' : colors.neutral[500]}
                      />
                      <Text
                        style={[
                          styles.modeCardTitle,
                          { color: outputMode === 'accountable_form' ? '#D97706' : isDark ? colors.neutral[200] : colors.neutral[800] },
                        ]}
                      >
                        Pre-Printed Accountable Form
                      </Text>
                    </View>
                    <Text style={[styles.modeCardDesc, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                      Suppresses borders &amp; static labels. Appends ONLY dynamic fields calibrated to pre-printed physical paper boxes.
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* 2. Accountable Form Template Preset */}
              {outputMode === 'accountable_form' && (
                <View style={styles.controlGroup}>
                  <Text style={[styles.sectionHeading, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>
                    2. ACCOUNTABLE FORM TEMPLATE
                  </Text>
                  {eligibleTemplates.length === 1 ? (
                    <View
                      style={[
                        styles.templateOptionRow,
                        styles.templateOptionRowSelected,
                        {
                          backgroundColor: isDark ? 'rgba(217, 119, 6, 0.12)' : '#FFFBEB',
                          borderColor: '#D97706',
                          paddingVertical: 12,
                        },
                      ]}
                    >
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                          <Lucide name="lock" size={13} color="#D97706" />
                          <Text style={[styles.templateOptionCode, { color: '#D97706', fontWeight: 'bold' }]}>
                            {eligibleTemplates[0].code} • {eligibleTemplates[0].title}
                          </Text>
                        </View>
                        <Text style={[styles.templateOptionMeta, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
                          Auto-matched for {app.serviceName || 'this service'} ({eligibleTemplates[0].dimensions.widthMm} x {eligibleTemplates[0].dimensions.heightMm} mm)
                        </Text>
                      </View>
                      <Lucide name="check-circle" size={18} color="#D97706" />
                    </View>
                  ) : (
                    <View style={{ gap: 6 }}>
                      {eligibleTemplates.map((tmpl) => {
                        const isSelected = tmpl.id === selectedTemplateId;
                        return (
                          <TouchableOpacity
                            key={tmpl.id}
                            onPress={() => {
                              setSelectedTemplateId(tmpl.id);
                              setPaperSize(tmpl.defaultPaperSize);
                            }}
                            style={[
                              styles.templateOptionRow,
                              isSelected && styles.templateOptionRowSelected,
                              {
                                backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50],
                                borderColor: isSelected ? '#D97706' : isDark ? colors.neutral[700] : colors.neutral[200],
                              },
                            ]}
                            activeOpacity={0.7}
                          >
                            <View style={{ flex: 1 }}>
                              <Text style={[styles.templateOptionCode, { color: isSelected ? '#D97706' : isDark ? colors.neutral[200] : colors.neutral[800] }]}>
                                {tmpl.code} • {tmpl.title}
                              </Text>
                              <Text style={[styles.templateOptionMeta, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                                {tmpl.dimensions.widthMm} x {tmpl.dimensions.heightMm} mm ({tmpl.defaultPaperSize.toUpperCase()})
                              </Text>
                            </View>
                            {isSelected && <Lucide name="check" size={16} color="#D97706" />}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>
              )}

              {/* 3. Paper Size & Orientation */}
              <View style={styles.controlGroup}>
                <Text style={[styles.sectionHeading, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>
                  {outputMode === 'accountable_form' ? '3.' : '2.'} PAPER SIZE &amp; ORIENTATION
                </Text>
                <View style={styles.paperSizePillsWrap}>
                  {(['letter', 'a4', 'folio', 'legal', 'custom'] as PaperSize[]).map((sizeKey) => {
                    const isSelected = paperSize === sizeKey;
                    const dim = PAPER_DIMENSIONS[sizeKey];
                    return (
                      <TouchableOpacity
                        key={sizeKey}
                        onPress={() => setPaperSize(sizeKey)}
                        style={[
                          styles.paperPill,
                          isSelected && styles.paperPillActive,
                          {
                            backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50],
                            borderColor: isSelected ? colors.brand[600] : isDark ? colors.neutral[700] : colors.neutral[200],
                          },
                        ]}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.paperPillText,
                            isSelected && styles.paperPillTextActive,
                            { color: isSelected ? colors.brand[600] : isDark ? colors.neutral[300] : colors.neutral[700] },
                          ]}
                        >
                          {sizeKey.toUpperCase()}
                        </Text>
                        <Text style={[styles.paperPillSub, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                          {dim.widthMm.toFixed(0)}x{dim.heightMm.toFixed(0)}mm
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {paperSize === 'custom' && (
                  <View style={styles.customDimensionsRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.dimLabel}>Width (mm):</Text>
                      <TextInput
                        style={[styles.dimInput, { borderColor: isDark ? colors.neutral[700] : colors.neutral[300], color: isDark ? colors.neutral[100] : colors.neutral[900] }]}
                        value={customWidthMm}
                        onChangeText={setCustomWidthMm}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.dimLabel}>Height (mm):</Text>
                      <TextInput
                        style={[styles.dimInput, { borderColor: isDark ? colors.neutral[700] : colors.neutral[300], color: isDark ? colors.neutral[100] : colors.neutral[900] }]}
                        value={customHeightMm}
                        onChangeText={setCustomHeightMm}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                )}

                {/* Orientation Selector */}
                <View style={styles.orientationRow}>
                  <TouchableOpacity
                    onPress={() => setOrientation('portrait')}
                    style={[
                      styles.orientationBtn,
                      orientation === 'portrait' && styles.orientationBtnActive,
                      {
                        backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50],
                        borderColor: orientation === 'portrait' ? colors.brand[600] : isDark ? colors.neutral[700] : colors.neutral[200],
                      },
                    ]}
                  >
                    <Lucide name="file" size={15} color={orientation === 'portrait' ? colors.brand[600] : colors.neutral[500]} />
                    <Text style={[styles.orientationBtnText, orientation === 'portrait' && { color: colors.brand[600], fontWeight: '700' }]}>
                      Portrait
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setOrientation('landscape')}
                    style={[
                      styles.orientationBtn,
                      orientation === 'landscape' && styles.orientationBtnActive,
                      {
                        backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50],
                        borderColor: orientation === 'landscape' ? colors.brand[600] : isDark ? colors.neutral[700] : colors.neutral[200],
                      },
                    ]}
                  >
                    <Lucide name="layout" size={15} color={orientation === 'landscape' ? colors.brand[600] : colors.neutral[500]} />
                    <Text style={[styles.orientationBtnText, orientation === 'landscape' && { color: colors.brand[600], fontWeight: '700' }]}>
                      Landscape
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* 4. Tray Coordinate Calibration Controls */}
              {outputMode === 'accountable_form' && (
                <View style={styles.controlGroup}>
                  <View style={styles.calibrationHeaderRow}>
                    <Text style={[styles.sectionHeading, { color: isDark ? colors.neutral[300] : colors.neutral[700], marginBottom: 0 }]}>
                      4. TRAY MARGIN CALIBRATION (MM)
                    </Text>
                    <TouchableOpacity onPress={handleResetCalibration}>
                      <Text style={{ fontSize: 11, color: colors.brand[600], fontWeight: '600' }}>Reset (0,0)</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={[styles.controlSubtext, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                    Nudge print output to align with the physical printer feeder tray.
                  </Text>

                  <View style={styles.calibrationControls}>
                    {/* Horizontal Offset X */}
                    <View style={styles.nudgeControlRow}>
                      <Text style={[styles.nudgeLabel, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>
                        Horizontal Offset (X):
                      </Text>
                      <View style={styles.nudgeBtnGroup}>
                        <TouchableOpacity onPress={() => setOffsetXmm((x) => Math.round((x - 1) * 10) / 10)} style={styles.nudgeBtn}>
                          <Text style={styles.nudgeBtnText}>-1mm</Text>
                        </TouchableOpacity>
                        <View style={[styles.nudgeValueDisplay, { borderColor: isDark ? colors.neutral[700] : colors.neutral[300] }]}>
                          <Text style={[styles.nudgeValueText, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]}>
                            {offsetXmm > 0 ? `+${offsetXmm.toFixed(1)}` : offsetXmm.toFixed(1)} mm
                          </Text>
                        </View>
                        <TouchableOpacity onPress={() => setOffsetXmm((x) => Math.round((x + 1) * 10) / 10)} style={styles.nudgeBtn}>
                          <Text style={styles.nudgeBtnText}>+1mm</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Vertical Offset Y */}
                    <View style={styles.nudgeControlRow}>
                      <Text style={[styles.nudgeLabel, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>
                        Vertical Offset (Y):
                      </Text>
                      <View style={styles.nudgeBtnGroup}>
                        <TouchableOpacity onPress={() => setOffsetYmm((y) => Math.round((y - 1) * 10) / 10)} style={styles.nudgeBtn}>
                          <Text style={styles.nudgeBtnText}>-1mm</Text>
                        </TouchableOpacity>
                        <View style={[styles.nudgeValueDisplay, { borderColor: isDark ? colors.neutral[700] : colors.neutral[300] }]}>
                          <Text style={[styles.nudgeValueText, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]}>
                            {offsetYmm > 0 ? `+${offsetYmm.toFixed(1)}` : offsetYmm.toFixed(1)} mm
                          </Text>
                        </View>
                        <TouchableOpacity onPress={() => setOffsetYmm((y) => Math.round((y + 1) * 10) / 10)} style={styles.nudgeBtn}>
                          <Text style={styles.nudgeBtnText}>+1mm</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>

                  {/* Ghost Guide Toggle */}
                  <TouchableOpacity
                    onPress={() => setShowGhostWatermark(!showGhostWatermark)}
                    style={styles.ghostToggleRow}
                  >
                    <Lucide
                      name={showGhostWatermark ? 'check-square' : 'square'}
                      size={16}
                      color={showGhostWatermark ? '#D97706' : colors.neutral[400]}
                    />
                    <Text style={[styles.ghostToggleText, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>
                      Show faint ghost outline of pre-printed boxes in preview
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>

            {/* Right Column: Live Visual Document Preview */}
            <View style={[styles.previewColumn, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[100] }]}>
              <View style={styles.previewHeaderBar}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Lucide name="eye" size={14} color={isDark ? colors.neutral[400] : colors.neutral[600]} />
                  <Text style={[styles.previewHeaderTitle, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>
                    LIVE PRINT PREVIEW ({paperSize.toUpperCase()} • {orientation.toUpperCase()})
                  </Text>
                </View>
                <View style={styles.previewBadge}>
                  <Text style={styles.previewBadgeText}>
                    {outputMode === 'plain_paper' ? 'PLAIN BOND PAPER' : 'DATA OVERLAY (ACCOUNTABLE)'}
                  </Text>
                </View>
              </View>

              {/* Scaled Preview Sheet Container */}
              <View style={styles.previewSheetFrame}>
                <View
                  style={[
                    styles.previewSheet,
                    {
                      aspectRatio: orientation === 'landscape' ? 1.35 : 0.75,
                      backgroundColor: '#FFFFFF',
                    },
                  ]}
                >
                  {outputMode === 'plain_paper' ? (
                    /* Plain Bond Paper Mock Preview */
                    <View style={styles.plainSheetContent}>
                      <View style={styles.plainSheetBorder}>
                        <View style={styles.mockHeader}>
                          <View style={{ flex: 1, alignItems: 'center' }}>
                            <Text style={styles.mockAgency}>REPUBLIC OF THE PHILIPPINES</Text>
                            <Text style={styles.mockDept}>NATIONAL TELECOMMUNICATIONS COMMISSION</Text>
                            <Text style={styles.mockTitle}>{app.serviceName || 'RADIO STATION LICENSE'}</Text>
                          </View>
                        </View>
                        <View style={styles.mockLicensee}>
                          <Text style={styles.mockLicenseeName}>{app.applicant}</Text>
                          <Text style={styles.mockLicenseeAddr}>{app.address?.city || 'Quezon City'}, Philippines</Text>
                        </View>
                        <View style={styles.mockGrid}>
                          <Text style={styles.mockGridCell}>Call Sign: <strong>DX7NTC</strong></Text>
                          <Text style={styles.mockGridCell}>Form No: <strong>{app.applicationNumber}</strong></Text>
                        </View>
                        <View style={styles.mockSign}>
                          <View style={styles.mockSignLine} />
                          <Text style={styles.mockSignName}>{app.issuingOfficer || 'REGIONAL DIRECTOR'}</Text>
                        </View>
                      </View>
                    </View>
                  ) : (
                    /* Accountable Form Precision Overlay Mock Preview */
                    <View style={styles.accountableSheetContent}>
                      {showGhostWatermark && (
                        <View style={styles.ghostLayer}>
                          <Text style={styles.ghostWatermarkText}>[PRE-PRINTED OFFICIAL GOVERNMENT STATIONERY]</Text>
                          <View style={[styles.ghostBox, { top: '18%', left: '12%', width: '76%', height: '10%' }]}>
                            <Text style={styles.ghostBoxLabel}>NAME OF LICENSEE / GRANTEE</Text>
                          </View>
                          <View style={[styles.ghostBox, { top: '30%', left: '12%', width: '35%', height: '8%' }]}>
                            <Text style={styles.ghostBoxLabel}>CALL SIGN</Text>
                          </View>
                          <View style={[styles.ghostBox, { top: '30%', left: '52%', width: '36%', height: '8%' }]}>
                            <Text style={styles.ghostBoxLabel}>CLASS OF STATION</Text>
                          </View>
                          <View style={[styles.ghostBox, { top: '75%', left: '55%', width: '35%', height: '12%' }]}>
                            <Text style={styles.ghostBoxLabel}>SIGNATURE OF ISSUING OFFICER</Text>
                          </View>
                        </View>
                      )}

                      {/* Calibrated Dynamic Text Elements */}
                      <View style={[styles.overlayItem, { top: '6%', right: '7%' }]}>
                        <Lucide name="grid" size={14} color="#000000" />
                      </View>
                      <View style={[styles.overlayItem, { top: '19%', left: '14%' }]}>
                        <Text style={styles.overlayTextBold}>{app.applicant}</Text>
                      </View>
                      <View style={[styles.overlayItem, { top: '31%', left: '14%' }]}>
                        <Text style={[styles.overlayTextBold, { fontFamily: 'monospace' }]}>DX7NTC</Text>
                      </View>
                      <View style={[styles.overlayItem, { top: '31%', left: '54%' }]}>
                        <Text style={styles.overlayText}>Land Mobile Station</Text>
                      </View>
                      <View style={[styles.overlayItem, { top: '78%', left: '58%' }]}>
                        <Text style={styles.overlayTextSign}>{app.issuingOfficer || 'REGIONAL DIRECTOR'}</Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>

          {/* Modal Footer Actions */}
          <View
            style={[
              styles.modalFooter,
              { borderTopColor: isDark ? colors.neutral[800] : colors.neutral[200] },
            ]}
          >
            <View style={styles.footerLeftActions}>
              <TouchableOpacity
                onPress={handleSavePreferences}
                style={[styles.savePrefBtn, { borderColor: isDark ? colors.neutral[700] : colors.neutral[300] }]}
              >
                <Lucide name="save" size={14} color={isDark ? colors.neutral[300] : colors.neutral[700]} />
                <Text style={[styles.savePrefBtnText, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>
                  Save Calibration Defaults
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footerRightActions}>
              <TouchableOpacity
                onPress={onClose}
                style={[styles.cancelBtn, { borderColor: isDark ? colors.neutral[700] : colors.neutral[300] }]}
              >
                <Text style={[styles.cancelBtnText, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
                  Close
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handlePrint}
                style={[styles.printBtn, { backgroundColor: outputMode === 'accountable_form' ? '#D97706' : colors.brand[600] }]}
              >
                <Lucide name="printer" size={16} color="#FFFFFF" />
                <Text style={styles.printBtnText}>
                  {outputMode === 'plain_paper'
                    ? 'Print Full Document'
                    : outputMode === 'accountable_form'
                      ? 'Print Accountable Form Overlay'
                      : 'Print Alignment Test Sheet'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING[16],
  },
  modalContainer: {
    width: '100%',
    maxWidth: 1060,
    maxHeight: '92%',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    overflow: 'hidden',
    ...SHADOWS.modal,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING[20],
    paddingVertical: SPACING[16],
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[12],
    flex: 1,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 17,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  modalSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    padding: SPACING[8],
  },
  modalBody: {
    flex: 1,
  },
  desktopBody: {
    flexDirection: 'row',
    minHeight: 520,
  },
  mobileBody: {
    flexDirection: 'column',
  },
  configColumn: {
    flex: 1.1,
    padding: SPACING[20],
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
  },
  previewColumn: {
    flex: 1.2,
    padding: SPACING[16],
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlGroup: {
    marginBottom: SPACING[20],
  },
  sectionHeading: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11.5,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.6,
    marginBottom: SPACING[10],
  },
  controlSubtext: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11.5,
    marginTop: 3,
    marginBottom: SPACING[8],
  },
  modeCardsWrap: {
    gap: SPACING[10],
  },
  modeCard: {
    padding: SPACING[12],
    borderRadius: RADIUS.card,
    borderWidth: 1.5,
  },
  modeCardActive: {
    backgroundColor: '#FAF5FF',
  },
  modeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
    marginBottom: 4,
  },
  modeCardTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13.5,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  modeCardDesc: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11.5,
    lineHeight: 16,
  },
  templateOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING[10],
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  templateOptionRowSelected: {
    backgroundColor: '#FFFBEB',
  },
  templateOptionCode: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12.5,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  templateOptionMeta: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10.5,
    marginTop: 2,
  },
  paperSizePillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[8],
  },
  paperPill: {
    paddingVertical: SPACING[8],
    paddingHorizontal: SPACING[12],
    borderRadius: RADIUS.sm,
    borderWidth: 1.2,
    alignItems: 'center',
    minWidth: 70,
  },
  paperPillActive: {
    backgroundColor: '#EFF6FF',
  },
  paperPillText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11.5,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  paperPillTextActive: {
    color: '#1D4ED8',
  },
  paperPillSub: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 9,
    marginTop: 2,
  },
  customDimensionsRow: {
    flexDirection: 'row',
    gap: SPACING[12],
    marginTop: SPACING[10],
  },
  dimLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: '#64748B',
    marginBottom: 3,
  },
  dimInput: {
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING[10],
    paddingVertical: SPACING[6],
    fontSize: 12,
  },
  orientationRow: {
    flexDirection: 'row',
    gap: SPACING[10],
    marginTop: SPACING[12],
  },
  orientationBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: SPACING[8],
    borderRadius: RADIUS.sm,
    borderWidth: 1.2,
  },
  orientationBtnActive: {
    backgroundColor: '#EFF6FF',
  },
  orientationBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: '#64748B',
  },
  calibrationHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING[4],
  },
  calibrationControls: {
    gap: SPACING[8],
    marginTop: SPACING[6],
  },
  nudgeControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nudgeLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
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
  ghostToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: SPACING[10],
  },
  ghostToggleText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11.5,
  },
  previewHeaderBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING[10],
  },
  previewHeaderTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  previewBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  previewBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#4338CA',
  },
  previewSheetFrame: {
    width: '100%',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING[8],
  },
  previewSheet: {
    width: '92%',
    maxWidth: 380,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    overflow: 'hidden',
    position: 'relative',
    ...SHADOWS.card,
  },
  plainSheetContent: {
    flex: 1,
    padding: 10,
  },
  plainSheetBorder: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#1E3A8A',
    padding: 8,
    justifyContent: 'space-between',
  },
  mockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#1E3A8A',
    paddingBottom: 4,
  },
  mockAgency: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  mockDept: {
    fontSize: 5.5,
    color: '#475569',
  },
  mockTitle: {
    fontSize: 8.5,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginTop: 2,
  },
  mockLicensee: {
    backgroundColor: '#F8FAFC',
    padding: 4,
    marginVertical: 4,
  },
  mockLicenseeName: {
    fontSize: 7.5,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  mockLicenseeAddr: {
    fontSize: 6,
    color: '#475569',
  },
  mockGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 3,
    borderWidth: 0.5,
    borderColor: '#CBD5E1',
  },
  mockGridCell: {
    fontSize: 6,
    color: '#334155',
  },
  mockSign: {
    alignItems: 'flex-end',
    marginTop: 4,
  },
  mockSignLine: {
    width: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    marginBottom: 2,
  },
  mockSignName: {
    fontSize: 6,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  accountableSheetContent: {
    flex: 1,
    position: 'relative',
  },
  ghostLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  ghostWatermarkText: {
    position: 'absolute',
    top: 8,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 6.5,
    color: '#CBD5E1',
    fontWeight: 'bold',
  },
  ghostBox: {
    position: 'absolute',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#FCD34D',
    backgroundColor: 'rgba(254, 243, 199, 0.4)',
    padding: 2,
  },
  ghostBoxLabel: {
    fontSize: 4.5,
    color: '#B45309',
    fontWeight: 'bold',
  },
  overlayItem: {
    position: 'absolute',
  },
  overlayText: {
    fontSize: 7,
    color: '#000000',
  },
  overlayTextBold: {
    fontSize: 7.5,
    fontWeight: 'bold',
    color: '#000000',
  },
  overlayTextSign: {
    fontSize: 6.5,
    fontWeight: 'bold',
    color: '#000000',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING[20],
    paddingVertical: SPACING[12],
    borderTopWidth: 1,
  },
  footerLeftActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  savePrefBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: SPACING[8],
    paddingHorizontal: SPACING[12],
    borderRadius: RADIUS.button,
    borderWidth: 1,
  },
  savePrefBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  footerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[10],
  },
  cancelBtn: {
    paddingVertical: SPACING[8],
    paddingHorizontal: SPACING[16],
    borderRadius: RADIUS.button,
    borderWidth: 1,
  },
  cancelBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  printBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: SPACING[8],
    paddingHorizontal: SPACING[16],
    borderRadius: RADIUS.button,
    ...SHADOWS.card,
  },
  printBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#FFFFFF',
  },
});
