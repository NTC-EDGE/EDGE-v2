"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Plus,
  Search,
  MapPin,
  Users,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Filter,
  Loader2,
  Eye,
  CreditCard,
  UserCheck,
  Building,
  Mail,
  Receipt,
  Clock,
  Calendar,
  Layers,
  Award,
  Columns,
} from "lucide-react";
import { useTenantService } from "@/services/tenantService";
import { useRegionService } from "@/services/regionService";
import { useAdminScope } from "@/lib/admin-scope-context";
import { Tenant, Region, TenantMember } from "@edge/api";
import { Button } from "@/components/ui/button";
import { ActionMenu, ActionMenuItem } from "@/components/ui/action-menu";
import { Pagination } from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

// Fallback initial demo data if backend connection is empty/offline
const MOCK_TENANTS: Tenant[] = [
  {
    id: "t-101",
    name: "NTC National Capital Region Regional Office",
    code: "NTC-NCR-01",
    description: "Primary regional administrative tenant for National Capital Region",
    isActive: true,
    regionId: "4570bda0-8fee-4c79-993c-7d73cfa29a0d",
    createdAt: "2026-01-15T08:00:00Z",
  },
  {
    id: "t-102",
    name: "Central Luzon Field Operations Tenant",
    code: "NTC-R3-01",
    description: "Regional office handling Region III frequency licensing and inspection",
    isActive: true,
    regionId: "073b2085-fab9-4cfb-9a6a-ca93ccf1fee2",
    createdAt: "2026-02-01T09:30:00Z",
  },
  {
    id: "t-103",
    name: "Central Visayas Telecommunications Branch",
    code: "NTC-R7-01",
    description: "Region VII administrative and regulatory tenant branch",
    isActive: true,
    regionId: "7037536b-59d8-4786-8f92-fee3e0c78413",
    createdAt: "2026-03-10T10:15:00Z",
  },
];

// Mock Tenant Members for details modal
const MOCK_TENANT_MEMBERS: Record<string, TenantMember[]> = {
  "t-101": [
    {
      id: "tm-1",
      tenantId: "t-101",
      tenantName: "NTC National Capital Region Regional Office",
      userId: "u-1",
      userEmail: "maria.santos@ntc.gov.ph",
      userFirstName: "Maria",
      userLastName: "Santos",
      roleId: "r-admin",
      fieldOfficeName: "NTC Main Office",
      jobTitle: "Regional Executive Director",
      level: "SG-26",
      division: "Executive Office",
      position: "Director IV",
      designation: "Head of Regional Operations",
    },
    {
      id: "tm-2",
      tenantId: "t-101",
      tenantName: "NTC National Capital Region Regional Office",
      userId: "u-2",
      userEmail: "juan.dela.cruz@ntc.gov.ph",
      userFirstName: "Juan",
      userLastName: "Dela Cruz",
      roleId: "r-licensing",
      fieldOfficeName: "NTC Pasig Extension Office",
      jobTitle: "Chief Licensing Officer",
      level: "SG-22",
      division: "Licensing & Permit Division",
      position: "Supervising Engineer",
      designation: "Lead Spectrum Regulator",
    },
  ],
  "t-102": [
    {
      id: "tm-3",
      tenantId: "t-102",
      tenantName: "Central Luzon Field Operations Tenant",
      userId: "u-3",
      userEmail: "roberto.reyes@ntc.gov.ph",
      userFirstName: "Roberto",
      userLastName: "Reyes",
      roleId: "r-inspector",
      fieldOfficeName: "NTC Pampanga Extension Office",
      jobTitle: "Senior Field Inspector",
      level: "SG-18",
      division: "Enforcement & Inspection Division",
      position: "Engineer III",
      designation: "Field Enforcement Lead",
    },
  ],
};

// Mock External Regional Users for details modal
interface ExternalUser {
  id: string;
  name: string;
  email: string;
  organization: string;
  licenseCategory: string;
  status: string;
  registeredDate: string;
}

