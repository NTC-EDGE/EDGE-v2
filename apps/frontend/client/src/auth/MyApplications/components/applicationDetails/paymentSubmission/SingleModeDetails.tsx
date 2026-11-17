import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Icon, DatePickerInput } from '@edge/ui';
import {
  ModeOfPayment,
  OnlinePaymentChannel,
  ONLINE_PAYMENT_CHANNELS,
  CheckProofFile,
} from './paymentSubmissionTypes';
import { styles } from './paymentSubmissionStyles';
import { CheckProofUploadField } from './CheckProofUploadField';

interface SingleModeDetailsProps {
  selectedMode: ModeOfPayment;
  onlineChannel: OnlinePaymentChannel;
  setOnlineChannel: (channel: OnlinePaymentChannel) => void;
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
  onlineChannel,
  setOnlineChannel,
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
          You have selected walk-in cash payment. Please present your Order of Payment (OP) to the NTC Regional Office Cashier. Submitting here registers your preferred payment method in the cashier queue.
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
          label="Check Date *"
          value={checkDate}
          onChangeText={setCheckDate}
          placeholder="YYYY-MM-DD"
        />
        <CheckProofUploadField
          file={checkProofFile}
          onFileChange={setCheckProofFile}
          label="Check Photo / Scanned Proof"
          helperText="Attach a clear photo or scanned copy of the physical check (JPEG, PNG, or PDF)"
          cameraTitle="Capture Check Photo"
          cameraInstruction="Position physical check clearly within frame"
          onPreview={onPreviewCheckProof}
        />
      </View>
    );
  }

  // Online / E-Payment mode (LandBank Link.BizPortal, GCash, Maya, Bank Transfer)
  const activeChannel =
    ONLINE_PAYMENT_CHANNELS.find((ch) => ch.id === onlineChannel) ??
    ONLINE_PAYMENT_CHANNELS[0];

  return (
    <View style={styles.checkCardSection}>
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>
          Payment Channel / Gateway <Text style={styles.requiredStar}>*</Text>
        </Text>
        <View style={styles.channelChipRow}>
          {ONLINE_PAYMENT_CHANNELS.map((channel) => {
            const isActive = onlineChannel === channel.id;
            return (
              <TouchableOpacity
                key={channel.id}
                style={[styles.channelChip, isActive && styles.channelChipActive]}
                onPress={() => setOnlineChannel(channel.id)}
                activeOpacity={0.75}
              >
                <Icon
                  name={isActive ? 'check-circle' : 'circle'}
                  size={12}
                  color={isActive ? '#1D4ED8' : '#64748B'}
                />
                <Text style={[styles.channelChipText, isActive && styles.channelChipTextActive]}>
                  {channel.shortLabel}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>
          {activeChannel?.refLabel || 'Transaction Reference / E-Receipt Number'}{' '}
          <Text style={styles.requiredStar}>*</Text>
        </Text>
        <TextInput
          style={styles.textInput}
          value={referenceNumber}
          onChangeText={setReferenceNumber}
          placeholder={activeChannel?.placeholder || 'e.g. LBP-EPAY-2026-XXXXX'}
          placeholderTextColor="#94A3B8"
        />
      </View>

      <CheckProofUploadField
        file={checkProofFile}
        onFileChange={setCheckProofFile}
        label="Payment Confirmation / E-Receipt Proof"
        helperText="Attach a screenshot, photo, or PDF copy of your online payment confirmation receipt (JPEG, PNG, or PDF)"
        cameraTitle="Capture Receipt Photo"
        cameraInstruction="Position payment receipt clearly within frame"
        onPreview={onPreviewCheckProof}
      />
    </View>
  );
}

