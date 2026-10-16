import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Icon as Lucide, useTheme } from '@edge/ui';
import { IssueReceiptLineItemInput, ReceiptFeeItemDto } from '@edge/api';
import { FeeSuggestionsDropdown } from '../FeeSuggestionsDropdown';
import { styles } from './issueReceiptStyles';

interface ReceiptLineItemsTableProps {
  isFromPendingPayment: boolean;
  lineItems: IssueReceiptLineItemInput[];
  totalAmount: number;
  feeCatalog: ReceiptFeeItemDto[];
  isLoadingFeeCatalog: boolean;
  activeSuggestionIndex: number | null;
  setActiveSuggestionIndex: (idx: number | null) => void;
  handleAddLineItem: () => void;
  handleRemoveLineItem: (idx: number) => void;
  handleUpdateLineItem: (index: number, field: keyof IssueReceiptLineItemInput, value: string | number) => void;
  handleSelectFee: (index: number, fee: ReceiptFeeItemDto) => void;
}

export function ReceiptLineItemsTable({
  isFromPendingPayment,
  lineItems,
  totalAmount,
  feeCatalog,
  isLoadingFeeCatalog,
  activeSuggestionIndex,
  setActiveSuggestionIndex,
  handleAddLineItem,
  handleRemoveLineItem,
  handleUpdateLineItem,
  handleSelectFee,
}: ReceiptLineItemsTableProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.breakdownSection}>
      <View style={styles.breakdownHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.sectionHeading, { color: colors.text }]}>
            {isFromPendingPayment ? 'Prescribed Items to be Paid (Assessed Fees)' : 'Particulars & Fee Breakdown'}
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
            {isFromPendingPayment
              ? 'Fees and particulars are determined by Evaluator/Accountant and locked for Cashier collection.'
              : 'Search fee code (e.g. REG-FEE, EXAM) or enter custom particulars'}
          </Text>
        </View>
        {!isFromPendingPayment && (
          <View style={styles.breakdownActions}>
            <TouchableOpacity
              onPress={handleAddLineItem}
              style={[styles.addItemBtn, { backgroundColor: colors.brand.primary }]}
            >
              <Lucide name="plus" size={13} color="#fff" />
              <Text style={[styles.addItemBtnText, { color: '#fff' }]}>Add Item</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Line Items List */}
      {isFromPendingPayment ? (
        <View style={{ marginBottom: 4 }}>
          {lineItems.map((item, idx) => (
            <View key={idx} style={[styles.readOnlyLineItemCard, { borderColor: colors.border, backgroundColor: colors.cardBg }]}>
              <View style={styles.readOnlyLineItemLeft}>
                <View style={[styles.readOnlyFeeCodeBadge, { backgroundColor: colors.neutral[100] }]}>
                  <Text style={[styles.readOnlyFeeCodeText, { color: colors.neutral[700] }]}>
                    {item.feeCode || 'FEE'}
                  </Text>
                </View>
                <Text style={[styles.readOnlyDescText, { color: colors.text }]} numberOfLines={2}>
                  {item.description}
                </Text>
              </View>
              <Text style={[styles.readOnlyAmountText, { color: colors.semantic.successText }]}>
                ₱{(item.amount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        lineItems.map((item, idx) => (
          <View key={idx} style={styles.lineItemWrapper}>
            <View style={styles.lineItemRow}>
              {/* Description / Particulars Search Input */}
              <View style={{ flex: 3, marginRight: 8, position: 'relative' }}>
                <View style={[styles.searchInputWrapper, { borderColor: colors.neutral[300] }]}>
                  <Lucide name="search" size={14} color={colors.neutral[400]} style={{ marginRight: 6 }} />
                  <TextInput
                    style={[styles.descInput, { color: colors.text }]}
                    placeholder="Search fee code (e.g. REG-FEE) or type particulars..."
                    placeholderTextColor={colors.neutral[400]}
                    value={item.description}
                    onFocus={() => setActiveSuggestionIndex(idx)}
                    onChangeText={(val) => {
                      handleUpdateLineItem(idx, 'description', val);
                      setActiveSuggestionIndex(idx);
                    }}
                  />
                </View>
              </View>

              {/* Amount Input */}
              <View style={{ width: 140, marginRight: 6 }}>
                <View style={[styles.amountInputWrapper, { borderColor: colors.neutral[300] }]}>
                  <Text style={[styles.currencyPrefix, { color: colors.neutral[500] }]}>₱</Text>
                  <TextInput
                    style={[styles.amountInput, { color: colors.text }]}
                    keyboardType="numeric"
                    placeholder="0.00"
                    placeholderTextColor={colors.neutral[400]}
                    value={item.amount > 0 ? item.amount.toString() : ''}
                    onChangeText={(val) => handleUpdateLineItem(idx, 'amount', val)}
                  />
                </View>
              </View>

              {/* Remove Row Button */}
              {lineItems.length > 1 && (
                <TouchableOpacity
                  onPress={() => handleRemoveLineItem(idx)}
                  style={styles.removeItemBtn}
                  accessibilityLabel="Remove Line Item"
                >
                  <Lucide name="trash-2" size={15} color={colors.semantic.error} />
                </TouchableOpacity>
              )}
            </View>

            {/* Auto-Complete Fee Suggestions Popover */}
            {activeSuggestionIndex === idx && (
              <FeeSuggestionsDropdown
                feeCatalog={feeCatalog}
                isLoading={isLoadingFeeCatalog}
                query={item.description || item.feeCode || ''}
                onSelect={(fee) => handleSelectFee(idx, fee)}
                onClose={() => setActiveSuggestionIndex(null)}
              />
            )}
          </View>
        ))
      )}

      {/* Total Amount Summary Banner */}
      <View style={[styles.totalBanner, { backgroundColor: colors.neutral[100], borderColor: colors.border }]}>
        <Text style={[styles.totalBannerLabel, { color: colors.neutral[700] }]}>TOTAL AMOUNT RECEIVED:</Text>
        <Text style={[styles.totalBannerValue, { color: colors.semantic.successText }]}>
          ₱{(totalAmount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
      </View>
    </View>
  );
}
