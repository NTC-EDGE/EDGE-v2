import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {
  COLORS,
  useTheme,
  Icon as Lucide,
  SPACING,
  RADIUS,
  SHADOWS,
  TYPOGRAPHY,
  toast,
} from '@edge/ui';
import { applicationService, mutateApplications, CreateSoaLineItemRequest, IssuedToTypeDto } from '@edge/api';
import { ApplicationData } from '../../../../types/application';

interface GenerateSoaModalProps {
  visible: boolean;
  app: ApplicationData;
  onClose: () => void;
  onSuccess?: () => void;
}

interface EditableLineItem {
  id: string;
  particular: string;
  itemCode: string;
  validityYears: number;
  noOfUnits: number;
  feeRate: number;
  amount: number;
}

export function GenerateSoaModal({
  visible,
  app,
  onClose,
  onSuccess,
}: GenerateSoaModalProps) {
  const { colors, isDark } = useTheme();

  const defaultDueDate = (() => {
    if (app.dueDate && app.dueDate.trim().length > 0) return app.dueDate;
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0] ?? '';
  })();

  const [issuedToName, setIssuedToName] = useState(app.applicant || '');
  const [issuedToType, setIssuedToType] = useState<IssuedToTypeDto>(
    app.applicantType === 'Company' ? 'Company' : 'Individual'
  );
  const [issuedToAddress, setIssuedToAddress] = useState(
    app.address?.streetAddress || app.address?.address || app.address?.city || ''
  );
  const [dueDate, setDueDate] = useState(defaultDueDate);
  const [loading, setLoading] = useState(false);

  const initialItems: EditableLineItem[] =
    app.soaItems.length > 0
      ? app.soaItems.map((item, idx) => ({
          id: `item-${idx}-${Date.now()}`,
          particular: item.particular,
          itemCode: item.code || `NTC-${idx + 101}`,
          validityYears: item.validityYears > 0 ? item.validityYears : 1,
          noOfUnits: item.noOfUnits > 0 ? item.noOfUnits : 1,
          feeRate: item.fees > 0 ? item.fees : item.amount || 300,
          amount: item.amount > 0 ? item.amount : (item.noOfUnits || 1) * (item.fees || 300),
        }))
      : [
          {
            id: `item-0-${Date.now()}`,
            particular: `${app.serviceName || 'Application'} Regulatory & Processing Fee`,
            itemCode: 'NTC-REG-01',
            validityYears: 1,
            noOfUnits: app.applicantsList?.length || 1,
            feeRate: 300,
            amount: (app.applicantsList?.length || 1) * 300,
          },
          {
            id: `item-1-${Date.now()}`,
            particular: 'Filing & Legal Research Fee',
            itemCode: 'NTC-LRF-02',
            validityYears: 1,
            noOfUnits: 1,
            feeRate: 150,
            amount: 150,
          },
        ];

  const [lineItems, setLineItems] = useState<EditableLineItem[]>(initialItems);

  useEffect(() => {
    if (visible) {
      setIssuedToName(app.applicant || '');
      setIssuedToType(app.applicantType === 'Company' ? 'Company' : 'Individual');
      setIssuedToAddress(app.address?.streetAddress || app.address?.address || app.address?.city || '');
      setDueDate(defaultDueDate);
      if (app.soaItems.length > 0) {
        setLineItems(
          app.soaItems.map((item, idx) => ({
            id: `item-${idx}-${Date.now()}`,
            particular: item.particular,
            itemCode: item.code || `NTC-${idx + 101}`,
            validityYears: item.validityYears > 0 ? item.validityYears : 1,
            noOfUnits: item.noOfUnits > 0 ? item.noOfUnits : 1,
            feeRate: item.fees > 0 ? item.fees : item.amount || 300,
            amount: item.amount > 0 ? item.amount : (item.noOfUnits || 1) * (item.fees || 300),
          }))
        );
      }
    }
  }, [visible, app]);

  const totalAmount = lineItems.reduce((sum, item) => sum + item.amount, 0);

  const handleUpdateItem = (
    id: string,
    field: keyof EditableLineItem,
    value: string | number
  ) => {
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        if (field === 'noOfUnits' || field === 'feeRate') {
          const u = typeof updated.noOfUnits === 'number' ? updated.noOfUnits : Number(updated.noOfUnits) || 0;
          const r = typeof updated.feeRate === 'number' ? updated.feeRate : Number(updated.feeRate) || 0;
          updated.amount = u * r;
        }
        return updated;
      })
    );
  };

  const handleAddItem = () => {
    const newItem: EditableLineItem = {
      id: `item-new-${Date.now()}`,
      particular: 'Additional Regulatory Assessment Fee',
      itemCode: 'NTC-MISC',
      validityYears: 1,
      noOfUnits: 1,
      feeRate: 100,
      amount: 100,
    };
    setLineItems((prev) => [...prev, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    if (lineItems.length <= 1) {
      toast.error('Statement of Account must have at least one line item.');
      return;
    }
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleGenerate = async () => {
    if (issuedToName.trim().length === 0) {
      toast.error('Please provide the Payor / Issued To Name.');
      return;
    }
    if (lineItems.length === 0) {
      toast.error('At least one fee line item is required.');
      return;
    }

    setLoading(true);
    const lineItemRequests: CreateSoaLineItemRequest[] = lineItems.map((item) => ({
      particular: item.particular.trim(),
      itemCode: item.itemCode.trim(),
      validityYears: item.validityYears,
      noOfUnits: item.noOfUnits,
      feeRate: item.feeRate,
      amount: item.amount,
    }));

    const [res, err] = await applicationService.createSoa(app.id, {
      issuedToType,
      issuedToName: issuedToName.trim(),
      issuedToAddress: issuedToAddress.trim(),
      dueDate: dueDate.trim() || defaultDueDate,
      lineItems: lineItemRequests,
    });

    setLoading(false);

    if (err !== null) {
      toast.error('Failed to generate Statement of Account. Please try again.');
      return;
    }

    toast.success('Statement of Account generated successfully!');
    await mutateApplications(app.id);
    if (onSuccess) {
      onSuccess();
    }
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContent,
            {
              backgroundColor: isDark ? colors.neutral[900] : COLORS.neutral.white,
              borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
            },
          ]}
        >
          {/* Header */}
          <View
            style={[
              styles.modalHeader,
              { borderBottomColor: isDark ? colors.neutral[800] : colors.neutral[200] },
            ]}
          >
            <View style={styles.headerLeft}>
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: isDark ? colors.brand[900] : colors.brand[50] },
                ]}
              >
                <Lucide
                  name="file-plus"
                  size={20}
                  color={isDark ? colors.brand[400] : colors.brand[600]}
                />
              </View>
              <View>
                <Text
                  style={[
                    styles.modalTitle,
                    { color: isDark ? colors.neutral[100] : colors.neutral[900] },
                  ]}
                >
                  Generate Statement of Account (SOA)
                </Text>
                <Text
                  style={[
                    styles.modalSubtitle,
                    { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                  ]}
                >
                  Ref #{app.referenceNumber} • {app.serviceName}
                </Text>
              </View>
            </View>
            <Pressable
              style={styles.closeBtn}
              onPress={onClose}
              hitSlop={8}
            >
              <Lucide
                name="x"
                size={20}
                color={isDark ? colors.neutral[400] : colors.neutral[500]}
              />
            </Pressable>
          </View>

          {/* Form Scroll Body */}
          <ScrollView
            style={styles.modalBody}
            contentContainerStyle={styles.bodyContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Payor Info Card */}
            <View
              style={[
                styles.sectionCard,
                {
                  backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50],
                  borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
                },
              ]}
            >
              <Text
                style={[
                  styles.sectionTitle,
                  { color: isDark ? colors.brand[400] : colors.brand[700] },
                ]}
              >
                1. BILLING &amp; PAYOR INFORMATION
              </Text>

              <View style={styles.formRow}>
                <View style={styles.formField}>
                  <Text
                    style={[
                      styles.fieldLabel,
                      { color: isDark ? colors.neutral[300] : colors.neutral[700] },
                    ]}
                  >
                    Billed To / Payor Name <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
                        color: isDark ? colors.neutral[100] : colors.neutral[900],
                        borderColor: isDark ? colors.neutral[700] : colors.neutral[300],
                      },
                    ]}
                    value={issuedToName}
                    onChangeText={setIssuedToName}
                    placeholder="Enter Payor Name"
                    placeholderTextColor={isDark ? colors.neutral[500] : colors.neutral[400]}
                  />
                </View>

                <View style={[styles.formField, { flex: 0.5 }]}>
                  <Text
                    style={[
                      styles.fieldLabel,
                      { color: isDark ? colors.neutral[300] : colors.neutral[700] },
                    ]}
                  >
                    Due Date <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
                        color: isDark ? colors.neutral[100] : colors.neutral[900],
                        borderColor: isDark ? colors.neutral[700] : colors.neutral[300],
                      },
                    ]}
                    value={dueDate}
                    onChangeText={setDueDate}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={isDark ? colors.neutral[500] : colors.neutral[400]}
                  />
                </View>
              </View>

              <View style={styles.formField}>
                <Text
                  style={[
                    styles.fieldLabel,
                    { color: isDark ? colors.neutral[300] : colors.neutral[700] },
                  ]}
                >
                  Billing Address
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
                      color: isDark ? colors.neutral[100] : colors.neutral[900],
                      borderColor: isDark ? colors.neutral[700] : colors.neutral[300],
                    },
                  ]}
                  value={issuedToAddress}
                  onChangeText={setIssuedToAddress}
                  placeholder="Enter billing address"
                  placeholderTextColor={isDark ? colors.neutral[500] : colors.neutral[400]}
                />
              </View>
            </View>

            {/* Line Items Table Card */}
            <View
              style={[
                styles.sectionCard,
                {
                  backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50],
                  borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
                },
              ]}
            >
              <View style={styles.sectionHeaderRow}>
                <Text
                  style={[
                    styles.sectionTitle,
                    { color: isDark ? colors.brand[400] : colors.brand[700] },
                  ]}
                >
                  2. ASSESSED STATUTORY FEES &amp; PARTICULARS
                </Text>
                <Pressable
                  style={[
                    styles.addItemBtn,
                    { backgroundColor: isDark ? colors.brand[900] : colors.brand[100] },
                  ]}
                  onPress={handleAddItem}
                >
                  <Lucide
                    name="plus"
                    size={14}
                    color={isDark ? colors.brand[300] : colors.brand[700]}
                  />
                  <Text
                    style={[
                      styles.addItemBtnText,
                      { color: isDark ? colors.brand[300] : colors.brand[700] },
                    ]}
                  >
                    Add Line Item
                  </Text>
                </Pressable>
              </View>

              {/* Items Table */}
              <View style={styles.itemsList}>
                {lineItems.map((item, idx) => (
                  <View
                    key={item.id}
                    style={[
                      styles.itemRowCard,
                      {
                        backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
                        borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
                      },
                    ]}
                  >
                    <View style={styles.itemHeader}>
                      <Text
                        style={[
                          styles.itemBadge,
                          {
                            backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100],
                            color: isDark ? colors.neutral[200] : colors.neutral[700],
                          },
                        ]}
                      >
                        Item #{idx + 1}
                      </Text>
                      {lineItems.length > 1 && (
                        <Pressable
                          onPress={() => handleRemoveItem(item.id)}
                          hitSlop={6}
                        >
                          <Lucide name="trash-2" size={16} color={COLORS.semantic.error} />
                        </Pressable>
                      )}
                    </View>

                    <View style={styles.itemGrid}>
                      <View style={{ flex: 2 }}>
                        <Text
                          style={[
                            styles.miniLabel,
                            { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                          ]}
                        >
                          Particulars
                        </Text>
                        <TextInput
                          style={[
                            styles.inputSm,
                            {
                              backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50],
                              color: isDark ? colors.neutral[100] : colors.neutral[900],
                              borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
                            },
                          ]}
                          value={item.particular}
                          onChangeText={(v) => handleUpdateItem(item.id, 'particular', v)}
                          placeholder="e.g. Radio Station Permit Fee"
                        />
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.miniLabel,
                            { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                          ]}
                        >
                          Fee Code
                        </Text>
                        <TextInput
                          style={[
                            styles.inputSm,
                            {
                              backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50],
                              color: isDark ? colors.neutral[100] : colors.neutral[900],
                              borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
                            },
                          ]}
                          value={item.itemCode}
                          onChangeText={(v) => handleUpdateItem(item.id, 'itemCode', v)}
                          placeholder="Code"
                        />
                      </View>

                      <View style={{ flex: 0.8 }}>
                        <Text
                          style={[
                            styles.miniLabel,
                            { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                          ]}
                        >
                          Units
                        </Text>
                        <TextInput
                          style={[
                            styles.inputSm,
                            {
                              backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50],
                              color: isDark ? colors.neutral[100] : colors.neutral[900],
                              borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
                              textAlign: 'center',
                            },
                          ]}
                          keyboardType="numeric"
                          value={String(item.noOfUnits)}
                          onChangeText={(v) =>
                            handleUpdateItem(item.id, 'noOfUnits', Number(v) || 1)
                          }
                        />
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.miniLabel,
                            { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                          ]}
                        >
                          Rate (PHP)
                        </Text>
                        <TextInput
                          style={[
                            styles.inputSm,
                            {
                              backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50],
                              color: isDark ? colors.neutral[100] : colors.neutral[900],
                              borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
                              textAlign: 'right',
                            },
                          ]}
                          keyboardType="numeric"
                          value={String(item.feeRate)}
                          onChangeText={(v) =>
                            handleUpdateItem(item.id, 'feeRate', Number(v) || 0)
                          }
                        />
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.miniLabel,
                            { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                          ]}
                        >
                          Amount
                        </Text>
                        <View
                          style={[
                            styles.amountBox,
                            {
                              backgroundColor: isDark ? colors.neutral[900] : colors.neutral[100],
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.amountText,
                              { color: isDark ? colors.neutral[100] : colors.neutral[900] },
                            ]}
                          >
                            PHP {item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
              </View>

              {/* Total Summary */}
              <View
                style={[
                  styles.totalSummaryCard,
                  {
                    backgroundColor: isDark ? colors.neutral[900] : colors.neutral[100],
                    borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
                  },
                ]}
              >
                <View>
                  <Text
                    style={[
                      styles.totalLabel,
                      { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                    ]}
                  >
                    CALCULATED TOTAL AMOUNT DUE
                  </Text>
                  <Text
                    style={[
                      styles.totalSub,
                      { color: isDark ? colors.neutral[300] : colors.neutral[600] },
                    ]}
                  >
                    {lineItems.length} fee item(s) assessed
                  </Text>
                </View>
                <Text
                  style={[
                    styles.totalValue,
                    { color: isDark ? colors.brand[400] : colors.brand[700] },
                  ]}
                >
                  PHP {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View
            style={[
              styles.modalFooter,
              { borderTopColor: isDark ? colors.neutral[800] : colors.neutral[200] },
            ]}
          >
            <Pressable
              style={[
                styles.cancelBtn,
                {
                  borderColor: isDark ? colors.neutral[700] : colors.neutral[300],
                  backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
                },
              ]}
              onPress={onClose}
              disabled={loading}
            >
              <Text
                style={[
                  styles.cancelBtnText,
                  { color: isDark ? colors.neutral[300] : colors.neutral[700] },
                ]}
              >
                Cancel
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.submitBtn,
                { backgroundColor: isDark ? colors.brand[500] : colors.brand[700] },
                loading && styles.btnDisabled,
              ]}
              onPress={handleGenerate}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={COLORS.neutral.white} />
              ) : (
                <>
                  <Lucide name="check" size={16} color={COLORS.neutral.white} />
                  <Text style={styles.submitBtnText}>Generate Statement of Account</Text>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING[16],
  },
  modalContent: {
    width: '100%',
    maxWidth: 780,
    maxHeight: '90%',
    borderRadius: RADIUS.dialog,
    borderWidth: 1,
    overflow: 'hidden',
    ...SHADOWS.modal,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[20],
    paddingVertical: SPACING[16],
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[12],
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  modalSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    padding: SPACING[6],
    borderRadius: RADIUS.sm,
  },
  modalBody: {
    flex: 1,
  },
  bodyContent: {
    padding: SPACING[20],
    gap: SPACING[16],
  },
  sectionCard: {
    padding: SPACING[16],
    borderRadius: RADIUS.card,
    borderWidth: 1,
    gap: SPACING[12],
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.8,
  },
  addItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.sm,
  },
  addItemBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  formRow: {
    flexDirection: 'row',
    gap: SPACING[12],
  },
  formField: {
    flex: 1,
    gap: 4,
  },
  fieldLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  required: {
    color: COLORS.semantic.error,
  },
  input: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    height: 40,
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING[12],
    fontSize: 13,
  },
  itemsList: {
    gap: SPACING[10],
  },
  itemRowCard: {
    padding: SPACING[12],
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    gap: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemBadge: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  itemGrid: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SPACING[8],
  },
  miniLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: 2,
  },
  inputSm: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    height: 34,
    borderWidth: 1,
    borderRadius: RADIUS.xs,
    paddingHorizontal: 8,
    fontSize: 12,
  },
  amountBox: {
    height: 34,
    borderRadius: RADIUS.xs,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
  },
  amountText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  totalSummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING[12],
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    marginTop: SPACING[4],
  },
  totalLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.5,
  },
  totalSub: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    marginTop: 2,
  },
  totalValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 18,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: SPACING[12],
    paddingHorizontal: SPACING[20],
    paddingVertical: SPACING[12],
    borderTopWidth: 1,
  },
  cancelBtn: {
    paddingHorizontal: SPACING[16],
    paddingVertical: SPACING[10],
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  cancelBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: SPACING[20],
    paddingVertical: SPACING[10],
    borderRadius: RADIUS.sm,
  },
  submitBtnText: {
    color: COLORS.neutral.white,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  btnDisabled: {
    opacity: 0.6,
  },
});
