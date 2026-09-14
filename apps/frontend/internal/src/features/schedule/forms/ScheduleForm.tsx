import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  Platform,
  Switch,
} from 'react-native';
import { useWatch } from 'react-hook-form';
import {
  COLORS,
  useTheme,
  SPACING,
  RADIUS,
  TYPOGRAPHY,
  FormFieldInput,
  DatePickerField,
  Button,
  Icon as Lucide,
} from '@edge/ui';
import { useAdminServices } from '@edge/api';
import { useScheduleForm } from '../hooks/useScheduleForm';

interface ScheduleFormProps {
  formState: ReturnType<typeof useScheduleForm>;
  isEditing?: boolean;
  onCancel: () => void;
}

export function ScheduleForm({ formState, isEditing = false, onCancel }: ScheduleFormProps) {
  const { colors, isDark } = useTheme();
  const {
    form,
    isServiceDropdownOpen,
    setIsServiceDropdownOpen,
    errorMessage,
    isSubmitting,
    onSubmit,
  } = formState;

  const { services, isLoading: isServicesLoading } = useAdminServices();
  const currentServiceId = useWatch({ control: form.control, name: 'serviceId' });
  const isPublishedValue = useWatch({ control: form.control, name: 'isPublished' }) ?? false;

  const selectedService = services.find((s) => s.id === currentServiceId);

  return (
    <ScrollView
      style={styles.formScroll}
      contentContainerStyle={styles.formContainer}
      keyboardShouldPersistTaps="handled"
    >
      {errorMessage !== null && errorMessage !== undefined && (
        <View style={[styles.errorBox, { backgroundColor: COLORS.semantic.errorBg, borderColor: COLORS.semantic.errorBorder }]}>
          <Lucide name="alert-triangle" size={16} color={COLORS.semantic.error} />
          <Text style={[styles.errorText, { color: COLORS.semantic.errorText }]}>
            {errorMessage}
          </Text>
        </View>
      )}

      {/* Service Selector */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.text }]}>
          Examination / Service Target <Text style={{ color: COLORS.semantic.error }}>*</Text>
        </Text>
        <Text style={[styles.fieldHint, { color: colors.textMuted }]}>
          Select the license or examination service category for this schedule.
        </Text>

        <Pressable
          style={[
            styles.selectTrigger,
            {
              backgroundColor: isDark ? colors.neutral[800] : colors.cardBg,
              borderColor: isServiceDropdownOpen ? (isDark ? colors.brand[500] : colors.brand.primary) : colors.border,
            },
            isEditing && styles.disabledTrigger,
            Platform.select({ web: { cursor: 'pointer' } }),
          ]}
          onPress={() => {
            if (!isEditing) {
              setIsServiceDropdownOpen(!isServiceDropdownOpen);
            }
          }}
          disabled={isEditing}
        >
          <View style={styles.selectTriggerLeft}>
            <Lucide
              name="book-open"
              size={16}
              color={selectedService ? (isDark ? colors.brand[500] : colors.brand.primary) : colors.textMuted}
            />
            <Text
              style={[
                styles.selectTriggerText,
                { color: selectedService ? colors.text : colors.textMuted },
              ]}
              numberOfLines={1}
            >
              {selectedService
                ? `${selectedService.name} (${selectedService.code || selectedService.serviceCategoryCode || 'NTC'})`
                : isServicesLoading
                ? 'Loading services catalog...'
                : 'Select Examination / Service...'}
            </Text>
          </View>
          <Lucide
            name={isServiceDropdownOpen ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={colors.textMuted}
          />
        </Pressable>

        {isServiceDropdownOpen && (
          <View
            style={[
              styles.dropdownMenu,
              {
                backgroundColor: isDark ? colors.neutral[800] : colors.cardBg,
                borderColor: colors.border,
              },
            ]}
          >
            <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
              {services.length === 0 && !isServicesLoading && (
                <View style={styles.emptyDropdown}>
                  <Text style={[styles.dropdownItemText, { color: colors.textMuted }]}>
                    No services found.
                  </Text>
                </View>
              )}
              {services.map((svc) => {
                const isSelected = svc.id === currentServiceId;
                return (
                  <Pressable
                    key={svc.id}
                    style={[
                      styles.dropdownItem,
                      isSelected && {
                        backgroundColor: isDark ? colors.neutral[700] : colors.brand.light,
                      },
                      Platform.select({ web: { cursor: 'pointer' } }),
                    ]}
                    onPress={() => {
                      form.setValue('serviceId', svc.id, { shouldValidate: true });
                      setIsServiceDropdownOpen(false);
                    }}
                  >
                    <View style={styles.dropdownItemContent}>
                      <Text
                        style={[
                          styles.dropdownItemText,
                          {
                            color: isSelected
                              ? isDark
                                ? colors.brand[500]
                                : colors.brand.primary
                              : colors.text,
                            fontWeight: isSelected ? TYPOGRAPHY.weights.bold : TYPOGRAPHY.weights.regular,
                          },
                        ]}
                      >
                        {svc.name}
                      </Text>
                      <Text style={[styles.dropdownItemSub, { color: colors.textMuted }]}>
                        {svc.code || svc.serviceCategoryCode} • {svc.serviceCategoryType || 'Standard'}
                      </Text>
                    </View>
                    {isSelected && (
                      <Lucide
                        name="check"
                        size={15}
                        color={isDark ? colors.brand[500] : colors.brand.primary}
                      />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        )}

        {form.formState.errors.serviceId && (
          <Text style={styles.fieldError}>
            {form.formState.errors.serviceId.message}
          </Text>
        )}
      </View>

      {/* Venue Location */}
      <FormFieldInput
        control={form.control}
        name="venue"
        label="Venue & Testing Center Location"
        placeholder="e.g. NTC Multi-Purpose Hall, NCR Regional Office, Diliman, QC"
      />

      {/* Examination Schedule Dates */}
      <View style={styles.gridRow}>
        <View style={styles.gridCol}>
          <DatePickerField
            control={form.control}
            name="startDate"
            label="Event / Exam Start Date"
            required
            placeholder="YYYY-MM-DD"
          />
        </View>

        <View style={styles.gridCol}>
          <DatePickerField
            control={form.control}
            name="endDate"
            label="Event / Exam End Date"
            required
            placeholder="YYYY-MM-DD"
          />
        </View>
      </View>

      {/* Application Filing Window */}
      <View style={styles.gridRow}>
        <View style={styles.gridCol}>
          <DatePickerField
            control={form.control}
            name="startApplication"
            label="Application Open Date"
            placeholder="YYYY-MM-DD"
          />
        </View>

        <View style={styles.gridCol}>
          <DatePickerField
            control={form.control}
            name="endApplication"
            label="Application Deadline"
            placeholder="YYYY-MM-DD"
          />
        </View>
      </View>

      {/* Slots Capacity & Remarks */}
      <View style={styles.gridRow}>
        <View style={styles.gridCol}>
          <FormFieldInput
            control={form.control}
            name="maximumSlots"
            label="Maximum Slots Capacity"
            placeholder="e.g. 50"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.gridCol}>
          <FormFieldInput
            control={form.control}
            name="remarks"
            label="Special Instructions / Remarks"
            placeholder="e.g. Bring valid 2x2 photo and black pen"
          />
        </View>
      </View>

      {/* Publish Toggle Switch */}
      <View
        style={[
          styles.publishRow,
          {
            backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50],
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.publishInfo}>
          <View style={styles.publishTitleRow}>
            <Lucide
              name={isPublishedValue ? 'globe' : 'eye-off'}
              size={16}
              color={isPublishedValue ? COLORS.semantic.success : colors.textMuted}
            />
            <Text style={[styles.publishTitle, { color: colors.text }]}>
              {isPublishedValue ? 'Published to Client Portal' : 'Save as Internal Draft'}
            </Text>
          </View>
          <Text style={[styles.publishDesc, { color: colors.textMuted }]}>
            {isPublishedValue
              ? 'This examination schedule is visible to applicants in the public services portal.'
              : 'Keep this schedule unpublished and invisible to clients while finalizing dates.'}
          </Text>
        </View>

        <Switch
          value={isPublishedValue}
          onValueChange={(val) => form.setValue('isPublished', val, { shouldValidate: true })}
          trackColor={{ false: isDark ? colors.neutral[700] : colors.neutral[300], true: COLORS.semantic.success }}
          thumbColor={COLORS.neutral.white}
        />
      </View>

      {/* Form Action Buttons */}
      <View style={styles.formFooter}>
        <Button variant="outline" onPress={onCancel} isDisabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          variant="primary"
          leftIcon={<Lucide name="check" size={16} color={COLORS.neutral.white} />}
          onPress={onSubmit}
          isLoading={isSubmitting}
        >
          {isEditing ? 'Save Changes' : 'Create Schedule'}
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  formScroll: {
    flex: 1,
  },
  formContainer: {
    padding: SPACING[16],
    gap: SPACING[16],
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
    padding: SPACING[12],
    borderRadius: RADIUS.card,
    borderWidth: 1,
  },
  errorText: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  section: {
    gap: SPACING[6],
  },
  sectionLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  fieldHint: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
    marginBottom: 2,
  },
  selectTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[12],
    borderRadius: RADIUS.input,
    borderWidth: 1,
  },
  disabledTrigger: {
    opacity: 0.6,
  },
  selectTriggerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[10],
    flex: 1,
  },
  selectTriggerText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    flex: 1,
  },
  dropdownMenu: {
    marginTop: 4,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    maxHeight: 200,
    overflow: 'hidden',
    zIndex: 50,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  emptyDropdown: {
    padding: SPACING[12],
    alignItems: 'center',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[10],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(150, 150, 150, 0.1)',
  },
  dropdownItemContent: {
    flex: 1,
    gap: 2,
  },
  dropdownItemText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
  },
  dropdownItemSub: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
  },
  fieldError: {
    color: COLORS.semantic.error,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
    marginTop: 2,
  },
  gridRow: {
    flexDirection: 'row',
    gap: SPACING[12],
    flexWrap: 'wrap',
  },
  gridCol: {
    flex: 1,
    minWidth: 220,
  },
  publishRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING[12],
    borderRadius: RADIUS.card,
    borderWidth: 1,
    marginTop: SPACING[4],
  },
  publishInfo: {
    flex: 1,
    gap: 4,
    paddingRight: SPACING[12],
  },
  publishTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
  },
  publishTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  publishDesc: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
    lineHeight: 16,
  },
  formFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: SPACING[10],
    marginTop: SPACING[8],
    paddingTop: SPACING[12],
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.15)',
  },
});
