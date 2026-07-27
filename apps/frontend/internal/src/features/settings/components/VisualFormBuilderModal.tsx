import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Modal,
  ScrollView,
  useWindowDimensions,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
} from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, Icon as Lucide } from '@edge/ui';

export interface CanvasElement {
  id: string;
  type: 'data-field' | 'image' | 'label' | 'line' | 'table';
  label: string;
  key?: string;
  x: number;
  y: number;
}

interface VisualFormBuilderModalProps {
  visible: boolean;
  formTitle: string;
  onClose: () => void;
  onSaveLayout: (elements: CanvasElement[]) => void;
}

const OFFICIAL_ELEMENTS = [
  { id: 'el-img', type: 'image' as const, label: 'Upload Image', icon: 'image' },
  { id: 'el-label', type: 'label' as const, label: 'Static Label', icon: 'type' },
  { id: 'el-line', type: 'line' as const, label: 'Horizontal Line', icon: 'minus' },
  { id: 'el-table', type: 'table' as const, label: 'Data Table', icon: 'table' },
];

const NTC_DATA_SOURCES = [
  { id: 'ds-1', label: 'Full Name', key: '{{basic_info.full_name}}' },
  { id: 'ds-2', label: 'Reference No.', key: '{{app.ref_no}}' },
  { id: 'ds-3', label: 'Call Sign', key: '{{radio.call_sign}}' },
  { id: 'ds-4', label: 'Expiry Date', key: '{{app.expiry}}' },
  { id: 'ds-5', label: 'Application Date', key: '{{application_date}}' },
  { id: 'ds-6', label: 'Office Region', key: '{{office.region}}' },
];

