import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Icon as Lucide, useTheme } from '@edge/ui';
import { ReceiptFeeItemDto } from '@edge/api';

interface FeeSuggestionsDropdownProps {
  feeCatalog: ReceiptFeeItemDto[];
  isLoading: boolean;
  query: string;
  onSelect: (fee: ReceiptFeeItemDto) => void;
  onClose: () => void;
}

export function FeeSuggestionsDropdown({
  feeCatalog,
  isLoading,
  query,
  onSelect,
  onClose,
}: FeeSuggestionsDropdownProps) {
  const { colors } = useTheme();

  const trimmedQuery = query.trim().toLowerCase();

  const filtered = React.useMemo(() => {
    if (!trimmedQuery) {
      return feeCatalog.slice(0, 15);
    }
    return feeCatalog
      .filter((fee) => {
        const codeMatch = fee.feeCode.toLowerCase().includes(trimmedQuery);
        const nameMatch = fee.name.toLowerCase().includes(trimmedQuery);
        const descMatch = fee.description.toLowerCase().includes(trimmedQuery);
        const serviceMatch = fee.serviceName ? fee.serviceName.toLowerCase().includes(trimmedQuery) : false;
        const variantMatch = fee.variantName ? fee.variantName.toLowerCase().includes(trimmedQuery) : false;
        const elemMatch = fee.elementName ? fee.elementName.toLowerCase().includes(trimmedQuery) : false;
        return codeMatch || nameMatch || descMatch || serviceMatch || variantMatch || elemMatch;
      })
      .slice(0, 20);
  }, [feeCatalog, trimmedQuery]);

  const getSourceBadgeColor = (sourceType: string) => {
    switch (sourceType) {
      case 'Service Fee':
        return { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' };
      case 'Service Variant Fee':
        return { bg: '#F5F3FF', text: '#6D28D9', border: '#DDD6FE' };
      case 'Service Variant Element Fee':
        return { bg: '#FDF2F8', text: '#BE185D', border: '#FBCFE8' };
      default:
        return { bg: '#F3F4F6', text: '#374151', border: '#E5E7EB' };
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.headerTitleRow}>
          <Lucide name="tag" size={12} color={colors.brand.primary} />
          <Text style={[styles.headerText, { color: colors.textMuted }]}>
            {trimmedQuery ? `Fee Suggestions matching "${query}"` : 'Standard Fees (Select to Auto-Fill)'}
          </Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Lucide name="x" size={12} color={colors.neutral[500]} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color={colors.brand.primary} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>Loading fee catalog...</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            No standard fees matching &quot;{query}&quot;. You may continue with manual entry.
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.list} nestedScrollEnabled keyboardShouldPersistTaps="handled">
          {filtered.map((fee) => {
            const badge = getSourceBadgeColor(fee.sourceType);
            return (
              <TouchableOpacity
                key={fee.id}
                onPress={() => onSelect(fee)}
                style={[styles.itemRow, { borderBottomColor: colors.neutral[100] }]}
              >
                <View style={styles.itemLeft}>
                  <View style={styles.codeRow}>
                    <View style={[styles.codeBadge, { backgroundColor: colors.brand.indigoLight }]}>
                      <Text style={[styles.codeText, { color: colors.brand.primary }]}>{fee.feeCode}</Text>
                    </View>
                    <View style={[styles.sourceBadge, { backgroundColor: badge.bg, borderColor: badge.border }]}>
                      <Text style={[styles.sourceBadgeText, { color: badge.text }]}>{fee.sourceType}</Text>
                    </View>
                  </View>
                  <Text style={[styles.descText, { color: colors.text }]} numberOfLines={2}>
                    {fee.description}
                  </Text>
                </View>

                <View style={styles.itemRight}>
                  <Text style={[styles.amountText, { color: colors.semantic.successText }]}>
                    ₱{(fee.amount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                  <Text style={[styles.selectHint, { color: colors.brand.primary }]}>Select ↵</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 8,
    maxHeight: 220,
    marginTop: 4,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    zIndex: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderBottomWidth: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerText: {
    fontSize: 11,
    fontWeight: '600',
  },
  closeBtn: {
    padding: 2,
  },
  list: {
    maxHeight: 180,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  itemLeft: {
    flex: 1,
    marginRight: 10,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  codeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  codeText: {
    fontSize: 10,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  sourceBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
  },
  sourceBadgeText: {
    fontSize: 9,
    fontWeight: '600',
  },
  descText: {
    fontSize: 12,
    fontWeight: '500',
  },
  itemRight: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 13,
    fontWeight: '800',
  },
  selectHint: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
  },
  loadingText: {
    fontSize: 12,
  },
  emptyBox: {
    padding: 12,
  },
  emptyText: {
    fontSize: 11,
    fontStyle: 'italic',
  },
});
