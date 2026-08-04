"use client";

import React, { useState, useEffect } from "react";
import { ClipboardList, Edit2, Trash2 } from "lucide-react";
import { Requirement, ServiceVariantRequirement } from "@edge/api";
import { DataTable, ColumnDef, ActionMenuItem } from "@/components/ui/data-table";

export interface RequirementsTableProps {
  requirements: Requirement[];
  serviceVariantRequirements: ServiceVariantRequirement[];
  loading: boolean;
  canManage: boolean;
  searchTerm: string;
  onEdit: (item: Requirement) => void;
  onDelete: (item: Requirement) => void;
}

export function RequirementsTable({
  requirements,
  serviceVariantRequirements,
  loading,
  canManage,
  searchTerm,
  onEdit,
  onDelete,
}: RequirementsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset pagination when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredRequirements = requirements.filter(
    (req) =>
      req.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.description !== null && req.description !== undefined && req.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const paginatedRequirements = filteredRequirements.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const columns: ColumnDef<Requirement>[] = [
    {
      key: "name",
      header: "Requirement Name",
      cell: (item) => <span className="font-semibold text-white">{item.name}</span>,
    },
    {
      key: "description",
      header: "Description",
      cell: (item) => (
        <span className="text-slate-400 text-xs">
          {item.description !== null && item.description !== undefined && item.description !== "" ? item.description : "—"}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={paginatedRequirements}
      loading={loading}
      getItemKey={(item) => item.id}
      rowActionMenu={
        canManage
          ? (item) => {
              const isUsedInServiceSvr = serviceVariantRequirements.some(
                (svr) => svr.requirementId === item.id
              );
              // Allow deleting requirements if not currently associated/used.
              const isDeleteAllowed = !isUsedInServiceSvr;

              const menuItems: ActionMenuItem[] = [
                {
                  label: "Edit Details",
                  icon: Edit2,
                  onClick: () => onEdit(item),
                },
              ];

              if (isDeleteAllowed) {
                menuItems.push({
                  label: "Delete Requirement",
                  icon: Trash2,
                  onClick: () => onDelete(item),
                  variant: "destructive" as const,
                });
              }
              return menuItems;
            }
          : undefined
      }
      emptyState={{
        icon: <ClipboardList className="w-10 h-10 mx-auto text-slate-600 mb-2" />,
        title: "No requirements configured",
        description: "There are no administrative requirements registered in the catalog yet.",
      }}
      pagination={{
        currentPage,
        totalItems: filteredRequirements.length,
        pageSize,
        onPageChange: setCurrentPage,
        onPageSizeChange: (sz) => {
          setPageSize(sz);
          setCurrentPage(1);
        },
      }}
    />
  );
}
