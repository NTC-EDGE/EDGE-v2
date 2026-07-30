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
import { NoteItem } from '../data/mockAdminSettings';

interface NotesTabProps {
  notes: NoteItem[];
  onAddNotes: () => void;
  onEditNote: (item: NoteItem) => void;
  onDeleteNote: (id: string, name: string) => void;
}

export function NotesTab({
  notes,
  onAddNotes,
  onEditNote,
  onDeleteNote,
}: NotesTabProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>('note-1');

  // Filter notes based on search
  const filteredNotes = useMemo(() => {
    if (searchQuery.trim() === '') return notes;
    const lower = searchQuery.toLowerCase();
    return notes.filter(
      (item) =>
        item.title.toLowerCase().includes(lower) ||
        item.instructions.toLowerCase().includes(lower)
    );
  }, [notes, searchQuery]);

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
            placeholder="Search Notes & Guidance Remarks..."
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
          onPress={onAddNotes}
          accessibilityLabel="Add Notes"
        >
          <Lucide name="plus" size={16} color={COLORS.neutral.white} />
          <Text style={styles.addButtonText}>Add Notes</Text>
        </Pressable>
      </View>

      {/* Accordion Notes List */}
      <View style={styles.listContainer}>
        {filteredNotes.length === 0 ? (
          <View style={[styles.emptyCard, SHADOWS.card]}>
            <Lucide name="file-text" size={36} color={COLORS.neutral[400]} />
            <Text style={styles.emptyTitle}>No matching notes found</Text>
            <Text style={styles.emptySubtitle}>Try searching with different keywords.</Text>
          </View>
        ) : (
          filteredNotes.map((item) => {
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
                      <Text style={styles.typeText}>{item.typeText}</Text>
                      <Text style={styles.separatorDot}>·</Text>

                      {/* Target View Badge */}
                      <View style={[styles.pillBadge, styles.badgePurple]}>
                        <Text style={[styles.badgeText, styles.badgeTextPurple]}>
                          {item.targetView}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Right Actions */}
                  <View style={styles.actionsRow}>
                    <Pressable
                      style={styles.actionBtn}
                      onPress={() => onEditNote(item)}
                      accessibilityLabel="Edit Note"
                    >
                      <Lucide name="edit-2" size={15} color={COLORS.neutral[600]} />
                    </Pressable>

                    <Pressable
                      style={[styles.actionBtn, styles.deleteBtn]}
                      onPress={() => onDeleteNote(item.id, item.title)}
                      accessibilityLabel="Delete Note"
                    >
                      <Lucide name="trash-2" size={15} color={COLORS.semantic.error} />
                    </Pressable>

                    <View style={styles.verticalDivider} />

                    <Pressable
                      style={styles.expandBtn}
                      onPress={() => toggleExpand(item.id)}
                      accessibilityLabel="Toggle Note Text"
                    >
                      <Lucide
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={18}
                        color={COLORS.neutral[600]}
                      />
                    </Pressable>
                  </View>
                </View>

                {/* Expanded Content: Service Guidance Notes Shown to Clients End (Matching Screenshot) */}
                {isExpanded && (
                  <View style={styles.expandedContent}>
                    <View style={styles.expandedHeaderRow}>
                      <View style={styles.expandedHeaderLeft}>
                        <Lucide name="file-text" size={16} color={COLORS.brand.indigoHover} />
                        <Text style={styles.expandedHeaderText}>
                          SERVICE GUIDANCE NOTES SHOWN TO CLIENTS END
                        </Text>
                      </View>

                      <View style={styles.badgeViewRight}>
                        <Text style={styles.badgeViewRightText}>
                          CLIENT INSTRUCTIONS VIEW
                        </Text>
                      </View>
                    </View>

                    <View style={styles.instructionBox}>
                      <Text style={styles.instructionText}>{item.instructions}</Text>
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
          Showing 1 to {filteredNotes.length} of {notes.length} entries
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
  typeText: {
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
  badgePurple: {
    backgroundColor: COLORS.brand.indigoLight,
  },
  badgeTextPurple: {
    color: COLORS.brand.indigo,
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

  // Expanded Content (Matching User Screenshot)
  expandedContent: {
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[200],
    backgroundColor: COLORS.neutral.white,
    padding: SPACING[16],
    gap: SPACING[12],
  },
  expandedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  expandedHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  expandedHeaderText: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
    color: COLORS.neutral[400],
    letterSpacing: 0.5,
  },
  badgeViewRight: {
    backgroundColor: COLORS.brand.indigoLight,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: RADIUS.circle,
  },
  badgeViewRightText: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
    color: COLORS.brand.indigo,
    letterSpacing: 0.5,
  },
  instructionBox: {
    backgroundColor: COLORS.neutral[50],
    padding: SPACING[16],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  instructionText: {
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '600',
    color: COLORS.neutral[800],
    lineHeight: 22,
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
