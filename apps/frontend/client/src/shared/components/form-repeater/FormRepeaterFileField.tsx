import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Alert } from 'react-native';
import { Icon, TYPOGRAPHY } from '@edge/ui';
import { FormRepeaterColumn } from './formRepeaterTypes';

interface FormRepeaterFileFieldProps {
  col: FormRepeaterColumn;
  value: string;
  onChange: (fileName: string) => void;
  disabled?: boolean;
}

export function FormRepeaterFileField({
  col,
  value,
  onChange,
  disabled = false,
}: FormRepeaterFileFieldProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handlePickFileNative = async () => {
    try {
      const DocumentPicker = await import('expo-document-picker');
      const res = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        const first = res.assets[0];
        if (first && typeof first?.name === 'string') {
          onChange(first.name);
        }
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to pick file';
      Alert.alert('File Selection Error', errMsg);
    }
  };

  const handleWebFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file && typeof file?.name === 'string') {
        onChange(file.name);
      }
    }
  };

  const handleTriggerPicker = () => {
    if (disabled) return;
    if (Platform.OS === 'web') {
      fileInputRef.current?.click();
    } else {
      void handlePickFileNative();
    }
  };

  const handleRemoveFile = () => {
    if (disabled) return;
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const hasFile = value !== undefined && value !== null && value.trim().length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{col.label}</Text>
        {col.required && <Text style={styles.asterisk}>*</Text>}
      </View>

      {Platform.OS === 'web' && (
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          style={{ display: 'none' }}
          onChange={handleWebFileChange}
          disabled={disabled}
        />
      )}

      {hasFile ? (
        <View style={styles.fileCard}>
          <View style={styles.fileIconWrapper}>
            <Icon name="file-text" size={18} color="#0284C7" />
          </View>
          <View style={styles.fileInfo}>
            <Text style={styles.fileName} numberOfLines={1}>
              {value}
            </Text>
            <Text style={styles.fileStatus}>Document attached</Text>
          </View>
          {!disabled && (
            <View style={styles.fileActions}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleTriggerPicker}
                style={styles.changeBtn}
              >
                <Text style={styles.changeBtnText}>Change</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleRemoveFile}
                style={styles.removeBtn}
              >
                <Icon name="trash-2" size={15} color="#DC2626" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : (
        <TouchableOpacity
          activeOpacity={0.7}
          disabled={disabled}
          onPress={handleTriggerPicker}
          style={[styles.uploadBox, disabled && styles.uploadBoxDisabled]}
        >
          <View style={styles.uploadIconCircle}>
            <Icon name="upload" size={16} color="#0284C7" />
          </View>
          <View style={styles.uploadTextContainer}>
            <Text style={styles.uploadMainText}>
              {col.placeholder || 'Choose File / Upload Document'}
            </Text>
            <Text style={styles.uploadSubText}>PDF, PNG, or JPG (up to 10MB)</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  label: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  asterisk: {
    color: '#EF4444',
    fontWeight: '800',
    fontSize: 14,
  },
  uploadBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#93C5FD',
    borderRadius: 10,
    backgroundColor: '#F0F9FF',
    gap: 12,
  },
  uploadBoxDisabled: {
    opacity: 0.6,
  },
  uploadIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadTextContainer: {
    flex: 1,
    gap: 2,
  },
  uploadMainText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: '600',
    color: '#0369A1',
  },
  uploadSubText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: '#64748B',
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 10,
    backgroundColor: '#F0F9FF',
    gap: 10,
  },
  fileIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileInfo: {
    flex: 1,
    gap: 2,
  },
  fileName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  fileStatus: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: '#0284C7',
    fontWeight: '500',
  },
  fileActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  changeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  changeBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
  },
  removeBtn: {
    padding: 6,
  },
});
