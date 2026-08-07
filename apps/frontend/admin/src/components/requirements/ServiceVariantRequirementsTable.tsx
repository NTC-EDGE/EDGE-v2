"use client";

import React, { useState, useEffect } from "react";
import { Link2, Edit2, Trash2 } from "lucide-react";
import { ServiceVariantRequirement } from "@edge/api";
import { DataTable, ColumnDef } from "@/components/ui/data-table";

export interface ServiceVariantRequirementsTableProps {
  serviceVariantRequirements: ServiceVariantRequirement[];
  loading: boolean;
  canManage: boolean;
  searchTerm: string;
  onEdit: (item: ServiceVariantRequirement) => void;
  onDelete: (item: ServiceVariantRequirement) => void;
}

export function ServiceVariantRequirementsTable({
  serviceVariantRequirements,
  loading,
  canManage,
  searchTerm,
  onEdit,
  onDelete,
}: ServiceVariantRequirementsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset pagination when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredSvr = serviceVariantRequirements.filter((svr) => {
    const serviceName = svr.serviceName ?? "";
    const serviceCode = svr.serviceCode ?? "";
    const variantType = svr.serviceVariantType ?? "";
    const reqName = svr.requirement?.name ?? "";
    const appType = svr.contextKey ?? "";

    return (
      serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      serviceCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      variantType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reqName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appType.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const paginatedSvr = filteredSvr.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const columns: ColumnDef<ServiceVariantRequirement>[] = [
    {
      key: "serviceVariant",
      header: "Service & Variant",
      cell: (item) => {
        const serviceDisplay = item.serviceName !== null && item.serviceName !== undefined && item.serviceName !== "" 
          ? `${item.serviceName} (${item.serviceCode ?? ""})` 
          : "Unknown Service";
        const variantDisplay = item.serviceVariantType !== null && item.serviceVariantType !== undefined && item.serviceVariantType !== "" 
          ? item.serviceVariantType 
          : "Standard";
        
        return (
          <div className="flex flex-col">
            <span className="font-semibold text-slate-200">{serviceDisplay}</span>
            {item.serviceVariantType !== "NA" && (
              <span className="text-xs text-indigo-400 mt-0.5 font-medium">{variantDisplay} Variant</span>
            )}
          </div>
        );
      },
    },
    {
      key: "requirement",
      header: "Requirement",
      cell: (item) => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-200">{item.requirement?.name ?? "Unknown Requirement"}</span>
          <span className="text-xs text-slate-400 mt-0.5">{item.requirement?.description ?? ""}</span>
        </div>
      ),
    },
    {
      key: "contextKey",
      header: "Context Key",
      cell: (item) => (
        <span className="font-mono text-xs bg-slate-950/70 border border-slate-800 px-2 py-0.5 rounded text-slate-300">
          {item.contextKey !== null && item.contextKey !== undefined && item.contextKey !== "" 
            ? item.contextKey 
            : "Any / Default"}
        </span>
      ),
    },
    {
      key: "necessity",
      header: "Necessity",
      cell: (item) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
            item.isRequired
              ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
              : "bg-slate-850 text-slate-400 border-slate-700"
          }`}
        >
          {item.isRequired ? "Mandatory" : "Optional"}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={paginatedSvr}
      loading={loading}
      getItemKey={(item) => item.id}
      rowActionMenu={
        canManage
          ? (item) => [
              {
                label: "Modify Mapping",
                icon: Edit2,
                onClick: () => onEdit(item),
              },
              {
                label: "Remove Mapping Rule",
                icon: Trash2,
                onClick: () => onDelete(item),
                variant: "destructive" as const,
              },
            ]
          : undefined
      }
      emptyState={{
        icon: <Link2 className="w-10 h-10 mx-auto text-slate-600 mb-2" />,
        title: "No service requirements mapped",
        description: "No requirements have been mapped to service variants yet.",
      }}
      pagination={{
        currentPage,
        totalItems: filteredSvr.length,
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
