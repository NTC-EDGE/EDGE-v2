import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { Icon, DatePickerInput } from '@edge/ui';
import { ModeOfPayment, CheckProofFile } from './paymentSubmissionTypes';
import { styles } from './paymentSubmissionStyles';
import { CheckProofUploadField } from './CheckProofUploadField';

interface SingleModeDetailsProps {
  selectedMode: ModeOfPayment;
  referenceNumber: string;
  setReferenceNumber: (v: string) => void;
  checkNumber: string;
  setCheckNumber: (v: string) => void;
  checkBank: string;
  setCheckBank: (v: string) => void;
  checkDate: string;
  setCheckDate: (v: string) => void;
  checkProofFile: CheckProofFile | null;
  setCheckProofFile: (file: CheckProofFile | null) => void;
  onPreviewCheckProof?: (file: CheckProofFile) => void;
}

export function SingleModeDetails({
  selectedMode,
  referenceNumber,
  setReferenceNumber,
  checkNumber,
  setCheckNumber,
  checkBank,
  setCheckBank,
  checkDate,
  setCheckDate,
  checkProofFile,
  setCheckProofFile,
  onPreviewCheckProof,
}: SingleModeDetailsProps) {
  if (selectedMode === 'Combination') {
    return null;
  }

  if (selectedMode === 'CashierOTC') {
    return (
      <View style={styles.guideBox}>
        <Icon name="info" size={16} color="#0284C7" />
        <Text style={styles.guideText}>
          You have selected on-site cash payment. Please present your Order of Payment (OP) to the NTC Regional Office Cashier. Submitting here registers your preferred payment method in the queue.
        </Text>
      </View>
    );
  }

  if (selectedMode === 'Check') {
    return (
      <View style={styles.checkCardSection}>
        <View style={styles.inlineCheckRow}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.inputLabel}>
              Check Number <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={styles.textInput}
              value={checkNumber}
              onChangeText={setCheckNumber}
              placeholder="e.g. 00012389"
              placeholderTextColor="#94A3B8"
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.inputLabel}>
              Drawee Bank <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={styles.textInput}
              value={checkBank}
              onChangeText={setCheckBank}
              placeholder="e.g. Land Bank / BDO / BPI"
              placeholderTextColor="#94A3B8"
            />
          </View>
        </View>
        <DatePickerInput
          label="Check Date"
          value={checkDate}
          onChangeText={setCheckDate}
          placeholder="YYYY-MM-DD"
        />
        <CheckProofUploadField
          file={checkProofFile}
          onFileChange={setCheckProofFile}
          onPreview={onPreviewCheckProof}
        />
      </View>
    );
  }

  // Online options (LandBank, GCashMaya, BankTransfer)
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>
        Transaction Reference / E-Receipt Number <Text style={styles.requiredStar}>*</Text>
      </Text>
      <TextInput
        style={styles.textInput}
        value={referenceNumber}
        onChangeText={setReferenceNumber}
        placeholder={
          selectedMode === 'LandBank'
            ? 'e.g. LBP-EPAY-2026-XXXXX'
            : selectedMode === 'GCashMaya'
            ? 'e.g. MP-2026-XXXXXXXX'
            : 'e.g. FT-UBP-XXXXXXXX'
        }
        placeholderTextColor="#94A3B8"
      />
    </View>
  );
}
