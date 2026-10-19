import React from 'react';
import { View, Text, Modal, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Icon as Lucide, useTheme } from '@edge/ui';
import { NextAvailableOrDto, PendingPaymentDto, OfficialReceiptDto, useReceiptFeeCatalog } from '@edge/api';
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
    activeSuggestionIndex,
    setActiveSuggestionIndex,
    lineItems,
    isSubmitting,
    errorMsg,
    isFromPendingPayment,
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

  const formattedTotal = (totalAmount ?? 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.cardBg }]}>
          {/* Top Modal Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.titleRow}>
              <View style={[styles.iconBox, { backgroundColor: colors.brand.indigoLight }]}>
                <Lucide name="printer" size={20} color={colors.brand.primary} />
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
            />

            <ReceiptPayorSection
              isFromPendingPayment={isFromPendingPayment}
              pendingPayment={pendingPayment ?? undefined}
              payorName={payorName}
              setPayorName={setPayorName}
              payorAddress={payorAddress}
              setPayorAddress={setPayorAddress}
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

            <View style={styles.remarksBox}>
              <Text style={[styles.inlineFieldLabel, { color: colors.neutral[800] }]}>
                Remarks / Reference Notes (Optional)
              </Text>
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
