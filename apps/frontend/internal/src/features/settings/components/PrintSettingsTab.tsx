import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
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
import { useAuthContext } from '../../auth/context/AuthContext';
import {
  PaperSize,
  PrintOutputMode,
  PageOrientation,
  PAPER_DIMENSIONS,
  ACCOUNTABLE_FORM_TEMPLATES,
  AccountableFormTemplate,
  REPORT_PRINT_PROFILES,
  ReportPrintProfile,
  loadUserReportPrintConfig,
  saveUserReportPrintConfig,
} from '../../queue/types/documentPrintTypes';
import {
  generateAlignmentTestSheetHtml,
  openDocumentPrintWindow,
} from '../../queue/utils/documentPrintGenerator';

export function PrintSettingsTab() {
  const { colors, isDark } = useTheme();
  const { user, clerkUser } = useAuthContext();
  const activeUserId = user?.id ?? clerkUser?.id ?? null;
  const activeUserName = user?.name || clerkUser?.fullName || user?.email || 'Officer';

  const [selectedProfileId, setSelectedProfileId] = useState<string>(REPORT_PRINT_PROFILES[0]?.id ?? 'AF-51');
  const activeProfile = useMemo<ReportPrintProfile>(() => {
    return REPORT_PRINT_PROFILES.find((p) => p.id === selectedProfileId) ?? REPORT_PRINT_PROFILES[0] ?? {
      id: 'AF-51',
      name: 'Official Receipt',
      category: 'Cashier',
      description: 'Collecting Officer receipts',
      defaultPaperSize: 'letter',
      defaultOutputMode: 'accountable_form',
      defaultOrientation: 'portrait',
    };
  }, [selectedProfileId]);

  const [paperSize, setPaperSize] = useState<PaperSize>(activeProfile.defaultPaperSize);
  const [outputMode, setOutputMode] = useState<PrintOutputMode>(activeProfile.defaultOutputMode);
  const [orientation, setOrientation] = useState<PageOrientation>(activeProfile.defaultOrientation);
  const [customWidthMm, setCustomWidthMm] = useState<string>('215.9');
  const [customHeightMm, setCustomHeightMm] = useState<string>('279.4');
  const [offsetXmm, setOffsetXmm] = useState<number>(0);
  const [offsetYmm, setOffsetYmm] = useState<number>(0);

  // Load saved configuration whenever selectedProfileId or activeUserId changes
  useEffect(() => {
    const saved = loadUserReportPrintConfig(selectedProfileId, activeUserId);
    if (saved) {
      if (saved.paperSize) setPaperSize(saved.paperSize);
      if (saved.outputMode) setOutputMode(saved.outputMode);
      if (saved.orientation) setOrientation(saved.orientation);
      if (typeof saved.customWidthMm === 'number') setCustomWidthMm(String(saved.customWidthMm));
      if (typeof saved.customHeightMm === 'number') setCustomHeightMm(String(saved.customHeightMm));
      if (typeof saved.calibration?.offsetXmm === 'number') setOffsetXmm(saved.calibration.offsetXmm);
      if (typeof saved.calibration?.offsetYmm === 'number') setOffsetYmm(saved.calibration.offsetYmm);
    } else {
      setPaperSize(activeProfile.defaultPaperSize);
      setOutputMode(activeProfile.defaultOutputMode);
      setOrientation(activeProfile.defaultOrientation);
      setCustomWidthMm(String(activeProfile.defaultCustomWidthMm ?? 215.9));
      setCustomHeightMm(String(activeProfile.defaultCustomHeightMm ?? 279.4));
      setOffsetXmm(0);
      setOffsetYmm(0);
    }
  }, [selectedProfileId, activeUserId, activeProfile]);

  const associatedTemplate = useMemo<AccountableFormTemplate | undefined>(() => {
    if (activeProfile.associatedTemplateId) {
      return ACCOUNTABLE_FORM_TEMPLATES.find((t) => t.id === activeProfile.associatedTemplateId);
    }
    return undefined;
  }, [activeProfile.associatedTemplateId]);

  const handleSaveProfile = () => {
    const widthNum = parseFloat(customWidthMm);
    const heightNum = parseFloat(customHeightMm);

    saveUserReportPrintConfig(
      selectedProfileId,
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

    toast.success(`Print settings saved for ${activeProfile.name}!`);
  };

  const handleTestPrint = () => {
    const widthNum = parseFloat(customWidthMm);
    const heightNum = parseFloat(customHeightMm);

    const html = generateAlignmentTestSheetHtml(
      {
        paperSize,
        outputMode: 'alignment_test',
        orientation,
        customWidthMm: Number.isNaN(widthNum) ? undefined : widthNum,
        customHeightMm: Number.isNaN(heightNum) ? undefined : heightNum,
        calibration: {
          offsetXmm,
          offsetYmm,
          scalePercent: 100,
        },
      },
      associatedTemplate
    );
    openDocumentPrintWindow(html);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Banner */}
      <View
        style={[
          styles.headerCard,
          {
            backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50],
            borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
          },
        ]}
      >
        <View style={styles.headerLeft}>
          <View style={[styles.iconWrap, { backgroundColor: isDark ? colors.brand[900] : colors.brand[50] }]}>
            <Lucide name="printer" size={24} color={isDark ? colors.brand[400] : colors.brand[600]} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <Text style={[styles.headerTitle, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]}>
                Printing Sizes &amp; Accountable Forms Configuration
              </Text>
              <View
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: RADIUS.xs,
                  backgroundColor: isDark ? '#1E293B' : '#EFF6FF',
                  borderWidth: 1,
                  borderColor: isDark ? '#3B82F6' : '#93C5FD',
                }}
              >
                <Text style={{ fontSize: 10.5, fontWeight: '700', color: isDark ? '#93C5FD' : '#1D4ED8' }}>
                  User: {activeUserName}
                </Text>
              </View>
            </View>
            <Text style={[styles.headerSubtitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
              Customize paper stock sizes, output modes, and workstation printer tray calibration per report type and user workstation.
            </Text>
          </View>
        </View>

        <TouchableOpacity onPress={handleTestPrint} style={styles.testPrintBtn} activeOpacity={0.8}>
          <Lucide name="crosshair" size={16} color="#FFFFFF" />
          <Text style={styles.testPrintBtnText}>Test Alignment Sheet</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Selector Section */}
      <View
        style={[
          styles.profileSelectorCard,
          {
            backgroundColor: isDark ? colors.neutral[900] : COLORS.neutral.white,
            borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
          },
        ]}
      >
        <View style={styles.profileCardHeader}>
          <Lucide name="layers" size={17} color={isDark ? colors.brand[400] : colors.brand[600]} />
          <Text style={[styles.cardTitle, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]}>
            Select Report / Service to Configure
          </Text>
        </View>
        <Text style={[styles.cardDesc, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
          Each document type (e.g. Cashier Official Receipt, Radio Station License, Operator Certificate, SOA) retains its own independent paper size and printer tray offsets.
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.profilePillsContainer}>
          {REPORT_PRINT_PROFILES.map((profile) => {
            const isSelected = selectedProfileId === profile.id;
            const categoryBadgeColor =
              profile.category === 'Cashier' ? '#059669' :
              profile.category === 'Licensing' ? '#2563EB' :
              profile.category === 'Permits' ? '#7C3AED' :
              profile.category === 'Billing' ? '#D97706' : '#475569';

            return (
              <TouchableOpacity
                key={profile.id}
                onPress={() => setSelectedProfileId(profile.id)}
                style={[
                  styles.profilePill,
                  isSelected && styles.profilePillActive,
                  {
                    backgroundColor: isSelected
                      ? (isDark ? colors.brand[900] : '#EFF6FF')
                      : (isDark ? colors.neutral[800] : colors.neutral[50]),
                    borderColor: isSelected
                      ? (isDark ? colors.brand[400] : colors.brand[600])
                      : (isDark ? colors.neutral[700] : colors.neutral[200]),
                  },
                ]}
                activeOpacity={0.7}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <View
                    style={{
                      paddingHorizontal: 6,
                      paddingVertical: 1,
                      borderRadius: 4,
                      backgroundColor: `${categoryBadgeColor}18`,
                    }}
                  >
                    <Text style={{ fontSize: 9.5, fontWeight: '800', color: categoryBadgeColor }}>
                      {profile.category.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Text
                  style={[
                    styles.profilePillTitle,
                    isSelected && { color: isDark ? colors.brand[300] : colors.brand[700], fontWeight: '700' },
                    { color: isDark ? colors.neutral[200] : colors.neutral[800] },
                  ]}
                >
                  {profile.name}
                </Text>
                <Text
                  style={[
                    styles.profilePillDesc,
                    { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                  ]}
                  numberOfLines={1}
                >
                  {profile.description}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Grid Settings Layout */}
      <View style={styles.grid}>
        {/* Section 1: Default Paper Size */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: isDark ? colors.neutral[900] : COLORS.neutral.white,
              borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <Lucide name="file" size={18} color={colors.brand[600]} />
            <Text style={[styles.cardTitle, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]}>
              Paper Stock Dimensions for {activeProfile.name}
            </Text>
          </View>
          <Text style={[styles.cardDesc, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
            Choose the physical paper stock size or specify custom dimensions in millimeters.
          </Text>

          <View style={styles.pillsWrap}>
            {(['letter', 'a4', 'folio', 'legal', 'custom'] as PaperSize[]).map((sizeKey) => {
              const isSelected = paperSize === sizeKey;
              const dim = PAPER_DIMENSIONS[sizeKey];
              return (
                <TouchableOpacity
                  key={sizeKey}
                  onPress={() => setPaperSize(sizeKey)}
                  style={[
                    styles.sizePill,
                    isSelected && styles.sizePillActive,
                    {
                      backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50],
                      borderColor: isSelected ? colors.brand[600] : isDark ? colors.neutral[700] : colors.neutral[200],
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.sizePillTitle,
                      isSelected && { color: colors.brand[600] },
                      { color: isDark ? colors.neutral[200] : colors.neutral[800] },
                    ]}
                  >
                    {dim.name}
                  </Text>
                  <Text style={[styles.sizePillDesc, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                    {dim.description}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {paperSize === 'custom' && (
            <View style={styles.customDimBox}>
              <View style={styles.customDimCol}>
                <Text style={[styles.dimLabel, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>
                  Width (mm):
                </Text>
                <TextInput
                  value={customWidthMm}
                  onChangeText={setCustomWidthMm}
                  keyboardType="numeric"
                  placeholder="215.9"
                  style={[
                    styles.dimInput,
                    {
                      color: isDark ? colors.neutral[100] : colors.neutral[900],
                      backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50],
                      borderColor: isDark ? colors.neutral[700] : colors.neutral[300],
                    },
                  ]}
                />
              </View>
              <View style={styles.customDimCol}>
                <Text style={[styles.dimLabel, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>
                  Height (mm):
                </Text>
                <TextInput
                  value={customHeightMm}
                  onChangeText={setCustomHeightMm}
                  keyboardType="numeric"
                  placeholder="279.4"
                  style={[
                    styles.dimInput,
                    {
                      color: isDark ? colors.neutral[100] : colors.neutral[900],
                      backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50],
                      borderColor: isDark ? colors.neutral[700] : colors.neutral[300],
                    },
                  ]}
                />
              </View>
            </View>
          )}

          {/* Page Orientation */}
          <View style={{ marginTop: SPACING[16] }}>
            <Text style={[styles.dimLabel, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>
              Print Orientation:
            </Text>
            <View style={styles.orientationWrap}>
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
                <Lucide name="file" size={15} color={orientation === 'portrait' ? colors.brand[600] : colors.neutral[400]} />
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
                <Lucide name="layout" size={15} color={orientation === 'landscape' ? colors.brand[600] : colors.neutral[400]} />
                <Text style={[styles.orientationBtnText, orientation === 'landscape' && { color: colors.brand[600], fontWeight: '700' }]}>
                  Landscape
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Section 2: Default Output Mode */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: isDark ? colors.neutral[900] : COLORS.neutral.white,
              borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <Lucide name="layers" size={18} color="#D97706" />
            <Text style={[styles.cardTitle, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]}>
              Default Output Target Mode
            </Text>
          </View>
          <Text style={[styles.cardDesc, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
            Choose whether {activeProfile.name} prints as a full plain-paper statutory certificate or precision overlay on physical pre-printed stationery.
          </Text>

          <View style={styles.modeOptionGroup}>
            <TouchableOpacity
              onPress={() => setOutputMode('plain_paper')}
              style={[
                styles.modeRow,
                outputMode === 'plain_paper' && styles.modeRowActive,
                {
                  backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50],
                  borderColor: outputMode === 'plain_paper' ? colors.brand[600] : isDark ? colors.neutral[700] : colors.neutral[200],
                },
              ]}
              activeOpacity={0.8}
            >
              <Lucide name="file-text" size={18} color={outputMode === 'plain_paper' ? colors.brand[600] : colors.neutral[400]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.modeRowTitle, outputMode === 'plain_paper' && { color: colors.brand[600] }]}>
                  Plain Bond Paper (Full Statutory Document)
                </Text>
                <Text style={[styles.modeRowDesc, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                  Generates Republic seal watermark, NTC header, security double-borders, filled tables, and upper-right QR code.
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setOutputMode('accountable_form')}
              style={[
                styles.modeRow,
                outputMode === 'accountable_form' && styles.modeRowActive,
                {
                  backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50],
                  borderColor: outputMode === 'accountable_form' ? '#D97706' : isDark ? colors.neutral[700] : colors.neutral[200],
                },
              ]}
              activeOpacity={0.8}
            >
              <Lucide name="layers" size={18} color={outputMode === 'accountable_form' ? '#D97706' : colors.neutral[400]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.modeRowTitle, outputMode === 'accountable_form' && { color: '#D97706' }]}>
                  Pre-Printed Accountable Form (Precision Overlay)
                </Text>
                <Text style={[styles.modeRowDesc, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                  Suppresses background graphics and prints ONLY dynamic values (Name, Call Sign, Fees, OR #) directly onto designated stationery boxes.
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section 3: Physical Workstation Calibration */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: isDark ? colors.neutral[900] : COLORS.neutral.white,
              borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <Lucide name="sliders" size={18} color="#059669" />
            <Text style={[styles.cardTitle, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]}>
              Workstation Feeder Tray Calibration (Millimeters)
            </Text>
          </View>
          <Text style={[styles.cardDesc, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
            Fine-tune physical margin shifts so text lands accurately inside the printer tray feeder for {activeProfile.name}.
          </Text>

          <View style={styles.calibrationGrid}>
            <View style={styles.calibItem}>
              <Text style={[styles.calibLabel, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>
                Horizontal Shift (X Offset):
              </Text>
              <View style={styles.calibInputWrap}>
                <TouchableOpacity onPress={() => setOffsetXmm((x) => Math.round((x - 1) * 10) / 10)} style={styles.calibBtn}>
                  <Text style={styles.calibBtnText}>-1mm</Text>
                </TouchableOpacity>
                <View style={[styles.calibBox, { borderColor: isDark ? colors.neutral[700] : colors.neutral[300] }]}>
                  <Text style={[styles.calibText, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]}>
                    {offsetXmm > 0 ? `+${offsetXmm.toFixed(1)}` : offsetXmm.toFixed(1)} mm
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setOffsetXmm((x) => Math.round((x + 1) * 10) / 10)} style={styles.calibBtn}>
                  <Text style={styles.calibBtnText}>+1mm</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.calibItem}>
              <Text style={[styles.calibLabel, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>
                Vertical Shift (Y Offset):
              </Text>
              <View style={styles.calibInputWrap}>
                <TouchableOpacity onPress={() => setOffsetYmm((y) => Math.round((y - 1) * 10) / 10)} style={styles.calibBtn}>
                  <Text style={styles.calibBtnText}>-1mm</Text>
                </TouchableOpacity>
                <View style={[styles.calibBox, { borderColor: isDark ? colors.neutral[700] : colors.neutral[300] }]}>
                  <Text style={[styles.calibText, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]}>
                    {offsetYmm > 0 ? `+${offsetYmm.toFixed(1)}` : offsetYmm.toFixed(1)} mm
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setOffsetYmm((y) => Math.round((y + 1) * 10) / 10)} style={styles.calibBtn}>
                  <Text style={styles.calibBtnText}>+1mm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Section 4: Accountable Form Template Coordinates Inspector */}
        {associatedTemplate && (
          <View
            style={[
              styles.card,
              {
                backgroundColor: isDark ? colors.neutral[900] : COLORS.neutral.white,
                borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <Lucide name="map-pin" size={18} color="#7C3AED" />
              <Text style={[styles.cardTitle, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]}>
                Form Box Layout ({associatedTemplate.code})
              </Text>
            </View>
            <Text style={[styles.cardDesc, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
              {associatedTemplate.title} — {associatedTemplate.fields.length} dynamic field coordinates mapped.
            </Text>

            <View style={styles.coordTable}>
              <View style={[styles.coordHeader, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
                <Text style={[styles.coordCell, { flex: 1.5, fontWeight: 'bold' }]}>Field Name</Text>
                <Text style={[styles.coordCell, { flex: 1, fontWeight: 'bold' }]}>Top (Y)</Text>
                <Text style={[styles.coordCell, { flex: 1, fontWeight: 'bold' }]}>Left (X)</Text>
                <Text style={[styles.coordCell, { flex: 1, fontWeight: 'bold' }]}>Width</Text>
                <Text style={[styles.coordCell, { flex: 1, fontWeight: 'bold' }]}>Font</Text>
              </View>

              {associatedTemplate.fields.map((f) => (
                <View
                  key={f.id}
                  style={[
                    styles.coordRow,
                    { borderBottomColor: isDark ? colors.neutral[800] : colors.neutral[200] },
                  ]}
                >
                  <Text style={[styles.coordCell, { flex: 1.5, color: isDark ? colors.neutral[200] : colors.neutral[800], fontWeight: '600' }]}>
                    {f.label}
                  </Text>
                  <Text style={[styles.coordCell, { flex: 1, color: isDark ? colors.neutral[400] : colors.neutral[600], fontFamily: 'monospace' }]}>
                    {f.topMm + offsetYmm} mm
                  </Text>
                  <Text style={[styles.coordCell, { flex: 1, color: isDark ? colors.neutral[400] : colors.neutral[600], fontFamily: 'monospace' }]}>
                    {f.leftMm + offsetXmm} mm
                  </Text>
                  <Text style={[styles.coordCell, { flex: 1, color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
                    {f.widthMm ? `${f.widthMm}mm` : 'Auto'}
                  </Text>
                  <Text style={[styles.coordCell, { flex: 1, color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
                    {f.fontSizePt ?? 10}pt {f.fontWeight ?? ''}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Save Button */}
      <View style={styles.saveButtonBar}>
        <TouchableOpacity
          onPress={handleSaveProfile}
          style={[styles.saveBtn, { backgroundColor: colors.brand[600] }]}
          activeOpacity={0.8}
        >
          <Lucide name="save" size={16} color="#FFFFFF" />
          <Text style={styles.saveBtnText}>
            Save Configuration for {activeProfile.name}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING[20],
  },
  headerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING[16],
    borderRadius: RADIUS.card,
    borderWidth: 1,
    marginBottom: SPACING[20],
    gap: SPACING[16],
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[12],
    flex: 1,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  headerSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  testPrintBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0284C7',
    paddingVertical: SPACING[8],
    paddingHorizontal: SPACING[16],
    borderRadius: RADIUS.button,
    ...SHADOWS.card,
  },
  testPrintBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12.5,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: '#FFFFFF',
  },
  profileSelectorCard: {
    padding: SPACING[16],
    borderRadius: RADIUS.card,
    borderWidth: 1,
    marginBottom: SPACING[20],
    ...SHADOWS.card,
  },
  profileCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
    marginBottom: 4,
  },
  profilePillsContainer: {
    flexDirection: 'row',
    gap: SPACING[10],
    paddingVertical: SPACING[10],
  },
  profilePill: {
    padding: SPACING[12],
    borderRadius: RADIUS.card,
    borderWidth: 1.5,
    minWidth: 190,
    maxWidth: 240,
  },
  profilePillActive: {
    borderWidth: 2,
  },
  profilePillTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: 2,
  },
  profilePillDesc: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    lineHeight: 13,
  },
  grid: {
    gap: SPACING[16],
  },
  card: {
    padding: SPACING[16],
    borderRadius: RADIUS.card,
    borderWidth: 1,
    ...SHADOWS.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
    marginBottom: 4,
  },
  cardTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  cardDesc: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11.5,
    marginBottom: SPACING[12],
  },
  pillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[8],
  },
  sizePill: {
    paddingVertical: SPACING[10],
    paddingHorizontal: SPACING[16],
    borderRadius: RADIUS.card,
    borderWidth: 1.5,
    minWidth: 140,
  },
  sizePillActive: {
    backgroundColor: '#FAF5FF',
  },
  sizePillTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12.5,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  sizePillDesc: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    marginTop: 2,
  },
  customDimBox: {
    flexDirection: 'row',
    gap: SPACING[16],
    marginTop: SPACING[12],
  },
  customDimCol: {
    flex: 1,
  },
  dimLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11.5,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: 4,
  },
  dimInput: {
    borderWidth: 1,
    borderRadius: RADIUS.card,
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[8],
    fontFamily: 'monospace',
    fontSize: 13,
  },
  orientationWrap: {
    flexDirection: 'row',
    gap: SPACING[10],
    marginTop: 4,
  },
  orientationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: SPACING[8],
    paddingHorizontal: SPACING[16],
    borderRadius: RADIUS.card,
    borderWidth: 1.5,
  },
  orientationBtnActive: {
    backgroundColor: '#EFF6FF',
  },
  orientationBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
  },
  modeOptionGroup: {
    gap: SPACING[10],
  },
  modeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING[12],
    padding: SPACING[12],
    borderRadius: RADIUS.card,
    borderWidth: 1.5,
  },
  modeRowActive: {
    borderWidth: 2,
  },
  modeRowTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: 2,
  },
  modeRowDesc: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    lineHeight: 15,
  },
  calibrationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[16],
  },
  calibItem: {
    flex: 1,
    minWidth: 200,
  },
  calibLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: 6,
  },
  calibInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  calibBtn: {
    backgroundColor: '#E2E8F0',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  calibBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11.5,
    fontWeight: 'bold',
    color: '#334155',
  },
  calibBox: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  calibText: {
    fontFamily: 'monospace',
    fontSize: 13,
    fontWeight: 'bold',
  },
  coordTable: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: RADIUS.card,
    overflow: 'hidden',
    marginTop: 4,
  },
  coordHeader: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  coordRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
  },
  coordCell: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
  },
  saveButtonBar: {
    marginTop: SPACING[20],
    marginBottom: SPACING[32],
    alignItems: 'flex-end',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: SPACING[10],
    paddingHorizontal: SPACING[20],
    borderRadius: RADIUS.button,
    ...SHADOWS.card,
  },
  saveBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13.5,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#FFFFFF',
  },
});
