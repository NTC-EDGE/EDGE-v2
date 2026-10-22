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
  FileText,
  Phone,
  MapPin,
  Globe,
  Receipt,
  Hash,
  Shield,
  CreditCard,
  Layers,
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
import { Tenant, Region, TenantClientDto } from "@edge/api";
import { useTenantService } from "@/services/tenantService";

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

function formatDateTimeWithMinutes(dateStringOrTimestamp: string | number | Date | null | undefined): string {
  if (!dateStringOrTimestamp) return "N/A";
  const date = new Date(dateStringOrTimestamp);
  if (isNaN(date.getTime())) return String(dateStringOrTimestamp);

  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getClientActionMeta(categoryOrService: string) {
  const lower = (categoryOrService || "").toLowerCase();
  if (lower.includes("permit")) {
    return {
      actionLabel: "View Permit Details",
      modalTitle: "Permit Application Details",
      modalDescription: "Verified regional permit filing, technical specifications, and fee assessments.",
    };
  }
  if (lower.includes("license")) {
    return {
      actionLabel: "View License Details",
      modalTitle: "License Application Details",
      modalDescription: "Verified radio station / operator license credentials and authorizations.",
    };
  }
  if (lower.includes("certificate") || lower.includes("cert")) {
    return {
      actionLabel: "View Certificate Details",
      modalTitle: "Certificate Application Details",
      modalDescription: "Official safety, registration, or operator certificate records.",
    };
  }
  if (lower.includes("registration")) {
    return {
      actionLabel: "View Registration Details",
      modalTitle: "Registration Application Details",
      modalDescription: "Regional equipment, station, or entity registration records.",
    };
  }
  return {
    actionLabel: "View Application Details",
    modalTitle: "Client Application Details",
    modalDescription: "Verified client applicant profile and associated transactions.",
  };
}

export function ExternalUsersTab({ currentTenant, getRegionName, getRegionCode }: ExternalUsersTabProps) {
  const [externalSearchTerm, setExternalSearchTerm] = useState("");
  const [externalCategoryFilter, setExternalCategoryFilter] = useState("ALL");
  const [externalPage, setExternalPage] = useState(1);
  const [externalPageSize, setExternalPageSize] = useState(10);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedClientFallback, setSelectedClientFallback] = useState<ExternalUser | null>(null);
  const [isExternalUserModalOpen, setIsExternalUserModalOpen] = useState(false);

  const { useTenantClients, useTenantClientDetails } = useTenantService();
  const { data: tenantClientsResponse, isLoading: loadingUsers, error } = useTenantClients(
    currentTenant.id,
    externalPage,
    externalPageSize,
    externalSearchTerm
  );

  const { data: clientDetails, isLoading: loadingDetails } = useTenantClientDetails(
    isExternalUserModalOpen ? currentTenant.id : null,
    selectedClientId
  );

  if (error && isForbiddenError(error)) {
    return (
      <PageForbiddenState
        title="Client Directory Access Denied"
        message="You do not have permission to view regional client accounts for this tenant."
      />
    );
  }

  if (loadingUsers && !tenantClientsResponse) {
    return (
      <div className="p-12 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-3" />
        <span className="text-xs font-semibold">Loading regional client permits...</span>
      </div>
    );
  }

  const clientsArray: TenantClientDto[] = Array.isArray(tenantClientsResponse?.data)
    ? tenantClientsResponse.data
    : Array.isArray(tenantClientsResponse)
      ? (tenantClientsResponse as unknown as TenantClientDto[])
      : [];

  const totalCount = tenantClientsResponse?.totalCount ?? clientsArray.length;

  const fullExternalUsers: ExternalUser[] = clientsArray.map((client) => ({
    id: client.id,
    name: client.name || client.email || "Client Entity",
    email: client.email,
    organization: client.organization || "Client Entity",
    licenseCategory: client.licenseCategory || "Public Telecommunications Entity (PTE)",
    status: client.status || "Under Review",
    registeredDate: client.registeredDate ? client.registeredDate.slice(0, 10) : "2026-01-15",
  }));

  const filteredExternalUsers = fullExternalUsers.filter((usr) => {
    const matchesCategory = externalCategoryFilter === "ALL" || usr.licenseCategory === externalCategoryFilter;
    return matchesCategory;
  });

  const activeModalMeta = getClientActionMeta(
    clientDetails?.serviceType || selectedClientFallback?.licenseCategory || ""
  );

  return (
    <div className="space-y-4 min-w-0">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
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
            className="w-full sm:w-auto bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
          >
            <option value="ALL" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">All Categories ({totalCount.toLocaleString()})</option>
            <option value="Public Telecommunications Entity (PTE)" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">Public Telecommunications Entity (PTE)</option>
            <option value="Cellular Mobile Telephone System (CMTS)" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">Cellular Mobile Telephone System (CMTS)</option>
            <option value="Class A Amateur Radio Permit" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">Class A Amateur Radio Permit</option>
            <option value="FM Commercial Radio Station" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">FM Commercial Radio Station</option>
            <option value="Ship Radio Station License" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">Ship Radio Station License</option>
          </select>
        </div>
      </div>

      <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-950/60 transition-colors duration-200 min-w-0">
        {filteredExternalUsers.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3 border border-purple-500/20 shadow-sm">
              <UserCheck className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">No Regional Clients Found</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
              {externalSearchTerm || externalCategoryFilter !== "ALL"
                ? "No clients match your filter criteria. Try adjusting your search query."
                : "No clients or applicants have submitted transactions in this regional office yet."}
            </p>
          </div>
        ) : (
          filteredExternalUsers.map((user) => {
            const meta = getClientActionMeta(user.licenseCategory);
            return (
              <div key={user.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors min-w-0">
                <div className="space-y-1 min-w-0">
                  <div className="text-sm font-bold text-slate-900 dark:text-white flex flex-wrap items-center gap-2 min-w-0">
                    <span className="break-words">{user.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-purple-50 dark:bg-slate-900 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-slate-800 font-mono shrink-0">
                      {user.organization}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-2 gap-y-1 min-w-0">
                    <span className="break-all"><Mail className="w-3 h-3 inline text-slate-400 dark:text-slate-500 mr-1 shrink-0" />{user.email}</span>
                    <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">•</span>
                    <span className="text-slate-700 dark:text-slate-300 break-words">{user.licenseCategory}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/60">
                  <div className="text-left sm:text-right space-y-0.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 inline-block">
                      {user.status}
                    </span>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">Reg: {user.registeredDate}</p>
                  </div>

                  <ActionMenu
                    items={[
                      {
                        label: meta.actionLabel,
                        icon: ExternalLink,
                        onClick: () => {
                          setSelectedClientId(user.id);
                          setSelectedClientFallback(user);
                          setIsExternalUserModalOpen(true);
                        },
                      },
                    ]}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {totalCount > 0 && (
        <Pagination
          currentPage={externalPage}
          totalItems={totalCount}
          pageSize={externalPageSize}
          onPageChange={setExternalPage}
          onPageSizeChange={(newSize) => {
            setExternalPageSize(newSize);
            setExternalPage(1);
          }}
        />
      )}

      {/* External User Detail Profile Modal */}
      <Dialog open={isExternalUserModalOpen} onOpenChange={setIsExternalUserModalOpen}>
        <DialogContent className="w-[calc(100vw-24px)] sm:w-full sm:max-w-[620px] max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white p-5 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" /> {activeModalMeta.modalTitle}
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400 text-xs">
              {activeModalMeta.modalDescription}
            </DialogDescription>
          </DialogHeader>

          {loadingDetails && !clientDetails ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-3" />
              <span className="text-xs font-semibold">Loading official application and record details...</span>
            </div>
          ) : (
            <div className="space-y-4 pt-2 text-sm text-slate-700 dark:text-slate-300">
              {/* Application Summary Header */}
              <div className="p-4 rounded-xl bg-purple-500/5 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/40 flex flex-col sm:flex-row justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wide">
                    {clientDetails?.serviceCode || "SERVICE CODE"}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {clientDetails?.serviceType || selectedClientFallback?.licenseCategory}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
                    <span>App #: {clientDetails?.applicationNumber || "N/A"}</span>
                    <span>•</span>
                    <span>Ref #: {clientDetails?.referenceNumber || "N/A"}</span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-1">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {clientDetails?.status || selectedClientFallback?.status || "Active"}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Mode: {clientDetails?.applicationMode || "Single"}
                  </span>
                </div>
              </div>

              {/* Applicant / Permittee Info */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-indigo-500" /> Applicant & Representative
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs pt-1">
                  <div>
                    <span className="text-slate-400 block font-semibold">Full Name</span>
                    <span className="text-slate-900 dark:text-white font-bold">{clientDetails?.name || selectedClientFallback?.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Email Address</span>
                    <span className="text-slate-800 dark:text-slate-200 font-mono break-all">{clientDetails?.email || selectedClientFallback?.email}</span>
                  </div>
                  {clientDetails?.contactNumber && (
                    <div>
                      <span className="text-slate-400 block font-semibold">Contact Number</span>
                      <span className="text-slate-800 dark:text-slate-200">{clientDetails.contactNumber}</span>
                    </div>
                  )}
                  {clientDetails?.nationality && (
                    <div>
                      <span className="text-slate-400 block font-semibold">Nationality</span>
                      <span className="text-slate-800 dark:text-slate-200">{clientDetails.nationality}</span>
                    </div>
                  )}
                  {clientDetails?.address && (
                    <div className="sm:col-span-2">
                      <span className="text-slate-400 block font-semibold">Registered Address</span>
                      <span className="text-slate-800 dark:text-slate-200">{clientDetails.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Corporate / Entity Info */}
              {(clientDetails?.organization || clientDetails?.companyRegistrationNumber) && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-purple-500" /> Corporate Entity Profile
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs pt-1">
                    <div>
                      <span className="text-slate-400 block font-semibold">Company / Entity</span>
                      <span className="text-slate-900 dark:text-white font-bold">{clientDetails.organization || selectedClientFallback?.organization}</span>
                    </div>
                    {clientDetails.companyRegistrationNumber && (
                      <div>
                        <span className="text-slate-400 block font-semibold">Registration Number</span>
                        <span className="text-slate-800 dark:text-slate-200 font-mono">{clientDetails.companyRegistrationNumber}</span>
                      </div>
                    )}
                    {clientDetails.companyEmail && (
                      <div>
                        <span className="text-slate-400 block font-semibold">Corporate Email</span>
                        <span className="text-slate-800 dark:text-slate-200 font-mono">{clientDetails.companyEmail}</span>
                      </div>
                    )}
                    {clientDetails.companyContactNumber && (
                      <div>
                        <span className="text-slate-400 block font-semibold">Corporate Phone</span>
                        <span className="text-slate-800 dark:text-slate-200">{clientDetails.companyContactNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Associated Transactions */}
              {clientDetails?.transactions && clientDetails.transactions.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Receipt className="w-3.5 h-3.5 text-teal-500" /> Financial & Assessment Records ({clientDetails.transactions.length})
                  </h5>
                  <div className="divide-y divide-slate-200 dark:divide-slate-800/80">
                    {clientDetails.transactions.map((tx) => (
                      <div key={tx.id} className="py-2 flex items-center justify-between gap-2 text-xs">
                        <div>
                          <span className="font-mono font-bold text-slate-900 dark:text-white">{tx.refNo}</span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-mono">
                            {tx.type} • {formatDateTimeWithMinutes(tx.date)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-slate-900 dark:text-white font-mono block">₱{(tx.amount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${tx.status === "Paid" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/10 text-amber-600 dark:text-amber-400"}`}>
                            {tx.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" onClick={() => setIsExternalUserModalOpen(false)} className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white font-semibold">
              Dismiss Details
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
