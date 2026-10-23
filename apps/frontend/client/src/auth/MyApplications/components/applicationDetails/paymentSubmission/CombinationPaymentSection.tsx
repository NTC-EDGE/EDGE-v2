import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Icon, DatePickerInput } from '@edge/ui';
import { PaymentItemMode } from '@edge/api';
import { CombinationRow, CheckProofFile } from './paymentSubmissionTypes';
import { styles } from './paymentSubmissionStyles';
import { CheckProofUploadField } from './CheckProofUploadField';

interface CombinationPaymentSectionProps {
  totalAmountDue: number;
  combinationRows: CombinationRow[];
  combinationTotalAllocated: number;
  allocationDifference: number;
  isAllocationBalanced: boolean;
  isExceedingTotal: boolean;
  onApplyPreset: (modeA: PaymentItemMode, modeB: PaymentItemMode) => void;
  onApplyThreePreset: () => void;
  onAddRow: () => void;
  onRemoveRow: (id: string) => void;
  onUpdateRow: (id: string, updates: Partial<CombinationRow>) => void;
  onPreviewCheckProof?: (file: CheckProofFile) => void;
}

export function CombinationPaymentSection({
  totalAmountDue,
  combinationRows,
  combinationTotalAllocated,
  allocationDifference,
  isAllocationBalanced,
  isExceedingTotal,
  onApplyPreset,
  onApplyThreePreset,
  onAddRow,
  onRemoveRow,
  onUpdateRow,
  onPreviewCheckProof,
}: CombinationPaymentSectionProps) {
  return (
    <View style={styles.combinationContainer}>
      {/* Presets */}
      <View style={styles.presetRow}>
        <Text style={styles.presetLabel}>Quick Presets:</Text>
        <TouchableOpacity
          style={styles.presetChip}
          onPress={() => onApplyPreset('Cash', 'Check')}
          activeOpacity={0.7}
        >
          <Icon name="layers" size={11} color="#4338CA" />
          <Text style={styles.presetChipText}>Cash + Check</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.presetChip}
          onPress={() => onApplyPreset('Check', 'Check')}
          activeOpacity={0.7}
        >
          <Icon name="layers" size={11} color="#4338CA" />
          <Text style={styles.presetChipText}>Check + Check</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.presetChip}
          onPress={() => onApplyPreset('Cash', 'Online')}
          activeOpacity={0.7}
        >
          <Icon name="layers" size={11} color="#4338CA" />
          <Text style={styles.presetChipText}>Cash + Online</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.presetChip}
          onPress={onApplyThreePreset}
          activeOpacity={0.7}
        >
          <Icon name="layers" size={11} color="#4338CA" />
          <Text style={styles.presetChipText}>Cash + Check + Online</Text>
        </TouchableOpacity>
      </View>

      {/* Allocation Banner */}
      <View
        style={[
          styles.allocationBanner,
          isAllocationBalanced
            ? styles.allocationBannerBalanced
            : isExceedingTotal
            ? styles.allocationBannerExceeded
            : styles.allocationBannerPending,
        ]}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.allocationTitle,
              isAllocationBalanced
                ? { color: '#166534' }
                : isExceedingTotal
                ? { color: '#DC2626' }
                : { color: '#92400E' },
            ]}
          >
            {isAllocationBalanced
              ? '✓ Fully Balanced'
              : isExceedingTotal
              ? `⚠ Exceeds Total by ₱${(combinationTotalAllocated - totalAmountDue).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })} (Not Allowed)`
              : `Remaining to Allocate: ₱${allocationDifference.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`}
          </Text>
          <Text
            style={[
              styles.allocationSub,
              isAllocationBalanced
                ? { color: '#15803D' }
                : isExceedingTotal
                ? { color: '#B91C1C' }
                : { color: '#B45309' },
            ]}
          >
            Allocated: ₱
            {combinationTotalAllocated.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{' '}
            / Total Due: ₱
            {totalAmountDue.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.addRowBtn,
            (isExceedingTotal || isAllocationBalanced) && { opacity: 0.5 },
          ]}
          onPress={onAddRow}
          disabled={isExceedingTotal || isAllocationBalanced}
          activeOpacity={0.8}
        >
          <Icon name="plus" size={13} color="#FFFFFF" />
          <Text style={styles.addRowBtnText}>Add Mode</Text>
        </TouchableOpacity>
      </View>

      {/* Combination Rows */}
      {combinationRows.map((row, index) => (
        <View key={row.id} style={styles.combinationItemCard}>
          <View style={styles.combinationItemHeader}>
            <View style={styles.modePillSelector}>
              {(['Cash', 'Check', 'Online'] as PaymentItemMode[]).map((mode) => {
                const isActive = row.mode === mode;
                return (
                  <TouchableOpacity
                    key={mode}
                    style={[
                      styles.modeSelectBtn,
                      isActive && styles.modeSelectBtnActive,
                    ]}
                    onPress={() => onUpdateRow(row.id, { mode })}
                  >
                    <Text
                      style={[
                        styles.modeSelectBtnText,
                        isActive && styles.modeSelectBtnTextActive,
                      ]}
                    >
                      {mode}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.amountInputInlineWrapper}>
              <Text style={styles.currencyPrefix}>₱</Text>
              <TextInput
                style={styles.amountInlineInput}
                keyboardType="numeric"
                value={row.amount}
                onChangeText={(val) => onUpdateRow(row.id, { amount: val })}
                placeholder="0.00"
                placeholderTextColor="#94A3B8"
              />
            </View>

            {combinationRows.length > 2 && (
              <TouchableOpacity
                style={styles.removeRowBtn}
                onPress={() => onRemoveRow(row.id)}
                activeOpacity={0.7}
              >
                <Icon name="trash-2" size={15} color="#EF4444" />
              </TouchableOpacity>
            )}
          </View>

          {/* Sub-fields for Check row */}
          {row.mode === 'Check' && (
            <View style={{ gap: 6 }}>
              <View style={styles.subFieldsRow}>
                <TextInput
                  style={[styles.textInput, styles.compactInput, { flex: 1 }]}
                  placeholder="Check # *"
                  placeholderTextColor="#94A3B8"
                  value={row.checkNumber}
                  onChangeText={(val) => onUpdateRow(row.id, { checkNumber: val })}
                />
                <TextInput
                  style={[styles.textInput, styles.compactInput, { flex: 1 }]}
                  placeholder="Drawee Bank *"
                  placeholderTextColor="#94A3B8"
                  value={row.checkBank}
                  onChangeText={(val) => onUpdateRow(row.id, { checkBank: val })}
                />
              </View>
              <DatePickerInput
                placeholder="Check Date (YYYY-MM-DD)"
                value={row.checkDate}
                onChangeText={(val) => onUpdateRow(row.id, { checkDate: val })}
              />
              <CheckProofUploadField
                compact={true}
                file={row.checkProofFile ?? null}
                onFileChange={(proof) => onUpdateRow(row.id, { checkProofFile: proof })}
                onPreview={onPreviewCheckProof}
              />
            </View>
          )}

          {/* Sub-fields for Online row */}
          {row.mode === 'Online' && (
            <TextInput
              style={[styles.textInput, styles.compactInput]}
              placeholder="Online Ref # / E-Receipt *"
              placeholderTextColor="#94A3B8"
              value={row.referenceNumber}
              onChangeText={(val) => onUpdateRow(row.id, { referenceNumber: val })}
            />
          )}
        </View>
      ))}
    </View>
  );
}
