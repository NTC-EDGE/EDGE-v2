import React, { useState, useEffect, useCallback } from 'react';
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
  DatePickerInput,
} from '@edge/ui';
import {
  applicationService,
  mutateApplications,
  CreateSoaLineItemRequest,
  IssuedToTypeDto,
  FeeCalculationResultDto,
} from '@edge/api';
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
  description?: string;
  validityYears: number;
  noOfUnits: number;
  feeRate: number;
  amount: number;
  isTax?: boolean;
  isSurcharge?: boolean;
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

  // Calculation state from backend calculation engine
  const [calculatedFees, setCalculatedFees] = useState<FeeCalculationResultDto | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationError, setCalculationError] = useState<string | null>(null);

  // Mode: automated statutory calculation vs manual customization
  const [isManualMode, setIsManualMode] = useState(false);
  const [customLineItems, setCustomLineItems] = useState<EditableLineItem[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Fetch backend calculated fees based on statutory formula & service catalog
  const fetchBackendCalculatedFees = useCallback(async () => {
    if (!app.id) return;
    setIsCalculating(true);
    setCalculationError(null);

    const [res, err] = await applicationService.calculateApplicationFees(app.id);
    setIsCalculating(false);

    if (err !== null || !res?.data) {
      const errMsg = typeof err === 'object' && err !== null && Reflect.has(err, 'message')
        ? String(Reflect.get(err, 'message'))
        : 'Failed to calculate statutory fees automatically.';
      setCalculationError(errMsg);
      return;
    }

    const calcData = res.data;
    setCalculatedFees(calcData);

    // Populate default custom line items from calculated result
    const mappedItems: EditableLineItem[] = calcData.lineItems.map((item, idx) => ({
      id: `item-${idx}-${Date.now()}`,
      particular: item.particular,
      itemCode: item.itemCode,
      description: item.description ?? undefined,
      validityYears: item.validityYears > 0 ? item.validityYears : 1,
      noOfUnits: item.noOfUnits > 0 ? item.noOfUnits : 1,
      feeRate: item.feeRate,
      amount: item.amount,
      isTax: item.isTax,
      isSurcharge: item.isSurcharge,
    }));
    setCustomLineItems(mappedItems);
  }, [app.id]);

  useEffect(() => {
    if (visible) {
      setIssuedToName(app.applicant || '');
      setIssuedToType(app.applicantType === 'Company' ? 'Company' : 'Individual');
      setIssuedToAddress(app.address?.streetAddress || app.address?.address || app.address?.city || '');
      setDueDate(defaultDueDate);
      setIsManualMode(false);
      fetchBackendCalculatedFees();
    }
  }, [visible, app, defaultDueDate, fetchBackendCalculatedFees]);

  // Handle custom line item updates (manual mode)
  const handleUpdateItem = (
    id: string,
    field: keyof EditableLineItem,
    value: string | number
  ) => {
    setCustomLineItems((prev) =>
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
    setCustomLineItems((prev) => [...prev, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    if (customLineItems.length <= 1) {
      toast.error('Statement of Account must have at least one line item.');
      return;
    }
    setCustomLineItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Compute displayed total
  const displayedTotal = isManualMode
    ? customLineItems.reduce((sum, item) => sum + item.amount, 0)
    : (calculatedFees?.totalAmount ?? (app.totalAmountDue > 0 ? app.totalAmountDue : 0));

  const handleGenerate = async () => {
    if (app.status !== 'Evaluating') {
      toast.warning('You must start evaluation on this application first before generating the Statement of Account.');
      return;
    }

    if (issuedToName.trim().length === 0) {
      toast.error('Please provide the Payor / Issued To Name.');
      return;
    }

    if (isManualMode && customLineItems.length === 0) {
      toast.error('At least one fee line item is required.');
      return;
    }

    setSubmitting(true);

    let lineItemRequests: CreateSoaLineItemRequest[] | undefined = undefined;

    if (isManualMode) {
      lineItemRequests = customLineItems.map((item) => ({
        particular: item.particular.trim(),
        itemCode: item.itemCode.trim(),
        description: item.description,
        validityYears: item.validityYears,
        noOfUnits: item.noOfUnits,
        feeRate: item.feeRate,
        amount: item.amount,
      }));
    }

    const [res, err] = await applicationService.createSoa(app.id, {
      issuedToType,
      issuedToName: issuedToName.trim(),
      issuedToAddress: issuedToAddress.trim(),
      dueDate: dueDate.trim() || defaultDueDate,
      lineItems: lineItemRequests,
    });

    setSubmitting(false);

    if (err !== null) {
      toast.error('Failed to generate SOA.');
      return;
    }

    const isExistingSoa = app.soaItems.length > 0 || app.totalAmountDue > 0;
    const successMsg = isExistingSoa ? 'SOA updated.' : 'SOA generated.';
    toast.success(successMsg);
    await mutateApplications(app.id);
    if (onSuccess) {
      onSuccess();
    }
    onClose();
  };

  const isExistingSoa = app.soaItems.length > 0 || app.totalAmountDue > 0;

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
          {/* ── Modal Header ── */}
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
                  name={isExistingSoa ? "refresh-cw" : "file-text"}
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
                  {isExistingSoa ? 'Recalculate SOA' : 'Generate SOA'}
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
            <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={8}>
              <Lucide
                name="x"
                size={20}
                color={isDark ? colors.neutral[400] : colors.neutral[500]}
              />
            </Pressable>
          </View>

          {/* ── Modal Scroll Body ── */}
          <ScrollView
            style={styles.modalBody}
            contentContainerStyle={styles.bodyContent}
            showsVerticalScrollIndicator={false}
          >
            {/* ── Automated Calculation Banner ── */}
            <View
              style={[
                styles.computationBanner,
                {
                  backgroundColor: isDark ? colors.brand[900] + '33' : colors.brand[50],
                  borderColor: isDark ? colors.brand[800] : colors.brand[200],
                },
              ]}
            >
              <View style={styles.bannerHeaderRow}>
                <View style={styles.bannerIconRow}>
                  <Lucide
                    name="cpu"
                    size={16}
                    color={isDark ? colors.brand[400] : colors.brand[700]}
                  />
                  <Text
                    style={[
                      styles.bannerTitle,
                      { color: isDark ? colors.brand[300] : colors.brand[800] },
                    ]}
                  >
                    Statutory Fee Calculation
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  {calculatedFees?.formulaApplied && (
                    <View
                      style={[
                        styles.formulaBadge,
                        { backgroundColor: isDark ? colors.brand[900] : colors.brand[100] },
                      ]}
                    >
                      <Lucide
                        name="code"
                        size={11}
                        color={isDark ? colors.brand[300] : colors.brand[800]}
                      />
                      <Text
                        style={[
                          styles.formulaBadgeText,
                          { color: isDark ? colors.brand[300] : colors.brand[800] },
                        ]}
                      >
                        Formula: {calculatedFees.formulaApplied}
                      </Text>
                    </View>
                  )}

                  <Pressable
                    disabled={isCalculating}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: RADIUS.xs,
                      backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
                      borderWidth: 1,
                      borderColor: isDark ? colors.brand[500] : colors.brand[600],
                    }}
                    onPress={fetchBackendCalculatedFees}
                  >
                    <Lucide
                      name="refresh-cw"
                      size={11}
                      color={isDark ? colors.brand[400] : colors.brand[700]}
                    />
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: TYPOGRAPHY.weights.semibold,
                        color: isDark ? colors.brand[400] : colors.brand[700],
                        fontFamily: TYPOGRAPHY.fonts.primary,
                      }}
                    >
                      {isCalculating ? 'Computing...' : 'Recalculate'}
                    </Text>
                  </Pressable>
                </View>
              </View>

              <Text
                style={[
                  styles.bannerDesc,
                  { color: isDark ? colors.neutral[300] : colors.neutral[700] },
                ]}
              >
                Statutory regulatory fees, surcharges, and DST are calculated automatically.
              </Text>

              {/* Service & Category Metadata Tag */}
              <View style={styles.metaTagsRow}>
                <View
                  style={[
                    styles.tagPill,
                    {
                      backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
                      borderColor: isDark ? colors.neutral[700] : colors.neutral[300],
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.tagText,
                      { color: isDark ? colors.neutral[300] : colors.neutral[700] },
                    ]}
                  >
                    Service:{' '}
                    <Text style={{ fontWeight: TYPOGRAPHY.weights.bold }}>
                      {app.serviceCategory || app.serviceName || 'Statutory Regulatory Service'}
                    </Text>
                  </Text>
                </View>

                {calculatedFees?.element && (
                  <View
                    style={[
                      styles.tagPill,
                      {
                        backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
                        borderColor: isDark ? colors.neutral[700] : colors.neutral[300],
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.tagText,
                        { color: isDark ? colors.neutral[300] : colors.neutral[700] },
                      ]}
                    >
                      Element / Class:{' '}
                      <Text style={{ fontWeight: TYPOGRAPHY.weights.bold }}>
                        {calculatedFees.element}
                      </Text>
                    </Text>
                  </View>
                )}

                <View
                  style={[
                    styles.tagPill,
                    {
                      backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
                      borderColor: isDark ? colors.neutral[700] : colors.neutral[300],
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.tagText,
                      { color: isDark ? colors.neutral[300] : colors.neutral[700] },
                    ]}
                  >
                    Applicants:{' '}
                    <Text style={{ fontWeight: TYPOGRAPHY.weights.bold }}>
                      {app.applicantsList?.length || 1} unit(s)
                    </Text>
                  </Text>
                </View>
              </View>
            </View>

            {/* ── Section 1: Payor Information ── */}
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
                  <DatePickerInput
                    label="Due Date"
                    required
                    value={dueDate}
                    onChangeText={setDueDate}
                    placeholder="YYYY-MM-DD"
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

            {/* ── Section 2: Statutory Fee Breakdown Table ── */}
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
                <View>
                  <Text
                    style={[
                      styles.sectionTitle,
                      { color: isDark ? colors.brand[400] : colors.brand[700] },
                    ]}
                  >
                    2. STATUTORY PARTICULARS &amp; FEE BREAKDOWN
                  </Text>
                  <Text
                    style={[
                      styles.sectionSubtitle,
                      { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                    ]}
                  >
                    {isManualMode
                      ? 'Manual item override active. Custom items will be submitted.'
                      : 'Computed dynamically by NTC statutory fee schedule.'}
                  </Text>
                </View>

                {/* Mode Switcher Button */}
                <Pressable
                  style={[
                    styles.modeToggleBtn,
                    {
                      backgroundColor: isManualMode
                        ? (isDark ? colors.brand[900] : colors.brand[100])
                        : (isDark ? colors.neutral[700] : colors.neutral[200]),
                      borderColor: isDark ? colors.neutral[600] : colors.neutral[300],
                    },
                  ]}
                  onPress={() => setIsManualMode((prev) => !prev)}
                >
                  <Lucide
                    name={isManualMode ? 'check-square' : 'edit-3'}
                    size={13}
                    color={isDark ? colors.neutral[200] : colors.neutral[800]}
                  />
                  <Text
                    style={[
                      styles.modeToggleText,
                      { color: isDark ? colors.neutral[200] : colors.neutral[800] },
                    ]}
                  >
                    {isManualMode ? 'Automated Mode' : 'Custom Override'}
                  </Text>
                </Pressable>
              </View>

              {/* Loading State */}
              {isCalculating && (
                <View style={styles.calculatingBox}>
                  <ActivityIndicator size="small" color={colors.brand[500]} />
                  <Text
                    style={[
                      styles.calculatingText,
                      { color: isDark ? colors.neutral[300] : colors.neutral[600] },
                    ]}
                  >
                    Calculating official statutory fees...
                  </Text>
                </View>
              )}

              {/* Calculation Error Banner */}
              {calculationError && (
                <View
                  style={[
                    styles.errorBanner,
                    {
                      backgroundColor: isDark ? colors.semantic.error + '22' : '#FEE2E2',
                      borderColor: COLORS.semantic.error,
                    },
                  ]}
                >
                  <Lucide name="alert-circle" size={16} color={COLORS.semantic.error} />
                  <Text style={[styles.errorBannerText, { color: COLORS.semantic.error }]}>
                    {calculationError}
                  </Text>
                  <Pressable onPress={fetchBackendCalculatedFees} style={styles.retryBtn}>
                    <Text style={styles.retryBtnText}>Retry</Text>
                  </Pressable>
                </View>
              )}

              {/* ── Mode 1: Automated Statutory Table ── */}
              {!isManualMode && !isCalculating && calculatedFees && (
                <View style={styles.itemsList}>
                  {calculatedFees.lineItems.map((item, idx) => (
                    <View
                      key={`calc-${idx}-${item.itemCode}`}
                      style={[
                        styles.itemRowCard,
                        {
                          backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
                          borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
                        },
                      ]}
                    >
                      <View style={styles.itemHeader}>
                        <View style={styles.itemHeaderLeft}>
                          <Text
                            style={[
                              styles.itemBadge,
                              {
                                backgroundColor: item.isTax
                                  ? (isDark ? '#065F46' : '#D1FAE5')
                                  : item.isSurcharge
                                  ? (isDark ? '#7F1D1D' : '#FEE2E2')
                                  : (isDark ? colors.neutral[700] : colors.neutral[100]),
                                color: item.isTax
                                  ? (isDark ? '#34D399' : '#065F46')
                                  : item.isSurcharge
                                  ? (isDark ? '#F87171' : '#991B1B')
                                  : (isDark ? colors.neutral[200] : colors.neutral[700]),
                              },
                            ]}
                          >
                            {item.isTax ? 'DST TAX' : item.isSurcharge ? 'PENALTY' : item.itemCode}
                          </Text>
                          <Text
                            style={[
                              styles.itemParticularTitle,
                              { color: isDark ? colors.neutral[100] : colors.neutral[900] },
                            ]}
                          >
                            {item.particular}
                          </Text>
                        </View>
                        <Text
                          style={[
                            styles.itemAmountBadge,
                            { color: isDark ? colors.brand[400] : colors.brand[700] },
                          ]}
                        >
                          PHP {item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </Text>
                      </View>

                      {item.description && (
                        <Text
                          style={[
                            styles.itemDescText,
                            { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                          ]}
                        >
                          {item.description}
                        </Text>
                      )}

                      <View style={styles.itemMetaRow}>
                        <Text
                          style={[
                            styles.itemMetaText,
                            { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                          ]}
                        >
                          Units: <Text style={{ fontWeight: TYPOGRAPHY.weights.semibold }}>{item.noOfUnits}</Text>
                        </Text>
                        <Text
                          style={[
                            styles.itemMetaText,
                            { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                          ]}
                        >
                          Validity: <Text style={{ fontWeight: TYPOGRAPHY.weights.semibold }}>{item.validityYears} yr(s)</Text>
                        </Text>
                        <Text
                          style={[
                            styles.itemMetaText,
                            { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                          ]}
                        >
                          Rate: <Text style={{ fontWeight: TYPOGRAPHY.weights.semibold }}>PHP {item.feeRate.toFixed(2)}</Text>
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* ── Mode 2: Manual Custom Line Items ── */}
              {isManualMode && (
                <View style={styles.itemsList}>
                  <View style={styles.manualToolbar}>
                    <Text
                      style={[
                        styles.manualToolbarDesc,
                        { color: isDark ? colors.neutral[300] : colors.neutral[600] },
                      ]}
                    >
                      Add or modify individual fee lines:
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
                        Add Item
                      </Text>
                    </Pressable>
                  </View>

                  {customLineItems.map((item, idx) => (
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
                        {customLineItems.length > 1 && (
                          <Pressable onPress={() => handleRemoveItem(item.id)} hitSlop={6}>
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
              )}

              {/* ── Total Assessment Summary Card ── */}
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
                    {isManualMode
                      ? `${customLineItems.length} custom line item(s)`
                      : `${calculatedFees?.lineItems.length ?? 0} statutory fee item(s) assessed`}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.totalValue,
                    { color: isDark ? colors.brand[400] : colors.brand[700] },
                  ]}
                >
                  PHP {displayedTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* ── Modal Footer Actions ── */}
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
              disabled={submitting}
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
                submitting && styles.btnDisabled,
              ]}
              onPress={handleGenerate}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color={COLORS.neutral.white} />
              ) : (
                <>
                  <Lucide name="check-circle" size={16} color={COLORS.neutral.white} />
                  <Text style={styles.submitBtnText}>
                    {isExistingSoa
                      ? (isManualMode ? 'Update Custom SOA' : 'Recalculate & Update SOA')
                      : (isManualMode ? 'Generate Custom SOA' : 'Generate Statement of Account')}
                  </Text>
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
    maxWidth: 820,
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
  computationBanner: {
    padding: SPACING[16],
    borderRadius: RADIUS.card,
    borderWidth: 1,
    gap: SPACING[8],
  },
  bannerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  bannerIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bannerTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.5,
  },
  formulaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
  },
  formulaBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  bannerDesc: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    lineHeight: 17,
  },
  metaTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
  },
  tagPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.xs,
    borderWidth: 1,
  },
  tagText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
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
    flexWrap: 'wrap',
    gap: 8,
  },
  sectionTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.8,
  },
  sectionSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    marginTop: 2,
  },
  modeToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  modeToggleText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  calculatingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: SPACING[12],
    justifyContent: 'center',
  },
  calculatingText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: SPACING[10],
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  errorBannerText: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
  },
  retryBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: COLORS.semantic.error,
    borderRadius: RADIUS.xs,
  },
  retryBtnText: {
    color: COLORS.neutral.white,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
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
    gap: SPACING[8],
  },
  itemRowCard: {
    padding: SPACING[10],
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    gap: 6,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  itemBadge: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  itemParticularTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
    flex: 1,
  },
  itemAmountBadge: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  itemDescText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    marginLeft: SPACING[4],
  },
  itemMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[12],
    marginTop: 2,
    paddingTop: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(150, 150, 150, 0.2)',
  },
  itemMetaText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
  },
  manualToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  manualToolbarDesc: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
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
