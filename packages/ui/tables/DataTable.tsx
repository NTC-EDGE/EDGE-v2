import React, { useMemo, useState } from 'react';
import { StyleSheet, View, Text, TextInput, Pressable, Platform } from 'react-native';
import { Feather as Lucide } from '@expo/vector-icons';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
  Row,
} from '@tanstack/react-table';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY } from '../theme/tokens';
import { StatusBadge } from './StatusBadge';

type TabType = 'All' | 'Approved' | 'Pending' | 'Rejected' | 'Draft';
const TABS: TabType[] = ['All', 'Approved', 'Pending', 'Rejected', 'Draft'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

// 1. Modular Tab Button with local hover state
interface TabButtonProps {
  tab: TabType;
  isActive: boolean;
  onPress: () => void;
}

function TabButton({ tab, isActive, onPress }: TabButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      style={[
        styles.tabItem,
        isActive && styles.tabItemActive,
        !isActive && isHovered && styles.tabItemHover,
      ]}
    >
      <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab}</Text>
    </Pressable>
  );
}

// 2. Modular Data Table Row with local hover state
interface DataTableRowProps<TData> {
  row: Row<TData>;
}

function DataTableRow<TData>({ row }: DataTableRowProps<TData>) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Pressable
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      style={[
        styles.tableRow,
        isHovered && styles.tableRowHover,
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

// 3. Modular Pagination Action Button with local hover state
interface PaginationButtonProps {
  disabled: boolean;
  onPress: () => void;
  iconName: 'chevron-left' | 'chevron-right';
}

function PaginationButton({ disabled, onPress, iconName }: PaginationButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      style={[
        styles.pageBtn,
        disabled && styles.pageBtnDisabled,
        !disabled && isHovered && styles.pageBtnHover,
      ]}
    >
      <Lucide
        name={iconName}
        size={16}
        color={!disabled ? COLORS.neutral[700] : COLORS.neutral[300]}
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
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('All');

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
    <View style={[styles.container, SHADOWS.card]}>
      {/* Table Toolbar */}
      <View style={styles.toolbar}>
        {/* Status Tabs */}
        {statusKey !== undefined ? (
          <View style={styles.tabsContainer}>
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
        <View style={styles.searchContainer}>
          <Lucide name="search" size={15} color={COLORS.neutral[400]} style={styles.searchIcon} />
          <TextInput
            placeholder={searchPlaceholder}
            placeholderTextColor={COLORS.neutral[400]}
            value={searchText}
            onChangeText={setSearchText}
            style={styles.searchInput}
          />
        </View>
      </View>

      {/* Main Table Grid */}
      <View style={styles.tableWrapper}>
        {/* Table Header */}
        <View style={styles.tableHeaderRow}>
          {table.getHeaderGroups().map((headerGroup) => (
            <React.Fragment key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const colFlex = header.column.columnDef.meta?.flex ?? 1;

                return (
                  <View key={header.id} style={[styles.tableHeaderCell, { flex: colFlex }]}>
                    <Text style={styles.headerText}>
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
          table.getRowModel().rows.map((row) => (
            <View key={row.id} style={styles.tableRowContainer}>
              <DataTableRow row={row} />
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Lucide name="folder" size={32} color={COLORS.neutral[300]} style={{ marginBottom: 12 }} />
            <Text style={styles.emptyText}>No records found matching your selection.</Text>
          </View>
        )}
      </View>

      {/* Table Pagination */}
      <View style={styles.pagination}>
        <Text style={styles.paginationText}>
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
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    padding: SPACING[24],
    width: '100%',
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
    backgroundColor: COLORS.neutral[50],
    padding: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
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
  tabItemHover: {
    backgroundColor: COLORS.neutral[100],
  },
  tabItemActive: {
    backgroundColor: COLORS.neutral.white,
    ...Platform.select({
      web: {
        boxShadow: '0 1px 2px rgba(15,23,42,.05)',
      },
    }),
  },
  tabText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.neutral[500],
  },
  tabTextActive: {
    color: COLORS.brand[800],
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral.white,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
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
    color: COLORS.neutral[900],
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
    borderColor: COLORS.neutral[200],
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.neutral[50],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
    height: 44,
    alignItems: 'center',
    paddingHorizontal: SPACING[16],
  },
  tableHeaderCell: {
    justifyContent: 'center',
  },
  headerText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRowContainer: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
  },
  tableRow: {
    flexDirection: 'row',
    height: 52,
    alignItems: 'center',
    paddingHorizontal: SPACING[16],
    backgroundColor: COLORS.neutral.white,
    ...Platform.select({
      web: {
        transition: 'background-color 150ms ease-out',
        cursor: 'pointer',
      },
    }),
  },
  tableRowHover: {
    backgroundColor: COLORS.neutral[50],
  },
  tableCell: {
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: COLORS.neutral.white,
  },
  emptyText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: COLORS.neutral[400],
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
    color: COLORS.neutral[500],
  },
  paginationActions: {
    flexDirection: 'row',
    gap: 8,
  },
  pageBtn: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.neutral.white,
    ...Platform.select({
      web: {
        transition: 'all 150ms ease-out',
        cursor: 'pointer',
      },
    }),
  },
  pageBtnHover: {
    backgroundColor: COLORS.neutral[50],
  },
  pageBtnDisabled: {
    opacity: 0.5,
    backgroundColor: COLORS.neutral[50],
    ...Platform.select({
      web: {
        cursor: 'not-allowed',
      },
    }),
  },
});
