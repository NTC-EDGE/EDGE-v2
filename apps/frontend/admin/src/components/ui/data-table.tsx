import React from "react";
import { Loader2, Inbox } from "lucide-react";
import { Pagination } from "./pagination";
import { ActionMenu, ActionMenuItem } from "./action-menu";
export type { ActionMenuItem };

export interface ColumnDef<T> {
  key?: string;
  /** Column identifier used when no accessorKey is set */
  id?: string;
  accessorKey?: string;
  header: React.ReactNode;
  cell: (value: any, item?: any, index?: number) => React.ReactNode;
  align?: "left" | "center" | "right";
  className?: string;
  [key: string]: unknown;
}

export interface DataTablePaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
}

export interface DataTableProps<T> {
  /** Optional Card Title */
  title?: React.ReactNode;
  /** Optional Card Subtitle/Description */
  description?: React.ReactNode;
  /** Optional Top Right Header Badge/Actions */
  headerBadge?: React.ReactNode;
  /** Custom Toolbar element (Search, Filters, Action buttons) */
  toolbar?: React.ReactNode;
  /** Column configurations */
  columns: ColumnDef<T>[];
  /** Array of data items */
  data: T[];
  /** Unique key extractor for each row. Defaults to index-based key if not provided. */
  getItemKey?: (item: T, index: number) => string | number;
  /** Row action menu items generator (renders ActionMenu dropdown) */
  rowActionMenu?: (item: T) => ActionMenuItem[] | undefined;
  /** Custom rendered actions column cell (alternative to rowActionMenu) */
  renderActions?: (item: T) => React.ReactNode;
  /** Custom text for Actions column header */
  actionsHeaderLabel?: string;
  /** Loading state indicator */
  loading?: boolean;
  /** Optional custom empty state message or icon */
  emptyState?: React.ReactNode | {
    icon?: React.ReactNode;
    title?: string;
    description?: string;
  };
  /** Built-in pagination config */
  pagination?: DataTablePaginationProps;
  /** Additional container CSS classes */
  className?: string;
}

export function DataTable<T>({
  title,
  description,
  headerBadge,
  toolbar,
  columns,
  data,
  getItemKey,
  rowActionMenu,
  renderActions,
  actionsHeaderLabel = "Actions",
  loading = false,
  emptyState,
  pagination,
  className = "",
}: DataTableProps<T>) {
  const hasHeader = Boolean(title || description || headerBadge);
  const hasActions = Boolean(rowActionMenu || renderActions);
  const resolveItemKey = (item: T, idx: number): string | number =>
    getItemKey ? getItemKey(item, idx) : idx;

  const renderEmptyState = () => {
    if (!emptyState) {
      return (
        <div className="flex flex-col items-center justify-center gap-2">
          <Inbox className="w-10 h-10 text-slate-600 mb-1" />
          <p className="font-semibold text-slate-300">No data available</p>
          <p className="text-xs text-slate-500 max-w-sm">
            There are no records matching the specified criteria.
          </p>
        </div>
      );
    }

    if (React.isValidElement(emptyState) || typeof emptyState === "string" || typeof emptyState === "number") {
      return emptyState;
    }

    const stateObj = emptyState as { icon?: React.ReactNode; title?: string; description?: string };
    return (
      <div className="flex flex-col items-center justify-center gap-2">
        {stateObj.icon ?? <Inbox className="w-10 h-10 text-slate-600 mb-1" />}
        <p className="font-semibold text-slate-300">
          {stateObj.title ?? "No data available"}
        </p>
        <p className="text-xs text-slate-500 max-w-sm">
          {stateObj.description ?? "There are no records matching the specified criteria."}
        </p>
      </div>
    );
  };

  const displayData = React.useMemo(() => {
    if (!pagination) return data;
    const { currentPage, pageSize } = pagination;
    // If data length is larger than the page size, perform client-side slicing automatically.
    if (data.length > pageSize) {
      const startIndex = (currentPage - 1) * pageSize;
      return data.slice(startIndex, startIndex + pageSize);
    }
    return data;
  }, [data, pagination]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header & Title Section */}
      {hasHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
          <div>
            {title && <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">{title}</h3>}
            {description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>}
          </div>
          {headerBadge && <div>{headerBadge}</div>}
        </div>
      )}

      {/* Custom Toolbar Slot */}
      {toolbar && <div>{toolbar}</div>}

      {/* Table Container */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xl transition-colors duration-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-950/90 text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                {columns.map((col, colIdx) => {
                  const alignClass =
                    col.align === "center"
                      ? "text-center"
                      : col.align === "right"
                      ? "text-right"
                      : "text-left";
                  const colKey = `${colIdx}-${col.key ?? col.id ?? col.accessorKey ?? "col"}`;
                  return (
                    <th key={colKey} className={`px-6 py-4 ${alignClass} ${col.className ?? ""}`}>
                      {col.header}
                    </th>
                  );
                })}
                {hasActions && <th className="px-6 py-4 text-right">{actionsHeaderLabel}</th>}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={columns.length + (hasActions ? 1 : 0)} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-cyan-500 dark:text-cyan-400" />
                      <span>Loading dataset...</span>
                    </div>
                  </td>
                </tr>
              ) : displayData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + (hasActions ? 1 : 0)} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    {renderEmptyState()}
                  </td>
                </tr>
              ) : (
                displayData.map((item, idx) => (
                  <tr key={resolveItemKey(item, idx)} className="hover:bg-slate-100/70 dark:hover:bg-slate-800/40 transition-colors group">
                    {columns.map((col, colIdx) => {
                      const alignClass =
                        col.align === "center"
                          ? "text-center"
                          : col.align === "right"
                          ? "text-right"
                          : "text-left";
                      const colKey = `${colIdx}-${col.key ?? col.id ?? col.accessorKey ?? "col"}`;
                      const firstArg = col.accessorKey
                        ? (item as any)[col.accessorKey]
                        : item;
                      const secondArg = col.accessorKey ? item : idx;
                      const thirdArg = col.accessorKey ? idx : undefined;
                      return (
                        <td key={colKey} className={`px-6 py-4 ${alignClass} ${col.className ?? ""}`}>
                          {col.cell(firstArg, secondArg, thirdArg)}
                        </td>
                      );
                    })}

                    {hasActions && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {renderActions && renderActions(item)}
                          {rowActionMenu && (() => {
                            const menuItems = rowActionMenu(item);
                            return menuItems && menuItems.length > 0 ? <ActionMenu items={menuItems} /> : null;
                          })()}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Built-in Pagination */}
        {pagination && pagination.totalItems > 0 && !loading && (
          <Pagination
            currentPage={pagination.currentPage}
            totalItems={pagination.totalItems}
            pageSize={pagination.pageSize}
            onPageChange={pagination.onPageChange}
            onPageSizeChange={pagination.onPageSizeChange}
            pageSizeOptions={pagination.pageSizeOptions}
          />
        )}
      </div>
    </div>
  );
}