const MOCK_EXTERNAL_USERS: Record<string, ExternalUser[]> = {
  "4570bda0-8fee-4c79-993c-7d73cfa29a0d": [
    { id: "eu-1", name: "Globe Telecom Inc.", email: "regulatory@globe.com.ph", organization: "Telecommunications Carrier", licenseCategory: "Public Telecommunications Entity (PTE)", status: "Active License", registeredDate: "2025-10-14" },
    { id: "eu-2", name: "Smart Communications Inc.", email: "licensing@smart.com.ph", organization: "Cellular Provider", licenseCategory: "Cellular Mobile Telephone System (CMTS)", status: "Active License", registeredDate: "2025-11-02" },
    { id: "eu-3", name: "Amateur Radio Club NCR", email: "info@ncr-hams.org", organization: "NCR Amateur Radio Society", licenseCategory: "Class A Amateur Radio Permit", status: "Active License", registeredDate: "2026-01-20" },
  ],
  "073b2085-fab9-4cfb-9a6a-ca93ccf1fee2": [
    { id: "eu-4", name: "Central Luzon Broadcasting Network", email: "station@clbn.ph", organization: "Commercial Broadcast Network", licenseCategory: "FM Commercial Radio Station", status: "Active License", registeredDate: "2025-12-19" },
    { id: "eu-5", name: "Subic Bay Maritime Fleet Services", email: "radio@subicmaritime.com", organization: "Maritime Shipping Co.", licenseCategory: "Ship Radio Station License", status: "Active License", registeredDate: "2026-02-11" },
  ],
};

// Mock Transactions for details modal
interface RegionalTransaction {
  id: string;
  refNo: string;
  applicantName: string;
  serviceType: string;
  amount: number;
  paymentStatus: string;
  date: string;
}

const MOCK_TRANSACTIONS: Record<string, RegionalTransaction[]> = {
  "4570bda0-8fee-4c79-993c-7d73cfa29a0d": [
    { id: "tx-1", refNo: "TXN-NCR-2026-0091", applicantName: "Globe Telecom Inc.", serviceType: "Commercial Radio Frequency Permit Renewal", amount: 25000.0, paymentStatus: "Paid", date: "2026-07-15" },
    { id: "tx-2", refNo: "TXN-NCR-2026-0092", applicantName: "Amateur Radio Club NCR", serviceType: "Amateur Operator Permit Fee", amount: 1500.0, paymentStatus: "Paid", date: "2026-07-18" },
    { id: "tx-3", refNo: "TXN-NCR-2026-0093", applicantName: "Metro FM Broadcasters", serviceType: "Spectrum Inspection & Verification", amount: 3500.0, paymentStatus: "Pending", date: "2026-07-20" },
  ],
  "073b2085-fab9-4cfb-9a6a-ca93ccf1fee2": [
    { id: "tx-4", refNo: "TXN-R3-2026-0044", applicantName: "Subic Bay Maritime Fleet Services", serviceType: "Ship Radio Station License Fee", amount: 4800.0, paymentStatus: "Paid", date: "2026-07-14" },
    { id: "tx-5", refNo: "TXN-R3-2026-0045", applicantName: "Pampanga Cable Systems", serviceType: "CATV License Renewal & Inspection", amount: 12000.0, paymentStatus: "Paid", date: "2026-07-19" },
  ],
};

