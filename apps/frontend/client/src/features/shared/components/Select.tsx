import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  ViewStyle,
  TouchableWithoutFeedback,
} from 'react-native';
import { Feather as Lucide } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY, SHADOWS } from '../theme/tokens';

type LucideIconName = React.ComponentProps<typeof Lucide>['name'];

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  label?: string;
  placeholder?: string;
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  error?: string;
  style?: ViewStyle;
  iconName?: LucideIconName;
}

export function Select({
  label,
  placeholder = 'Select an option...',
  value,
  onValueChange,
  options,
  error,
  style,
  iconName,
}: SelectProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (val: string) => {
    onValueChange(val);
    setModalVisible(false);
  };

  const getRowStyles = (): ViewStyle[] => {
    const list: ViewStyle[] = [styles.inputRow];
    if (error !== undefined && error.length > 0) {
      list.push(styles.rowError);
    }
    return list;
  };

  return (
    <View style={[styles.container, style]}>
      {label !== undefined && label.length > 0 ? (
        <Text style={styles.label}>{label}</Text>
      ) : null}

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setModalVisible(true)}
        style={getRowStyles()}
      >
        {iconName !== undefined && iconName !== null ? (
          <Lucide name={iconName} size={18} color={COLORS.neutral[400]} style={styles.icon} />
        ) : null}
        <Text
          style={[
            styles.valueText,
            selectedOption === undefined ? styles.placeholderText : styles.selectedText,
          ]}
        >
          {selectedOption !== undefined ? selectedOption.label : placeholder}
        </Text>
        <Lucide name="chevron-down" size={18} color={COLORS.neutral[500]} />
      </TouchableOpacity>

      {error !== undefined && error.length > 0 ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalCard, SHADOWS.modal]}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{label || 'Select Option'}</Text>
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    style={styles.closeBtn}
                  >
                    <Lucide name="x" size={20} color={COLORS.neutral[500]} />
                  </TouchableOpacity>
                </View>

                <FlatList
                  data={options}
                  keyExtractor={(item) => item.value}
                  renderItem={({ item }) => {
                    const isSelected = item.value === value;
                    return (
                      <TouchableOpacity
                        activeOpacity={0.6}
                        style={[
                          styles.optionItem,
                          isSelected && styles.optionItemSelected,
                        ]}
                        onPress={() => handleSelect(item.value)}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            isSelected && styles.optionTextSelected,
                          ]}
                        >
                          {item.label}
                        </Text>
                        {isSelected && (
                          <Lucide name="check" size={16} color={COLORS.brand[800]} />
                        )}
                      </TouchableOpacity>
                    );
                  }}
                  style={styles.list}
                  contentContainerStyle={styles.listContent}
                  nestedScrollEnabled={true}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: SPACING[16],
  },
  label: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.smallLabel,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.neutral[700],
    marginBottom: SPACING[8],
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 48,
    backgroundColor: COLORS.neutral.white,
    borderColor: COLORS.neutral[200],
    borderWidth: 1.5,
    borderRadius: RADIUS.input,
    paddingHorizontal: SPACING[16],
  },
  rowError: {
    borderColor: COLORS.semantic.error,
  },
  icon: {
    marginRight: SPACING[12],
  },
  valueText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.body,
    fontFamily: TYPOGRAPHY.fonts.primary,
  },
  placeholderText: {
    color: COLORS.neutral[400],
  },
  selectedText: {
    color: COLORS.neutral[900],
  },
  errorText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
    color: COLORS.semantic.error,
    marginTop: SPACING[4],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING[20],
  },
  modalCard: {
    backgroundColor: COLORS.glass.bg,
    borderColor: COLORS.glass.border,
    borderWidth: 1.5,
    borderRadius: RADIUS.dialog,
    width: '100%',
    maxWidth: 440,
    maxHeight: '70%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING[20],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
  },
  modalTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
  },
  closeBtn: {
    padding: 4,
  },
  list: {
    width: '100%',
  },
  listContent: {
    paddingVertical: SPACING[8],
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING[12],
    paddingHorizontal: SPACING[20],
  },
  optionItemSelected: {
    backgroundColor: COLORS.brand[100],
  },
  optionText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.neutral[800],
    flex: 1,
    marginRight: SPACING[8],
  },
  optionTextSelected: {
    color: COLORS.brand[800],
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});
