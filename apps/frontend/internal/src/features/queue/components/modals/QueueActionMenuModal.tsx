import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  Pressable,
  TouchableWithoutFeedback,
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
} from '@edge/ui';
import { ApplicationData } from '../../../../types/application';

interface QueueActionMenuModalProps {
  visible: boolean;
  app: ApplicationData;
  onClose: () => void;
  onGenerateSoa: () => void;
  onPrintSoa: () => void;
  onPrintOp: () => void;
  onPreviewReport: (docType: 'soa' | 'op' | 'summary') => void;
}

export function QueueActionMenuModal({
  visible,
  app,
  onClose,
  onGenerateSoa,
  onPrintSoa,
  onPrintOp,
  onPreviewReport,
}: QueueActionMenuModalProps) {
  const { colors, isDark } = useTheme();

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.menuCard,
                {
                  backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
                  borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
                },
              ]}
            >
              {/* Menu Header */}
              <View
                style={[
                  styles.menuHeader,
                  { borderBottomColor: isDark ? colors.neutral[700] : colors.neutral[100] },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.menuTitle,
                      { color: isDark ? colors.neutral[100] : colors.neutral[900] },
                    ]}
                  >
                    Application Actions
                  </Text>
                  <Text
                    style={[
                      styles.menuSubtitle,
                      { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                    ]}
                  >
                    Ref #{app.referenceNumber}
                  </Text>
                </View>
                <Pressable onPress={onClose} hitSlop={6}>
                  <Lucide
                    name="x"
                    size={16}
                    color={isDark ? colors.neutral[400] : colors.neutral[500]}
                  />
                </Pressable>
              </View>

              {/* Action List */}
              <View style={styles.actionList}>
                {/* 1. Generate SOA */}
                <Pressable
                  style={({ pressed }) => [
                    styles.actionItem,
                    pressed && {
                      backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100],
                    },
                  ]}
                  onPress={() => {
                    onClose();
                    onGenerateSoa();
                  }}
                >
                  <View
                    style={[
                      styles.iconCircle,
                      { backgroundColor: isDark ? colors.brand[900] : colors.brand[50] },
                    ]}
                  >
                    <Lucide
                      name="file-plus"
                      size={16}
                      color={isDark ? colors.brand[400] : colors.brand[600]}
                    />
                  </View>
                  <View style={styles.actionTextWrap}>
                    <Text
                      style={[
                        styles.actionName,
                        { color: isDark ? colors.neutral[100] : colors.neutral[900] },
                      ]}
                    >
                      Generate Statement of Account
                    </Text>
                    <Text
                      style={[
                        styles.actionDesc,
                        { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                      ]}
                    >
                      Assess statutory charges, line items, and payment due date
                    </Text>
                  </View>
                </Pressable>

                {/* 2. Print SOA */}
                <Pressable
                  style={({ pressed }) => [
                    styles.actionItem,
                    pressed && {
                      backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100],
                    },
                  ]}
                  onPress={() => {
                    onClose();
                    onPrintSoa();
                  }}
                >
                  <View
                    style={[
                      styles.iconCircle,
                      { backgroundColor: isDark ? '#1e3a8a' : '#eff6ff' },
                    ]}
                  >
                    <Lucide
                      name="printer"
                      size={16}
                      color={isDark ? '#60a5fa' : '#2563eb'}
                    />
                  </View>
                  <View style={styles.actionTextWrap}>
                    <Text
                      style={[
                        styles.actionName,
                        { color: isDark ? colors.neutral[100] : colors.neutral[900] },
                      ]}
                    >
                      Print Statement of Account (SOA)
                    </Text>
                    <Text
                      style={[
                        styles.actionDesc,
                        { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                      ]}
                    >
                      Open official printable billing assessment document
                    </Text>
                  </View>
                </Pressable>

                {/* 3. Print Order of Payment */}
                <Pressable
                  style={({ pressed }) => [
                    styles.actionItem,
                    pressed && {
                      backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100],
                    },
                  ]}
                  onPress={() => {
                    onClose();
                    onPrintOp();
                  }}
                >
                  <View
                    style={[
                      styles.iconCircle,
                      { backgroundColor: isDark ? '#064e3b' : '#ecfdf5' },
                    ]}
                  >
                    <Lucide
                      name="credit-card"
                      size={16}
                      color={isDark ? '#34d399' : '#059669'}
                    />
                  </View>
                  <View style={styles.actionTextWrap}>
                    <Text
                      style={[
                        styles.actionName,
                        { color: isDark ? colors.neutral[100] : colors.neutral[900] },
                      ]}
                    >
                      Print Order of Payment (OP)
                    </Text>
                    <Text
                      style={[
                        styles.actionDesc,
                        { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                      ]}
                    >
                      Official cashier collection authorization slip
                    </Text>
                  </View>
                </Pressable>

                {/* Divider */}
                <View
                  style={[
                    styles.divider,
                    { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[200] },
                  ]}
                />

                {/* 4. Preview Report Modal */}
                <Pressable
                  style={({ pressed }) => [
                    styles.actionItem,
                    pressed && {
                      backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100],
                    },
                  ]}
                  onPress={() => {
                    onClose();
                    onPreviewReport('soa');
                  }}
                >
                  <View
                    style={[
                      styles.iconCircle,
                      { backgroundColor: isDark ? '#3730a3' : '#eef2ff' },
                    ]}
                  >
                    <Lucide
                      name="eye"
                      size={16}
                      color={isDark ? '#818cf8' : '#4f46e5'}
                    />
                  </View>
                  <View style={styles.actionTextWrap}>
                    <Text
                      style={[
                        styles.actionName,
                        { color: isDark ? colors.neutral[100] : colors.neutral[900] },
                      ]}
                    >
                      Preview SOA &amp; OP Report
                    </Text>
                    <Text
                      style={[
                        styles.actionDesc,
                        { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                      ]}
                    >
                      Interactive preview with SOA and Order of Payment views
                    </Text>
                  </View>
                </Pressable>

                {/* 5. Application Dossier */}
                <Pressable
                  style={({ pressed }) => [
                    styles.actionItem,
                    pressed && {
                      backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100],
                    },
                  ]}
                  onPress={() => {
                    onClose();
                    onPreviewReport('summary');
                  }}
                >
                  <View
                    style={[
                      styles.iconCircle,
                      { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] },
                    ]}
                  >
                    <Lucide
                      name="layout"
                      size={16}
                      color={isDark ? colors.neutral[300] : colors.neutral[700]}
                    />
                  </View>
                  <View style={styles.actionTextWrap}>
                    <Text
                      style={[
                        styles.actionName,
                        { color: isDark ? colors.neutral[100] : colors.neutral[900] },
                      ]}
                    >
                      Application Dossier &amp; Audit Trail
                    </Text>
                    <Text
                      style={[
                        styles.actionDesc,
                        { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                      ]}
                    >
                      Full application summary with requirements and history
                    </Text>
                  </View>
                </Pressable>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING[16],
  },
  menuCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: RADIUS.dialog,
    borderWidth: 1,
    overflow: 'hidden',
    ...SHADOWS.modal,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[16],
    paddingVertical: SPACING[12],
    borderBottomWidth: 1,
  },
  menuTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  menuSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    marginTop: 1,
  },
  actionList: {
    padding: SPACING[8],
    gap: 4,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[12],
    padding: SPACING[10],
    borderRadius: RADIUS.sm,
    ...Platform.select({
      web: { cursor: 'pointer' } as object,
    }),
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTextWrap: {
    flex: 1,
  },
  actionName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  actionDesc: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
});