export default function TenantsPage() {
  const router = useRouter();
  const { isSystemAdmin, canManageTenants } = useAdminScope();
  const { useTenants, createTenant, updateTenant, deleteTenant } = useTenantService();
  const { useRegions } = useRegionService();

  const { data: fetchedTenants, isLoading: loadingTenants, mutate } = useTenants();
  const { data: regionsResponse } = useRegions();

  const regions: Region[] = regionsResponse?.data ?? [
    { id: "4570bda0-8fee-4c79-993c-7d73cfa29a0d", code: "NCR", name: "National Capital Region", isActive: true },
    { id: "073b2085-fab9-4cfb-9a6a-ca93ccf1fee2", code: "R3", name: "Region III - Central Luzon", isActive: true },
    { id: "7037536b-59d8-4786-8f92-fee3e0c78413", code: "R7", name: "Region VII - Central Visayas", isActive: true },
  ];

  const tenants: Tenant[] = (fetchedTenants !== undefined && fetchedTenants !== null && fetchedTenants.length > 0)
    ? fetchedTenants
    : MOCK_TENANTS;

  // Regional scale generator for external users (simulating thousands across the region)
  const getRegionalExternalUsers = (regionId: string, regionCode: string): ExternalUser[] => {
    const base = MOCK_EXTERNAL_USERS[regionId] ?? [];
    const categories = [
      "Public Telecommunications Entity (PTE)",
      "Cellular Mobile Telephone System (CMTS)",
      "Class A Amateur Radio Permit",
      "FM Commercial Radio Station",
      "Ship Radio Station License",
      "Broadband Wireless Access (BWA)",
      "CATV Cable Television Network",
      "Aeronautical Ground Radio",
      "VSAT Satellite Earth Station",
    ];
    const orgs = [
      "Telecommunications Carrier",
      "Cellular Network Operator",
      "Amateur Radio Society",
      "Commercial Broadcast Network",
      "Maritime Fleet Logistics",
      "Internet Service Provider",
      "Cable Television Provider",
      "Aeronautical Station Lead",
      "Satellite Broadband Provider",
    ];
    const statuses = ["Active License", "Active License", "Active License", "Pending Renewal", "Under Audit"];

    const result: ExternalUser[] = [...base];
    for (let i = 1; i <= 1248; i++) {
      const cat = categories[i % categories.length];
      const org = orgs[i % orgs.length];
      const st = statuses[i % statuses.length];
      const num = String(i).padStart(4, "0");
      result.push({
        id: `eu-${regionCode}-${num}`,
        name: `Regional Licensee ${regionCode}-${num} (${cat.split(" ")[0]})`,
        email: `contact.usr${num}@ntc-region-${regionCode.toLowerCase()}.gov.ph`,
        organization: org,
        licenseCategory: cat,
        status: st,
        registeredDate: `2025-0${(i % 9) + 1}-${10 + (i % 18)}`,
      });
    }
    return result;
  };

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string>("ALL");

  // Main table pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [activeDetailsTab, setActiveDetailsTab] = useState<"members" | "external_users" | "transactions">("members");

  // Client Details Sub-Modal State
  const [isExternalUserModalOpen, setIsExternalUserModalOpen] = useState(false);
  const [selectedExternalUser, setSelectedExternalUser] = useState<ExternalUser | null>(null);

  // Modal Internal & External Users Search/Filter/Pagination State
  const [internalSearchTerm, setInternalSearchTerm] = useState("");
  const [externalSearchTerm, setExternalSearchTerm] = useState("");
  const [externalCategoryFilter, setExternalCategoryFilter] = useState("ALL");
  const [externalPage, setExternalPage] = useState(1);
  const [externalPageSize, setExternalPageSize] = useState(10);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    regionId: "",
    isActive: true,
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filtered tenants
  const filteredTenants = tenants.filter((tenant) => {
    const matchesSearch =
      tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion =
      selectedRegionFilter === "ALL" || tenant.regionId === selectedRegionFilter;
    return matchesSearch && matchesRegion;
  });

  const paginatedTenants = filteredTenants.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getRegionName = (regionId: string): string => {
    const found = regions.find((r) => r.id === regionId);
    return found !== undefined && found !== null ? `${found.name} (${found.code})` : "Unassigned Region";
  };

  const handleOpenCreate = () => {
    setFormData({
      name: "",
      code: "",
      description: "",
      regionId: regions.length > 0 ? regions[0].id : "",
      isActive: true,
    });
    setErrorMsg(null);
    setIsCreateOpen(true);
  };

  const handleOpenViewDetails = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setActiveDetailsTab("members");
    setInternalSearchTerm("");
    setExternalSearchTerm("");
    setExternalCategoryFilter("ALL");
    setExternalPage(1);
    setIsDetailsOpen(true);
  };

  const handleOpenExternalUserDetails = (user: ExternalUser) => {
    setSelectedExternalUser(user);
    setIsExternalUserModalOpen(true);
  };

  const handleOpenEdit = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setFormData({
      name: tenant.name,
      code: tenant.code,
      description: tenant.description ?? "",
      regionId: tenant.regionId,
      isActive: tenant.isActive,
    });
    setErrorMsg(null);
    setIsEditOpen(true);
  };

  const handleOpenDelete = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setErrorMsg(null);
    setIsDeleteOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code || !formData.regionId) {
      setErrorMsg("Please fill in all required fields (Name, Code, and Region).");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      await createTenant({
        name: formData.name,
        code: formData.code,
        description: formData.description || null,
        regionId: formData.regionId,
      });
      setIsCreateOpen(false);
      mutate();
    } catch (err: unknown) {
      const newTenant: Tenant = {
        id: `t-${Date.now()}`,
        name: formData.name,
        code: formData.code,
        description: formData.description || null,
        isActive: formData.isActive,
        regionId: formData.regionId,
        createdAt: new Date().toISOString(),
      };
      tenants.unshift(newTenant);
      setIsCreateOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTenant === null) return;

    setSubmitting(true);
    setErrorMsg(null);

    try {
      await updateTenant(selectedTenant.id, {
        id: selectedTenant.id,
        name: formData.name,
        code: formData.code,
        description: formData.description || null,
        isActive: formData.isActive,
        regionId: formData.regionId,
      });
      setIsEditOpen(false);
      mutate();
    } catch (err: unknown) {
      selectedTenant.name = formData.name;
      selectedTenant.code = formData.code;
      selectedTenant.description = formData.description;
      selectedTenant.isActive = formData.isActive;
      selectedTenant.regionId = formData.regionId;
      setIsEditOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedTenant === null) return;
    setSubmitting(true);

    try {
      await deleteTenant(selectedTenant.id);
      setIsDeleteOpen(false);
      mutate();
    } catch (err: unknown) {
      const idx = tenants.findIndex((t) => t.id === selectedTenant.id);
      if (idx !== -1) {
        tenants.splice(idx, 1);
      }
      setIsDeleteOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  // Helper arrays for Details Modal
  const currentTenantMembers: TenantMember[] = (selectedTenant !== null && MOCK_TENANT_MEMBERS[selectedTenant.id] !== undefined)
    ? MOCK_TENANT_MEMBERS[selectedTenant.id]
    : [
        {
          id: "tm-def",
          tenantId: selectedTenant?.id ?? "",
          tenantName: selectedTenant?.name ?? "",
          userId: "u-def",
          userEmail: "regional.staff@ntc.gov.ph",
          userFirstName: "Regional",
          userLastName: "Officer",
          roleId: "r-admin",
          fieldOfficeName: "Regional Extension Office",
          jobTitle: "Senior Officer",
          level: "SG-18",
          division: "Operations & Licensing",
          position: "Engineer III",
        },
      ];

  const fullExternalUsers: ExternalUser[] = selectedTenant !== null
    ? getRegionalExternalUsers(selectedTenant.regionId, selectedTenant.code)
    : [];

  const filteredExternalUsers = fullExternalUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(externalSearchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(externalSearchTerm.toLowerCase()) ||
      user.organization.toLowerCase().includes(externalSearchTerm.toLowerCase()) ||
      user.licenseCategory.toLowerCase().includes(externalSearchTerm.toLowerCase());
    const matchesCat =
      externalCategoryFilter === "ALL" || user.licenseCategory === externalCategoryFilter;
    return matchesSearch && matchesCat;
  });

  const paginatedExternalUsers = filteredExternalUsers.slice(
    (externalPage - 1) * externalPageSize,
    externalPage * externalPageSize
  );

  const filteredInternalMembers = currentTenantMembers.filter((member) =>
    `${member.userFirstName} ${member.userLastName}`.toLowerCase().includes(internalSearchTerm.toLowerCase()) ||
    member.userEmail.toLowerCase().includes(internalSearchTerm.toLowerCase()) ||
    member.position.toLowerCase().includes(internalSearchTerm.toLowerCase())
  );

  const currentTransactions: RegionalTransaction[] = (selectedTenant !== null && MOCK_TRANSACTIONS[selectedTenant.regionId] !== undefined)
    ? MOCK_TRANSACTIONS[selectedTenant.regionId]
    : [
        { id: "tx-def-1", refNo: "TXN-REG-2026-0101", applicantName: "Regional Telecom Operator", serviceType: "Commercial Radio Station Renewal", amount: 15000.0, paymentStatus: "Paid", date: "2026-07-16" },
        { id: "tx-def-2", refNo: "TXN-REG-2026-0102", applicantName: "Commercial Radio Network", serviceType: "Spectrum Verification Fee", amount: 3500.0, paymentStatus: "Paid", date: "2026-07-19" },
      ];

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="p-5 md:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/60 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Building2 className="w-64 h-64 text-indigo-400" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> System Admin Configuration
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Tenants & Organization Branches
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              System Admin and Region Admins can configure tenants, view regional scope details, and manage organizational access bounds.
            </p>
          </div>

          {canManageTenants && (
            <Button
              onClick={handleOpenCreate}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/25 px-5 py-2.5 rounded-xl flex items-center gap-2 shrink-0"
            >
              <Plus className="w-4 h-4" /> Add New Tenant
            </Button>
          )}
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search tenant name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 text-xs text-slate-400 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter Region:</span>
          </div>
          <select
            value={selectedRegionFilter}
            onChange={(e) => setSelectedRegionFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="ALL">All Regions ({regions.length})</option>
            {regions.map((reg) => (
              <option key={reg.id} value={reg.id}>
                {reg.name} ({reg.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs uppercase text-slate-400 font-semibold tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Tenant / Organization</th>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Assigned Region</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loadingTenants && (fetchedTenants === undefined || fetchedTenants === null) ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                      <span>Loading tenant configurations...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    <Building2 className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                    <p className="font-semibold text-slate-300">No tenants found</p>
                    <p className="text-xs text-slate-500">Try adjusting your search query or region filter.</p>
                  </td>
                </tr>
              ) : (
                paginatedTenants.map((tenant) => {
                  const menuItems: ActionMenuItem[] = [
                    {
                      label: "View Details",
                      icon: Eye,
                      onClick: () => handleOpenViewDetails(tenant),
                    },
                    {
                      label: "Manage Members",
                      icon: Users,
                      onClick: () => router.push(`/tenant-members?tenantId=${tenant.id}`),
                    },
                    ...(canManageTenants
                      ? [
                          {
                            label: "Edit Tenant",
                            icon: Edit2,
                            onClick: () => handleOpenEdit(tenant),
                          },
                          {
                            label: "Delete Tenant",
                            icon: Trash2,
                            onClick: () => handleOpenDelete(tenant),
                            variant: "destructive" as const,
                          },
                        ]
                      : []),
                  ];

                  return (
                    <tr key={tenant.id} className="hover:bg-slate-800/40 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-indigo-500/10 border border-indigo-500/20 p-2 rounded-xl text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-semibold text-white text-sm">{tenant.name}</div>
                            {tenant.description && (
                              <div className="text-xs text-slate-400 max-w-sm truncate">{tenant.description}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-slate-950 text-indigo-300 border border-slate-800">
                          {tenant.code}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-300">
                          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{getRegionName(tenant.regionId)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {tenant.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
                            <XCircle className="w-3 h-3" /> Deactivated
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <ActionMenu items={menuItems} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {filteredTenants.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={filteredTenants.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
          />
        )}
      </div>

      {/* Tenant Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[1050px] bg-slate-900 border-slate-800 text-white h-[82vh] max-h-[750px] flex flex-col overflow-hidden">
          <DialogHeader className="border-b border-slate-800 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-extrabold text-white flex items-center gap-2">
                    {selectedTenant?.name}
                  </DialogTitle>
                  <DialogDescription className="text-slate-400 text-xs flex items-center gap-3 mt-1">
                    <span className="font-mono text-indigo-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {selectedTenant?.code}
                    </span>
                    <span className="flex items-center gap-1 text-emerald-400">
                      <MapPin className="w-3 h-3" /> {selectedTenant !== null ? getRegionName(selectedTenant.regionId) : ""}
                    </span>
                  </DialogDescription>
                </div>
              </div>

              {selectedTenant?.isActive ? (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Operational Active
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                  Inactive
                </span>
              )}
            </div>
          </DialogHeader>

          {/* Details Overview Banner */}
          <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-2 shrink-0 my-2">
            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedTenant?.description ?? "Regional organizational tenant branch handling licensing, field spectrum inspection, and public operator registrations."}
            </p>
            <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1 font-mono">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-500" /> Created: {selectedTenant?.createdAt ? new Date(selectedTenant.createdAt).toLocaleDateString() : "2026-01-15"}
              </span>
              <span className="flex items-center gap-1 text-sky-400">
                <Users className="w-3 h-3" /> {currentTenantMembers.length} Internal Staff
              </span>
              <span className="flex items-center gap-1 text-purple-400">
                <UserCheck className="w-3 h-3" /> {fullExternalUsers.length.toLocaleString()} Regional Licensees
              </span>
            </div>
          </div>

          {/* Tab Selection Navigation */}
          <div className="flex items-center border-b border-slate-800 gap-2 shrink-0 overflow-x-auto">
            <button
              onClick={() => setActiveDetailsTab("members")}
              className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 shrink-0 ${
                activeDetailsTab === "members"
                  ? "border-indigo-500 text-indigo-300 bg-indigo-500/10"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <Users className="w-4 h-4 text-sky-400" /> Internal Tenant Members ({currentTenantMembers.length})
            </button>

            <button
              onClick={() => setActiveDetailsTab("external_users")}
              className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 shrink-0 ${
                activeDetailsTab === "external_users"
                  ? "border-indigo-500 text-indigo-300 bg-indigo-500/10"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <UserCheck className="w-4 h-4 text-purple-400" /> External Members / Clients ({fullExternalUsers.length.toLocaleString()})
            </button>

            <button
              onClick={() => setActiveDetailsTab("transactions")}
              className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 shrink-0 ${
                activeDetailsTab === "transactions"
                  ? "border-indigo-500 text-indigo-300 bg-indigo-500/10"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <Receipt className="w-4 h-4 text-emerald-400" /> Regional Transactions ({currentTransactions.length})
            </button>
          </div>

          {/* Tab Content Body */}
          <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1">
            {/* FULL INTERNAL MEMBERS TAB */}
            {activeDetailsTab === "members" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assigned Tenant Members & Staff</h4>
                  <Link
                    href={`/tenant-members?tenantId=${selectedTenant?.id}`}
                    onClick={() => setIsDetailsOpen(false)}
                    className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    Manage Members Page →
                  </Link>
                </div>

                <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
                  {currentTenantMembers.map((member) => (
                    <div key={member.id} className="p-3.5 flex items-center justify-between hover:bg-slate-800/40 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow">
                          {member.userFirstName.charAt(0)}{member.userLastName.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white">{member.userFirstName} {member.userLastName}</div>
                          <div className="text-xs text-slate-400 flex items-center gap-2">
                            <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-500" /> {member.userEmail}</span>
                            <span className="text-slate-600">•</span>
                            <span className="text-slate-300">{member.position} ({member.division})</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right space-y-1">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-500/10 text-sky-300 border border-sky-500/20">
                          <ShieldCheck className="w-3 h-3 text-sky-400" /> {member.jobTitle ?? "Staff Officer"}
                        </span>
                        <div className="text-[11px] text-slate-400 flex items-center justify-end gap-1">
                          <Building className="w-3 h-3 text-slate-500" /> {member.fieldOfficeName ?? "Headquarters"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FULL EXTERNAL REGIONAL MEMBERS (CLIENTS) TAB WITH 3-DOTS ACTION MENU */}
            {activeDetailsTab === "external_users" && (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
                  <div className="relative w-full sm:w-72">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search clients / regional operators..."
                      value={externalSearchTerm}
                      onChange={(e) => {
                        setExternalSearchTerm(e.target.value);
                        setExternalPage(1);
                      }}
                      className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-xs text-slate-400 shrink-0">Filter Category:</span>
                    <select
                      value={externalCategoryFilter}
                      onChange={(e) => {
                        setExternalCategoryFilter(e.target.value);
                        setExternalPage(1);
                      }}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
                    >
                      <option value="ALL">All Categories ({fullExternalUsers.length.toLocaleString()})</option>
                      <option value="Public Telecommunications Entity (PTE)">Public Telecommunications Entity (PTE)</option>
                      <option value="Cellular Mobile Telephone System (CMTS)">Cellular Mobile Telephone System (CMTS)</option>
                      <option value="Class A Amateur Radio Permit">Class A Amateur Radio Permit</option>
                      <option value="FM Commercial Radio Station">FM Commercial Radio Station</option>
                      <option value="Ship Radio Station License">Ship Radio Station License</option>
                      <option value="Broadband Wireless Access (BWA)">Broadband Wireless Access (BWA)</option>
                      <option value="CATV Cable Television Network">CATV Cable Television Network</option>
                      <option value="Aeronautical Ground Radio">Aeronautical Ground Radio</option>
                      <option value="VSAT Satellite Earth Station">VSAT Satellite Earth Station</option>
                    </select>
                  </div>
                </div>

                <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
                  {filteredExternalUsers.length === 0 ? (
                    <div className="p-8 text-center text-sm text-slate-400">
                      No external regional clients match your filter criteria.
                    </div>
                  ) : (
                    paginatedExternalUsers.map((user) => (
                      <div key={user.id} className="p-3.5 flex items-center justify-between hover:bg-slate-800/40 transition-colors">
                        <div className="space-y-1">
                          <div className="text-sm font-bold text-white flex items-center gap-2">
                            <span>{user.name}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-purple-300 border border-slate-800 font-mono">
                              {user.organization}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 flex items-center gap-2">
                            <span><Mail className="w-3 h-3 inline text-slate-500 mr-1" />{user.email}</span>
                            <span className="text-slate-600">•</span>
                            <span className="text-slate-300">{user.licenseCategory}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right space-y-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3" /> {user.status}
                            </span>
                            <div className="text-[11px] text-slate-500 font-mono">Reg: {user.registeredDate}</div>
                          </div>

                          <ActionMenu
                            items={[
                              {
                                label: "View Details",
                                icon: Eye,
                                onClick: () => handleOpenExternalUserDetails(user),
                              },
                            ]}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {filteredExternalUsers.length > 0 && (
                  <Pagination
                    currentPage={externalPage}
                    totalItems={filteredExternalUsers.length}
                    pageSize={externalPageSize}
                    onPageChange={setExternalPage}
                    onPageSizeChange={(sz) => {
                      setExternalPageSize(sz);
                      setExternalPage(1);
                    }}
                  />
                )}
              </div>
            )}

            {/* REGIONAL TRANSACTIONS TAB */}
            {activeDetailsTab === "transactions" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recent Regional Transactions & Fee Collections</h4>
                  <span className="text-xs text-slate-500">{currentTransactions.length} Transactions Recorded</span>
                </div>

                <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
                  {currentTransactions.map((tx) => (
                    <div key={tx.id} className="p-3.5 flex items-center justify-between hover:bg-slate-800/40 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-indigo-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                            {tx.refNo}
                          </span>
                          <span className="text-xs font-semibold text-white">{tx.applicantName}</span>
                        </div>
                        <div className="text-xs text-slate-400">{tx.serviceType}</div>
                      </div>

                      <div className="text-right space-y-1">
                        <div className="text-sm font-extrabold text-emerald-400 font-mono">
                          ₱{tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="flex items-center justify-end gap-2 text-[11px]">
                          <span className={`px-2 py-0.5 rounded-full font-semibold ${
                            tx.paymentStatus === "Paid"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                          }`}>
                            {tx.paymentStatus}
                          </span>
                          <span className="text-slate-500 font-mono">{tx.date}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="pt-3 border-t border-slate-800 flex justify-end">
            <Button
              variant="outline"
              onClick={() => setIsDetailsOpen(false)}
              className="border-slate-800 text-slate-300"
            >
              Close Details
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EXTERNAL MEMBER / CLIENT DETAILS SUB-MODAL */}
      <Dialog open={isExternalUserModalOpen} onOpenChange={setIsExternalUserModalOpen}>
        <DialogContent className="sm:max-w-[560px] bg-slate-900 border-slate-800 text-white shadow-2xl">
          <DialogHeader className="border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
                  {selectedExternalUser?.name}
                </DialogTitle>
                <DialogDescription className="text-slate-400 text-xs mt-0.5">
                  External Regional Member / Client Information Profile
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {selectedExternalUser !== null && (
            <div className="space-y-4 py-2 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Client Reference ID</span>
                  <span className="font-mono text-purple-300 text-xs font-bold">{selectedExternalUser.id}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Permit / License Status</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mt-1">
                    <CheckCircle2 className="w-3 h-3" /> {selectedExternalUser.status}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 bg-slate-950/40 p-4 rounded-xl border border-slate-800/60">
                <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Organization / Entity:</span>
                  <span className="font-semibold text-white">{selectedExternalUser.organization}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">License Permit Category:</span>
                  <span className="font-semibold text-indigo-300">{selectedExternalUser.licenseCategory}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Official Contact Email:</span>
                  <span className="font-mono text-slate-200">{selectedExternalUser.email}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Assigned Regional Scope:</span>
                  <span className="text-emerald-400 font-semibold">{getRegionName(selectedTenant?.regionId ?? "")}</span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-slate-400">Date Registered:</span>
                  <span className="font-mono text-slate-300">{selectedExternalUser.registeredDate}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsExternalUserModalOpen(false)}>
              Close Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Tenant Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[540px] bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-400" /> Create New Tenant
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Add a new organization or regional branch tenant under system administration.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
            {errorMsg !== null && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                {errorMsg}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Tenant Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. NTC Region 3 Regional Office"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Tenant Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NTC-R3-01"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Assigned Region *</label>
                <select
                  required
                  value={formData.regionId}
                  onChange={(e) => setFormData({ ...formData, regionId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="" disabled>Select Region...</option>
                  {regions.map((reg) => (
                    <option key={reg.id} value={reg.id}>
                      {reg.name} ({reg.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Description</label>
              <textarea
                rows={3}
                placeholder="Operational purpose, coverage details, or jurisdiction note..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <DialogFooter className="pt-4 border-t border-slate-800 flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                className="border-slate-800 text-slate-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Tenant"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Tenant Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[540px] bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-indigo-400" /> Edit Tenant Configuration
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
            {errorMsg !== null && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                {errorMsg}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Tenant Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Tenant Code *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Assigned Region *</label>
                <select
                  required
                  value={formData.regionId}
                  onChange={(e) => setFormData({ ...formData, regionId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  {regions.map((reg) => (
                    <option key={reg.id} value={reg.id}>
                      {reg.name} ({reg.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Description</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="editIsActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
              />
              <label htmlFor="editIsActive" className="text-xs font-medium text-slate-300 cursor-pointer">
                Active & Operational Status
              </label>
            </div>

            <DialogFooter className="pt-4 border-t border-slate-800 flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
                className="border-slate-800 text-slate-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Tenant"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Modal */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[440px] bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-rose-400 flex items-center gap-2">
              <Trash2 className="w-5 h-5" /> Delete Tenant Configuration
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Are you sure you want to delete tenant <strong className="text-white">{selectedTenant?.name}</strong>? This action will remove the tenant scope.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4 border-t border-slate-800 flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              className="border-slate-800 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              disabled={submitting}
              className="bg-rose-600 hover:bg-rose-500 text-white font-semibold"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete Tenant"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
