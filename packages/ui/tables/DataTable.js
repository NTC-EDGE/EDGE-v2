"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataTable = DataTable;
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const vector_icons_1 = require("@expo/vector-icons");
const react_table_1 = require("@tanstack/react-table");
const tokens_1 = require("../theme/tokens");
const TABS = ['All', 'Approved', 'Pending', 'Rejected', 'Draft'];
function isRecord(value) {
    return typeof value === 'object' && value !== null;
}
function TabButton({ tab, isActive, onPress }) {
    const [isHovered, setIsHovered] = (0, react_1.useState)(false);
    return (<react_native_1.Pressable onPress={onPress} onHoverIn={() => setIsHovered(true)} onHoverOut={() => setIsHovered(false)} style={[
            styles.tabItem,
            isActive && styles.tabItemActive,
            !isActive && isHovered && styles.tabItemHover,
        ]}>
      <react_native_1.Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab}</react_native_1.Text>
    </react_native_1.Pressable>);
}
function DataTableRow({ row }) {
    const [isHovered, setIsHovered] = (0, react_1.useState)(false);
    return (<react_native_1.Pressable onHoverIn={() => setIsHovered(true)} onHoverOut={() => setIsHovered(false)} style={[
            styles.tableRow,
            isHovered && styles.tableRowHover,
        ]}>
      {row.getVisibleCells().map((cell) => {
            const colFlex = cell.column.columnDef.meta?.flex ?? 1;
            return (<react_native_1.View key={cell.id} style={[styles.tableCell, { flex: colFlex }]}>
            {(0, react_table_1.flexRender)(cell.column.columnDef.cell, cell.getContext())}
          </react_native_1.View>);
        })}
    </react_native_1.Pressable>);
}
function PaginationButton({ disabled, onPress, iconName }) {
    const [isHovered, setIsHovered] = (0, react_1.useState)(false);
    return (<react_native_1.Pressable disabled={disabled} onPress={onPress} onHoverIn={() => setIsHovered(true)} onHoverOut={() => setIsHovered(false)} style={[
            styles.pageBtn,
            disabled && styles.pageBtnDisabled,
            !disabled && isHovered && styles.pageBtnHover,
        ]}>
      <vector_icons_1.Feather name={iconName} size={16} color={!disabled ? tokens_1.COLORS.neutral[700] : tokens_1.COLORS.neutral[300]}/>
    </react_native_1.Pressable>);
}
function DataTable({ data, columns, searchPlaceholder = 'Search...', searchKey, statusKey, }) {
    const [searchText, setSearchText] = (0, react_1.useState)('');
    const [activeTab, setActiveTab] = (0, react_1.useState)('All');
    const { width } = (0, react_native_1.useWindowDimensions)();
    const isMobile = width < 768;
    const filteredData = (0, react_1.useMemo)(() => {
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
                return Object.values(row).some((val) => val !== null && val !== undefined && String(val).toLowerCase().includes(query));
            }
            return false;
        });
    }, [data, searchText, activeTab, searchKey, statusKey]);
    const table = (0, react_table_1.useReactTable)({
        data: filteredData,
        columns,
        getCoreRowModel: (0, react_table_1.getCoreRowModel)(),
        getPaginationRowModel: (0, react_table_1.getPaginationRowModel)(),
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
    return (<react_native_1.View style={[styles.container, isMobile && styles.containerMobile, tokens_1.SHADOWS.card]}>
      {/* Table Toolbar */}
      <react_native_1.View style={styles.toolbar}>
        {/* Status Tabs */}
        {statusKey !== undefined ? (<react_native_1.View style={styles.tabsContainer}>
            {TABS.map((tab) => {
                const isActive = activeTab === tab;
                return (<TabButton key={tab} tab={tab} isActive={isActive} onPress={() => setActiveTab(tab)}/>);
            })}
          </react_native_1.View>) : (<react_native_1.View style={{ flex: 1 }}/>)}

        {/* Search Input */}
        <react_native_1.View style={[styles.searchContainer, isMobile && styles.searchContainerMobile]}>
          <vector_icons_1.Feather name="search" size={15} color={tokens_1.COLORS.neutral[400]} style={styles.searchIcon}/>
          <react_native_1.TextInput placeholder={searchPlaceholder} placeholderTextColor={tokens_1.COLORS.neutral[400]} value={searchText} onChangeText={setSearchText} style={styles.searchInput}/>
        </react_native_1.View>
      </react_native_1.View>

      {/* Main Table Grid - scrollable horizontally on mobile to prevent squishing */}
      <react_native_1.ScrollView horizontal={isMobile} showsHorizontalScrollIndicator={isMobile} scrollEnabled={isMobile} style={isMobile ? styles.mobileTableScroll : undefined}>
        <react_native_1.View style={[styles.tableWrapper, isMobile && { width: 680 }]}>
          {/* Table Header */}
          <react_native_1.View style={styles.tableHeaderRow}>
            {table.getHeaderGroups().map((headerGroup) => (<react_1.default.Fragment key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                const colFlex = header.column.columnDef.meta?.flex ?? 1;
                return (<react_native_1.View key={header.id} style={[styles.tableHeaderCell, { flex: colFlex }]}>
                      <react_native_1.Text style={styles.headerText}>
                        {header.isPlaceholder
                        ? null
                        : (0, react_table_1.flexRender)(header.column.columnDef.header, header.getContext())}
                      </react_native_1.Text>
                    </react_native_1.View>);
            })}
              </react_1.default.Fragment>))}
          </react_native_1.View>

          {/* Table Body */}
          {table.getRowModel().rows.length > 0 ? (table.getRowModel().rows.map((row) => (<react_native_1.View key={row.id} style={styles.tableRowContainer}>
                <DataTableRow row={row}/>
              </react_native_1.View>))) : (<react_native_1.View style={styles.emptyState}>
              <vector_icons_1.Feather name="folder" size={32} color={tokens_1.COLORS.neutral[300]} style={{ marginBottom: 12 }}/>
              <react_native_1.Text style={styles.emptyText}>No records found matching your selection.</react_native_1.Text>
            </react_native_1.View>)}
        </react_native_1.View>
      </react_native_1.ScrollView>

      {/* Table Pagination */}
      <react_native_1.View style={styles.pagination}>
        <react_native_1.Text style={styles.paginationText}>
          Page {pageCount > 0 ? pageIndex + 1 : 0} of {pageCount} ({filteredData.length} total rows)
        </react_native_1.Text>
        <react_native_1.View style={styles.paginationActions}>
          <PaginationButton disabled={!hasPreviousPage} onPress={() => table.previousPage()} iconName="chevron-left"/>
          <PaginationButton disabled={!hasNextPage} onPress={() => table.nextPage()} iconName="chevron-right"/>
        </react_native_1.View>
      </react_native_1.View>
    </react_native_1.View>);
}
const styles = react_native_1.StyleSheet.create({
    container: {
        backgroundColor: tokens_1.COLORS.neutral.white,
        borderRadius: tokens_1.RADIUS.card,
        borderWidth: 1,
        borderColor: tokens_1.COLORS.neutral[200],
        padding: tokens_1.SPACING[24],
        width: '100%',
    },
    containerMobile: {
        padding: tokens_1.SPACING[12],
    },
    toolbar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: tokens_1.SPACING[20],
        flexWrap: 'wrap',
        gap: tokens_1.SPACING[12],
    },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: tokens_1.COLORS.neutral[50],
        padding: 3,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: tokens_1.COLORS.neutral[200],
    },
    tabItem: {
        paddingHorizontal: tokens_1.SPACING[12],
        paddingVertical: 6,
        borderRadius: 6,
        ...react_native_1.Platform.select({
            web: {
                transition: 'all 200ms ease-out',
                cursor: 'pointer',
            },
        }),
    },
    tabItemHover: {
        backgroundColor: tokens_1.COLORS.neutral[100],
    },
    tabItemActive: {
        backgroundColor: tokens_1.COLORS.neutral.white,
        ...react_native_1.Platform.select({
            web: {
                boxShadow: '0 1px 2px rgba(15,23,42,.05)',
            },
        }),
    },
    tabText: {
        fontFamily: tokens_1.TYPOGRAPHY.fonts.primary,
        fontSize: 13,
        fontWeight: tokens_1.TYPOGRAPHY.weights.medium,
        color: tokens_1.COLORS.neutral[500],
    },
    tabTextActive: {
        color: tokens_1.COLORS.brand[800],
        fontWeight: tokens_1.TYPOGRAPHY.weights.semibold,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: tokens_1.COLORS.neutral.white,
        borderWidth: 1,
        borderColor: tokens_1.COLORS.neutral[200],
        borderRadius: tokens_1.RADIUS.input,
        height: 36,
        width: 240,
        paddingHorizontal: tokens_1.SPACING[12],
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontFamily: tokens_1.TYPOGRAPHY.fonts.primary,
        fontSize: 13,
        color: tokens_1.COLORS.neutral[900],
        height: '100%',
        padding: 0,
        ...react_native_1.Platform.select({
            web: {
                outlineWidth: 0,
            },
        }),
    },
    tableWrapper: {
        borderWidth: 1,
        borderColor: tokens_1.COLORS.neutral[200],
        borderRadius: 8,
        overflow: 'hidden',
    },
    tableHeaderRow: {
        flexDirection: 'row',
        backgroundColor: tokens_1.COLORS.neutral[50],
        borderBottomWidth: 1,
        borderBottomColor: tokens_1.COLORS.neutral[200],
        height: 44,
        alignItems: 'center',
        paddingHorizontal: tokens_1.SPACING[16],
    },
    tableHeaderCell: {
        justifyContent: 'center',
    },
    headerText: {
        fontFamily: tokens_1.TYPOGRAPHY.fonts.primary,
        fontSize: 12,
        fontWeight: tokens_1.TYPOGRAPHY.weights.bold,
        color: tokens_1.COLORS.neutral[500],
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    tableRowContainer: {
        borderBottomWidth: 1,
        borderBottomColor: tokens_1.COLORS.neutral[200],
    },
    tableRow: {
        flexDirection: 'row',
        height: 52,
        alignItems: 'center',
        paddingHorizontal: tokens_1.SPACING[16],
        backgroundColor: tokens_1.COLORS.neutral.white,
        ...react_native_1.Platform.select({
            web: {
                transition: 'background-color 150ms ease-out',
                cursor: 'pointer',
            },
        }),
    },
    tableRowHover: {
        backgroundColor: tokens_1.COLORS.neutral[50],
    },
    tableCell: {
        justifyContent: 'center',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        backgroundColor: tokens_1.COLORS.neutral.white,
    },
    emptyText: {
        fontFamily: tokens_1.TYPOGRAPHY.fonts.primary,
        color: tokens_1.COLORS.neutral[400],
        fontSize: 13,
    },
    pagination: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: tokens_1.SPACING[20],
    },
    paginationText: {
        fontFamily: tokens_1.TYPOGRAPHY.fonts.primary,
        fontSize: 13,
        color: tokens_1.COLORS.neutral[500],
    },
    paginationActions: {
        flexDirection: 'row',
        gap: 8,
    },
    pageBtn: {
        width: 32,
        height: 32,
        borderWidth: 1,
        borderColor: tokens_1.COLORS.neutral[200],
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: tokens_1.COLORS.neutral.white,
        ...react_native_1.Platform.select({
            web: {
                transition: 'all 150ms ease-out',
                cursor: 'pointer',
            },
        }),
    },
    pageBtnHover: {
        backgroundColor: tokens_1.COLORS.neutral[50],
    },
    pageBtnDisabled: {
        opacity: 0.5,
        backgroundColor: tokens_1.COLORS.neutral[50],
        ...react_native_1.Platform.select({
            web: {
                cursor: 'not-allowed',
            },
        }),
    },
    searchContainerMobile: {
        width: '100%',
    },
    mobileTableScroll: {
        width: '100%',
    },
});
