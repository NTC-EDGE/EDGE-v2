import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Pressable, ScrollView, Platform } from 'react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, Icon as Lucide, Avatar, StatusBadge } from '@edge/ui';
import { ApplicationData } from '../data/mockApplications';

interface ActivitiesFeedProps {
  applications: readonly ApplicationData[];
  selectedId: string | undefined;
  activeFilter: 'All' | 'Pending' | 'History';
  onSelect: (id: string) => void;
  onFilterChange: (filter: 'All' | 'Pending' | 'History') => void;
}

export function ActivitiesFeed({
  applications,
  selectedId,
  activeFilter,
  onSelect,
  onFilterChange,
}: ActivitiesFeedProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Filter logic based on tab select
  const filteredByTab = applications.filter((app) => {
    if (activeFilter === 'Pending') {
      return app.status === 'FOR APPROVAL' || app.status === 'Pending';
    }
    if (activeFilter === 'History') {
      return app.status === 'APPROVED' || app.status === 'COMPLETED' || app.status === 'REJECTED' || app.status === 'Approved' || app.status === 'Rejected';
    }
    return true; // 'All'
  });

  // Filter logic based on search query
  const filtered = filteredByTab.filter((app) => {
    const query = searchQuery.toLowerCase().trim();
    if (query === '') return true;
    return (
      app.applicant.toLowerCase().includes(query) ||
      app.id.toLowerCase().includes(query) ||
      app.title.toLowerCase().includes(query) ||
      app.company.toLowerCase().includes(query)
    );
  });

  // Group applications by dateGroup
  const uniqueGroups: string[] = [];
  const groupedApps: Record<string, ApplicationData[]> = {};

  filtered.forEach((app) => {
    const group = app.dateGroup;
    if (groupedApps[group] === undefined) {
      groupedApps[group] = [];
      uniqueGroups.push(group);
    }
    groupedApps[group].push(app);
  });

  return (
    <View style={styles.container}>
      {/* Feed Header */}
      <View style={styles.feedHeader}>
        <Text style={styles.feedTitle}>Feed</Text>
        <View style={styles.headerActions}>
          <Pressable style={styles.actionBtn}>
            <Lucide name="list" size={16} color={COLORS.neutral[500]} />
          </Pressable>
          <Pressable style={styles.actionBtn}>
            <Lucide name="calendar" size={16} color={COLORS.neutral[500]} />
          </Pressable>
          <Pressable style={styles.actionBtn}>
            <Lucide name="sliders" size={16} color={COLORS.neutral[500]} />
          </Pressable>
          <Pressable style={styles.actionBtn}>
            <Lucide name="rotate-cw" size={16} color={COLORS.neutral[500]} />
          </Pressable>
        </View>
      </View>

      {/* Search Input */}
      <View style={[styles.searchWrapper, isSearchFocused && styles.searchWrapperFocused]}>
        <Lucide name="search" size={16} color={COLORS.neutral[400]} style={styles.searchIcon} />
        <TextInput
          placeholder="Search..."
          placeholderTextColor={COLORS.neutral[400]}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
        />
      </View>

      {/* Tab Filter Links */}
      <View style={styles.tabsContainer}>
        {(['All', 'Pending', 'History'] as const).map((tab) => {
          const isActive = activeFilter === tab;
          return (
            <Pressable
              key={tab}
              onPress={() => onFilterChange(tab)}
              style={[styles.tabButton, isActive && styles.tabButtonActive]}
            >
              <Text style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}>
                {tab}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Grouped Feed List */}
      <ScrollView
        style={styles.feedList}
        contentContainerStyle={styles.feedListContent}
        showsVerticalScrollIndicator={false}
      >
        {uniqueGroups.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No applications found</Text>
          </View>
        ) : (
          uniqueGroups.map((groupName) => {
            const appsInGroup = groupedApps[groupName];
            if (appsInGroup === undefined) return null;
            return (
              <View key={groupName} style={styles.groupContainer}>
                <Text style={styles.groupHeader}>{groupName}</Text>
                {appsInGroup.map((app) => {
                  const isSelected = selectedId === app.id;
                  return (
                    <Pressable
                      key={app.id}
                      onPress={() => onSelect(app.id)}
                      style={[
                        styles.card,
                        isSelected && styles.cardSelected,
                      ]}
                    >
                      {/* Avatar */}
                      <View style={styles.avatarWrapper}>
                        <Avatar name={app.applicant} size="md" useDeterministicColors={true} />
                      </View>

                      {/* Content */}
                      <View style={styles.cardContent}>
                        <View style={styles.cardHeaderRow}>
                          <Text style={styles.applicantName} numberOfLines={1}>
                            {app.applicant}
                          </Text>
                          <Text style={styles.timeAgo}>{app.timeAgo}</Text>
                        </View>
                        <Text style={styles.companyName} numberOfLines={1}>
                          {app.company}
                        </Text>
                        <Text style={styles.descriptionSnippet} numberOfLines={1}>
                          {app.title}
                        </Text>

                        {/* Badges row */}
                        <View style={styles.badgesRow}>
                          <StatusBadge status={app.status} />

                          <View
                            style={[
                              styles.metaBadge,
                              app.flowType === 'BULK' ? styles.badgeBulk : styles.badgeSingle,
                            ]}
                          >
                            <Text
                              style={[
                                styles.metaBadgeText,
                                app.flowType === 'BULK' ? styles.textBulk : styles.textSingle,
                              ]}
                            >
                              {app.flowType}
                            </Text>
                          </View>

                          <View style={[styles.metaBadge, styles.badgeCode]}>
                            <Text style={[styles.metaBadgeText, styles.textCode]}>
                              {app.code}
                            </Text>
                          </View>

                          {isSelected && app.status === 'FOR APPROVAL' && (
                            <View style={styles.beingViewedBadge}>
                              <Text style={styles.beingViewedText}>Being viewed</Text>
                            </View>
                          )}
                        </View>
                      </View>

                      {/* Right caret or options button */}
                      <View style={styles.cardRightAction}>
                        <Lucide name="more-vertical" size={16} color={COLORS.neutral[300]} />
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral.white,
    borderRightWidth: 1,
    borderRightColor: COLORS.neutral[200],
  },
  feedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[20],
    paddingTop: SPACING[20],
    paddingBottom: SPACING[12],
  },
  feedTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 20,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.button,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.neutral[50],
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral[50],
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    borderRadius: RADIUS.input,
    marginHorizontal: SPACING[20],
    marginBottom: SPACING[16],
    paddingHorizontal: 12,
    height: 40,
    ...Platform.select({
      web: {
        transition: 'all 200ms ease-out',
      },
    }),
  },
  searchWrapperFocused: {
    borderColor: COLORS.brand[700],
    backgroundColor: COLORS.neutral.white,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: COLORS.neutral[900],
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fonts.primary,
    height: '100%',
    ...Platform.select({
      web: {
        outlineWidth: 0,
      },
    }),
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
    marginHorizontal: SPACING[20],
    marginBottom: SPACING[12],
  },
  tabButton: {
    paddingVertical: SPACING[12],
    paddingHorizontal: SPACING[16],
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  tabButtonActive: {
    borderBottomColor: COLORS.brand[700],
  },
  tabButtonText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[500],
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  tabButtonTextActive: {
    color: COLORS.brand[700],
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  feedList: {
    flex: 1,
  },
  feedListContent: {
    paddingBottom: SPACING[32],
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: COLORS.neutral[400],
    fontSize: 14,
  },
  groupContainer: {
    marginTop: 8,
  },
  groupHeader: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[400],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: SPACING[20],
    paddingVertical: 8,
    backgroundColor: COLORS.neutral[50],
  },
  card: {
    flexDirection: 'row',
    padding: SPACING[16],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[100],
    backgroundColor: COLORS.neutral.white,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'background-color 150ms ease-out',
      },
    }),
  },
  cardSelected: {
    backgroundColor: 'rgba(37, 99, 235, 0.04)',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.brand[700],
    paddingLeft: SPACING[16] - 3, // Offset for left border
  },
  avatarWrapper: {
    marginRight: SPACING[12],
    justifyContent: 'flex-start',
    paddingTop: 2,
  },
  cardContent: {
    flex: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  applicantName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
    flex: 1,
    marginRight: 8,
  },
  timeAgo: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: COLORS.neutral[400],
  },
  companyName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[500],
    marginBottom: 4,
  },
  descriptionSnippet: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[500],
    marginBottom: 8,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  },
  metaBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  metaBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  badgeBulk: {
    backgroundColor: '#FAF5FF',
    borderColor: '#E9D5FF',
  },
  badgeSingle: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  textBulk: {
    color: '#7E22CE',
  },
  textSingle: {
    color: '#1D4ED8',
  },
  badgeCode: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  textCode: {
    color: '#047857',
  },
  beingViewedBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  beingViewedText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#D97706',
  },
  cardRightAction: {
    justifyContent: 'center',
    marginLeft: 8,
  },
});
