import React from 'react';
import { StyleSheet, View, Text, Pressable, Modal, ScrollView } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { Feather as Icon } from '@expo/vector-icons';
import { Button } from './Button';

export interface ModalDialogProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: keyof typeof Icon.glyphMap;
  iconVariant?: 'primary' | 'success' | 'warning' | 'danger' | 'accent';
  maxWidth?: number;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void | Promise<void>;
  isLoading?: boolean;
  isConfirmDisabled?: boolean;
  hideFooter?: boolean;
  children: React.ReactNode;
}

export const ModalDialog: React.FC<ModalDialogProps> = ({
  visible,
  onClose,
  title,
  subtitle,
  icon,
  iconVariant = 'primary',
  maxWidth = 500,
  confirmText = 'Save',
  cancelText = 'Cancel',
  onConfirm,
  isLoading = false,
  isConfirmDisabled = false,
  hideFooter = false,
  children,
}) => {
  const { colors } = useTheme();
  if (!visible) return null;

  const iconColor = iconVariant === 'success' ? colors.semantic.success
    : iconVariant === 'warning' ? colors.semantic.warning
    : iconVariant === 'danger' ? colors.semantic.error
    : iconVariant === 'accent' ? colors.brand.accent
    : colors.brand.primary;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.dialogCard, { backgroundColor: colors.cardBg, borderColor: colors.border, maxWidth }]}>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.headerLeft}>
              {icon ? (
                <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
                  <Icon name={icon} size={20} color={iconColor} />
                </View>
              ) : null}
              <View style={styles.titleWrapper}>
                <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
                {subtitle ? <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text> : null}
              </View>
            </View>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <Icon name="x" size={20} color={colors.textMuted} />
            </Pressable>
          </View>

          <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>

          {!hideFooter && onConfirm ? (
            <View style={[styles.footer, { borderTopColor: colors.border }]}>
              <Button variant="secondary" size="md" onPress={onClose} isDisabled={isLoading}>
                {cancelText}
              </Button>
              <Button variant="primary" size="md" onPress={() => void onConfirm()} isLoading={isLoading} isDisabled={isConfirmDisabled}>
                {confirmText}
              </Button>
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  dialogCard: {
    width: '100%',
    maxHeight: '90%',
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleWrapper: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  body: {
    flexGrow: 0,
  },
  bodyContent: {
    padding: 24,
    gap: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    gap: 12,
  },
});
