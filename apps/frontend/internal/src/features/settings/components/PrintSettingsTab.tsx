import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
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
import {
  PaperSize,
  PrintOutputMode,
  PageOrientation,
  PAPER_DIMENSIONS,
  ACCOUNTABLE_FORM_TEMPLATES,
  AccountableFormTemplate,
} from '../../queue/types/documentPrintTypes';
import {
  generateAlignmentTestSheetHtml,
  openDocumentPrintWindow,
} from '../../queue/utils/documentPrintGenerator';

const STORAGE_CALIBRATION_KEY = 'ntc_edge_printer_calibration_prefs';

export function PrintSettingsTab() {
  const { colors, isDark } = useTheme();

  const [defaultPaperSize, setDefaultPaperSize] = useState<PaperSize>('letter');
  const [defaultOutputMode, setDefaultOutputMode] = useState<PrintOutputMode>('plain_paper');
  const [defaultOrientation, setDefaultOrientation] = useState<PageOrientation>('portrait');
  const [offsetXmm, setOffsetXmm] = useState<number>(0);
  const [offsetYmm, setOffsetYmm] = useState<number>(0);
  const [selectedTemplate, setSelectedTemplate] = useState<AccountableFormTemplate>(
    ACCOUNTABLE_FORM_TEMPLATES[0] ?? ACCOUNTABLE_FORM_TEMPLATES[0]
  );

  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_CALIBRATION_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (typeof parsed.offsetXmm === 'number') setOffsetXmm(parsed.offsetXmm);
          if (typeof parsed.offsetYmm === 'number') setOffsetYmm(parsed.offsetYmm);
          if (parsed.paperSize) setDefaultPaperSize(parsed.paperSize);
          if (parsed.outputMode) setDefaultOutputMode(parsed.outputMode);
        }
      } catch {
        // ignore
      }
    }
  }, []);

  const handleSave = () => {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(
          STORAGE_CALIBRATION_KEY,
          JSON.stringify({
            offsetXmm,
            offsetYmm,
            paperSize: defaultPaperSize,
            outputMode: defaultOutputMode,
            orientation: defaultOrientation,
            updatedAt: new Date().toISOString(),
          })
        );
        toast.success('Workstation print & accountable form settings saved.');
      } catch {
        toast.error('Failed to save printing settings.');
      }
    }
  };

  const handleTestPrint = () => {
    const html = generateAlignmentTestSheetHtml(
      {
        paperSize: defaultPaperSize,
        outputMode: 'alignment_test',
        orientation: defaultOrientation,
        calibration: {
          offsetXmm,
          offsetYmm,
          scalePercent: 100,
        },
      },
      selectedTemplate
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
            <Text style={[styles.headerTitle, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]}>
              Printing Sizes &amp; Accountable Forms Configuration
            </Text>
            <Text style={[styles.headerSubtitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
              Manage default paper stock sizes, output modes (Plain Bond vs Pre-printed Accountable Stationery), and workstation printer tray calibration offsets.
            </Text>
          </View>
        </View>

        <TouchableOpacity onPress={handleTestPrint} style={styles.testPrintBtn} activeOpacity={0.8}>
          <Lucide name="crosshair" size={16} color="#FFFFFF" />
          <Text style={styles.testPrintBtnText}>Test Alignment Sheet</Text>
        </TouchableOpacity>
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
              Default Agency Paper Sizes
            </Text>
          </View>
          <Text style={[styles.cardDesc, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
            Choose standard paper dimensions used by your office printers.
          </Text>

          <View style={styles.pillsWrap}>
            {(['letter', 'a4', 'folio', 'legal'] as PaperSize[]).map((sizeKey) => {
              const isSelected = defaultPaperSize === sizeKey;
              const dim = PAPER_DIMENSIONS[sizeKey];
              return (
                <TouchableOpacity
                  key={sizeKey}
                  onPress={() => setDefaultPaperSize(sizeKey)}
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
            Select whether documents print as full layouts or data overlays by default.
          </Text>

          <View style={styles.modeOptionGroup}>
            <TouchableOpacity
              onPress={() => setDefaultOutputMode('plain_paper')}
              style={[
                styles.modeRow,
                defaultOutputMode === 'plain_paper' && styles.modeRowActive,
                {
                  backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50],
                  borderColor: defaultOutputMode === 'plain_paper' ? colors.brand[600] : isDark ? colors.neutral[700] : colors.neutral[200],
                },
              ]}
              activeOpacity={0.8}
            >
              <Lucide name="file-text" size={18} color={defaultOutputMode === 'plain_paper' ? colors.brand[600] : colors.neutral[400]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.modeRowTitle, defaultOutputMode === 'plain_paper' && { color: colors.brand[600] }]}>
                  Plain Bond Paper (Full Document)
                </Text>
                <Text style={[styles.modeRowDesc, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                  Generates Republic of the Philippines seal, NTC letterhead, decorative borders, and filled data.
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setDefaultOutputMode('accountable_form')}
              style={[
                styles.modeRow,
                defaultOutputMode === 'accountable_form' && styles.modeRowActive,
                {
                  backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50],
                  borderColor: defaultOutputMode === 'accountable_form' ? '#D97706' : isDark ? colors.neutral[700] : colors.neutral[200],
                },
              ]}
              activeOpacity={0.8}
            >
              <Lucide name="layers" size={18} color={defaultOutputMode === 'accountable_form' ? '#D97706' : colors.neutral[400]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.modeRowTitle, defaultOutputMode === 'accountable_form' && { color: '#D97706' }]}>
                  Pre-Printed Accountable Form (Data Overlay)
                </Text>
                <Text style={[styles.modeRowDesc, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                  Suppresses static background graphics and prints ONLY dynamic fields on physical pre-printed forms.
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
            Fine-tune physical margin shifts so text lands accurately inside accountable form boxes on this specific computer.
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

        {/* Section 4: Accountable Form Templates Catalog */}
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
            <Lucide name="book-open" size={18} color="#7C3AED" />
            <Text style={[styles.cardTitle, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]}>
              Official Accountable Form Templates
            </Text>
          </View>
          <Text style={[styles.cardDesc, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
            Pre-calibrated coordinate configurations for official statutory forms.
          </Text>

          <View style={{ gap: 8 }}>
            {ACCOUNTABLE_FORM_TEMPLATES.map((tmpl) => {
              const isSelected = selectedTemplate.id === tmpl.id;
              return (
                <TouchableOpacity
                  key={tmpl.id}
                  onPress={() => setSelectedTemplate(tmpl)}
                  style={[
                    styles.tmplCard,
                    isSelected && styles.tmplCardActive,
                    {
                      backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50],
                      borderColor: isSelected ? '#7C3AED' : isDark ? colors.neutral[700] : colors.neutral[200],
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={[styles.tmplCode, { color: isSelected ? '#7C3AED' : isDark ? colors.neutral[200] : colors.neutral[800] }]}>
                        {tmpl.code}
                      </Text>
                      <View style={styles.tmplBadge}>
                        <Text style={styles.tmplBadgeText}>{tmpl.category}</Text>
                      </View>
                    </View>
                    <Text style={[styles.tmplTitle, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>
                      {tmpl.title}
                    </Text>
                    <Text style={[styles.tmplFieldsCount, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                      {tmpl.fields.length} calibrated field coordinates • {tmpl.dimensions.widthMm} x {tmpl.dimensions.heightMm} mm
                    </Text>
                  </View>
                  <Lucide name="chevron-right" size={16} color={isSelected ? '#7C3AED' : colors.neutral[400]} />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      {/* Save Button Bar */}
      <View style={styles.saveButtonBar}>
        <TouchableOpacity onPress={handleSave} style={[styles.saveBtn, { backgroundColor: colors.brand[600] }]} activeOpacity={0.8}>
          <Lucide name="check" size={16} color="#FFFFFF" />
          <Text style={styles.saveBtnText}>Save Printing &amp; Calibration Settings</Text>
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
    gap: 8,
    marginBottom: 4,
  },
  cardTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14.5,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  cardDesc: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    marginBottom: SPACING[12],
  },
  pillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[10],
  },
  sizePill: {
    flex: 1,
    minWidth: 140,
    padding: SPACING[10],
    borderRadius: RADIUS.sm,
    borderWidth: 1.2,
  },
  sizePillActive: {
    backgroundColor: '#EFF6FF',
  },
  sizePillTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12.5,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  sizePillDesc: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10.5,
    marginTop: 2,
  },
  modeOptionGroup: {
    gap: SPACING[10],
  },
  modeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[12],
    padding: SPACING[12],
    borderRadius: RADIUS.sm,
    borderWidth: 1.2,
  },
  modeRowActive: {
    backgroundColor: '#FAF5FF',
  },
  modeRowTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  modeRowDesc: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },
  calibrationGrid: {
    flexDirection: 'row',
    gap: SPACING[16],
  },
  calibItem: {
    flex: 1,
  },
  calibLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: SPACING[6],
  },
  calibInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  calibBtn: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  calibBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#334155',
  },
  calibBox: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 4,
    paddingVertical: 6,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  calibText: {
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tmplCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING[12],
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  tmplCardActive: {
    backgroundColor: '#FAF5FF',
  },
  tmplCode: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12.5,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  tmplBadge: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tmplBadgeText: {
    fontSize: 9.5,
    fontWeight: 'bold',
    color: '#6D28D9',
  },
  tmplTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    marginTop: 2,
  },
  tmplFieldsCount: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10.5,
    marginTop: 2,
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
