import React from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { Icon as Lucide, useTheme } from '@edge/ui';
import { NextAvailableOrDto, PendingPaymentDto, OfficialReceiptDto, useReceiptFeeCatalog, applicationService } from '@edge/api';
import { styles } from './issueReceipt/issueReceiptStyles';
import { PreferredPaymentBanner } from './issueReceipt/PreferredPaymentBanner';
import { ReceiptHeaderCard } from './issueReceipt/ReceiptHeaderCard';
import { ReceiptPayorSection } from './issueReceipt/ReceiptPayorSection';
import { ReceiptLineItemsTable } from './issueReceipt/ReceiptLineItemsTable';
import { useIssueReceiptForm } from './issueReceipt/useIssueReceiptForm';

interface IssueReceiptModalProps {
  visible: boolean;
  tenantId: string;
  nextOr?: NextAvailableOrDto;
  pendingPayment?: PendingPaymentDto | null;
  onClose: () => void;
  onSuccess: (issuedReceipt?: OfficialReceiptDto) => void;
}

export function IssueReceiptModal({
  visible,
  tenantId,
  nextOr,
  pendingPayment,
  onClose,
  onSuccess,
}: IssueReceiptModalProps) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 860;
  const { feeCatalog, isLoading: isLoadingFeeCatalog } = useReceiptFeeCatalog(undefined, visible);

  const {
    payorName,
    setPayorName,
    payorAddress,
    setPayorAddress,
    paymentMethod,
    setPaymentMethod,
    checkNumber,
    setCheckNumber,
    checkBank,
    setCheckBank,
    checkDate,
    setCheckDate,
    onlineReference,
    setOnlineReference,
    remarks,
    setRemarks,
    manualOrNumber,
    setManualOrNumber,
    useManualOr,
    setUseManualOr,
    issuanceStrategy,
    selectedSplitIndex,
    bulkOrScope,
    selectedBulkOpIndex,
    bulkOpItems,
    unpaidBulkOpItems,
    hasBulkOpOptions,
    handleSelectBulkOrScope,
    handleSelectBulkOpItem,
    activeSuggestionIndex,
    setActiveSuggestionIndex,
    lineItems,
    isSubmitting,
    errorMsg,
    isFromPendingPayment,
    issueDate,
    setIssueDate,
    dateChangeReason,
    setDateChangeReason,
    todayStr,
    preferredBreakdown,
    totalAmount,
    handleSelectSplitItem,
    handleSelectStrategy,
    handleAddLineItem,
    handleRemoveLineItem,
    handleUpdateLineItem,
    handleSelectFee,
    handlePaymentMethodChange,
    clientPaymentDetails,
    handleSubmit,
  } = useIssueReceiptForm({
    visible,
    tenantId,
    nextOr,
    pendingPayment,
    onClose,
    onSuccess,
  });

  const activeBulkTarget = hasBulkOpOptions ? bulkOpItems[selectedBulkOpIndex] : undefined;
  const bulkTargetsForTotal = unpaidBulkOpItems.length > 0 ? unpaidBulkOpItems : bulkOpItems;

  const isCurrentSelectionPaid = hasBulkOpOptions
    ? (bulkOrScope === 'per_op'
        ? activeBulkTarget?.status === 'Paid'
        : unpaidBulkOpItems.length === 0)
    : false;

  const activeOpLabel = hasBulkOpOptions
    ? (bulkOrScope === 'bulk'
        ? Array.from(new Set(bulkTargetsForTotal.map((o) => o.opNumber.replace(/\s*\(#\d+\)\s*$/, '')))).join(', ')
        : (activeBulkTarget?.opNumber.replace(/\s*\(#\d+\)\s*$/, '') ?? pendingPayment?.opNumber ?? ''))
    : (pendingPayment?.opNumber ?? undefined);

  const activeSoaLabel = hasBulkOpOptions
    ? (bulkOrScope === 'bulk'
        ? Array.from(new Set(bulkTargetsForTotal.map((o) => o.soaNumber).filter(Boolean))).join(', ') || pendingPayment?.soaNumber
        : (activeBulkTarget?.soaNumber || pendingPayment?.soaNumber))
    : (pendingPayment?.soaNumber ?? undefined);

  const activeIssuedOrNumber =
    hasBulkOpOptions && bulkOrScope === 'per_op'
      ? (activeBulkTarget?.officialReceiptNumber ?? null)
      : null;

  const handlePreviewOr = () => {
    if (pendingPayment?.applicationId) {
      const currentOr =
        isCurrentSelectionPaid && activeIssuedOrNumber
          ? activeIssuedOrNumber
          : useManualOr
            ? manualOrNumber.trim()
            : (nextOr?.formattedOrNumber ?? '');
      const url = applicationService.getOrPrintUrl(
        pendingPayment.applicationId,
        currentOr || undefined,
        'landscape',
        payorName.trim() || undefined,
        issueDate || undefined
      );
      if (typeof window !== 'undefined') {
        const win = window.open(url, '_blank');
        if (win !== null) {
          win.focus();
        }
      }
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.container,
            {
              backgroundColor: colors.cardBg,
              maxWidth: hasBulkOpOptions && isDesktop ? 1060 : 720,
            },
          ]}
        >
          {/* Top Modal Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.titleRow}>
              <View style={[styles.iconBox, { backgroundColor: '#F1F5F9' }]}>
                <Lucide name="printer" size={18} color={colors.neutral[700]} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.title, { color: colors.text }]}>
                  {isFromPendingPayment ? 'Issue Official Receipt for Order of Payment' : 'Manual Official Receipt Issuance'}
                </Text>
                <Text style={[styles.subtitle, { color: colors.textMuted }]} numberOfLines={1}>
                  {isFromPendingPayment && pendingPayment
                    ? `${pendingPayment.serviceName || 'Application Payment'}${hasBulkOpOptions ? ` • Bulk (${bulkOpItems.length} Applicants)` : ''}`
                    : 'Enter receipt details and particulars below'}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityLabel="Close Modal">
              <Lucide name="x" size={20} color={colors.neutral[500]} />
            </TouchableOpacity>
          </View>

          {/* Main Content: 2-Column Layout when Bulk Application, 1-Column when Single */}
          <View
            style={[
              hasBulkOpOptions && isDesktop ? styles.twoColumnWrap : { flexShrink: 1 },
            ]}
          >
            {/* Left Column: Applicants List (Only for Bulk Applications) */}
            {hasBulkOpOptions && (
              <View
                style={[
                  styles.leftSidebar,
                  {
                    borderRightColor: colors.border,
                    width: isDesktop ? 280 : '100%',
                    borderRightWidth: isDesktop ? 1 : 0,
                    borderBottomWidth: isDesktop ? 0 : 1,
                    borderBottomColor: colors.border,
                  },
                ]}
              >
                <View style={styles.sidebarHeader}>
                  <View style={styles.sidebarTitleRow}>
                    <Lucide name="users" size={16} color="#1D4ED8" />
                    <Text style={styles.sidebarTitle}>Applicants List</Text>
                  </View>
                  <View style={styles.sidebarCountBadge}>
                    <Text style={styles.sidebarCountText}>{bulkOpItems.length}</Text>
                  </View>
                </View>

                {/* Issuance Scope Segmented Control */}
                <View style={styles.scopeToggleRow}>
                  <TouchableOpacity
                    style={[
                      styles.scopeToggleBtn,
                      bulkOrScope === 'per_op' && styles.scopeToggleBtnActive,
                    ]}
                    onPress={() => handleSelectBulkOrScope('per_op')}
                  >
                    <Text
                      style={[
                        styles.scopeToggleText,
                        bulkOrScope === 'per_op' && styles.scopeToggleTextActive,
                      ]}
                    >
                      Per Applicant
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.scopeToggleBtn,
                      bulkOrScope === 'bulk' && styles.scopeToggleBtnActive,
                    ]}
                    onPress={() => handleSelectBulkOrScope('bulk')}
                  >
                    <Text
                      style={[
                        styles.scopeToggleText,
                        bulkOrScope === 'bulk' && styles.scopeToggleTextActive,
                      ]}
                    >
                      As Bulk OR
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Selectable Applicant Names List (Names Only — OP & SOA Shown on Right) */}
                <ScrollView
                  style={isDesktop ? styles.applicantListScroll : { maxHeight: 180 }}
                  showsVerticalScrollIndicator={false}
                >
                  {bulkOpItems.map((item, idx) => {
                    const isPaid = item.status === 'Paid';
                    const isSelected = bulkOrScope === 'per_op' && selectedBulkOpIndex === idx;
                    const isIncludedInBulk = bulkOrScope === 'bulk' && !isPaid;

                    return (
                      <TouchableOpacity
                        key={`${item.orderOfPaymentId}-${idx}`}
                        onPress={() => handleSelectBulkOpItem(idx)}
                        style={[
                          styles.applicantCard,
                          (isSelected || isIncludedInBulk) && styles.applicantCardActive,
                          isPaid && !isSelected && { backgroundColor: '#F8FAFC' },
                        ]}
                        activeOpacity={0.75}
                      >
                        <View
                          style={[
                            styles.applicantIndexBadge,
                            (isSelected || isIncludedInBulk) && styles.applicantIndexBadgeActive,
                            isPaid && { backgroundColor: '#DCFCE7' },
                          ]}
                        >
                          <Text
                            style={[
                              styles.applicantIndexText,
                              (isSelected || isIncludedInBulk) && styles.applicantIndexTextActive,
                              isPaid && { color: '#15803D' },
                            ]}
                          >
                            {idx + 1}
                          </Text>
                        </View>

                        <Text
                          style={[
                            styles.applicantNameText,
                            (isSelected || isIncludedInBulk) && styles.applicantNameTextActive,
                          ]}
                          numberOfLines={1}
                        >
                          {item.applicantName}
                        </Text>

                        {isPaid ? (
                          <View style={styles.applicantPaidBadge}>
                            <Lucide name="check-circle" size={11} color="#059669" />
                            <Text style={styles.applicantPaidText}>Paid</Text>
                          </View>
                        ) : (
                          <Lucide
                            name="chevron-right"
                            size={15}
                            color={isSelected || isIncludedInBulk ? '#1D4ED8' : '#94A3B8'}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* Right Column: Official Receipt Details */}
            <ScrollView
              style={[styles.body, hasBulkOpOptions && isDesktop && { flex: 1 }]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {errorMsg !== null && (
                <View style={styles.errorBox}>
                  <Lucide name="alert-triangle" size={18} color={colors.semantic.error} />
                  <Text style={[styles.errorText, { color: colors.semantic.error }]}>{errorMsg}</Text>
                </View>
              )}

              <PreferredPaymentBanner
                preferredBreakdown={preferredBreakdown}
                pendingPayment={pendingPayment}
                issuanceStrategy={issuanceStrategy}
                selectedSplitIndex={selectedSplitIndex}
                onSelectStrategy={handleSelectStrategy}
                onSelectSplitItem={handleSelectSplitItem}
              />

              <ReceiptHeaderCard
                useManualOr={useManualOr}
                manualOrNumber={manualOrNumber}
                setUseManualOr={setUseManualOr}
                setManualOrNumber={setManualOrNumber}
                nextOr={nextOr}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                onPaymentMethodChange={handlePaymentMethodChange}
                clientSubmittedPayment={clientPaymentDetails}
                isFromPendingPayment={isFromPendingPayment}
                checkNumber={checkNumber}
                setCheckNumber={setCheckNumber}
                checkBank={checkBank}
                setCheckBank={setCheckBank}
                checkDate={checkDate}
                setCheckDate={setCheckDate}
                onlineReference={onlineReference}
                setOnlineReference={setOnlineReference}
                issueDate={issueDate}
                setIssueDate={setIssueDate}
                dateChangeReason={dateChangeReason}
                setDateChangeReason={setDateChangeReason}
                todayStr={todayStr}
                isAlreadyPaid={isCurrentSelectionPaid}
                issuedOrNumber={activeIssuedOrNumber}
              />

              <ReceiptPayorSection
                isFromPendingPayment={isFromPendingPayment}
                pendingPayment={pendingPayment ?? undefined}
                payorName={payorName}
                setPayorName={setPayorName}
                payorAddress={payorAddress}
                setPayorAddress={setPayorAddress}
                activeOpLabel={activeOpLabel}
                activeSoaLabel={activeSoaLabel}
              />

              <ReceiptLineItemsTable
                isFromPendingPayment={isFromPendingPayment}
                lineItems={lineItems}
                totalAmount={totalAmount}
                feeCatalog={feeCatalog}
                isLoadingFeeCatalog={isLoadingFeeCatalog}
                activeSuggestionIndex={activeSuggestionIndex}
                setActiveSuggestionIndex={setActiveSuggestionIndex}
                handleAddLineItem={handleAddLineItem}
                handleRemoveLineItem={handleRemoveLineItem}
                handleUpdateLineItem={handleUpdateLineItem}
                handleSelectFee={handleSelectFee}
              />

              <View
                style={[
                  styles.remarksBox,
                  {
                    backgroundColor: colors.cardBg,
                    borderColor: colors.border,
                    borderLeftColor: '#D97706',
                  },
                ]}
              >
                <View style={styles.sectionHeaderRow}>
                  <View style={styles.sectionHeaderLeft}>
                    <View style={[styles.sectionIconBadge, { backgroundColor: '#FEF3C7' }]}>
                      <Lucide name="file-text" size={14} color="#D97706" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.sectionHeaderTitle, { color: '#B45309' }]}>
                        4. REMARKS &amp; REFERENCE NOTES (OPTIONAL)
                      </Text>
                      <Text style={styles.sectionHeaderSub}>
                        Add transaction notes, endorsement details, or collection remarks
                      </Text>
                    </View>
                  </View>
                </View>
                <TextInput
                  style={[styles.input, { borderColor: colors.neutral[300], color: colors.text }]}
                  placeholder="Optional notes, transaction numbers or references"
                  placeholderTextColor={colors.neutral[400]}
                  value={remarks}
                  onChangeText={setRemarks}
                />
              </View>
            </ScrollView>
          </View>

          {/* Modal Footer */}
          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <TouchableOpacity onPress={onClose} style={[styles.cancelBtn, { backgroundColor: colors.neutral[100] }]}>
              <Text style={[styles.cancelBtnText, { color: colors.neutral[700] }]}>Cancel</Text>
            </TouchableOpacity>

            <View style={{ flex: 1 }} />

            {pendingPayment?.applicationId !== undefined && (
              <TouchableOpacity
                onPress={handlePreviewOr}
                style={[
                  styles.cancelBtn,
                  {
                    backgroundColor: colors.cardBg,
                    borderColor: colors.brand.primary,
                    borderWidth: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                  },
                ]}
              >
                <Lucide name="printer" size={16} color={colors.brand.primary} />
                <Text style={[styles.cancelBtnText, { color: colors.brand.primary, fontWeight: '700' }]}>
                  Preview OR
                </Text>
              </TouchableOpacity>
            )}

            {!isCurrentSelectionPaid && (
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isSubmitting}
                style={[
                  styles.submitBtn,
                  { backgroundColor: colors.brand.primary },
                  isSubmitting && { opacity: 0.7 },
                ]}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Lucide name="check-circle" size={18} color="#fff" />
                    <Text style={styles.submitBtnText}>Issue Official Receipt</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}
