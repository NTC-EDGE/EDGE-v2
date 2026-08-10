import React from "react";
import {
  LifeBuoy,
  UserX,
  Mail,
  Phone,
  Globe,
  Building2,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Ticket,
  Unlock,
  Key,
  RefreshCw,
  FileText
} from "lucide-react";
import { GlobalSupportUser } from "@edge/api";
import { Button } from "@/components/ui/button";
import { DataTable, ColumnDef, DataTablePaginationProps } from "@/components/ui/data-table";
import { StatusBadge } from "./StatusBadge";

interface SupportUserTableProps {
  users: GlobalSupportUser[];
  loading: boolean;
  onOpenWorkbench: (user: GlobalSupportUser, initialTab?: "health" | "access" | "audit" | "sessions" | "tickets") => void;
  onUnlockAccount: (userId: string) => void;
  onResetPassword: (userId: string) => void;
  onRevokeSessions: (userId: string) => void;
  onOpenStatusModal: (user: GlobalSupportUser) => void;
  pagination?: DataTablePaginationProps;
}

export function SupportUserTable({
  users,
  loading,
  onOpenWorkbench,
  onUnlockAccount,
  onResetPassword,
  onRevokeSessions,
  onOpenStatusModal,
  pagination,
}: SupportUserTableProps) {
  const columns: ColumnDef<GlobalSupportUser>[] = [
    {
      key: "user",
      header: "User",
      cell: (usr) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow shrink-0">
            {usr.firstName.charAt(0)}{usr.lastName.charAt(0)}
          </div>
          <div>
            <div className="font-semibold text-slate-900 dark:text-white text-sm">
              <span>{usr.firstName} {usr.lastName}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3 text-slate-400 dark:text-slate-500" /> {usr.email}
              </span>
              {usr.phoneNumber && (
                <span className="flex items-center gap-1 text-slate-500">
                  • <Phone className="w-3 h-3 text-slate-400 dark:text-slate-500" /> {usr.phoneNumber}
                </span>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "region",
      header: "Global Region & Tenant",
      cell: (usr) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-cyan-600 dark:text-cyan-300 font-medium">
            <Globe className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400 shrink-0" />
            <span className="max-w-[180px] truncate">{usr.regionName}</span>
          </div>
          {usr.tenantName ? (
            <div className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-400">
              <Building2 className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
              <span className="max-w-[170px] truncate">{usr.tenantName}</span>
            </div>
          ) : (
            <div className="text-[11px] text-slate-400 dark:text-slate-500 italic">No direct tenant binding</div>
          )}
        </div>
      ),
    },
    {
      key: "security",
      header: "Security & Status",
      cell: (usr) => (
        <div className="space-y-1.5">
          <div><StatusBadge status={usr.status} isLocked={usr.isLockedOut} /></div>
          <div className="flex items-center gap-1.5 text-[11px]">
            {usr.mfaEnabled ? (
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> MFA: {usr.mfaMethod ?? "Enrolled"}
              </span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400/80 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" /> MFA Disabled
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "auth",
      header: "Auth Activity",
      cell: (usr) => (
        <div className="space-y-1 text-xs">
          <div className="text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
            {usr.lastLoginAt ? new Date(usr.lastLoginAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }) : "Never logged in"}
          </div>
          <div className="flex items-center gap-1 text-[11px]">
            <span className="text-slate-500">Failed attempts:</span>
            <span className={`font-mono font-bold ${usr.failedLoginAttempts > 0 ? "text-rose-500 dark:text-rose-400" : "text-slate-500 dark:text-slate-400"}`}>
              {usr.failedLoginAttempts}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "support",
      header: "Support History",
      cell: (usr) => (
        <div className="space-y-1 text-xs">
          {usr.openTicketsCount > 0 ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300 font-semibold border border-amber-500/30 text-[11px]">
              <Ticket className="w-3 h-3 text-amber-500 dark:text-amber-400" /> {usr.openTicketsCount} Open Ticket{usr.openTicketsCount > 1 ? "s" : ""}
            </span>
          ) : (
            <span className="text-slate-500 text-[11px]">No active tickets</span>
          )}
          <div className="text-[10px] text-slate-500 font-mono">
            {usr.totalTicketsCount} total ticket history
          </div>
        </div>
      ),
    },
  ];

  return (
    <DataTable<GlobalSupportUser>
      columns={columns}
      data={users}
      getItemKey={(usr) => usr.id}
      loading={loading}
      actionsHeaderLabel="Actions & Diagnostics"
      renderActions={(usr) => (
        <Button
          onClick={() => onOpenWorkbench(usr)}
          className="bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm"
        >
          <LifeBuoy className="w-3.5 h-3.5" /> Troubleshoot
        </Button>
      )}
      rowActionMenu={(usr) => [
        {
          label: usr.isLockedOut ? "Unlock Account Now" : "Account Health Check",
          icon: usr.isLockedOut ? Unlock : ShieldCheck,
          onClick: () => {
            if (usr.isLockedOut) {
              onUnlockAccount(usr.id);
            } else {
              onOpenWorkbench(usr, "health");
            }
          },
        },
        {
          label: "Send Password Reset Email",
          icon: Key,
          onClick: () => onResetPassword(usr.id),
        },
        {
          label: "Revoke Active Sessions",
          icon: RefreshCw,
          onClick: () => onRevokeSessions(usr.id),
        },
        {
          label: "Toggle Account Status",
          icon: UserX,
          onClick: () => onOpenStatusModal(usr),
        },
        {
          label: "View Audit Log History",
          icon: FileText,
          onClick: () => onOpenWorkbench(usr, "audit"),
        },
      ]}
      emptyState={{
        title: "No users found matching query",
        description: "Try adjusting your search keywords, region, or status filters.",
      }}
      pagination={pagination}
    />
  );
}
