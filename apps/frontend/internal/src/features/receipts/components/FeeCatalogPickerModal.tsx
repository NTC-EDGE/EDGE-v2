import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Icon as Lucide, useTheme } from '@edge/ui';
import { ReceiptFeeItemDto } from '@edge/api';

interface FeeCatalogPickerModalProps {
  visible: boolean;
  feeCatalog: ReceiptFeeItemDto[];
  isLoading: boolean;
  onSelect: (fee: ReceiptFeeItemDto) => void;
  onClose: () => void;
}

type FeeCategoryFilter = 'All' | 'Service Fee' | 'Service Variant Fee' | 'Service Variant Element Fee';

export function FeeCatalogPickerModal({
  visible,
  feeCatalog,
  isLoading,
  onSelect,
  onClose,
}: FeeCatalogPickerModalProps) {
  const { colors } = useTheme();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<FeeCategoryFilter>('All');

  const filteredFees = useMemo(() => {
    let list = feeCatalog;
    if (categoryFilter !== 'All') {
      list = list.filter((f) => f.sourceType === categoryFilter);
    }
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((f) => {
        const codeMatch = f.feeCode.toLowerCase().includes(q);
        const nameMatch = f.name.toLowerCase().includes(q);
        const descMatch = f.description.toLowerCase().includes(q);
        const serviceMatch = f.serviceName ? f.serviceName.toLowerCase().includes(q) : false;
        const variantMatch = f.variantName ? f.variantName.toLowerCase().includes(q) : false;
        const elemMatch = f.elementName ? f.elementName.toLowerCase().includes(q) : false;
        return codeMatch || nameMatch || descMatch || serviceMatch || variantMatch || elemMatch;
      });
    }
    return list;
  }, [feeCatalog, search, categoryFilter]);

  const CATEGORIES: { id: FeeCategoryFilter; label: string }[] = [
    { id: 'All', label: 'All Standard Fees' },
    { id: 'Service Fee', label: 'Service Fees' },
    { id: 'Service Variant Fee', label: 'Variant Fees' },
    { id: 'Service Variant Element Fee', label: 'Element Fees' },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.cardBg }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.titleRow}>
              <View style={[styles.iconBox, { backgroundColor: colors.brand.indigoLight }]}>
                <Lucide name="list" size={18} color={colors.brand.primary} />
              </View>
              <View>
                <Text style={[styles.title, { color: colors.text }]}>Official Fee Schedule Catalog</Text>
                <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                  Select from approved Service Fees, Service Variant Fees, and Element Fees
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Lucide name="x" size={18} color={colors.neutral[500]} />
            </TouchableOpacity>
          </View>

          {/* Search & Category Filter */}
          <View style={[styles.filterBar, { borderBottomColor: colors.border, backgroundColor: colors.neutral[50] }]}>
            <View style={[styles.searchBox, { backgroundColor: '#fff', borderColor: colors.neutral[300] }]}>
              <Lucide name="search" size={16} color={colors.neutral[400]} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Search by fee code, description, service, or element..."
                placeholderTextColor={colors.neutral[400]}
                value={search}
                onChangeText={setSearch}
                autoFocus
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <Lucide name="x" size={14} color={colors.neutral[400]} />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
              {CATEGORIES.map((cat) => {
                const isSelected = categoryFilter === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setCategoryFilter(cat.id)}
                    style={[
                      styles.categoryBtn,
                      { borderColor: colors.neutral[300], backgroundColor: '#fff' },
                      isSelected && { backgroundColor: colors.brand.primary, borderColor: colors.brand.primary },
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryBtnText,
                        { color: colors.neutral[700] },
                        isSelected && { color: '#fff', fontWeight: '700' },
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Fee Items List */}
          <View style={styles.body}>
            {isLoading ? (
              <View style={styles.centered}>
                <ActivityIndicator size="large" color={colors.brand.primary} />
                <Text style={[styles.loadingText, { color: colors.textMuted }]}>Loading fee catalog...</Text>
              </View>
            ) : filteredFees.length === 0 ? (
              <View style={styles.centered}>
                <Lucide name="search" size={32} color={colors.neutral[400]} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>No Fees Found</Text>
                <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
                  No fees match your current search query or filter.
                </Text>
              </View>
            ) : (
              <ScrollView style={styles.scrollList}>
                {filteredFees.map((fee) => (
                  <TouchableOpacity
                    key={fee.id}
                    onPress={() => onSelect(fee)}
                    style={[styles.feeCard, { backgroundColor: '#fff', borderColor: colors.neutral[200] }]}
                  >
                    <View style={styles.cardLeft}>
                      <View style={styles.badgeRow}>
                        <View style={[styles.codeBadge, { backgroundColor: colors.brand.indigoLight }]}>
                          <Text style={[styles.codeText, { color: colors.brand.primary }]}>{fee.feeCode}</Text>
                        </View>
                        <View style={[styles.sourceBadge, { backgroundColor: colors.neutral[100] }]}>
                          <Text style={[styles.sourceBadgeText, { color: colors.neutral[700] }]}>{fee.sourceType}</Text>
                        </View>
                        {fee.serviceName && (
                          <Text style={[styles.serviceNameText, { color: colors.textMuted }]}>
                            {fee.serviceName}
                          </Text>
                        )}
                      </View>
                      <Text style={[styles.feeDesc, { color: colors.text }]}>{fee.description}</Text>
                    </View>

                    <View style={styles.cardRight}>
                      <Text style={[styles.feeAmount, { color: colors.semantic.successText }]}>
                        ₱{fee.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Text>
                      <View style={[styles.selectBtn, { backgroundColor: colors.brand.indigoLight }]}>
                        <Lucide name="plus" size={12} color={colors.brand.primary} />
                        <Text style={[styles.selectBtnText, { color: colors.brand.primary }]}>Select Fee</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <Text style={[styles.footerHint, { color: colors.textMuted }]}>
              Showing {filteredFees.length} available fee items
            </Text>
            <TouchableOpacity onPress={onClose} style={[styles.cancelBtn, { backgroundColor: colors.neutral[100] }]}>
              <Text style={[styles.cancelBtnText, { color: colors.neutral[700] }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  container: {
    borderRadius: 12,
    width: '100%',
    maxWidth: 760,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
  },
  closeBtn: {
    padding: 4,
  },
  filterBar: {
    padding: 12,
    borderBottomWidth: 1,
    gap: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
  },
  categoryScroll: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
  },
  categoryBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
  body: {
    flex: 1,
    minHeight: 320,
    maxHeight: 460,
    padding: 12,
  },
  scrollList: {
    flex: 1,
  },
  feeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  cardLeft: {
    flex: 1,
    marginRight: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  codeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  codeText: {
    fontSize: 11,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  sourceBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sourceBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  serviceNameText: {
    fontSize: 11,
  },
  feeDesc: {
    fontSize: 13,
    fontWeight: '600',
  },
  cardRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  feeAmount: {
    fontSize: 14,
    fontWeight: '800',
  },
  selectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  selectBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    marginTop: 8,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderTopWidth: 1,
  },
  footerHint: {
    fontSize: 11,
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
