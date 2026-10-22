import React from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { Icon } from '@edge/ui';
import { Application } from '../../data/applicationsData';
import { styles } from './paymentSubmission/paymentSubmissionStyles';
import { PaymentModeSelector } from './paymentSubmission/PaymentModeSelector';
import { SingleModeDetails } from './paymentSubmission/SingleModeDetails';
import { CombinationPaymentSection } from './paymentSubmission/CombinationPaymentSection';
import { PaymentSubmissionFooter } from './paymentSubmission/PaymentSubmissionFooter';
import { useClientPaymentSubmission } from './paymentSubmission/useClientPaymentSubmission';

interface ClientPaymentSubmissionModalProps {
  visible: boolean;
  app: Application;
  onClose: () => void;
  onSuccess: () => void;
}

export function ClientPaymentSubmissionModal({
  visible,
  app,
  onClose,
  onSuccess,
}: ClientPaymentSubmissionModalProps) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const {
    totalAmountDue,
    selectedMode,
    setSelectedMode,
    referenceNumber,
    setReferenceNumber,
    payorName,
    setPayorName,
    remarks,
    setRemarks,
    isSubmitting,
    errorMessage,
    checkNumber,
    setCheckNumber,
    checkBank,
    setCheckBank,
    checkDate,
    setCheckDate,
    combinationRows,
    combinationTotalAllocated,
    allocationDifference,
    isAllocationBalanced,
    isExceedingTotal,
    applyPreset,
    applyThreePreset,
    handleAddCombinationRow,
    handleRemoveCombinationRow,
    handleUpdateCombinationRow,
    handleSubmit,
  } = useClientPaymentSubmission({ app, onClose, onSuccess, visible });

  const isSubmitDisabled = isExceedingTotal || (selectedMode === 'Combination' && !isAllocationBalanced);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalCard, isDesktop && { maxWidth: 660 }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIconCircle}>
              <Icon name="credit-card" size={20} color="#1D4ED8" />
            </View>
            <View style={styles.headerTitles}>
              <Text style={styles.title}>Submit Payment &amp; Proof</Text>
              <Text style={styles.subtitle}>
                Application #{app.referenceNumber || app.id} • {app.serviceName}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <Icon name="x" size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <ScrollView
            style={styles.scrollBody}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {errorMessage !== null && (
              <View style={styles.errorAlert}>
                <Icon name="alert-triangle" size={16} color="#DC2626" />
                <Text style={styles.errorAlertText}>{errorMessage}</Text>
              </View>
            )}

            {/* SOA Summary Box */}
            <View style={styles.soaSummaryBox}>
              <View style={styles.soaSummaryRow}>
                <Text style={styles.soaSummaryLabel}>Applicant / Company:</Text>
                <Text style={styles.soaSummaryValue}>{app.applicantName || app.companyName || '—'}</Text>
              </View>
              <View style={styles.soaSummaryRow}>
                <Text style={styles.soaSummaryLabel}>Total Amount Due:</Text>
                <Text style={[styles.soaSummaryValue, { color: '#16A34A', fontSize: 15 }]}>
                  ₱{totalAmountDue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </View>
            </View>

            {/* Section 1: Mode Selector */}
            <Text style={styles.sectionHeading}>1. SELECT PAYMENT METHOD</Text>
            <PaymentModeSelector selectedMode={selectedMode} onSelectMode={setSelectedMode} />

            {/* Section 2: Mode Details */}
            <Text style={styles.sectionHeading}>
              {selectedMode === 'Combination' ? '2. COMBINATION & ALLOCATION SETUP' : '2. PAYMENT DETAILS'}
            </Text>

            <SingleModeDetails
              selectedMode={selectedMode}
              referenceNumber={referenceNumber}
              setReferenceNumber={setReferenceNumber}
              checkNumber={checkNumber}
              setCheckNumber={setCheckNumber}
              checkBank={checkBank}
              setCheckBank={setCheckBank}
              checkDate={checkDate}
              setCheckDate={setCheckDate}
            />

            {selectedMode === 'Combination' && (
              <CombinationPaymentSection
                totalAmountDue={totalAmountDue}
                combinationRows={combinationRows}
                combinationTotalAllocated={combinationTotalAllocated}
                allocationDifference={allocationDifference}
                isAllocationBalanced={isAllocationBalanced}
                isExceedingTotal={isExceedingTotal}
                onApplyPreset={applyPreset}
                onApplyThreePreset={applyThreePreset}
                onAddRow={handleAddCombinationRow}
                onRemoveRow={handleRemoveCombinationRow}
                onUpdateRow={handleUpdateCombinationRow}
              />
            )}

            {/* Section 3: General Transaction Details */}
            <Text style={styles.sectionHeading}>3. GENERAL TRANSACTION DETAILS</Text>
            <View style={styles.formSection}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Payee / Payor Full Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={payorName}
                  onChangeText={setPayorName}
                  placeholder="e.g. Juan Dela Cruz / Acme Corp"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Client Remarks / Special Instructions (Optional)</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={remarks}
                  onChangeText={setRemarks}
                  placeholder="Additional reference numbers, branch details, or notes..."
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={2}
                />
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <PaymentSubmissionFooter
            isSubmitting={isSubmitting}
            isSubmitDisabled={isSubmitDisabled}
            onClose={onClose}
            onSubmit={handleSubmit}
          />
        </View>
      </View>
    </Modal>
  );
}
