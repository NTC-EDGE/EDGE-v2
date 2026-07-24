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
  onDeleteForm: (id: string) => void;
}

export function FormBuilderTab({
  forms,
  onCreateForm,
  onEditForm,
  onDeleteForm,
}: FormBuilderTabProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [searchQuery, setSearchQuery] = useState('');

  const filteredForms = useMemo(() => {
    if (searchQuery.trim() === '') return forms;
    const lower = searchQuery.toLowerCase();
    return forms.filter(
      (item) =>
        item.title.toLowerCase().includes(lower) || item.code.toLowerCase().includes(lower)
    );
  }, [forms, searchQuery]);

  return (
    <View style={styles.container}>
      {/* Search & Action Control Bar */}
      <View style={[styles.controlBar, isMobile && styles.controlBarMobile]}>
        <View style={styles.searchBox}>
          <Lucide name="search" size={18} color={COLORS.neutral[400]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Form Templates & Schemas..."
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
          <Text style={styles.addButtonText}>Build Form</Text>
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
          filteredForms.map((item) => (
            <View key={item.id} style={[styles.card, SHADOWS.card]}>
              <View style={styles.cardHeader}>
                <View style={styles.titleWrapper}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <View style={styles.subtextRow}>
                    <Text style={styles.codeText}>{item.code}</Text>
                    <Text style={styles.separatorDot}>·</Text>
                    <Text style={styles.versionText}>{item.version}</Text>
                    <Text style={styles.separatorDot}>·</Text>
                    <Text style={styles.fieldsText}>{item.fieldsCount} input fields</Text>

                    <View
                      style={[
                        styles.pillBadge,
                        item.status === 'Published' ? styles.badgeGreen : styles.badgeYellow,
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          item.status === 'Published' ? styles.badgeTextGreen : styles.badgeTextYellow,
                        ]}
                      >
                        {item.status}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.actionsRow}>
                  <Pressable style={styles.actionBtn} onPress={() => onEditForm(item)}>
                    <Lucide name="edit-2" size={15} color={COLORS.neutral[600]} />
                  </Pressable>
                  <Pressable
                    style={[styles.actionBtn, styles.deleteBtn]}
                    onPress={() => onDeleteForm(item.id)}
                  >
                    <Lucide name="trash-2" size={15} color="#EF4444" />
                  </Pressable>
                </View>
              </View>
            </View>
          ))
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
    padding: SPACING[16],
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING[12],
    flexWrap: 'wrap',
  },
  titleWrapper: {
    flex: 1,
    minWidth: 240,
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
  codeText: {
    fontSize: TYPOGRAPHY.sizes.caption,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
    color: COLORS.neutral[700],
  },
  versionText: {
    fontSize: TYPOGRAPHY.sizes.caption,
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: COLORS.brand[700],
    fontWeight: '700',
  },
  fieldsText: {
    fontSize: TYPOGRAPHY.sizes.caption,
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: COLORS.neutral[500],
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
  badgeGreen: {
    backgroundColor: '#DCFCE7',
  },
  badgeTextGreen: {
    color: '#16A34A',
  },
  badgeYellow: {
    backgroundColor: '#FEF3C7',
  },
  badgeTextYellow: {
    color: '#D97706',
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
