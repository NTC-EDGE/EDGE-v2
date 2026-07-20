import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
interface DataTableProps<TData, TValue> {
    data: TData[];
    columns: ColumnDef<TData, TValue>[];
    searchPlaceholder?: string;
    searchKey?: keyof TData;
    statusKey?: keyof TData;
}
export declare function DataTable<TData, TValue>({ data, columns, searchPlaceholder, searchKey, statusKey, }: DataTableProps<TData, TValue>): React.JSX.Element;
export {};
