import React from "react";
import {
  Mail,
  Building2,
  Building,
  ShieldCheck,
  Award,
  Briefcase,
  Layers,
  Edit2,
  Trash2
} from "lucide-react";
import { TenantMember, Role, FieldOffice } from "@edge/api";
import { DataTable, ColumnDef, DataTablePaginationProps } from "@/components/ui/data-table";

interface TenantMembersTableProps {
  members: TenantMember[];
  loading: boolean;
  canManage: boolean;
  roles: Role[];
  fieldOffices: FieldOffice[];
  onOpenEdit: (member: TenantMember) => void;
  onOpenRemove: (member: TenantMember) => void;
  pagination?: DataTablePaginationProps;
}

export function TenantMembersTable({
  members,
  loading,
  canManage,
  roles,
  fieldOffices,
  onOpenEdit,
  onOpenRemove,
  pagination,
}: TenantMembersTableProps) {
  const getRoleName = (roleId: string): string => {
    const found = roles.find((r) => r.id === roleId);
    return found !== undefined && found !== null ? found.name : "Member";
  };

  const getOfficeName = (officeId?: string | null): string => {
    if (officeId === undefined || officeId === null || officeId.length === 0) {
      return "Regional Headquarters";
    }
    const found = fieldOffices.find((fo) => fo.id === officeId);
    return found !== undefined && found !== null ? found.name : "Extension Office";
  };

  const columns: ColumnDef<TenantMember>[] = [
    {
      key: "user",
      header: "User Member",
      cell: (member) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow">
            {member.userFirstName.charAt(0)}{member.userLastName.charAt(0)}
          </div>
          <div>
            <div className="font-semibold text-white text-sm">
              {member.userFirstName} {member.userLastName}
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Mail className="w-3 h-3 text-slate-500" />
              <span>{member.userEmail}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "tenant",
      header: "Tenant Scope",
      cell: (member) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
          <Building2 className="w-3.5 h-3.5 text-emerald-400" />
          <span className="max-w-[180px] truncate">{member.tenantName}</span>
        </div>
      ),
    },
    {
      key: "office",
      header: "Field Office Assignment",
      cell: (member) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-300">
          <Building className="w-3.5 h-3.5 text-sky-400" />
          <span className="font-medium text-slate-200">
            {getOfficeName(member.fieldOfficeId)}
          </span>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role & Level",
      cell: (member) => (
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-300 border border-sky-500/20">
            <ShieldCheck className="w-3 h-3 text-sky-400" /> {getRoleName(member.roleId)}
          </span>
          {member.level && (
            <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
              <Award className="w-3 h-3 text-amber-400" /> {member.level}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "position",
      header: "Division & Position",
      cell: (member) => (
        <div className="space-y-0.5">
          <div className="text-xs font-medium text-slate-200 flex items-center gap-1">
            <Briefcase className="w-3 h-3 text-slate-400" /> {member.position}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Layers className="w-3 h-3 text-slate-500" /> {member.division}
          </div>
        </div>
      ),
    },
  ];

  return (
    <DataTable<TenantMember>
      columns={columns}
      data={members}
      getItemKey={(m) => m.id}
      loading={loading}
      rowActionMenu={
        canManage
          ? (member) => [
              {
                label: "Edit Member Details",
                icon: Edit2,
                onClick: () => onOpenEdit(member),
              },
              {
                label: "Remove Member",
                icon: Trash2,
                onClick: () => onOpenRemove(member),
                variant: "destructive",
              },
            ]
          : undefined
      }
      emptyState={{
        title: "No members assigned",
        description: "Try assigning a user or changing tenant/office filter.",
      }}
      pagination={pagination}
    />
  );
}
