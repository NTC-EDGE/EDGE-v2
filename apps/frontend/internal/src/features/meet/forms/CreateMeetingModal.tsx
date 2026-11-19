import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Pressable, Platform } from 'react-native';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormFieldInput, ModalDialog, Icon, useTheme } from '@edge/ui';
import { Meeting } from '@edge/api';
import { createMeetingSchema, CreateMeetingFormValues } from '../schemas/meetSchemas';
import { TenantParticipantPicker } from '../../../shared/components';

interface CreateMeetingModalProps {
  visible: boolean;
  editingMeeting?: Meeting | null;
  onClose: () => void;
  onSubmit: (values: CreateMeetingFormValues) => Promise<void>;
  isSubmitting: boolean;
}

const DURATION_OPTIONS = [
  { label: '15 mins', minutes: 15 },
  { label: '30 mins', minutes: 30 },
  { label: '45 mins', minutes: 45 },
  { label: '1 hour', minutes: 60 },
  { label: '1.5 hours', minutes: 90 },
  { label: '2 hours', minutes: 120 },
];

const getDefaultDate = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const day = String(tomorrow.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDefaultTime = (): string => '10:00';

const SCOPE_OPTIONS: {
  id: 'IntraRegional' | 'InterRegional';
  label: string;
  icon: 'shield' | 'globe';
}[] = [
  { id: 'IntraRegional', label: 'Invited / Regional Only', icon: 'shield' },
  { id: 'InterRegional', label: 'Inter-Regional (Open Code)', icon: 'globe' },
];

function toDateInputString(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return getDefaultDate();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toTimeInputString(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return getDefaultTime();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

export const CreateMeetingModal: React.FC<CreateMeetingModalProps> = ({
  visible,
  editingMeeting = null,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const { colors, isDark } = useTheme();
  const isEditing = editingMeeting !== null;

  const defaultDate = getDefaultDate();
  const defaultTime = getDefaultTime();

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateMeetingFormValues>({
    resolver: zodResolver(createMeetingSchema),
    defaultValues: {
      title: '',
      description: '',
      scope: 'IntraRegional',
      meetingDate: defaultDate,
      meetingTime: defaultTime,
      durationMinutes: 60,
      scheduledStartTime: new Date(`${defaultDate}T${defaultTime}:00`).toISOString(),
      scheduledEndTime: new Date(new Date(`${defaultDate}T${defaultTime}:00`).getTime() + 60 * 60 * 1000).toISOString(),
      participantUserIds: [],
    },
  });

  useEffect(() => {
    if (!visible) return;
    if (editingMeeting) {
      const mDate = toDateInputString(editingMeeting.scheduledStartTime);
      const mTime = toTimeInputString(editingMeeting.scheduledStartTime);
      let mins = 60;
      if (editingMeeting.scheduledEndTime) {
        const diff = Math.round(
          (new Date(editingMeeting.scheduledEndTime).getTime() -
            new Date(editingMeeting.scheduledStartTime).getTime()) /
            60000
        );
        if (diff >= 15) mins = diff;
      }
      reset({
        title: editingMeeting.title,
        description: editingMeeting.description ?? '',
        scope: editingMeeting.scope,
        meetingDate: mDate,
        meetingTime: mTime,
        durationMinutes: mins,
        scheduledStartTime: editingMeeting.scheduledStartTime,
        scheduledEndTime: editingMeeting.scheduledEndTime ?? undefined,
        participantUserIds: editingMeeting.participants.map((p) => p.userId),
      });
    } else {
      const d = getDefaultDate();
      const t = getDefaultTime();
      reset({
        title: '',
        description: '',
        scope: 'IntraRegional',
        meetingDate: d,
        meetingTime: t,
        durationMinutes: 60,
        scheduledStartTime: new Date(`${d}T${t}:00`).toISOString(),
        scheduledEndTime: new Date(new Date(`${d}T${t}:00`).getTime() + 60 * 60 * 1000).toISOString(),
        participantUserIds: [],
      });
    }
  }, [visible, editingMeeting, reset]);

  const selectedUserIds = useWatch({ control, name: 'participantUserIds' }) || [];
  const meetingDate = useWatch({ control, name: 'meetingDate' }) || defaultDate;
  const meetingTime = useWatch({ control, name: 'meetingTime' }) || defaultTime;
  const durationMinutes = useWatch({ control, name: 'durationMinutes' }) || 60;
  const scope = useWatch({ control, name: 'scope' }) || 'IntraRegional';

  useEffect(() => {
    if (meetingDate && meetingTime) {
      const parsedStart = new Date(`${meetingDate}T${meetingTime}:00`);
      if (!isNaN(parsedStart.getTime())) {
        const startIso = parsedStart.toISOString();
        const endIso = new Date(parsedStart.getTime() + durationMinutes * 60 * 1000).toISOString();
        setValue('scheduledStartTime', startIso, { shouldValidate: true });
        setValue('scheduledEndTime', endIso, { shouldValidate: true });
      }
    }
  }, [meetingDate, meetingTime, durationMinutes, setValue]);

  const handleSelectedUserIdsChange = (userIds: string[]) => {
    setValue('participantUserIds', userIds, { shouldValidate: true });
  };

  const handleDurationSelect = (mins: number) => {
    setValue('durationMinutes', mins, { shouldValidate: true });
  };

  const handleFormSubmit = async (values: CreateMeetingFormValues) => {
    await onSubmit(values);
    reset();
    onClose();
  };

  const formattedPreviewDate = (): string => {
    try {
      const d = new Date(`${meetingDate}T${meetingTime}:00`);
      if (isNaN(d.getTime())) return '';
      return d.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return `${meetingDate} at ${meetingTime}`;
    }
  };

  return (
    <ModalDialog
      visible={visible}
      onClose={onClose}
      title={isEditing ? 'Edit / Reschedule Meeting' : 'Schedule Regional Meeting'}
      subtitle={
        isEditing
          ? 'Update meeting title, scope, agenda, or scheduled date and time.'
          : 'Set meeting date, time, and invite officers. Invitees receive a scheduled notification without ringing.'
      }
      icon={isEditing ? 'edit-3' : 'calendar'}
      confirmText={isEditing ? 'Save Changes' : 'Schedule Meeting'}
      cancelText="Cancel"
      onConfirm={handleSubmit(handleFormSubmit)}
      isLoading={isSubmitting}
      maxWidth={540}
    >
      <View style={styles.formContent}>
        <FormFieldInput
          control={control}
          name="title"
          label="Meeting Title"
          placeholder="e.g. Regional Coordination & Operational Review"
        />

        <FormFieldInput
          control={control}
          name="description"
          label="Agenda / Notes (Optional)"
          placeholder="Key topics, agenda points, or briefing notes..."
        />

        {/* Scope Selector */}
        <View style={styles.durationSection}>
          <Text style={[styles.fieldLabel, { color: colors.text }]}>Access Scope</Text>
          <View style={styles.scopeRow}>
            {SCOPE_OPTIONS.map((opt) => {
              const selected = scope === opt.id;
              return (
                <Pressable
                  key={opt.id}
                  style={[
                    styles.scopeChip,
                    {
                      borderColor: selected ? colors.brand.primary : colors.border,
                      backgroundColor: selected
                        ? colors.brand.primary + '18'
                        : isDark
                          ? 'rgba(255,255,255,0.05)'
                          : '#F8FAFC',
                    },
                  ]}
                  onPress={() => setValue('scope', opt.id, { shouldValidate: true })}
                >
                  <Icon
                    name={opt.icon}
                    size={13}
                    color={selected ? colors.brand.primary : colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.durationChipText,
                      {
                        color: selected ? colors.brand.primary : colors.textMuted,
                        fontWeight: selected ? '700' : '500',
                      },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Date and Time Row */}
        <View style={styles.dateTimeRow}>
          <View style={styles.dateField}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              Meeting Date <Text style={styles.requiredStar}>*</Text>
            </Text>
            {Platform.OS === 'web' ? (
              <input
                type="date"
                value={meetingDate}
                onChange={(e) => setValue('meetingDate', e.target.value, { shouldValidate: true })}
                style={{
                  width: '100%',
                  height: '42px',
                  paddingLeft: '12px',
                  paddingRight: '12px',
                  fontSize: '13px',
                  fontFamily: 'System, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  color: isDark ? '#F1F5F9' : '#0F172A',
                  backgroundColor: isDark ? colors.cardBg : '#FFFFFF',
                  border: errors.meetingDate ? '1.5px solid #EF4444' : `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  outline: 'none',
                  cursor: 'pointer',
                  boxSizing: 'border-box',
                }}
              />
            ) : (
              <FormFieldInput
                control={control}
                name="meetingDate"
                label="Date"
                placeholder="YYYY-MM-DD"
              />
            )}
            {errors.meetingDate ? (
              <Text style={styles.errorText}>{errors.meetingDate.message}</Text>
            ) : null}
          </View>

          <View style={styles.timeField}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              Start Time <Text style={styles.requiredStar}>*</Text>
            </Text>
            {Platform.OS === 'web' ? (
              <input
                type="time"
                value={meetingTime}
                onChange={(e) => setValue('meetingTime', e.target.value, { shouldValidate: true })}
                style={{
                  width: '100%',
                  height: '42px',
                  paddingLeft: '12px',
                  paddingRight: '12px',
                  fontSize: '13px',
                  fontFamily: 'System, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  color: isDark ? '#F1F5F9' : '#0F172A',
                  backgroundColor: isDark ? colors.cardBg : '#FFFFFF',
                  border: errors.meetingTime ? '1.5px solid #EF4444' : `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  outline: 'none',
                  cursor: 'pointer',
                  boxSizing: 'border-box',
                }}
              />
            ) : (
              <FormFieldInput
                control={control}
                name="meetingTime"
                label="Time"
                placeholder="HH:mm (e.g. 14:00)"
              />
            )}
            {errors.meetingTime ? (
              <Text style={styles.errorText}>{errors.meetingTime.message}</Text>
            ) : null}
          </View>
        </View>

        {/* Duration Selection Chips */}
        <View style={styles.durationSection}>
          <Text style={[styles.fieldLabel, { color: colors.text }]}>Meeting Duration</Text>
          <View style={styles.durationChipsRow}>
            {DURATION_OPTIONS.map((opt) => {
              const isSelected = durationMinutes === opt.minutes;
              return (
                <Pressable
                  key={opt.minutes}
                  style={[
                    styles.durationChip,
                    {
                      borderColor: isSelected ? colors.brand.primary : colors.border,
                      backgroundColor: isSelected
                        ? colors.brand.primary + '18'
                        : isDark
                          ? 'rgba(255,255,255,0.05)'
                          : '#F8FAFC',
                    },
                  ]}
                  onPress={() => handleDurationSelect(opt.minutes)}
                >
                  <Text
                    style={[
                      styles.durationChipText,
                      {
                        color: isSelected ? colors.brand.primary : colors.textMuted,
                        fontWeight: isSelected ? '700' : '500',
                      },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {!isEditing && (
          <TenantParticipantPicker
            label={`Invite Participants (${selectedUserIds.length} selected)`}
            selectedUserIds={selectedUserIds}
            onSelectedUserIdsChange={handleSelectedUserIdsChange}
            listMaxHeight={150}
          />
        )}

        {/* Preview Summary Banner */}
        <View
          style={[
            styles.previewBanner,
            {
              backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF',
              borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : '#BFDBFE',
            },
          ]}
        >
          <Icon name="calendar" size={16} color={colors.brand.primary} />
          <View style={styles.previewInfo}>
            <Text style={[styles.previewTitle, { color: colors.text }]}>
              Scheduled for {formattedPreviewDate()} ({durationMinutes} mins)
            </Text>
            <Text style={[styles.previewSub, { color: colors.textMuted }]}>
              {isEditing
                ? 'Meeting schedule will be updated immediately for all participants.'
                : 'Invitees will see this meeting in Upcoming and receive a calendar notification.'}
            </Text>
          </View>
        </View>
      </View>
    </ModalDialog>
  );
};

const styles = StyleSheet.create({
  formContent: {
    gap: 12,
  },
  scopeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  scopeChip: {
    flex: 1,
    minWidth: 180,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateField: {
    flex: 1,
  },
  timeField: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  requiredStar: {
    color: '#EF4444',
  },
  errorText: {
    fontSize: 11,
    color: '#EF4444',
    marginTop: 4,
  },
  durationSection: {
    gap: 4,
  },
  durationChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  durationChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  durationChipText: {
    fontSize: 12,
  },
  previewBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 4,
  },
  previewInfo: {
    flex: 1,
    gap: 2,
  },
  previewTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  previewSub: {
    fontSize: 11,
    lineHeight: 15,
  },
});
