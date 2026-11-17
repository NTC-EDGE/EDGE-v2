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
            <Lucide name="file-text" size={14} color="#059669" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.sectionHeaderTitle, { color: '#059669' }]}>
              {isFromPendingPayment ? '3. ASSESSED FEES & PARTICULARS' : '3. PARTICULARS & FEE BREAKDOWN'}
            </Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
              {isFromPendingPayment
                ? 'Assessed fees or selected payment mode allocation for this receipt'
                : 'Search fee code (e.g. REG-FEE, EXAM) or enter custom particulars'}
            </Text>
          </View>
        </View>
        <View style={styles.breakdownActions}>
          <View style={styles.feeCountSummaryBadge}>
            <Text style={styles.feeCountSummaryText}>
              {lineItems.length} {lineItems.length === 1 ? 'Item' : 'Items'}
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
        <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 8, overflow: 'hidden' }}>
          {lineItems.map((item, idx) => {
            const isLast = idx === lineItems.length - 1;
            return (
              <View
                key={idx}
                style={[
                  styles.readOnlyLineItemCard,
                  {
                    borderBottomColor: colors.border,
                    borderBottomWidth: isLast ? 0 : 1,
                    backgroundColor: '#FFFFFF',
                  },
                ]}
              >
                <View style={styles.readOnlyLineItemLeft}>
                  <View style={styles.readOnlyFeeCodeBadge}>
                    <Text style={styles.readOnlyFeeCodeText}>
                      {item.feeCode || 'FEE'}
                    </Text>
                  </View>
                  <Text style={[styles.readOnlyDescText, { color: colors.text }]} numberOfLines={2}>
                    {item.description}
                  </Text>
                </View>
                <Text style={[styles.readOnlyAmountText, { color: colors.text }]}>
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
                borderColor: colors.border,
                borderRadius: 8,
                padding: 10,
                backgroundColor: '#F8FAFC',
              },
            ]}
          >
            <View style={styles.lineItemRow}>
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
            backgroundColor: '#F8FAFC',
            borderColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.totalBannerLabel, { color: colors.neutral[600] }]}>TOTAL AMOUNT RECEIVED</Text>
        <Text style={[styles.totalBannerValue, { color: colors.text }]}>
          ₱{(totalAmount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
      </View>
    </View>
  );
}

