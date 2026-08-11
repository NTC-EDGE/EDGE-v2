"use client";

import React, { useState } from "react";
import {
  Search,
  Mail,
  ExternalLink,
  CheckCircle2,
  Calendar,
  Building,
  UserCheck,
  Loader2,
} from "lucide-react";
import { isForbiddenError, PageForbiddenState } from "@/components/PageForbiddenState";
import { ActionMenu } from "@/components/ui/action-menu";
import { Pagination } from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tenant, Region, GlobalSupportUser } from "@edge/api";
import { useSupportService } from "@/services/supportService";

export interface ExternalUser {
  id: string;
  name: string;
  email: string;
  organization: string;
  licenseCategory: string;
  status: string;
  registeredDate: string;
}

interface ExternalUsersTabProps {
  currentTenant: Tenant;
  getRegionName: (regionId: string) => string;
  getRegionCode: (regionId: string) => string;
}

export function ExternalUsersTab({ currentTenant, getRegionName, getRegionCode }: ExternalUsersTabProps) {
  const [externalSearchTerm, setExternalSearchTerm] = useState("");
  const [externalCategoryFilter, setExternalCategoryFilter] = useState("ALL");
  const [externalPage, setExternalPage] = useState(1);
  const [selectedExternalUser, setSelectedExternalUser] = useState<ExternalUser | null>(null);
  const [isExternalUserModalOpen, setIsExternalUserModalOpen] = useState(false);

  const { useGlobalUsers } = useSupportService();
  const { data: globalUsers, isLoading: loadingUsers, error } = useGlobalUsers(
    externalSearchTerm,
    currentTenant.regionId,
    "ALL"
  );

  if (error && isForbiddenError(error)) {
    return (
      <PageForbiddenState
        title="Client Directory Access Denied"
        message="You do not have permission to view regional client accounts for this tenant."
      />
    );
  }

  if (loadingUsers && !globalUsers) {
    return (
      <div className="p-12 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-3" />
        <span className="text-xs font-semibold">Loading regional client permits...</span>
      </div>
    );
  }

  const usersArray: GlobalSupportUser[] = Array.isArray(globalUsers)
    ? globalUsers
    : (globalUsers as { data?: GlobalSupportUser[] } | undefined)?.data ?? [];

  const fullExternalUsers: ExternalUser[] = usersArray.map((usr) => ({
    id: usr.id,
    name: `${usr.firstName} ${usr.lastName}`.trim() || usr.email,
    email: usr.email,
    organization: usr.tenantName || usr.fieldOfficeName || "Client Entity",
    licenseCategory: Array.isArray(usr.assignedRoles) && usr.assignedRoles.length > 0 ? usr.assignedRoles.join(", ") : "Public Telecommunications Entity (PTE)",
    status: usr.isLockedOut ? "Locked Out" : usr.status === "active" ? "Active License" : "Under Review",
    registeredDate: usr.createdAt ? usr.createdAt.slice(0, 10) : "2026-01-15",
  }));

  const filteredExternalUsers = fullExternalUsers.filter((usr) => {
    const matchesSearch =
      usr.name.toLowerCase().includes(externalSearchTerm.toLowerCase()) ||
      usr.email.toLowerCase().includes(externalSearchTerm.toLowerCase()) ||
      usr.organization.toLowerCase().includes(externalSearchTerm.toLowerCase());
    const matchesCategory = externalCategoryFilter === "ALL" || usr.licenseCategory === externalCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const externalPageSize = 8;
  const paginatedExternalUsers = filteredExternalUsers.slice(
    (externalPage - 1) * externalPageSize,
    externalPage * externalPageSize
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search regional clients / permittees..."
            value={externalSearchTerm}
            onChange={(e) => {
              setExternalSearchTerm(e.target.value);
              setExternalPage(1);
            }}
            className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-600 dark:text-slate-400 shrink-0">Category Filter:</span>
          <select
            value={externalCategoryFilter}
            onChange={(e) => {
              setExternalCategoryFilter(e.target.value);
              setExternalPage(1);
            }}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
          >
            <option value="ALL" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">All Categories ({fullExternalUsers.length.toLocaleString()})</option>
            <option value="Public Telecommunications Entity (PTE)" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">Public Telecommunications Entity (PTE)</option>
            <option value="Cellular Mobile Telephone System (CMTS)" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">Cellular Mobile Telephone System (CMTS)</option>
            <option value="Class A Amateur Radio Permit" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">Class A Amateur Radio Permit</option>
            <option value="FM Commercial Radio Station" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">FM Commercial Radio Station</option>
            <option value="Ship Radio Station License" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">Ship Radio Station License</option>
          </select>
        </div>
      </div>

      <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-950/60 transition-colors duration-200">
        {filteredExternalUsers.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
            No regional clients match your criteria.
          </div>
        ) : (
          paginatedExternalUsers.map((user) => (
            <div key={user.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
              <div className="space-y-1">
                <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{user.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-purple-50 dark:bg-slate-900 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-slate-800 font-mono">
                    {user.organization}
                  </span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <span><Mail className="w-3 h-3 inline text-slate-400 dark:text-slate-500 mr-1" />{user.email}</span>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <span className="text-slate-700 dark:text-slate-300">{user.licenseCategory}</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right space-y-1 hidden sm:block">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {user.status}
                  </span>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">Reg: {user.registeredDate}</p>
                </div>

                <ActionMenu
                  items={[
                    {
                      label: "View License Profile",
                      icon: ExternalLink,
                      onClick: () => {
                        setSelectedExternalUser(user);
                        setIsExternalUserModalOpen(true);
                      },
                    },
                  ]}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {filteredExternalUsers.length > externalPageSize && (
        <Pagination
          currentPage={externalPage}
          totalItems={filteredExternalUsers.length}
          pageSize={externalPageSize}
          onPageChange={setExternalPage}
        />
      )}

      {/* External User Detail Profile Modal */}
      <Dialog open={isExternalUserModalOpen} onOpenChange={setIsExternalUserModalOpen}>
        <DialogContent className="sm:max-w-[480px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" /> Licensee Profile Detail
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400 text-xs">
              Verified regional permittee identity and spectrum usage authorization status.
            </DialogDescription>
          </DialogHeader>

          {selectedExternalUser !== null && (
            <div className="space-y-4 pt-2 text-sm text-slate-700 dark:text-slate-300">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500 font-semibold uppercase">Permittee Name</span>
                  <span className="text-slate-900 dark:text-white font-bold">{selectedExternalUser.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500 font-semibold uppercase">Corporate Entity</span>
                  <span className="text-slate-900 dark:text-white font-bold">{selectedExternalUser.organization}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500 font-semibold uppercase">Email Address</span>
                  <span className="text-slate-700 dark:text-slate-300 font-mono">{selectedExternalUser.email}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500 font-semibold uppercase">License Category</span>
                  <span className="text-purple-600 dark:text-purple-400 font-bold text-xs">{selectedExternalUser.licenseCategory}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500 font-semibold uppercase">Assigned Region</span>
                  <span className="text-slate-900 dark:text-white font-bold">{getRegionName(currentTenant.regionId)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500 font-semibold uppercase">Registration Date</span>
                  <span className="text-slate-900 dark:text-white font-mono">{selectedExternalUser.registeredDate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500 font-semibold uppercase">Operator Status</span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> {selectedExternalUser.status}
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" onClick={() => setIsExternalUserModalOpen(false)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white font-semibold">
              Dismiss Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
