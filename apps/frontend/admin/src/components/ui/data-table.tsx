import React from "react";
import { Loader2, Inbox } from "lucide-react";
import { Pagination } from "./pagination";
import { ActionMenu, ActionMenuItem } from "./action-menu";

export interface ColumnDef<T> {
  key: string;
  header: React.ReactNode;
  cell: (item: T, index: number) => React.ReactNode;
  align?: "left" | "center" | "right";
  className?: string;
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
  /** Unique key extractor for each row */
  getItemKey: (item: T, index: number) => string | number;
  /** Row action menu items generator (renders ActionMenu dropdown) */
  rowActionMenu?: (item: T) => ActionMenuItem[];
  /** Custom rendered actions column cell (alternative to rowActionMenu) */
  renderActions?: (item: T) => React.ReactNode;
  /** Custom text for Actions column header */
  actionsHeaderLabel?: string;
  /** Loading state indicator */
  loading?: boolean;
  /** Optional custom empty state message or icon */
  emptyState?: {
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

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header & Title Section */}
      {hasHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/90 border border-slate-800">
          <div>
            {title && <h3 className="text-lg font-bold text-white flex items-center gap-2">{title}</h3>}
            {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
          </div>
          {headerBadge && <div>{headerBadge}</div>}
        </div>
      )}

      {/* Custom Toolbar Slot */}
      {toolbar && <div>{toolbar}</div>}

      {/* Table Container */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/90 text-xs uppercase text-slate-400 font-semibold tracking-wider border-b border-slate-800">
              <tr>
                {columns.map((col) => {
                  const alignClass =
                    col.align === "center"
                      ? "text-center"
                      : col.align === "right"
                      ? "text-right"
                      : "text-left";
                  return (
                    <th key={col.key} className={`px-6 py-4 ${alignClass} ${col.className ?? ""}`}>
                      {col.header}
                    </th>
                  );
                })}
                {hasActions && <th className="px-6 py-4 text-right">{actionsHeaderLabel}</th>}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={columns.length + (hasActions ? 1 : 0)} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
                      <span>Loading dataset...</span>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + (hasActions ? 1 : 0)} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      {emptyState?.icon ?? <Inbox className="w-10 h-10 text-slate-600 mb-1" />}
                      <p className="font-semibold text-slate-300">
                        {emptyState?.title ?? "No data available"}
                      </p>
                      <p className="text-xs text-slate-500 max-w-sm">
                        {emptyState?.description ?? "There are no records matching the specified criteria."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((item, idx) => (
                  <tr key={getItemKey(item, idx)} className="hover:bg-slate-800/40 transition-colors group">
                    {columns.map((col) => {
                      const alignClass =
                        col.align === "center"
                          ? "text-center"
                          : col.align === "right"
                          ? "text-right"
                          : "text-left";
                      return (
                        <td key={col.key} className={`px-6 py-4 ${alignClass} ${col.className ?? ""}`}>
                          {col.cell(item, idx)}
                        </td>
                      );
                    })}

                    {hasActions && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {renderActions && renderActions(item)}
                          {rowActionMenu && <ActionMenu items={rowActionMenu(item)} />}
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
