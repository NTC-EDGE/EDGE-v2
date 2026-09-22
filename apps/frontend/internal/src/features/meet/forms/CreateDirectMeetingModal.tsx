import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormFieldInput, ModalDialog, Icon, useTheme } from '@edge/ui';
import { useUsers, ApiUser } from '@edge/api';
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
  const { colors } = useTheme();
  const { users } = useUsers();

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
      subtitle="Launch an instant 1-on-1 video & audio session with a colleague."
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
            <Text style={[styles.suggestionHeader, { color: colors.textMuted }]}>Suggested Colleagues:</Text>
            {matchingUsers.map((u) => (
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
                  <Text style={[styles.itemName, { color: colors.text }]}>{u.firstName} {u.lastName}</Text>
                  <Text style={[styles.itemEmail, { color: colors.textMuted }]}>{u.email}</Text>
                </View>
                <Icon name="chevron-right" size={16} color={colors.textMuted} />
              </Pressable>
            ))}
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
  inputContainer: {
    position: 'relative',
  },
  suggestionsBox: {
    marginTop: -8,
    marginBottom: 14,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  suggestionHeader: {
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 4,
    textTransform: 'uppercase',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    gap: 10,
  },
  avatarBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '600',
  },
  itemEmail: {
    fontSize: 11,
  },
});
