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
    <View
      style={[
        styles.breakdownSection,
        {
          backgroundColor: colors.cardBg,
          borderColor: colors.border,
          borderLeftColor: '#059669',
        },
      ]}
    >
      <View style={styles.breakdownHeader}>
        <View style={styles.sectionHeaderLeft}>
          <View style={[styles.sectionIconBadge, { backgroundColor: '#ECFDF5' }]}>
            <Lucide name="credit-card" size={16} color="#059669" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.sectionHeaderTitle, { color: '#059669' }]}>
              {isFromPendingPayment ? '3. PRESCRIBED ITEMS TO BE PAID (ASSESSED FEES)' : '3. PARTICULARS & FEE BREAKDOWN'}
            </Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
              {isFromPendingPayment
                ? 'Fees and particulars reflect the assessed fees or selected payment mode allocation for this receipt.'
                : 'Search fee code (e.g. REG-FEE, EXAM) or enter custom particulars'}
            </Text>
          </View>
        </View>
        <View style={styles.breakdownActions}>
          <View
            style={[
              styles.feeCountSummaryBadge,
              {
                backgroundColor: '#ECFDF5',
                borderColor: '#6EE7B7',
              },
            ]}
          >
            <Text style={[styles.feeCountSummaryText, { color: '#065F46' }]}>
              {lineItems.length} {lineItems.length === 1 ? 'Item' : 'Items'} • ₱{(totalAmount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </View>
          {!isFromPendingPayment && (
            <TouchableOpacity
              onPress={handleAddLineItem}
              style={[styles.addItemBtn, { backgroundColor: colors.brand.primary }]}
            >
              <Lucide name="plus" size={13} color="#fff" />
              <Text style={[styles.addItemBtnText, { color: '#fff' }]}>Add Item</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Line Items List */}
      {isFromPendingPayment ? (
        <View style={{ marginBottom: 4 }}>
          {lineItems.map((item, idx) => {
            const upperCode = (item.feeCode || '').toUpperCase();
            const isDstItem = upperCode === 'DST' || item.description.toUpperCase().includes('DOCUMENTARY STAMP');
            const isSurchargeItem = upperCode === 'SUR' || upperCode.includes('SUR') || item.description.toUpperCase().includes('SURCHARGE');
            const itemAccentColor = isSurchargeItem
              ? '#DC2626'
              : isDstItem
                ? '#059669'
                : colors.brand.primary;
            const badgeBgColor = isSurchargeItem
              ? '#FEE2E2'
              : isDstItem
                ? '#ECFDF5'
                : '#EFF6FF';
            const badgeTextColor = isSurchargeItem
              ? '#991B1B'
              : isDstItem
                ? '#065F46'
                : colors.brand.primary;

            return (
              <View
                key={idx}
                style={[
                  styles.readOnlyLineItemCard,
                  {
                    borderColor: colors.border,
                    borderLeftColor: itemAccentColor,
                    backgroundColor: '#F8FAFC',
                  },
                ]}
              >
                <View style={styles.readOnlyLineItemLeft}>
                  <View style={[styles.readOnlyFeeCodeBadge, { backgroundColor: badgeBgColor }]}>
                    <Text style={[styles.readOnlyFeeCodeText, { color: badgeTextColor }]}>
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
            );
          })}
        </View>
      ) : (
        lineItems.map((item, idx) => (
          <View
            key={idx}
            style={[
              styles.lineItemWrapper,
              {
                borderWidth: 1,
                borderLeftWidth: 4,
                borderColor: colors.border,
                borderLeftColor: colors.brand.primary,
                borderRadius: 10,
                padding: 10,
                backgroundColor: '#F8FAFC',
              },
            ]}
          >
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
      <View
        style={[
          styles.totalBanner,
          {
            backgroundColor: '#ECFDF5',
            borderColor: '#6EE7B7',
            borderLeftColor: '#059669',
          },
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Lucide name="check-circle" size={18} color="#059669" />
          <Text style={[styles.totalBannerLabel, { color: '#065F46' }]}>TOTAL AMOUNT RECEIVED:</Text>
        </View>
        <Text style={[styles.totalBannerValue, { color: '#065F46' }]}>
          ₱{(totalAmount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
      </View>
    </View>
  );
}
