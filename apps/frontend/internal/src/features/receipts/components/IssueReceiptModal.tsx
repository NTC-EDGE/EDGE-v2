import React from 'react';
import { View, Text, Modal, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
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
    isMultiOpBulk,
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

  const handlePreviewOr = () => {
    if (pendingPayment?.applicationId) {
      const currentOr = useManualOr ? manualOrNumber.trim() : (nextOr?.formattedOrNumber ?? '');
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

  const formattedTotal = (totalAmount ?? 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const activeBulkTarget = hasBulkOpOptions ? bulkOpItems[selectedBulkOpIndex] : undefined;
  const bulkTargetsForTotal = unpaidBulkOpItems.length > 0 ? unpaidBulkOpItems : bulkOpItems;
  const bulkTotalAmount = bulkTargetsForTotal.reduce((sum, item) => sum + (item.amountDue || 0), 0);
  const formattedBulkTotal = bulkTotalAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const activeOpLabel = hasBulkOpOptions
    ? (bulkOrScope === 'bulk'
        ? `Bulk (${Array.from(new Set(bulkTargetsForTotal.map((o) => o.opNumber.replace(/\s*\(#\d+\)\s*$/, '')))).join(', ')})`
        : `OP #${activeBulkTarget?.opNumber ?? pendingPayment?.opNumber ?? ''}`)
    : undefined;

  const activeApplicantName = hasBulkOpOptions
    ? (bulkOrScope === 'bulk'
        ? `${pendingPayment?.applicantName ?? 'Bulk Payor'} (${bulkTargetsForTotal.length} ${isMultiOpBulk ? 'OPs' : 'Applicants'})`
        : activeBulkTarget?.applicantName)
    : undefined;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.cardBg }]}>
          {/* Top Modal Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.titleRow}>
              <View style={[styles.iconBox, { backgroundColor: '#F1F5F9' }]}>
                <Lucide name="printer" size={18} color={colors.neutral[700]} />
              </View>
              <View>
                <Text style={[styles.title, { color: colors.text }]}>
                  {isFromPendingPayment ? 'Issue Official Receipt for Order of Payment' : 'Manual Official Receipt Issuance'}
                </Text>
                <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                  {useManualOr
                    ? 'Manual OR Number Override'
                    : nextOr?.hasActiveBooklet
                    ? `Booklet ${nextOr.bookletNumber ?? ''} (${nextOr.remainingCount} remaining)`
                    : 'No active booklet'}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityLabel="Close Modal">
              <Lucide name="x" size={20} color={colors.neutral[500]} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {errorMsg !== null && (
              <View style={styles.errorBox}>
                <Lucide name="alert-triangle" size={18} color={colors.semantic.error} />
                <Text style={[styles.errorText, { color: colors.semantic.error }]}>{errorMsg}</Text>
              </View>
            )}

            {/* Bulk Application OR Issuance Mode (Per OP vs As Bulk) */}
            {hasBulkOpOptions && (
              <View
                style={[
                  styles.preferredCard,
                  {
                    backgroundColor: '#F8FAFC',
                    borderColor: colors.border,
                    borderLeftColor: '#4F46E5',
                  },
                ]}
              >
                <View style={styles.preferredCardHeader}>
                  <View style={styles.preferredTitleRow}>
                    <Lucide name="users" size={16} color="#4F46E5" />
                    <Text style={[styles.preferredTitleText, { color: colors.text }]}>
                      BULK APPLICATION RECEIPT ISSUANCE
                    </Text>
                  </View>
                  <View style={[styles.preferredBadge, { backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' }]}>
                    <Text style={[styles.preferredBadgeText, { color: '#475569' }]}>
                      {isMultiOpBulk ? `${bulkOpItems.length} Orders of Payment` : `${bulkOpItems.length} Applicants`}
                    </Text>
                  </View>
                </View>

                <View style={styles.strategyOptionsRow}>
                  <TouchableOpacity
                    style={[
                      styles.strategyOptionCard,
                      { borderColor: colors.border, backgroundColor: '#FFFFFF' },
                      bulkOrScope === 'per_op' && {
                        borderColor: colors.brand.primary,
                        backgroundColor: '#F8FAFC',
                      },
                    ]}
                    onPress={() => handleSelectBulkOrScope('per_op')}
                  >
                    <View
                      style={[
                        styles.strategyRadio,
                        bulkOrScope === 'per_op' && { borderColor: colors.brand.primary },
                      ]}
                    >
                      {bulkOrScope === 'per_op' && (
                        <View style={[styles.strategyRadioInner, { backgroundColor: colors.brand.primary }]} />
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.strategyTitle,
                          bulkOrScope === 'per_op' && { color: colors.brand.primary },
                        ]}
                      >
                        Issue OR per Order of Payment
                      </Text>
                      <Text style={styles.strategySub}>
                        Issue individual Official Receipts per OP / applicant
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.strategyOptionCard,
                      { borderColor: colors.border, backgroundColor: '#FFFFFF' },
                      bulkOrScope === 'bulk' && {
                        borderColor: colors.brand.primary,
                        backgroundColor: '#F8FAFC',
                      },
                    ]}
                    onPress={() => handleSelectBulkOrScope('bulk')}
                  >
                    <View
                      style={[
                        styles.strategyRadio,
                        bulkOrScope === 'bulk' && { borderColor: colors.brand.primary },
                      ]}
                    >
                      {bulkOrScope === 'bulk' && (
                        <View style={[styles.strategyRadioInner, { backgroundColor: colors.brand.primary }]} />
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.strategyTitle,
                          bulkOrScope === 'bulk' && { color: colors.brand.primary },
                        ]}
                      >
                        Issue OR as Bulk (₱{formattedBulkTotal})
                      </Text>
                      <Text style={styles.strategySub}>
                        Issue 1 consolidated Official Receipt covering all {bulkTargetsForTotal.length} unpaid {isMultiOpBulk ? 'OPs' : 'applicants'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>

                {bulkOrScope === 'per_op' ? (
                  <View style={styles.splitModesContainer}>
                    <Text style={[styles.splitModesLabel, { color: colors.neutral[700] }]}>
                      Select Order of Payment / Applicant to issue OR for now:
                    </Text>
                    <View style={styles.splitModesChipsRow}>
                      {bulkOpItems.map((item, idx) => {
                        const isPaid = item.status === 'Paid';
                        const isSelected = selectedBulkOpIndex === idx;
                        return (
                          <TouchableOpacity
                            key={`${item.orderOfPaymentId}-${idx}`}
                            disabled={isPaid}
                            onPress={() => handleSelectBulkOpItem(idx)}
                            style={[
                              styles.splitModeBtn,
                              { borderColor: colors.neutral[300], backgroundColor: '#FFFFFF' },
                              isSelected && { borderColor: colors.brand.primary, backgroundColor: colors.brand.primary },
                              isPaid && { borderColor: colors.border, backgroundColor: '#F8FAFC', opacity: 0.7 },
                            ]}
                          >
                            <Lucide
                              name={isPaid ? 'check-circle' : 'file-text'}
                              size={14}
                              color={isPaid ? '#16A34A' : isSelected ? '#fff' : colors.neutral[700]}
                            />
                            <Text
                              style={[
                                styles.splitModeBtnText,
                                isSelected && { color: '#fff', fontWeight: '700' },
                                isPaid && { color: colors.neutral[600] },
                              ]}
                            >
                              {item.opNumber} • {item.applicantName} (₱{item.amountDue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                              {isPaid && item.officialReceiptNumber ? ` [OR #${item.officialReceiptNumber}]` : ''}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                ) : (
                  <View
                    style={[
                      styles.strategyActiveBanner,
                      {
                        backgroundColor: '#FFFFFF',
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                      <Lucide name="layers" size={14} color={colors.neutral[600]} />
                      <Text style={[styles.strategyActiveBannerText, { color: colors.text }]}>
                        Included OPs: {Array.from(new Set(bulkTargetsForTotal.map((o) => o.opNumber.replace(/\s*\(#\d+\)\s*$/, '')))).join(', ')} ({bulkTargetsForTotal.length} {isMultiOpBulk ? 'OPs' : 'applicants'})
                      </Text>
                    </View>
                    <Text style={[styles.strategyActiveBannerSub, { color: colors.text }]}>
                      Total: ₱{formattedBulkTotal}
                    </Text>
                  </View>
                )}
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
            />

            <ReceiptPayorSection
              isFromPendingPayment={isFromPendingPayment}
              pendingPayment={pendingPayment ?? undefined}
              payorName={payorName}
              setPayorName={setPayorName}
              payorAddress={payorAddress}
              setPayorAddress={setPayorAddress}
              activeOpLabel={activeOpLabel}
              activeApplicantName={activeApplicantName}
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

          {/* Modal Footer with High-Contrast Action Buttons */}
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
                  <Text style={styles.submitBtnText}>
                    Issue Official Receipt ({totalAmount > 0 ? `₱${formattedTotal}` : 'Confirm'})
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
