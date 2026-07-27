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
import { FormBuilderItem } from '../data/mockAdminSettings';

interface FormBuilderTabProps {
  forms: FormBuilderItem[];
  onCreateForm: () => void;
  onEditForm: (item: FormBuilderItem) => void;
  onDeleteForm: (id: string, name: string) => void;
  onOpenVisualBuilder?: (item?: FormBuilderItem) => void;
}

export function FormBuilderTab({
  forms,
  onCreateForm,
  onEditForm,
  onDeleteForm,
  onOpenVisualBuilder,
}: FormBuilderTabProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>('fb-1');

  const filteredForms = useMemo(() => {
    if (searchQuery.trim() === '') return forms;
    const lower = searchQuery.toLowerCase();
    return forms.filter(
      (item) =>
        item.title.toLowerCase().includes(lower) ||
        item.code.toLowerCase().includes(lower) ||
        (item.serviceType && item.serviceType.toLowerCase().includes(lower))
    );
  }, [forms, searchQuery]);

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
            placeholder="Search form templates..."
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

        <Pressable style={styles.addButton} onPress={onCreateForm}>
          <Lucide name="plus" size={16} color={COLORS.neutral.white} />
          <Text style={styles.addButtonText}>Add Form</Text>
        </Pressable>
      </View>

      {/* Forms List */}
      <View style={styles.listContainer}>
        {filteredForms.length === 0 ? (
          <View style={[styles.emptyCard, SHADOWS.card]}>
            <Lucide name="layout" size={36} color={COLORS.neutral[400]} />
            <Text style={styles.emptyTitle}>No matching form templates found</Text>
            <Text style={styles.emptySubtitle}>Try searching with another keywords.</Text>
          </View>
        ) : (
          filteredForms.map((item) => {
            const isExpanded = expandedId === item.id;
            const isDraft = item.status === 'Draft';

            return (
              <View key={item.id} style={[styles.card, SHADOWS.card]}>
                <View style={styles.cardHeader}>
                  <View style={styles.headerLeftRow}>
                    <View style={styles.iconBox}>
                      <Lucide name="file-text" size={20} color="#4F46E5" />
                    </View>
                    <View style={styles.titleWrapper}>
                      <View style={styles.titleTitleRow}>
                        <Text style={styles.itemTitle}>{item.title}</Text>
                        <View
                          style={[
                            styles.pillBadge,
                            isDraft ? styles.badgeDraft : styles.badgePublished,
                          ]}
                        >
                          <Text
                            style={[
                              styles.badgeText,
                              isDraft ? styles.badgeTextDraft : styles.badgeTextPublished,
                            ]}
                          >
                            {item.status}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.serviceTypeText}>
                        {item.serviceType || 'Amateur Radio Station License'}
                      </Text>

                      <View style={styles.subtextRow}>
                        <Text style={styles.codeText}>{item.code}</Text>
                        <Text style={styles.separatorDot}>·</Text>
                        <Text style={styles.elementsText}>
                          {item.fieldsCount} builder elements
                        </Text>
                        <Text style={styles.separatorDot}>·</Text>
                        <Text style={styles.updatedText}>
                          Updated {item.lastUpdated || '2026-06-15T13:06:14'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.actionsRow}>
                    <Pressable
                      style={styles.builderBtn}
                      onPress={() => (onOpenVisualBuilder ? onOpenVisualBuilder(item) : onEditForm(item))}
                    >
                      <Lucide name="layout" size={15} color="#4F46E5" />
                    </Pressable>

                    <Pressable style={styles.actionBtn} onPress={() => onEditForm(item)}>
                      <Lucide name="edit-2" size={15} color={COLORS.neutral[600]} />
                    </Pressable>

                    <Pressable
                      style={[styles.actionBtn, styles.deleteBtn]}
                      onPress={() => onDeleteForm(item.id, item.title)}
                    >
                      <Lucide name="trash-2" size={15} color="#EF4444" />
                    </Pressable>

                    <View style={styles.verticalDivider} />

                    <Pressable
                      style={styles.expandBtn}
                      onPress={() => toggleExpand(item.id)}
                    >
                      <Lucide
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={18}
                        color={COLORS.neutral[600]}
                      />
                    </Pressable>
                  </View>
                </View>

                {/* Expanded Form Template Summary Section (Matching Screenshot 1) */}
                {isExpanded && (
                  <View style={styles.expandedContent}>
                    <View style={styles.expandedHeaderRow}>
                      <View style={styles.expandedHeaderLeft}>
                        <Lucide name="layout" size={16} color="#6366F1" />
                        <Text style={styles.expandedHeaderText}>
                          FORM TEMPLATE SUMMARY
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.badgeViewRight,
                          isDraft ? styles.badgeDraft : styles.badgePublished,
                        ]}
                      >
                        <Text
                          style={[
                            styles.badgeViewRightText,
                            isDraft ? styles.badgeTextDraft : styles.badgeTextPublished,
                          ]}
                        >
                          {item.status}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.summaryBox}>
                      <Text style={styles.summaryLineText}>
                        <Text style={styles.boldLabel}>Service: </Text>
                        {item.serviceType || 'Amateur Radio Station License'}
                      </Text>
                      <Text style={styles.summaryLineText}>
                        <Text style={styles.boldLabel}>Form Code: </Text>
                        {item.code}
                      </Text>
                      <Text style={styles.summaryLineText}>
                        <Text style={styles.boldLabel}>Elements: </Text>
                        {item.fieldsCount}
                      </Text>
                      <Text style={styles.summaryLineText}>
                        <Text style={styles.boldLabel}>Last Updated: </Text>
                        {item.lastUpdated || '2026-06-15T13:06:14'}
                      </Text>

                      <View style={styles.summarySpacer} />

                      <Text style={styles.descriptionText}>
                        {item.description || 'No description added.'}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            );
          })
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING[16],
    paddingBottom: SPACING[32],
  },
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
  listContainer: {
    gap: SPACING[12],
  },
  card: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    borderColor: COLORS.neutral[200],
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING[16],
    gap: SPACING[12],
    flexWrap: 'wrap',
  },
  headerLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[12],
    flex: 1,
    minWidth: 260,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleWrapper: {
    flex: 1,
  },
  titleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
  },
  itemTitle: {
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
    color: COLORS.neutral[900],
  },
  serviceTypeText: {
    fontSize: TYPOGRAPHY.sizes.caption,
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: COLORS.neutral[600],
    marginTop: 2,
    fontWeight: '500',
  },
  subtextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: SPACING[4],
    marginTop: 4,
  },
  codeText: {
    fontSize: TYPOGRAPHY.sizes.caption,
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: COLORS.neutral[500],
  },
  elementsText: {
    fontSize: TYPOGRAPHY.sizes.caption,
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: '#6366F1',
    fontWeight: '700',
  },
  updatedText: {
    fontSize: TYPOGRAPHY.sizes.caption,
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: COLORS.neutral[400],
  },
  separatorDot: {
    color: COLORS.neutral[400],
    fontWeight: '700',
  },
  pillBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.circle,
  },
  badgeDraft: {
    backgroundColor: '#EEF2FF',
  },
  badgeTextDraft: {
    color: '#4F46E5',
  },
  badgePublished: {
    backgroundColor: '#DCFCE7',
  },
  badgeTextPublished: {
    color: '#16A34A',
  },
  badgeText: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[4],
  },
  builderBtn: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.input,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E7FF',
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

  // Expanded Content (Matching User Screenshot 1)
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
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  badgeViewRight: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: RADIUS.circle,
  },
  badgeViewRightText: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  summaryBox: {
    backgroundColor: '#F8FAFC',
    padding: SPACING[16],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  summaryLineText: {
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: '#1E293B',
    lineHeight: 22,
  },
  boldLabel: {
    fontWeight: '700',
    color: '#0F172A',
  },
  summarySpacer: {
    height: 8,
  },
  descriptionText: {
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: '#475569',
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
});
