/// <reference path="../react-native.d.ts" />
import React, { useMemo, useState } from 'react';
import { StyleSheet, View, Text, TextInput, Pressable, Platform, useWindowDimensions, ScrollView } from 'react-native';
import { Feather as Lucide } from '@expo/vector-icons';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
  Row,
} from '@tanstack/react-table';
import { SPACING, RADIUS, SHADOWS, TYPOGRAPHY } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { StatusBadge } from './StatusBadge';

type TabType = 'All' | 'Approved' | 'Pending' | 'Rejected' | 'Draft';
const TABS: TabType[] = ['All', 'Approved', 'Pending', 'Rejected', 'Draft'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

// 1. Modular Tab Button with local hover state & theme awareness
interface TabButtonProps {
  tab: TabType;
  isActive: boolean;
  onPress: () => void;
}

function TabButton({ tab, isActive, onPress }: TabButtonProps) {
  const { colors, isDark } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  const activeBg = isDark ? colors.brand[800] : colors.cardBg;
  const hoverBg = isDark ? colors.neutral[800] : colors.neutral[100];
  const activeText = isDark ? colors.neutral.white : colors.brand[800];

  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      style={[
        styles.tabItem,
        isActive && { backgroundColor: activeBg },
        !isActive && isHovered && { backgroundColor: hoverBg },
      ]}
    >
      <Text style={[styles.tabText, { color: colors.textMuted }, isActive && { color: activeText, fontWeight: TYPOGRAPHY.weights.semibold }]}>
        {tab}
      </Text>
    </Pressable>
  );
}

// 2. Modular Data Table Row with local hover state & theme awareness
interface DataTableRowProps<TData> {
  row: Row<TData>;
  isLastRow?: boolean;
}

function DataTableRow<TData>({ row, isLastRow }: DataTableRowProps<TData>) {
  const { colors, isDark } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  const rowBg = colors.cardBg;
  const rowHoverBg = isDark ? colors.neutral[800] : colors.neutral[50];

  return (
    <Pressable
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      style={[
        styles.tableRow,
        { backgroundColor: isHovered ? rowHoverBg : rowBg },
        isLastRow && {
          borderBottomLeftRadius: 7,
          borderBottomRightRadius: 7,
        },
      ]}
    >
      {row.getVisibleCells().map((cell) => {
        const colFlex = cell.column.columnDef.meta?.flex ?? 1;

        return (
          <View key={cell.id} style={[styles.tableCell, { flex: colFlex }]}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </View>
        );
      })}
    </Pressable>
  );
}

// 3. Modular Pagination Action Button with local hover state & theme awareness
interface PaginationButtonProps {
  disabled: boolean;
  onPress: () => void;
  iconName: 'chevron-left' | 'chevron-right';
}

function PaginationButton({ disabled, onPress, iconName }: PaginationButtonProps) {
  const { colors, isDark } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  const btnBg = colors.cardBg;
  const hoverBg = isDark ? colors.neutral[800] : colors.neutral[50];

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      style={[
        styles.pageBtn,
        { backgroundColor: isHovered && !disabled ? hoverBg : btnBg, borderColor: colors.border },
        disabled && styles.pageBtnDisabled,
      ]}
    >
      <Lucide
        name={iconName}
        size={16}
        color={!disabled ? colors.text : colors.neutral[400]}
      />
    </Pressable>
  );
}

interface DataTableProps<TData, TValue> {
  data: TData[];
  columns: ColumnDef<TData, TValue>[];
  searchPlaceholder?: string;
  searchKey?: keyof TData;
  statusKey?: keyof TData;
}

