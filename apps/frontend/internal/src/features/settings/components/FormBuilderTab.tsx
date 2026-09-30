import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, Icon as Lucide, useTheme } from '@edge/ui';
import { FormBuilderItem } from '../types/adminSettingsTypes';

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
  const { colors, isDark } = useTheme();
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
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Search & Action Control Bar */}
      <View style={[styles.controlBar, isMobile && styles.controlBarMobile]}>
        <View
          style={[
            styles.searchBox,
            { backgroundColor: colors.cardBg, borderColor: colors.border },
          ]}
        >
          <Lucide name="search" size={16} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search form templates..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable
              onPress={() => setSearchQuery('')}
              style={Platform.select({ web: { cursor: 'pointer' } })}
            >
              <Lucide name="x" size={16} color={colors.textMuted} />
            </Pressable>
          )}
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.addButton,
            { backgroundColor: isDark ? colors.brand[600] : colors.brand.primary },
            pressed && { opacity: 0.8 },
            Platform.select({ web: { cursor: 'pointer' } }),
          ]}
          onPress={onCreateForm}
        >
          <Lucide name="plus" size={15} color={COLORS.neutral.white} />
          <Text style={styles.addButtonText}>Add Form Template</Text>
        </Pressable>
      </View>

      {/* Forms List */}
      <View style={styles.listContainer}>
        {filteredForms.length === 0 ? (
          <View
            style={[
              styles.emptyCard,
              { backgroundColor: colors.cardBg, borderColor: colors.border },
              SHADOWS.card,
            ]}
          >
            <Lucide name="layout" size={32} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No matching form templates found</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
              Try searching with different keywords or code parameters.
            </Text>
          </View>
        ) : (
          filteredForms.map((item) => {
            const isExpanded = expandedId === item.id;
            const isDraft = item.status === 'Draft';

            return (
              <View
                key={item.id}
                style={[
                  styles.card,
                  { backgroundColor: colors.cardBg, borderColor: colors.border },
                  SHADOWS.card,
                ]}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.headerLeftRow}>
                    <View
                      style={[
                        styles.iconBox,
                        { backgroundColor: isDark ? colors.neutral[800] : colors.brand.light },
                      ]}
                    >
                      <Lucide name="file-text" size={18} color={isDark ? colors.brand[500] : colors.brand.primary} />
                    </View>
                    <View style={styles.titleWrapper}>
                      <View style={styles.titleTitleRow}>
                        <Text style={[styles.itemTitle, { color: colors.text }]}>{item.title}</Text>
                        <View
                          style={[
                            styles.pillBadge,
                            {
                              backgroundColor: isDraft
                                ? (isDark ? colors.neutral[800] : colors.neutral[100])
                                : (isDark ? colors.brand[900] : colors.brand.light),
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.badgeText,
                              {
                                color: isDraft
                                  ? colors.textMuted
                                  : (isDark ? colors.brand[500] : colors.brand.primary),
                              },
                            ]}
                          >
                            {item.status}
                          </Text>
                        </View>
                      </View>

                      <Text style={[styles.serviceTypeText, { color: colors.textMuted }]}>
                        {item.serviceType || 'Amateur Radio Station License'}
                      </Text>

                      <View style={styles.subtextRow}>
                        <Text style={[styles.codeText, { color: colors.textMuted }]}>{item.code}</Text>
                        <Text style={[styles.separatorDot, { color: colors.textMuted }]}>·</Text>
                        <Text style={[styles.elementsText, { color: colors.textMuted }]}>
                          {item.fieldsCount} builder elements
                        </Text>
                        <Text style={[styles.separatorDot, { color: colors.textMuted }]}>·</Text>
                        <Text style={[styles.updatedText, { color: colors.textMuted }]}>
                          Updated {item.lastUpdated || '2026-06-15T13:06:14'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.actionsRow}>
                    <Pressable
                      style={({ pressed }) => [
                        styles.actionBtn,
                        { backgroundColor: isDark ? colors.neutral[800] : colors.brand.light },
                        pressed && { opacity: 0.7 },
                        Platform.select({ web: { cursor: 'pointer' } }),
                      ]}
                      onPress={() => (onOpenVisualBuilder ? onOpenVisualBuilder(item) : onEditForm(item))}
                    >
                      <Lucide name="layout" size={14} color={isDark ? colors.brand[500] : colors.brand.primary} />
                    </Pressable>

                    <Pressable
                      style={({ pressed }) => [
                        styles.actionBtn,
                        { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] },
                        pressed && { opacity: 0.7 },
                        Platform.select({ web: { cursor: 'pointer' } }),
                      ]}
                      onPress={() => onEditForm(item)}
                    >
                      <Lucide name="edit-2" size={14} color={colors.textMuted} />
                    </Pressable>

                    <Pressable
                      style={({ pressed }) => [
                        styles.actionBtn,
                        styles.deleteBtn,
                        pressed && { opacity: 0.7 },
                        Platform.select({ web: { cursor: 'pointer' } }),
                      ]}
                      onPress={() => onDeleteForm(item.id, item.title)}
                    >
                      <Lucide name="trash-2" size={14} color={COLORS.semantic.error} />
                    </Pressable>

                    <View style={[styles.verticalDivider, { backgroundColor: colors.border }]} />

                    <Pressable
                      style={({ pressed }) => [
                        styles.expandBtn,
                        pressed && { opacity: 0.7 },
                        Platform.select({ web: { cursor: 'pointer' } }),
                      ]}
                      onPress={() => toggleExpand(item.id)}
                    >
                      <Lucide
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={16}
                        color={colors.textMuted}
                      />
                    </Pressable>
                  </View>
                </View>

                {/* Expanded Form Template Summary Section */}
                {isExpanded && (
                  <View
                    style={[
                      styles.expandedContent,
                      {
                        backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50],
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <View style={styles.expandedHeaderRow}>
                      <View style={styles.expandedHeaderLeft}>
                        <Lucide name="layout" size={14} color={isDark ? colors.brand[500] : colors.brand.primary} />
                        <Text style={[styles.expandedHeaderText, { color: colors.text }]}>
                          FORM TEMPLATE SUMMARY
                        </Text>
                      </View>
                    </View>

                    <View style={styles.summaryBox}>
                      <Text style={[styles.summaryLineText, { color: colors.text }]}>
                        <Text style={[styles.boldLabel, { color: colors.textMuted }]}>Service: </Text>
                        {item.serviceType || 'Amateur Radio Station License'}
                      </Text>
                      <Text style={[styles.summaryLineText, { color: colors.text }]}>
                        <Text style={[styles.boldLabel, { color: colors.textMuted }]}>Code: </Text>
                        {item.code}
                      </Text>
                      <Text style={[styles.summaryLineText, { color: colors.text }]}>
                        <Text style={[styles.boldLabel, { color: colors.textMuted }]}>Elements: </Text>
                        {item.fieldsCount} active inputs
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
    padding: SPACING[16],
  },
  controlBar: {
    flexDirection: 'row',
    alignItems: 'center',
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
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[8],
    borderRadius: RADIUS.input,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.body,
    fontFamily: TYPOGRAPHY.fonts.primary,
    padding: 0,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[6],
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[8],
    borderRadius: RADIUS.button,
  },
  addButtonText: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.neutral.white,
  },
  listContainer: {
    gap: SPACING[10],
  },
  emptyCard: {
    padding: SPACING[32],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    gap: SPACING[8],
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.sizes.caption,
    fontFamily: TYPOGRAPHY.fonts.primary,
  },
  card: {
    borderRadius: RADIUS.card,
    borderWidth: 1,
    padding: SPACING[12],
    gap: SPACING[12],
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[12],
    flex: 1,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.input,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleWrapper: {
    gap: 2,
    flex: 1,
  },
  titleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
  },
  itemTitle: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  pillBadge: {
    paddingHorizontal: SPACING[8],
    paddingVertical: 2,
    borderRadius: RADIUS.button,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  serviceTypeText: {
    fontSize: TYPOGRAPHY.sizes.caption,
    fontFamily: TYPOGRAPHY.fonts.primary,
  },
  subtextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  codeText: {
    fontSize: TYPOGRAPHY.sizes.caption,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  separatorDot: {
    fontSize: TYPOGRAPHY.sizes.caption,
  },
  elementsText: {
    fontSize: TYPOGRAPHY.sizes.caption,
    fontFamily: TYPOGRAPHY.fonts.primary,
  },
  updatedText: {
    fontSize: TYPOGRAPHY.sizes.caption,
    fontFamily: TYPOGRAPHY.fonts.primary,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[6],
  },
  actionBtn: {
    width: 30,
    height: 30,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  verticalDivider: {
    width: 1,
    height: 18,
    marginHorizontal: 2,
  },
  expandBtn: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandedContent: {
    marginTop: SPACING[6],
    padding: SPACING[12],
    borderRadius: RADIUS.card,
    borderWidth: 1,
    gap: SPACING[8],
  },
  expandedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  expandedHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[6],
  },
  expandedHeaderText: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
    letterSpacing: 0.5,
  },
  summaryBox: {
    gap: 4,
  },
  summaryLineText: {
    fontSize: TYPOGRAPHY.sizes.caption,
    fontFamily: TYPOGRAPHY.fonts.primary,
  },
  boldLabel: {
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});
