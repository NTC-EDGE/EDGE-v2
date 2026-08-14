import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {
  COLORS,
  SPACING,
  RADIUS,
  SHADOWS,
  TYPOGRAPHY,
  Icon as Lucide,
  useTheme,
} from '@edge/ui';
import { AddSoaLineItemRequest, feeMasterService, Fee } from '@edge/api';
import { formatAmount } from '../review/common/reviewUtils';

interface AddSoaLineItemModalProps {
  visible: boolean;
  targetName: string;
  onConfirm: (payload: AddSoaLineItemRequest) => Promise<void>;
  onCancel: () => void;
}

export function AddSoaLineItemModal({
  visible,
  targetName,
  onConfirm,
  onCancel,
}: AddSoaLineItemModalProps) {
  const { colors, isDark } = useTheme();

  const [fees, setFees] = useState<Fee[]>([]);
  const [loadingFees, setLoadingFees] = useState(false);
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [feeSearch, setFeeSearch] = useState('');

  const [validityYears, setValidityYears] = useState('1');
  const [noOfUnits, setNoOfUnits] = useState('1');
  const [feeRate, setFeeRate] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch fees when modal opens
  useEffect(() => {
    if (visible) {
      setLoadingFees(true);
      feeMasterService.getFeeMasterCatalog(true).then(([data, err]) => {
        setLoadingFees(false);
        if (data && Array.isArray(data)) {
          setFees(data);
          if (data.length > 0 && selectedFee === null) {
            setSelectedFee(data[0]);
            setDescription(data[0].description ?? '');
          }
        }
      });
    }
  }, [visible]);

  const filteredFees = useMemo(() => {
    if (!feeSearch.trim()) return fees;
    const q = feeSearch.toLowerCase();
    return fees.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.code.toLowerCase().includes(q) ||
        (f.description && f.description.toLowerCase().includes(q))
    );
  }, [fees, feeSearch]);

  const unitsNum = parseInt(noOfUnits, 10);
  const validUnits = isNaN(unitsNum) || unitsNum < 1 ? 1 : unitsNum;

  const rateNum = parseFloat(feeRate);
  const validRate = isNaN(rateNum) || rateNum < 0 ? 0 : rateNum;

  const calculatedAmount = validUnits * validRate;

  const resetForm = () => {
    setSelectedFee(null);
    setIsDropdownOpen(false);
    setFeeSearch('');
    setDescription('');
    setValidityYears('1');
    setNoOfUnits('1');
    setFeeRate('');
    setErrorMsg(null);
    setIsSubmitting(false);
  };

  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  const handleSelectFee = (fee: Fee) => {
    setSelectedFee(fee);
    setDescription(fee.description ?? '');
    setIsDropdownOpen(false);
    setFeeSearch('');
    setErrorMsg(null);
  };

  const handleSave = async () => {
    if (!selectedFee) {
      setErrorMsg('Please select a fee from the masterlist.');
      return;
    }
    if (isNaN(rateNum) || rateNum < 0) {
      setErrorMsg('Fee rate must be a valid number (0 or greater).');
      return;
    }

    const valYearsNum = parseInt(validityYears, 10);
    const validYears = isNaN(valYearsNum) || valYearsNum < 0 ? 1 : valYearsNum;

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await onConfirm({
        particular: selectedFee.name.trim(),
        itemCode: selectedFee.code.trim().toUpperCase(),
        description: description.trim().length > 0 ? description.trim() : undefined,
        validityYears: validYears,
        noOfUnits: validUnits,
        feeRate: validRate,
      });
      resetForm();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add line item.';
      setErrorMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCancel}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.container,
            {
              backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
              borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View
              style={[
                styles.iconWrapper,
                { backgroundColor: isDark ? colors.brand[900] : '#EFF6FF' },
              ]}
            >
              <Lucide
                name="plus-circle"
                size={22}
                color={isDark ? colors.brand[400] : COLORS.brand[700]}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.title,
                  { color: isDark ? colors.neutral[100] : colors.neutral[900] },
                ]}
              >
                Add Fee / Line Item
              </Text>
              <Text
                style={[
                  styles.subtitle,
                  { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                ]}
                numberOfLines={1}
              >
                For: {targetName}
              </Text>
            </View>
            <Pressable onPress={handleCancel} hitSlop={8}>
              <Lucide
                name="x"
                size={18}
                color={isDark ? colors.neutral[400] : colors.neutral[500]}
              />
            </Pressable>
          </View>

          {errorMsg !== null && errorMsg.length > 0 && (
            <View
              style={[
                styles.errorBanner,
                { backgroundColor: isDark ? '#451A1A' : '#FEF2F2' },
              ]}
            >
              <Lucide name="alert-circle" size={16} color={COLORS.semantic.error} />
              <Text style={[styles.errorText, { color: COLORS.semantic.error }]}>
                {errorMsg}
              </Text>
            </View>
          )}

          {/* Form Fields */}
          <View style={styles.form}>
            {/* Fee Selection Dropdown */}
            <View style={styles.inputGroup}>
              <Text
                style={[
                  styles.label,
                  { color: isDark ? colors.neutral[300] : colors.neutral[700] },
                ]}
              >
                Select Fee (from Masterlist) <Text style={styles.required}>*</Text>
              </Text>

              {loadingFees ? (
                <View style={styles.dropdownLoading}>
                  <ActivityIndicator size="small" color={COLORS.brand[700]} />
                  <Text
                    style={[
                      styles.loadingText,
                      { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                    ]}
                  >
                    Loading configured fees...
                  </Text>
                </View>
              ) : (
                <View>
                  <Pressable
                    style={[
                      styles.dropdownTrigger,
                      {
                        backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50],
                        borderColor: isDropdownOpen
                          ? COLORS.brand[700]
                          : isDark
                          ? colors.neutral[700]
                          : colors.neutral[300],
                      },
                    ]}
                    onPress={() => setIsDropdownOpen((prev) => !prev)}
                  >
                    {selectedFee ? (
                      <View style={styles.selectedFeeDisplay}>
                        <Text
                          style={[
                            styles.selectedFeeName,
                            { color: isDark ? colors.neutral[100] : colors.neutral[900] },
                          ]}
                          numberOfLines={1}
                        >
                          {selectedFee.name}
                        </Text>
                        <View
                          style={[
                            styles.codeBadge,
                            {
                              backgroundColor: isDark ? colors.brand[900] : '#DBEAFE',
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.codeBadgeText,
                              { color: isDark ? colors.brand[400] : COLORS.brand[700] },
                            ]}
                          >
                            {selectedFee.code}
                          </Text>
                        </View>
                      </View>
                    ) : (
                      <Text
                        style={{
                          color: isDark ? colors.neutral[500] : colors.neutral[400],
                          fontSize: 14,
                        }}
                      >
                        -- Select a fee from masterlist --
                      </Text>
                    )}
                    <Lucide
                      name={isDropdownOpen ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color={isDark ? colors.neutral[400] : colors.neutral[500]}
                    />
                  </Pressable>

                  {/* Dropdown Options List */}
                  {isDropdownOpen && (
                    <View
                      style={[
                        styles.dropdownList,
                        {
                          backgroundColor: isDark ? colors.neutral[900] : COLORS.neutral.white,
                          borderColor: isDark ? colors.neutral[700] : colors.neutral[300],
                        },
                      ]}
                    >
                      <TextInput
                        style={[
                          styles.searchInput,
                          {
                            backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50],
                            color: isDark ? colors.neutral[100] : colors.neutral[900],
                            borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
                          },
                        ]}
                        placeholder="Search fees by name or code..."
                        placeholderTextColor={
                          isDark ? colors.neutral[500] : colors.neutral[400]
                        }
                        value={feeSearch}
                        onChangeText={setFeeSearch}
                        autoFocus
                      />
                      <ScrollView style={styles.optionsScroll} nestedScrollEnabled>
                        {filteredFees.length === 0 ? (
                          <View style={styles.noFeesFound}>
                            <Text
                              style={[
                                styles.noFeesText,
                                { color: isDark ? colors.neutral[500] : colors.neutral[400] },
                              ]}
                            >
                              No fees found matching "{feeSearch}"
                            </Text>
                          </View>
                        ) : (
                          filteredFees.map((f) => (
                            <Pressable
                              key={f.id}
                              style={[
                                styles.optionRow,
                                selectedFee?.id === f.id && {
                                  backgroundColor: isDark
                                    ? colors.neutral[800]
                                    : '#EFF6FF',
                                },
                              ]}
                              onPress={() => handleSelectFee(f)}
                            >
                              <View style={{ flex: 1 }}>
                                <Text
                                  style={[
                                    styles.optionName,
                                    {
                                      color: isDark
                                        ? colors.neutral[100]
                                        : colors.neutral[900],
                                    },
                                  ]}
                                >
                                  {f.name}
                                </Text>
                                {f.description ? (
                                  <Text
                                    style={[
                                      styles.optionDesc,
                                      {
                                        color: isDark
                                          ? colors.neutral[400]
                                          : colors.neutral[500],
                                      },
                                    ]}
                                    numberOfLines={1}
                                  >
                                    {f.description}
                                  </Text>
                                ) : null}
                              </View>
                              <View
                                style={[
                                  styles.codeBadge,
                                  {
                                    backgroundColor: isDark
                                      ? colors.neutral[800]
                                      : '#F1F5F9',
                                  },
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.codeBadgeText,
                                    {
                                      color: isDark
                                        ? colors.neutral[300]
                                        : colors.neutral[700],
                                    },
                                  ]}
                                >
                                  {f.code}
                                </Text>
                              </View>
                            </Pressable>
                          ))
                        )}
                      </ScrollView>
                    </View>
                  )}
                </View>
              )}
            </View>

            {/* Code and Validity Row */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text
                  style={[
                    styles.label,
                    { color: isDark ? colors.neutral[300] : colors.neutral[700] },
                  ]}
                >
                  Item Code
                </Text>
                <View
                  style={[
                    styles.readonlyField,
                    {
                      backgroundColor: isDark ? colors.neutral[900] : colors.neutral[100],
                      borderColor: isDark ? colors.neutral[700] : colors.neutral[300],
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.readonlyText,
                      { color: isDark ? colors.neutral[300] : colors.neutral[700] },
                    ]}
                  >
                    {selectedFee ? selectedFee.code : '—'}
                  </Text>
                </View>
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text
                  style={[
                    styles.label,
                    { color: isDark ? colors.neutral[300] : colors.neutral[700] },
                  ]}
                >
                  Validity (Years) <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: isDark ? colors.neutral[100] : colors.neutral[900],
                      backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50],
                      borderColor: isDark ? colors.neutral[700] : colors.neutral[300],
                    },
                  ]}
                  keyboardType="number-pad"
                  placeholder="1"
                  placeholderTextColor={isDark ? colors.neutral[500] : colors.neutral[400]}
                  value={validityYears}
                  onChangeText={(txt) => setValidityYears(txt.replace(/[^0-9]/g, ''))}
                />
              </View>
            </View>

            {/* Units and Rate Row */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text
                  style={[
                    styles.label,
                    { color: isDark ? colors.neutral[300] : colors.neutral[700] },
                  ]}
                >
                  No. of Units <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: isDark ? colors.neutral[100] : colors.neutral[900],
                      backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50],
                      borderColor: isDark ? colors.neutral[700] : colors.neutral[300],
                    },
                  ]}
                  keyboardType="number-pad"
                  placeholder="1"
                  placeholderTextColor={isDark ? colors.neutral[500] : colors.neutral[400]}
                  value={noOfUnits}
                  onChangeText={(txt) => setNoOfUnits(txt.replace(/[^0-9]/g, ''))}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text
                  style={[
                    styles.label,
                    { color: isDark ? colors.neutral[300] : colors.neutral[700] },
                  ]}
                >
                  Fee Rate (₱) <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: isDark ? colors.neutral[100] : colors.neutral[900],
                      backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50],
                      borderColor: isDark ? colors.neutral[700] : colors.neutral[300],
                    },
                  ]}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor={isDark ? colors.neutral[500] : colors.neutral[400]}
                  value={feeRate}
                  onChangeText={(txt) =>
                    setFeeRate(txt.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1'))
                  }
                />
              </View>
            </View>

            {/* Calculated Preview */}
            <View
              style={[
                styles.totalPreview,
                {
                  backgroundColor: isDark ? colors.neutral[900] : '#F8FAFC',
                  borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
                },
              ]}
            >
              <Text
                style={[
                  styles.totalPreviewLabel,
                  { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                ]}
              >
                Computed Line Amount:
              </Text>
              <Text
                style={[
                  styles.totalPreviewValue,
                  { color: isDark ? colors.brand[400] : COLORS.brand[700] },
                ]}
              >
                {formatAmount(calculatedAmount)}
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Pressable
              style={[
                styles.cancelBtn,
                { borderColor: isDark ? colors.neutral[700] : colors.neutral[300] },
              ]}
              onPress={handleCancel}
              disabled={isSubmitting}
            >
              <Text
                style={[
                  styles.cancelText,
                  { color: isDark ? colors.neutral[300] : colors.neutral[600] },
                ]}
              >
                Cancel
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.confirmBtn,
                {
                  backgroundColor: isDark ? colors.brand[500] : COLORS.brand[700],
                  opacity: isSubmitting || !selectedFee ? 0.7 : 1,
                },
              ]}
              onPress={handleSave}
              disabled={isSubmitting || !selectedFee}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color={COLORS.neutral.white} />
              ) : (
                <>
                  <Lucide name="plus" size={16} color={COLORS.neutral.white} />
                  <Text style={styles.confirmText}>Add Line Item</Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING[16],
  },
  container: {
    borderRadius: RADIUS.dialog,
    borderWidth: 1,
    padding: SPACING[24],
    width: '100%',
    maxWidth: 520,
    ...SHADOWS.modal,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[12],
    marginBottom: SPACING[16],
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 18,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  subtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    marginTop: 2,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
    padding: SPACING[10],
    borderRadius: RADIUS.input,
    marginBottom: SPACING[12],
  },
  errorText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.medium,
    flex: 1,
  },
  form: {
    gap: SPACING[12],
    marginBottom: SPACING[20],
  },
  row: {
    flexDirection: 'row',
    gap: SPACING[12],
  },
  inputGroup: {
    gap: SPACING[4],
  },
  label: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  required: {
    color: COLORS.semantic.error,
  },
  dropdownLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
    padding: SPACING[10],
  },
  loadingText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: RADIUS.input,
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[10],
  },
  selectedFeeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
    flex: 1,
  },
  selectedFeeName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
    flex: 1,
  },
  codeBadge: {
    paddingHorizontal: SPACING[6],
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  codeBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  dropdownList: {
    marginTop: SPACING[4],
    borderWidth: 1,
    borderRadius: RADIUS.input,
    maxHeight: 180,
    ...SHADOWS.card,
    overflow: 'hidden',
  },
  searchInput: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    borderBottomWidth: 1,
    paddingHorizontal: SPACING[10],
    paddingVertical: SPACING[8],
  },
  optionsScroll: {
    maxHeight: 130,
  },
  noFeesFound: {
    padding: SPACING[12],
    alignItems: 'center',
  },
  noFeesText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontStyle: 'italic',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[8],
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.1)',
  },
  optionName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  optionDesc: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    marginTop: 1,
  },
  readonlyField: {
    borderWidth: 1,
    borderRadius: RADIUS.input,
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[8],
    justifyContent: 'center',
  },
  readonlyText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  input: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    borderWidth: 1,
    borderRadius: RADIUS.input,
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[8],
  },
  totalPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING[12],
    borderRadius: RADIUS.input,
    borderWidth: 1,
    marginTop: SPACING[4],
  },
  totalPreviewLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  totalPreviewValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING[12],
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: SPACING[10],
    borderRadius: RADIUS.button,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  confirmBtn: {
    flex: 2,
    paddingVertical: SPACING[10],
    borderRadius: RADIUS.button,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING[8],
  },
  confirmText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral.white,
  },
});
