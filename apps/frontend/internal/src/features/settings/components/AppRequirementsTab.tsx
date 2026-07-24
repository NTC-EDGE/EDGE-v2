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
import { ApplicationRequirementItem } from '../data/mockAdminSettings';

interface AppRequirementsTabProps {
  requirements: ApplicationRequirementItem[];
  onAddRequirement: () => void;
  onEditRequirement: (item: ApplicationRequirementItem) => void;
  onDeleteRequirement: (id: string, name: string) => void;
}

export function AppRequirementsTab({
  requirements,
  onAddRequirement,
  onEditRequirement,
  onDeleteRequirement,
}: AppRequirementsTabProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filtered requirements based on search text
  const filteredRequirements = useMemo(() => {
    if (searchQuery.trim() === '') return requirements;
    const lower = searchQuery.toLowerCase();
    return requirements.filter((item) => item.title.toLowerCase().includes(lower));
  }, [requirements, searchQuery]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <View style={styles.container}>
      {/* Search & Add Control Bar */}
      <View style={[styles.controlBar, isMobile && styles.controlBarMobile]}>
        <View style={styles.searchBox}>
          <Lucide name="search" size={18} color={COLORS.neutral[400]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Service..."
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

        <Pressable
          style={styles.addButton}
          onPress={onAddRequirement}
          accessibilityLabel="Add Service Requirement"
        >
          <Lucide name="plus" size={16} color={COLORS.neutral.white} />
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>
      </View>

      {/* Requirement Accordion List */}
      <View style={styles.listContainer}>
        {filteredRequirements.length === 0 ? (
          <View style={[styles.emptyCard, SHADOWS.card]}>
            <Lucide name="help-circle" size={36} color={COLORS.neutral[400]} />
            <Text style={styles.emptyTitle}>No matching requirements found</Text>
            <Text style={styles.emptySubtitle}>Try searching with a different term.</Text>
          </View>
        ) : (
          filteredRequirements.map((item) => {
            const isExpanded = expandedId === item.id;

            return (
              <View key={item.id} style={[styles.accordionCard, SHADOWS.card]}>
                <View style={styles.cardMainRow}>
                  {/* Left Title & Status */}
                  <View style={styles.titleWrapper}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <View style={styles.subtextRow}>
                      <Text style={styles.statusText}>{item.statusText}</Text>
                      <Text style={styles.separatorDot}>·</Text>
                      <Text style={styles.mappedCountText}>{item.mappedCount} documents mapped</Text>

                      {/* Required Count Badge */}
                      <View style={[styles.pillBadge, styles.badgeGreen]}>
                        <Text style={[styles.badgeText, styles.badgeTextGreen]}>
                          {item.requiredCount} Required
                        </Text>
                      </View>

                      {/* Optional Count Badge */}
                      {item.optionalCount > 0 && (
                        <View style={[styles.pillBadge, styles.badgeGrey]}>
                          <Text style={[styles.badgeText, styles.badgeTextGrey]}>
                            {item.optionalCount} Optional
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Right Actions */}
                  <View style={styles.actionsRow}>
                    <Pressable
                      style={styles.actionBtn}
                      onPress={() => onEditRequirement(item)}
                      accessibilityLabel="Edit Requirement"
                    >
                      <Lucide name="edit-2" size={15} color={COLORS.neutral[600]} />
                    </Pressable>

                    <Pressable
                      style={[styles.actionBtn, styles.deleteBtn]}
                      onPress={() => onDeleteRequirement(item.id, item.title)}
                      accessibilityLabel="Delete Requirement"
                    >
                      <Lucide name="trash-2" size={15} color="#EF4444" />
                    </Pressable>

                    <View style={styles.verticalDivider} />

                    <Pressable
                      style={styles.expandBtn}
                      onPress={() => toggleExpand(item.id)}
                      accessibilityLabel="Toggle Document List"
                    >
                      <Lucide
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={18}
                        color={COLORS.neutral[600]}
                      />
                    </Pressable>
                  </View>
                </View>

                {/* Expanded Content: Mapped Documents Checklist */}
                {isExpanded && (
                  <View style={styles.expandedContent}>
                    <View style={styles.expandedHeader}>
                      <Text style={styles.expandedTitle}>Mapped Documents Checklist</Text>
                      <Text style={styles.expandedSubtitle}>
                        Documents required for this service application cycle.
                      </Text>
                    </View>
                    <View style={styles.docList}>
                      {item.mappedDocuments.map((doc, idx) => (
                        <View key={doc.id} style={styles.docRow}>
                          <View style={styles.docLeft}>
                            <View style={styles.docNumberBox}>
                              <Text style={styles.docNumberText}>{idx + 1}</Text>
                            </View>
                            <Text style={styles.docName}>{doc.name}</Text>
                          </View>
                          <View
                            style={[
                              styles.pillBadge,
                              doc.isRequired ? styles.badgeGreen : styles.badgeGrey,
                            ]}
                          >
                            <Text
                              style={[
                                styles.badgeText,
                                doc.isRequired ? styles.badgeTextGreen : styles.badgeTextGrey,
                              ]}
                            >
                              {doc.isRequired ? 'Mandatory' : 'Optional'}
                            </Text>
                          </View>
                        </View>
                      ))}
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
          Showing 1 to {filteredRequirements.length} of {requirements.length} entries
        </Text>

        <View style={styles.paginationControls}>
          <Text style={styles.paginationRowsText}>Rows per page</Text>
          <View style={styles.rowsDropdown}>
            <Text style={styles.rowsDropdownText}>10</Text>
            <Lucide name="chevron-down" size={14} color={COLORS.neutral[600]} />
          </View>
          <Text style={styles.pageInfoText}>Page 1 of 3</Text>
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
            <Pressable style={styles.pageNavBtn}>
              <Text style={styles.pageNavText}>2</Text>
            </Pressable>
            <Pressable style={styles.pageNavBtn}>
              <Text style={styles.pageNavText}>3</Text>
            </Pressable>
            <Pressable style={styles.pageNavBtn}>
              <Lucide name="chevron-right" size={14} color={COLORS.neutral[600]} />
            </Pressable>
            <Pressable style={styles.pageNavBtn}>
              <Lucide name="chevrons-right" size={14} color={COLORS.neutral[600]} />
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
  mappedCountText: {
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
    backgroundColor: '#DCFCE7',
  },
  badgeTextGreen: {
    color: '#16A34A',
  },
  badgeGrey: {
    backgroundColor: COLORS.neutral[100],
  },
  badgeTextGrey: {
    color: COLORS.neutral[600],
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
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
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
    backgroundColor: '#F8FAFC',
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
  docList: {
    gap: SPACING[4],
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.neutral.white,
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[8],
    borderRadius: RADIUS.input,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  docLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
    flex: 1,
  },
  docNumberBox: {
    width: 22,
    height: 22,
    borderRadius: RADIUS.circle,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  docNumberText: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: COLORS.brand[700],
    fontWeight: '700',
  },
  docName: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: COLORS.neutral[800],
    fontWeight: '500',
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
