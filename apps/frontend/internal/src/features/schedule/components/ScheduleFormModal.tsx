import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  Pressable,
  Platform,
} from 'react-native';
import {
  COLORS,
  useTheme,
  SPACING,
  RADIUS,
  TYPOGRAPHY,
  SHADOWS,
  Icon as Lucide,
} from '@edge/ui';
import { ScheduleItemDto } from '@edge/api';
import { useScheduleForm } from '../hooks/useScheduleForm';
import { ScheduleForm } from '../forms/ScheduleForm';
import { ScheduleFormData } from '../schemas/scheduleSchema';

interface ScheduleFormModalProps {
  visible: boolean;
  schedule: ScheduleItemDto | null;
  defaultTenantId?: string;
  onClose: () => void;
  onSave: (data: ScheduleFormData) => Promise<void> | void;
}

export function ScheduleFormModal({
  visible,
  schedule,
  defaultTenantId,
  onClose,
  onSave,
}: ScheduleFormModalProps) {
  const { colors, isDark } = useTheme();

  const formState = useScheduleForm({
    visible,
    initialSchedule: schedule,
    defaultTenantId,
    onSave,
  });

  const isEditing = schedule !== null && schedule !== undefined;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View
          style={[
            styles.modalCard,
            {
              backgroundColor: colors.cardBg,
              borderColor: colors.border,
            },
          ]}
        >
          {/* Modal Header */}
          <View
            style={[
              styles.header,
              { borderBottomColor: isDark ? colors.neutral[800] : colors.neutral[100] },
            ]}
          >
            <View style={styles.headerTitleGroup}>
              <View
                style={[
                  styles.headerIconBox,
                  {
                    backgroundColor: isDark ? colors.neutral[800] : colors.brand.light,
                  },
                ]}
              >
                <Lucide
                  name={isEditing ? 'edit-3' : 'plus-circle'}
                  size={18}
                  color={isDark ? colors.brand[500] : colors.brand.primary}
                />
              </View>
              <View>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                  {isEditing ? 'Edit Examination Schedule' : 'Create Examination Schedule'}
                </Text>
                <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
                  {isEditing
                    ? 'Modify venue, dates, capacity, and candidate slots.'
                    : 'Configure a new public examination slot or operational appointment window.'}
                </Text>
              </View>
            </View>

            <Pressable
              style={[
                styles.closeButton,
                {
                  backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100],
                },
                Platform.select({ web: { cursor: 'pointer' } }),
              ]}
              onPress={onClose}
            >
              <Lucide name="x" size={16} color={colors.text} />
            </Pressable>
          </View>

          {/* Modal Form Body */}
          <ScheduleForm
            formState={formState}
            isEditing={isEditing}
            onCancel={onClose}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING[16],
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalCard: {
    width: '100%',
    maxWidth: 640,
    height: 680,
    maxHeight: '90%',
    borderRadius: RADIUS.dialog,
    borderWidth: 1,
    overflow: 'hidden',
    flexDirection: 'column',
    ...SHADOWS.modal,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[20],
    paddingVertical: SPACING[16],
    borderBottomWidth: 1,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[12],
    flex: 1,
  },
  headerIconBox: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.pageTitle,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  headerSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
    marginTop: 2,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
