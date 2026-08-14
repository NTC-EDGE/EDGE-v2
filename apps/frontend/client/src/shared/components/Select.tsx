import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Platform,
  ViewStyle,
  TouchableWithoutFeedback,
} from 'react-native';
import { Icon as Lucide } from '@edge/ui';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY, SHADOWS } from '../theme/tokens';

type LucideIconName = React.ComponentProps<typeof Lucide>['name'];

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  label?: string;
  placeholder?: string;
  emptyText?: string;
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  error?: string;
  style?: ViewStyle;
  iconName?: LucideIconName;
  required?: boolean;
}

export function Select({
  label,
  placeholder = 'Select an option...',
  emptyText = 'No data found.',
  value,
  onValueChange,
  options,
  error,
  style,
  iconName,
  required,
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

  // Render clean HTML dropdown on web with single custom chevron icon (appearance: none prevents duplicate native arrows)
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, style]}>
        {label !== undefined && label.length > 0 ? (
          <Text style={styles.label}>
            {label}
            {required && <Text style={{ color: '#EF4444', fontWeight: '800' }}> *</Text>}
          </Text>
        ) : null}

        <View style={styles.selectWrapper}>
          {iconName !== undefined && iconName !== null ? (
            <View style={styles.iconWeb}>
              <Lucide name={iconName} size={16} color="#64748B" />
            </View>
          ) : null}
          <select
            value={value || ''}
            onChange={(e) => onValueChange(e.target.value)}
            style={{
              width: '100%',
              height: 44,
              paddingLeft: iconName ? 40 : 14,
              paddingRight: 36,
              borderRadius: 10,
              borderWidth: error ? 1.5 : 1,
              borderStyle: 'solid',
              borderColor: error ? '#EF4444' : '#CBD5E1',
              backgroundColor: '#FFFFFF',
              fontSize: 14,
              color: value ? '#0F172A' : '#94A3B8',
              outlineStyle: 'none',
              cursor: 'pointer',
              // Suppress the browser's native dropdown arrow so only our custom chevron shows
              appearance: 'none',
              WebkitAppearance: 'none',
            }}
          >
            <option value="" disabled style={{ color: '#94A3B8', backgroundColor: '#FFFFFF' }}>
              {options.length === 0 ? emptyText : placeholder}
            </option>
            {options.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                style={{
                  color: '#0F172A',
                  backgroundColor: '#FFFFFF',
                  fontSize: '14px',
                  padding: '8px 12px',
                }}
              >
                {opt.label}
              </option>
            ))}
          </select>
          <View style={styles.chevronWeb}>
            <Lucide name="chevron-down" size={16} color="#64748B" />
          </View>
        </View>

        {error !== undefined && error.length > 0 ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {label !== undefined && label.length > 0 ? (
        <Text style={styles.label}>
          {label}
          {required && <Text style={{ color: '#EF4444', fontWeight: '800' }}> *</Text>}
        </Text>
      ) : null}

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setModalVisible(true)}
        style={getRowStyles()}
      >
        {iconName !== undefined && iconName !== null ? (
          <Lucide name={iconName} size={16} color="#64748B" style={styles.icon} />
        ) : null}
        <Text
          style={[
            styles.valueText,
            selectedOption === undefined ? styles.placeholderText : styles.selectedText,
          ]}
        >
          {selectedOption !== undefined
            ? selectedOption.label
            : options.length === 0
            ? emptyText
            : placeholder}
        </Text>
        <Lucide name="chevron-down" size={16} color="#64748B" />
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
                    <Lucide name="x" size={20} color="#64748B" />
                  </TouchableOpacity>
                </View>

                {/* Mobile FlatList capped at max 10 visible options (~400px height) */}
                <FlatList
                  data={options}
                  keyExtractor={(item) => item.value}
                  showsVerticalScrollIndicator={true}
                  ListEmptyComponent={
                    <View style={{ padding: 28, alignItems: 'center', justifyContent: 'center' }}>
                      <Lucide name="inbox" size={26} color="#94A3B8" style={{ marginBottom: 6 }} />
                      <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: '#64748B', fontStyle: 'italic' }}>
                        {emptyText}
                      </Text>
                    </View>
                  }
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
                          <Lucide name="check" size={16} color="#0F2C59" />
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
    marginBottom: 14,
  },
  label: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 44,
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
  },
  rowError: {
    borderColor: '#EF4444',
    borderWidth: 1.5,
  },
  icon: {
    marginRight: 10,
  },
  valueText: {
    flex: 1,
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fonts.primary,
  },
  placeholderText: {
    color: '#94A3B8',
  },
  selectedText: {
    color: '#0F172A',
  },
  errorText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
    borderWidth: 1,
    borderRadius: 14,
    width: '100%',
    maxWidth: 440,
    maxHeight: 400,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
    fontWeight: '700',
    color: '#0F2C59',
  },
  closeBtn: {
    padding: 4,
  },
  list: {
    width: '100%',
    maxHeight: 340,
  },
  listContent: {
    paddingVertical: 4,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  optionItemSelected: {
    backgroundColor: '#EFF6FF',
  },
  optionText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: '#1E293B',
    flex: 1,
    marginRight: 8,
  },
  optionTextSelected: {
    color: '#0F2C59',
    fontWeight: '700',
  },
  selectWrapper: {
    position: 'relative',
    width: '100%',
  },
  iconWeb: {
    position: 'absolute',
    left: 14,
    top: 14,
    zIndex: 1,
    ...Platform.select({
      web: {
        pointerEvents: 'none',
      },
    }),
  },
  chevronWeb: {
    position: 'absolute',
    right: 14,
    top: 14,
    zIndex: 1,
    ...Platform.select({
      web: {
        pointerEvents: 'none',
      },
    }),
  },
});
