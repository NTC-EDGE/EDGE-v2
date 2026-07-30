import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, Icon as Lucide } from '@edge/ui';
import { FeePaymentItem } from '../data/mockAdminSettings';

interface FeesPaymentsTabProps {
  fees: FeePaymentItem[];
  onConfigureFees: () => void;
  onEditFee: (item: FeePaymentItem) => void;
  onDeleteFee: (id: string, name: string) => void;
}

export function FeesPaymentsTab({
  fees,
  onConfigureFees,
  onEditFee,
  onDeleteFee,
}: FeesPaymentsTabProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filter fees based on search
  const filteredFees = useMemo(() => {
    if (searchQuery.trim() === '') return fees;
    const lower = searchQuery.toLowerCase();
    return fees.filter((item) => item.title.toLowerCase().includes(lower));
  }, [fees, searchQuery]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <View style={styles.container}>
      {/* Search & Action Control Bar */}
      <View style={[styles.controlBar, isMobile && styles.controlBarMobile]}>
        <View style={styles.searchBox}>
          <Lucide name="search" size={18} color={COLORS.neutral[400]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search application type or internal fee names..."
            placeholderTextColor={COLORS.neutral[400]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Lucide name="x" size={16} color={COLORS.neutral[400]} />
            </Pressable>
          )}
        </View>

        <View style={styles.rightControlGroup}>
          {/* Visible Records Badge */}
          <View style={styles.recordsBadge}>
            <Text style={styles.recordsBadgeText}>
              {filteredFees.length} visible records
            </Text>
          </View>

          {/* Configure Fees Button */}
          <Pressable
            style={styles.addButton}
            onPress={onConfigureFees}
            accessibilityLabel="Configure Fees"
          >
            <Lucide name="plus" size={16} color={COLORS.neutral.white} />
            <Text style={styles.addButtonText}>Configure Fees</Text>
          </Pressable>
        </View>
      </View>

      {/* Accordion Fee List */}
      <View style={styles.listContainer}>
        {filteredFees.length === 0 ? (
          <View style={[styles.emptyCard, SHADOWS.card]}>
            <Lucide name="dollar-sign" size={36} color={COLORS.neutral[400]} />
            <Text style={styles.emptyTitle}>No matching fee items found</Text>
            <Text style={styles.emptySubtitle}>Try searching for another application type.</Text>
          </View>
        ) : (
          filteredFees.map((item) => {
            const isExpanded = expandedId === item.id;
            const formattedTotal = item.totalAmount.toLocaleString('en-PH', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });

            return (
              <View key={item.id} style={[styles.accordionCard, SHADOWS.card]}>
                <View style={styles.cardMainRow}>
                  {/* Left Title & Status */}
                  <View style={styles.titleWrapper}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <View style={styles.subtextRow}>
                      <Text style={styles.statusText}>{item.statusText}</Text>
                      <Text style={styles.separatorDot}>·</Text>
                      <Text style={styles.configuredCountText}>
                        {item.configuredCount} Fee types configured
                      </Text>

                      {/* Total Amount Badge */}
                      <View style={[styles.pillBadge, styles.badgeGreen]}>
                        <Text style={[styles.badgeText, styles.badgeTextGreen]}>
                          Total: ₱{formattedTotal}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Right Actions */}
                  <View style={styles.actionsRow}>
                    <Pressable
                      style={styles.actionBtn}
                      onPress={() => onEditFee(item)}
                      accessibilityLabel="Edit Fee Configuration"
                    >
                      <Lucide name="edit-2" size={15} color={COLORS.neutral[600]} />
                    </Pressable>

                    <Pressable
                      style={[styles.actionBtn, styles.deleteBtn]}
                      onPress={() => onDeleteFee(item.id, item.title)}
                      accessibilityLabel="Delete Fee Configuration"
                    >
                      <Lucide name="trash-2" size={15} color={COLORS.semantic.error} />
                    </Pressable>

                    <View style={styles.verticalDivider} />

                    <Pressable
                      style={styles.expandBtn}
                      onPress={() => toggleExpand(item.id)}
                      accessibilityLabel="Toggle Fee Breakdown"
                    >
                      <Lucide
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={18}
                        color={COLORS.neutral[600]}
                      />
                    </Pressable>
                  </View>
                </View>

                {/* Expanded Content: Configured Fee Itemization Table */}
                {isExpanded && (
                  <View style={styles.expandedContent}>
                    <View style={styles.expandedHeader}>
                      <Text style={styles.expandedTitle}>Configured Fee Itemization</Text>
                      <Text style={styles.expandedSubtitle}>
                        Detailed component breakdown of fees charged upon application filing.
                      </Text>
                    </View>
                    <View style={styles.feeTable}>
                      {item.feeBreakdown.map((fb, idx) => (
                        <View key={fb.id} style={styles.feeTableRow}>
                          <View style={styles.feeLeft}>
                            <View style={styles.feeDot} />
                            <Text style={styles.feeName}>{fb.name}</Text>
                          </View>
                          <Text style={styles.feeAmount}>
                            ₱{fb.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                          </Text>
                        </View>
                      ))}
                      <View style={styles.feeTotalRow}>
                        <Text style={styles.feeTotalLabel}>Calculated Total Fee</Text>
                        <Text style={styles.feeTotalValue}>₱{formattedTotal}</Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            );
          })
        )}
      </View>

      {/* Footer Pagination Bar */}
      <View style={[styles.paginationBar, isMobile && styles.paginationBarMobile]}>
        <Text style={styles.paginationShowing}>
          Showing 1 to {filteredFees.length} of {fees.length} entries
        </Text>

        <View style={styles.paginationControls}>
          <Text style={styles.paginationRowsText}>Rows per page</Text>
          <View style={styles.rowsDropdown}>
            <Text style={styles.rowsDropdownText}>10</Text>
            <Lucide name="chevron-down" size={14} color={COLORS.neutral[600]} />
          </View>
          <Text style={styles.pageInfoText}>Page 1 of 1</Text>
          <View style={styles.navButtonsRow}>
            <Pressable style={styles.pageNavBtnDisabled}>
              <Lucide name="chevrons-left" size={14} color={COLORS.neutral[300]} />
            </Pressable>
            <Pressable style={styles.pageNavBtnDisabled}>
              <Lucide name="chevron-left" size={14} color={COLORS.neutral[300]} />
            </Pressable>
            <Pressable style={styles.pageNavBtnActive}>
              <Text style={styles.pageNavTextActive}>1</Text>
            </Pressable>
            <Pressable style={styles.pageNavBtnDisabled}>
              <Lucide name="chevron-right" size={14} color={COLORS.neutral[300]} />
            </Pressable>
            <Pressable style={styles.pageNavBtnDisabled}>
              <Lucide name="chevrons-right" size={14} color={COLORS.neutral[300]} />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING[16],
    paddingBottom: SPACING[32],
  },

  // Control Bar
  controlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING[12],
  },
  controlBarMobile: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
    backgroundColor: COLORS.neutral.white,
    borderColor: COLORS.neutral[200],
    borderWidth: 1,
    borderRadius: RADIUS.input,
    paddingHorizontal: SPACING[12],
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.body,
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: COLORS.neutral[900],
  },
  rightControlGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[12],
  },
  recordsBadge: {
    backgroundColor: COLORS.brand.indigoLight,
    paddingHorizontal: SPACING[12],
    paddingVertical: 10,
    borderRadius: RADIUS.input,
  },
  recordsBadgeText: {
    fontSize: TYPOGRAPHY.sizes.caption,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
    color: COLORS.brand.indigo,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[4],
    backgroundColor: COLORS.brand[600],
    paddingHorizontal: SPACING[24],
    height: 44,
    borderRadius: RADIUS.button,
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: COLORS.neutral.white,
    fontWeight: '600',
  },

  // List
  listContainer: {
    gap: SPACING[12],
  },
  accordionCard: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    borderColor: COLORS.neutral[200],
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING[16],
    gap: SPACING[12],
    flexWrap: 'wrap',
  },
  titleWrapper: {
    flex: 1,
    minWidth: 260,
  },
  itemTitle: {
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
    color: COLORS.neutral[900],
  },
  subtextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: SPACING[4],
    marginTop: 4,
  },
  statusText: {
    fontSize: TYPOGRAPHY.sizes.caption,
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: COLORS.neutral[500],
  },
  separatorDot: {
    color: COLORS.neutral[400],
    fontWeight: '700',
  },
  configuredCountText: {
    fontSize: TYPOGRAPHY.sizes.caption,
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: COLORS.brand[700],
    fontWeight: '700',
  },

  // Badges
  pillBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.circle,
  },
  badgeGreen: {
    backgroundColor: COLORS.semantic.successBg,
  },
  badgeTextGreen: {
    color: COLORS.semantic.success,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
  },

  // Actions
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[4],
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.input,
    backgroundColor: COLORS.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  deleteBtn: {
    backgroundColor: COLORS.semantic.errorBg,
    borderColor: COLORS.semantic.errorBorder,
  },
  verticalDivider: {
    width: 1,
    height: 20,
    backgroundColor: COLORS.neutral[200],
    marginHorizontal: SPACING[4],
  },
  expandBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Expanded Content
  expandedContent: {
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[200],
    backgroundColor: COLORS.neutral[50],
    padding: SPACING[16],
    gap: SPACING[12],
  },
  expandedHeader: {},
  expandedTitle: {
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
    color: COLORS.neutral[900],
  },
  expandedSubtitle: {
    fontSize: TYPOGRAPHY.sizes.caption,
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: COLORS.neutral[500],
  },
  feeTable: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.input,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    overflow: 'hidden',
  },
  feeTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[8],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[100],
  },
  feeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
  },
  feeDot: {
    width: 6,
    height: 6,
    borderRadius: RADIUS.circle,
    backgroundColor: COLORS.brand[600],
  },
  feeName: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: COLORS.neutral[800],
    fontWeight: '500',
  },
  feeAmount: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: COLORS.neutral[900],
    fontWeight: '600',
  },
  feeTotalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[8],
    backgroundColor: COLORS.neutral[100],
  },
  feeTotalLabel: {
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
    color: COLORS.neutral[900],
  },
  feeTotalValue: {
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '800',
    color: COLORS.semantic.success,
  },

  // Empty state
  emptyCard: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    padding: SPACING[32],
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING[4],
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
    color: COLORS.neutral[700],
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.sizes.caption,
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: COLORS.neutral[500],
  },

  // Pagination
  paginationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING[12],
    flexWrap: 'wrap',
    gap: SPACING[12],
  },
  paginationBarMobile: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  paginationShowing: {
    fontSize: TYPOGRAPHY.sizes.caption,
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: COLORS.neutral[500],
    fontWeight: '500',
  },
  paginationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[12],
    flexWrap: 'wrap',
  },
  paginationRowsText: {
    fontSize: TYPOGRAPHY.sizes.caption,
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: COLORS.neutral[600],
  },
  rowsDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.neutral.white,
    borderColor: COLORS.neutral[300],
    borderWidth: 1,
    borderRadius: RADIUS.input,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  rowsDropdownText: {
    fontSize: TYPOGRAPHY.sizes.caption,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '600',
    color: COLORS.neutral[800],
  },
  pageInfoText: {
    fontSize: TYPOGRAPHY.sizes.caption,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '600',
    color: COLORS.neutral[800],
  },
  navButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pageNavBtn: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.input,
    backgroundColor: COLORS.neutral.white,
    borderColor: COLORS.neutral[300],
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageNavBtnActive: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.input,
    backgroundColor: COLORS.brand[600],
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageNavTextActive: {
    fontSize: TYPOGRAPHY.sizes.caption,
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: COLORS.neutral.white,
    fontWeight: '700',
  },
  pageNavText: {
    fontSize: TYPOGRAPHY.sizes.caption,
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: COLORS.neutral[700],
    fontWeight: '500',
  },
  pageNavBtnDisabled: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.input,
    backgroundColor: COLORS.neutral[100],
    borderColor: COLORS.neutral[200],
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