export function DataTable<TData, TValue>({
  data,
  columns,
  searchPlaceholder = 'Search...',
  searchKey,
  statusKey,
}: DataTableProps<TData, TValue>) {
  const { colors, isDark } = useTheme();
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('All');
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      if (statusKey !== undefined && activeTab !== 'All') {
        if (isRecord(row)) {
          const rowStatus = String(row[statusKey]).toLowerCase();
          if (rowStatus !== activeTab.toLowerCase()) {
            return false;
          }
        }
      }

      if (searchText.trim().length === 0) {
        return true;
      }

      const query = searchText.toLowerCase();

      if (searchKey !== undefined) {
        if (isRecord(row)) {
          const value = row[searchKey];
          if (value !== null && value !== undefined && String(value).toLowerCase().includes(query)) {
            return true;
          }
        }
        return false;
      }

      if (isRecord(row)) {
        return Object.values(row).some(
          (val) => val !== null && val !== undefined && String(val).toLowerCase().includes(query)
        );
      }

      return false;
    });
  }, [data, searchText, activeTab, searchKey, statusKey]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  });

  const pageIndex = table.getState().pagination.pageIndex;
  const pageCount = table.getPageCount();
  const hasPreviousPage = table.getCanPreviousPage();
  const hasNextPage = table.getCanNextPage();

  return (
    <View style={[styles.container, { backgroundColor: colors.cardBg, borderColor: colors.border }, isMobile && styles.containerMobile, SHADOWS.card]}>
      {/* Table Toolbar */}
      <View style={styles.toolbar}>
        {/* Status Tabs */}
        {statusKey !== undefined ? (
          <View style={[styles.tabsContainer, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50], borderColor: colors.border }]}>
            {TABS.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <TabButton
                  key={tab}
                  tab={tab}
                  isActive={isActive}
                  onPress={() => setActiveTab(tab)}
                />
              );
            })}
          </View>
        ) : (
          <View style={{ flex: 1 }} />
        )}

        {/* Search Input */}
        <View style={[styles.searchContainer, { backgroundColor: colors.cardBg, borderColor: colors.border }, isMobile && styles.searchContainerMobile]}>
          <Lucide name="search" size={15} color={colors.neutral[400]} style={styles.searchIcon} />
          <TextInput
            placeholder={searchPlaceholder}
            placeholderTextColor={colors.neutral[400]}
            value={searchText}
            onChangeText={setSearchText}
            style={[styles.searchInput, { color: colors.text }]}
          />
        </View>
      </View>

      {/* Main Table Grid */}
      {(() => {
        const TableContent = (
          <View style={[styles.tableWrapper, { borderColor: colors.border }, isMobile && { width: 680 }]}>
            {/* Table Header */}
            <View style={[styles.tableHeaderRow, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50], borderBottomColor: colors.border }]}>
              {table.getHeaderGroups().map((headerGroup) => (
                <React.Fragment key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const colFlex = header.column.columnDef.meta?.flex ?? 1;

                    return (
                      <View key={header.id} style={[styles.tableHeaderCell, { flex: colFlex }]}>
                        <Text style={[styles.headerText, { color: colors.textMuted }]}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </Text>
                      </View>
                    );
                  })}
                </React.Fragment>
              ))}
            </View>

            {/* Table Body */}
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row, index) => {
                const isLastRow = index === table.getRowModel().rows.length - 1;
                return (
                  <View
                    key={row.id}
                    style={[
                      styles.tableRowContainer,
                      { borderBottomColor: colors.border },
                      { zIndex: table.getRowModel().rows.length - index },
                      isLastRow && styles.tableRowContainerLast,
                    ]}
                  >
                    <DataTableRow row={row} isLastRow={isLastRow} />
                  </View>
                );
              })
            ) : (
              <View style={[styles.emptyState, { backgroundColor: colors.cardBg }]}>
                <Lucide name="folder" size={32} color={colors.neutral[400]} style={{ marginBottom: 12 }} />
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>No records found matching your selection.</Text>
              </View>
            )}
          </View>
        );

        return isMobile ? (
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={true}
            scrollEnabled={true}
            style={styles.mobileTableScroll}
          >
            {TableContent}
          </ScrollView>
        ) : (
          TableContent
        );
      })()}

      {/* Table Pagination */}
      <View style={styles.pagination}>
        <Text style={[styles.paginationText, { color: colors.textMuted }]}>
          Page {pageCount > 0 ? pageIndex + 1 : 0} of {pageCount} ({filteredData.length} total rows)
        </Text>
        <View style={styles.paginationActions}>
          <PaginationButton
            disabled={!hasPreviousPage}
            onPress={() => table.previousPage()}
            iconName="chevron-left"
          />
          <PaginationButton
            disabled={!hasNextPage}
            onPress={() => table.nextPage()}
            iconName="chevron-right"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: RADIUS.card,
    borderWidth: 1,
    padding: SPACING[24],
    width: '100%',
  },
  containerMobile: {
    padding: SPACING[12],
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING[20],
    flexWrap: 'wrap',
    gap: SPACING[12],
  },
  tabsContainer: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  tabItem: {
    paddingHorizontal: SPACING[12],
    paddingVertical: 6,
    borderRadius: 6,
    ...Platform.select({
      web: {
        transition: 'all 200ms ease-out',
        cursor: 'pointer',
      },
    }),
  },
  tabText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: RADIUS.input,
    height: 36,
    width: 240,
    paddingHorizontal: SPACING[12],
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    height: '100%',
    padding: 0,
    ...Platform.select({
      web: {
        outlineWidth: 0,
      },
    }),
  },
  tableWrapper: {
    borderWidth: 1,
    borderRadius: 8,
    ...Platform.select({
      web: {
        overflow: 'visible',
      },
      default: {
        overflow: 'hidden',
      },
    }),
  },
  tableHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    height: 44,
    alignItems: 'center',
    paddingHorizontal: SPACING[16],
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
  },
  tableHeaderCell: {
    justifyContent: 'center',
  },
  headerText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRowContainer: {
    position: 'relative',
    borderBottomWidth: 1,
  },
  tableRowContainerLast: {
    borderBottomWidth: 0,
    borderBottomLeftRadius: 7,
    borderBottomRightRadius: 7,
  },
  tableRow: {
    flexDirection: 'row',
    height: 52,
    alignItems: 'center',
    paddingHorizontal: SPACING[16],
    overflow: 'visible',
    ...Platform.select({
      web: {
        transition: 'background-color 150ms ease-out',
        cursor: 'pointer',
      },
    }),
  },
  tableCell: {
    justifyContent: 'center',
    overflow: 'visible',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING[20],
  },
  paginationText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
  },
  paginationActions: {
    flexDirection: 'row',
    gap: 8,
  },
  pageBtn: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: {
        transition: 'all 150ms ease-out',
        cursor: 'pointer',
      },
    }),
  },
  pageBtnDisabled: {
    opacity: 0.5,
  },
  searchContainerMobile: {
    width: '100%',
  },
  mobileTableScroll: {
    width: '100%',
  },
});
