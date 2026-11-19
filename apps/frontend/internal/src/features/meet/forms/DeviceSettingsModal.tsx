import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { ModalDialog, Icon, useTheme } from '@edge/ui';
import { MediaDeviceOption } from '../hooks/useMediaDevices';

interface DeviceSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  microphones: MediaDeviceOption[];
  cameras: MediaDeviceOption[];
  speakers: MediaDeviceOption[];
  selectedMicId: string;
  selectedCameraId: string;
  selectedSpeakerId: string;
  onSelectMic: (id: string) => void;
  onSelectCamera: (id: string) => void;
  onSelectSpeaker: (id: string) => void;
}

export const DeviceSettingsModal: React.FC<DeviceSettingsModalProps> = ({
  visible,
  onClose,
  microphones,
  cameras,
  speakers,
  selectedMicId,
  selectedCameraId,
  selectedSpeakerId,
  onSelectMic,
  onSelectCamera,
  onSelectSpeaker,
}) => {
  const { colors, isDark } = useTheme();

  const renderSection = (
    title: string,
    iconName: 'mic' | 'video' | 'volume-2',
    options: MediaDeviceOption[],
    selectedId: string,
    onSelect: (id: string) => void,
    emptyText: string
  ) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Icon name={iconName} size={14} color={colors.brand.primary} />
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      </View>
      {options.length === 0 ? (
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>{emptyText}</Text>
      ) : (
        <View style={styles.optionList}>
          {options.map((opt) => {
            const selected = opt.deviceId === selectedId;
            return (
              <Pressable
                key={`${opt.kind}_${opt.deviceId}`}
                style={[
                  styles.optionRow,
                  {
                    borderColor: selected ? colors.brand.primary : colors.border,
                    backgroundColor: selected
                      ? colors.brand.primary + '16'
                      : isDark
                        ? 'rgba(255,255,255,0.04)'
                        : '#F8FAFC',
                  },
                ]}
                onPress={() => onSelect(opt.deviceId)}
              >
                <Text
                  style={[
                    styles.optionLabel,
                    {
                      color: selected ? colors.brand.primary : colors.text,
                      fontWeight: selected ? '700' : '500',
                    },
                  ]}
                  numberOfLines={1}
                >
                  {opt.label}
                </Text>
                {selected && <Icon name="check" size={14} color={colors.brand.primary} />}
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );

  return (
    <ModalDialog
      visible={visible}
      onClose={onClose}
      title="Audio & Video Settings"
      subtitle="Switch your active microphone, camera, or audio output device without leaving the meeting."
      icon="settings"
      confirmText="Done"
      cancelText="Close"
      onConfirm={onClose}
      maxWidth={440}
    >
      <ScrollView style={styles.scroll} nestedScrollEnabled>
        <View style={styles.content}>
          {renderSection(
            'Microphone',
            'mic',
            microphones,
            selectedMicId,
            onSelectMic,
            'Default system microphone'
          )}
          {renderSection(
            'Camera',
            'video',
            cameras,
            selectedCameraId,
            onSelectCamera,
            'No camera detected'
          )}
          {renderSection(
            'Speakers / Audio Output',
            'volume-2',
            speakers,
            selectedSpeakerId,
            onSelectSpeaker,
            'Default browser audio output'
          )}
        </View>
      </ScrollView>
    </ModalDialog>
  );
};

const styles = StyleSheet.create({
  scroll: {
    maxHeight: 360,
  },
  content: {
    gap: 14,
  },
  section: {
    gap: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  optionList: {
    gap: 6,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
  },
  optionLabel: {
    flex: 1,
    fontSize: 12,
  },
});