export function VisualFormBuilderModal({
  visible,
  formTitle,
  onClose,
  onSaveLayout,
}: VisualFormBuilderModalProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 900;

  const [elements, setElements] = useState<CanvasElement[]>([
    {
      id: 'init-1',
      type: 'data-field',
      label: 'Full Name',
      key: '{{basic_info.full_name}}',
      x: 40,
      y: 50,
    },
    {
      id: 'init-2',
      type: 'data-field',
      label: 'Reference No.',
      key: '{{app.ref_no}}',
      x: 40,
      y: 130,
    },
    {
      id: 'init-3',
      type: 'data-field',
      label: 'Call Sign',
      key: '{{radio.call_sign}}',
      x: 40,
      y: 240,
    },
  ]);

  const [selectedId, setSelectedId] = useState<string | null>('init-1');

  if (!visible) return null;

  const handleAddDataSource = (ds: typeof NTC_DATA_SOURCES[0]) => {
    const newEl: CanvasElement = {
      id: `el-${Date.now()}`,
      type: 'data-field',
      label: ds.label,
      key: ds.key,
      x: 240,
      y: 50 + (elements.length % 5) * 60,
    };
    setElements((prev) => [...prev, newEl]);
    setSelectedId(newEl.id);
  };

  const handleAddOfficialElement = (oe: typeof OFFICIAL_ELEMENTS[0]) => {
    const newEl: CanvasElement = {
      id: `el-${Date.now()}`,
      type: oe.type,
      label: oe.label,
      x: 240,
      y: 80 + (elements.length % 5) * 60,
    };
    setElements((prev) => [...prev, newEl]);
    setSelectedId(newEl.id);
  };

  const handleDeleteSelected = () => {
    if (!selectedId) return;
    setElements((prev) => prev.filter((el) => el.id !== selectedId));
    setSelectedId(null);
  };

  const handleClear = () => {
    setElements([]);
    setSelectedId(null);
  };

  const handleSave = () => {
    onSaveLayout(elements);
    onClose();
  };

  // Helper for manual drag positioning inside paper canvas
  const handleDrag = (id: string, dx: number, dy: number) => {
    setElements((prev) =>
      prev.map((el) => {
        if (el.id === id) {
          const newX = Math.max(10, Math.min(480, el.x + dx));
          const newY = Math.max(10, Math.min(680, el.y + dy));
          return { ...el, x: newX, y: newY };
        }
        return el;
      })
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Header Bar */}
          <View style={styles.headerBar}>
            <View style={styles.headerLeft}>
              <Text style={styles.topBadgeText}>VISUAL FORM BUILDER</Text>
              <Text style={styles.formTitleText}>{formTitle || 'sample'}</Text>
              <Text style={styles.headerSubtitle}>
                Add fields, arrange elements, upload logo, then save the layout.
              </Text>
            </View>

            <View style={styles.headerRightActions}>
              <Pressable style={styles.secondaryBtn} onPress={handleDeleteSelected}>
                <Text style={styles.secondaryBtnText}>Delete Element</Text>
              </Pressable>

              <Pressable style={styles.secondaryBtn} onPress={handleClear}>
                <Text style={styles.secondaryBtnText}>Clear</Text>
              </Pressable>

              <Pressable style={styles.saveLayoutBtn} onPress={handleSave}>
                <Lucide name="save" size={16} color={COLORS.neutral.white} />
                <Text style={styles.saveLayoutBtnText}>Save Layout</Text>
              </Pressable>

              <Pressable style={styles.closeBtn} onPress={onClose}>
                <Lucide name="x" size={20} color="#94A3B8" />
              </Pressable>
            </View>
          </View>

          {/* Builder Split Workspace */}
          <View style={[styles.workspaceContainer, isMobile && styles.workspaceMobile]}>
            {/* Left Palette Sidebar */}
            <ScrollView style={styles.paletteSidebar} contentContainerStyle={styles.paletteContent}>
              {/* Official Elements Section */}
              <View style={styles.paletteSection}>
                <Text style={styles.paletteSectionTitle}>OFFICIAL ELEMENTS</Text>
                <View style={styles.elementsGrid}>
                  {OFFICIAL_ELEMENTS.map((oe) => (
                    <Pressable
                      key={oe.id}
                      style={styles.elementCard}
                      onPress={() => handleAddOfficialElement(oe)}
                    >
                      <Lucide name={oe.icon as any} size={20} color="#334155" />
                      <Text style={styles.elementCardText}>{oe.label}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* NTC Data Sources Section */}
              <View style={styles.paletteSection}>
                <Text style={styles.paletteSectionTitle}>NTC DATA SOURCES</Text>
                <View style={styles.dataSourcesList}>
                  {NTC_DATA_SOURCES.map((ds) => (
                    <Pressable
                      key={ds.id}
                      style={styles.dataSourceCard}
                      onPress={() => handleAddDataSource(ds)}
                    >
                      <View style={styles.dataSourceLeft}>
                        <Text style={styles.dataSourceLabel}>{ds.label}</Text>
                        <Text style={styles.dataSourceKey}>{ds.key}</Text>
                      </View>
                      <View style={styles.plusIconBox}>
                        <Lucide name="plus" size={16} color="#94A3B8" />
                      </View>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Guidance Callout Banner */}
              <View style={styles.guidanceCallout}>
                <Lucide name="move" size={16} color="#4F46E5" />
                <Text style={styles.guidanceText}>
                  Click an item to add it. Drag inside the paper. Select an element then delete if needed.
                </Text>
              </View>
            </ScrollView>

            {/* Right Interactive Paper Canvas */}
            <View style={styles.canvasContainer}>
              <View style={styles.paperSheet}>
                {elements.map((el) => {
                  const isSelected = selectedId === el.id;

                  return (
                    <DraggableCanvasElement
                      key={el.id}
                      element={el}
                      isSelected={isSelected}
                      onSelect={() => setSelectedId(el.id)}
                      onDrag={(dx, dy) => handleDrag(el.id, dx, dy)}
                    />
                  );
                })}
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

interface DraggableCanvasElementProps {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: () => void;
  onDrag: (dx: number, dy: number) => void;
}

function DraggableCanvasElement({
  element,
  isSelected,
  onSelect,
  onDrag,
}: DraggableCanvasElementProps) {
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      onSelect();
    },
    onPanResponderMove: (_: GestureResponderEvent, gestureState: PanResponderGestureState) => {
      onDrag(gestureState.dx, gestureState.dy);
    },
  });

  return (
    <View
      {...panResponder.panHandlers}
      style={[
        styles.canvasElementItem,
        { left: element.x, top: element.y },
        isSelected && styles.canvasElementSelected,
      ]}
    >
      <Text style={styles.elementTitleText}>{element.label}</Text>
      {element.key && <Text style={styles.elementKeyText}>{element.key}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING[16],
  },
  modalCard: {
    width: '100%',
    maxWidth: 1280,
    height: '92%',
    backgroundColor: COLORS.neutral.white,
    borderRadius: 20,
    overflow: 'hidden',
    ...SHADOWS.modal,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[24],
    paddingVertical: SPACING[16],
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: COLORS.neutral.white,
  },
  headerLeft: {
    gap: 2,
  },
  topBadgeText: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
    color: '#6366F1',
    letterSpacing: 0.5,
  },
  formTitleText: {
    fontSize: 20,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: '#64748B',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[12],
  },
  secondaryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  secondaryBtnText: {
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
    color: '#334155',
  },
  saveLayoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#4F46E5',
  },
  saveLayoutBtnText: {
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
    color: COLORS.neutral.white,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.circle,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Workspace Split
  workspaceContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  workspaceMobile: {
    flexDirection: 'column',
  },

  // Left Palette Sidebar
  paletteSidebar: {
    width: 380,
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    backgroundColor: COLORS.neutral.white,
  },
  paletteContent: {
    padding: SPACING[20],
    gap: SPACING[24],
  },
  paletteSection: {
    gap: 12,
  },
  paletteSectionTitle: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  elementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  elementCard: {
    width: '47%',
    height: 64,
    backgroundColor: COLORS.neutral.white,
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  elementCardText: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
    color: '#334155',
  },

  // Data sources list
  dataSourcesList: {
    gap: 10,
  },
  dataSourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.neutral.white,
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dataSourceLeft: {
    gap: 2,
  },
  dataSourceLabel: {
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
    color: '#0F172A',
  },
  dataSourceKey: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: '#94A3B8',
  },
  plusIconBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Guidance callout
  guidanceCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 10,
    borderColor: '#BFDBFE',
    borderWidth: 1,
  },
  guidanceText: {
    flex: 1,
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: '#1E40AF',
    fontWeight: '500',
    lineHeight: 16,
  },

  // Right Paper Canvas Container
  canvasContainer: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING[20],
  },
  paperSheet: {
    width: 560,
    height: 760,
    backgroundColor: COLORS.neutral.white,
    borderRadius: 8,
    position: 'relative',
    borderColor: '#CBD5E1',
    borderWidth: 1,
    ...SHADOWS.card,
  },

  // Canvas element box
  canvasElementItem: {
    position: 'absolute',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  canvasElementSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
  },
  elementTitleText: {
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
    color: '#0F172A',
  },
  elementKeyText: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: '#64748B',
    marginTop: 2,
  },
});
