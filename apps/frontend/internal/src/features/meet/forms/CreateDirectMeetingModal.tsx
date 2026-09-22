import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormFieldInput, ModalDialog, Icon, useTheme } from '@edge/ui';
import { useUsers, useRegions, ApiUser } from '@edge/api';
import { createDirectMeetingSchema, CreateDirectMeetingFormValues } from '../schemas/meetSchemas';

interface CreateDirectMeetingModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: CreateDirectMeetingFormValues) => Promise<void>;
  isSubmitting: boolean;
}

export const CreateDirectMeetingModal: React.FC<CreateDirectMeetingModalProps> = ({
  visible,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const { colors, isDark } = useTheme();
  const { users } = useUsers();
  const { regions } = useRegions();

  const {
    control,
    handleSubmit,
    setValue,
    reset,
  } = useForm<CreateDirectMeetingFormValues>({
    resolver: zodResolver(createDirectMeetingSchema),
    defaultValues: {
      colleagueEmailOrId: '',
      title: '',
      scope: 'IntraRegional',
    },
  });

  const colleagueQuery = useWatch({ control, name: 'colleagueEmailOrId' });

  const matchingUsers = useMemo(() => {
    const q = (colleagueQuery || '').trim().toLowerCase();
    if (q.length === 0) return [];
    return users
      .filter((u) => {
        const isInternalStaff = u.tenantMemberships !== undefined && u.tenantMemberships.length > 0;
        if (!isInternalStaff) return false;
        const full = `${u.firstName} ${u.lastName}`.toLowerCase();
        return (
          (full.includes(q) || u.email.toLowerCase().includes(q)) &&
          u.email.toLowerCase() !== q
        );
      })
      .slice(0, 4);
  }, [users, colleagueQuery]);

  const handleSelectUser = (user: ApiUser) => {
    setValue('colleagueEmailOrId', user.email, { shouldValidate: true });
  };

  const getTenantInfo = (user: ApiUser) => {
    const m = user.tenantMemberships?.[0];
    const region = regions.find((r) => r.id === m?.tenantId);
    const tenantName = region?.name || region?.code || 'Regional Office';
    const fieldOfficeName = m?.fieldOffice?.name || m?.division || 'Main Office';
    return { tenantName, fieldOfficeName };
  };

  const handleFormSubmit = async (values: CreateDirectMeetingFormValues) => {
    await onSubmit(values);
    reset();
    onClose();
  };

  return (
    <ModalDialog
      visible={visible}
      onClose={onClose}
      title="Start Direct Meeting"
      subtitle="Launch an instant 1-on-1 video & audio session with an internal regional officer."
      icon="video"
      iconVariant="accent"
      confirmText="Start Meeting"
      cancelText="Cancel"
      onConfirm={handleSubmit(handleFormSubmit)}
      isLoading={isSubmitting}
      maxWidth={520}
    >
      <View style={styles.inputContainer}>
        <FormFieldInput
          control={control}
          name="colleagueEmailOrId"
          label="Colleague / User ID or Email"
          placeholder="Type name or email (e.g. juan.delacruz@ntc.gov.ph)..."
        />

        {matchingUsers.length > 0 && (
          <View style={[styles.suggestionsBox, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <Text style={[styles.suggestionHeader, { color: colors.textMuted }]}>Suggested Internal Officers:</Text>
            {matchingUsers.map((u) => {
              const { tenantName, fieldOfficeName } = getTenantInfo(u);
              return (
                <Pressable
                  key={u.id}
                  style={({ pressed }) => [
                    styles.suggestionItem,
                    { borderBottomColor: colors.border },
                    pressed && { backgroundColor: colors.bg },
                  ]}
                  onPress={() => handleSelectUser(u)}
                >
                  <View style={[styles.avatarBadge, { backgroundColor: colors.brand.primary }]}>
                    <Text style={styles.avatarText}>{u.firstName.charAt(0)}{u.lastName.charAt(0)}</Text>
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>
                      {u.firstName} {u.lastName} <Text style={[styles.itemEmail, { color: colors.textMuted }]}>({u.email})</Text>
                    </Text>
                    <View style={styles.badgeRow}>
                      <View style={[styles.locBadge, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
                        <Icon name="map-pin" size={10} color={colors.brand[700]} />
                        <Text style={[styles.badgeText, { color: colors.text }]} numberOfLines={1}>{tenantName}</Text>
                      </View>
                      <View style={[styles.locBadge, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
                        <Icon name="briefcase" size={10} color={colors.textMuted} />
                        <Text style={[styles.badgeText, { color: colors.textMuted }]} numberOfLines={1}>{fieldOfficeName}</Text>
                      </View>
                    </View>
                  </View>
                  <Icon name="chevron-right" size={14} color={colors.textMuted} />
                </Pressable>
              );
            })}
          </View>
        )}
      </View>

      <FormFieldInput
        control={control}
        name="title"
        label="Subject / Topic (Optional)"
        placeholder="e.g. Quick Permit Clarification"
      />
    </ModalDialog>
  );
};

const styles = StyleSheet.create({
  inputContainer: { position: 'relative' },
  suggestionsBox: { marginTop: -8, marginBottom: 14, borderRadius: 8, borderWidth: 1, overflow: 'hidden' },
  suggestionHeader: { fontSize: 11, fontWeight: '600', paddingHorizontal: 12, paddingTop: 8, paddingBottom: 4, textTransform: 'uppercase' },
  suggestionItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, gap: 10 },
  avatarBadge: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  itemInfo: { flex: 1, gap: 3 },
  itemName: { fontSize: 13, fontWeight: '600' },
  itemEmail: { fontSize: 11, fontWeight: '400' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  locBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, gap: 4 },
  badgeText: { fontSize: 10, fontWeight: '500' },
});
