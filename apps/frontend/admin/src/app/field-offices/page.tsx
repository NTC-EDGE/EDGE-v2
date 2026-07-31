"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Building,
  Plus,
  Search,
  MapPin,
  Users,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Filter,
  Loader2,
  Phone,
  Mail,
  UserCheck,
  ShieldCheck,
  Radio,
  FileCheck,
  MessageSquare,
  ArrowRight,
  Sliders
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useFieldOfficeService } from "@/services/fieldOfficeService";
import { useRegionService } from "@/services/regionService";
import { useProvinceService } from "@/services/provinceService";
import { useTenantMemberService } from "@/services/tenantMemberService";
import { useTenantService } from "@/services/tenantService";
import { useAdminScope } from "@/lib/admin-scope-context";
import { FieldOffice, Region, Province, TenantMember } from "@edge/api";
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

// Mock Fallback Field Offices for demo & immediate rendering
const MOCK_FIELD_OFFICES: FieldOffice[] = [
  {
    id: "fo-1",
    tenantId: "t-101",
    name: "NTC Pampanga Extension Office",
    code: "NTC-FO-PAM",
    description: "Extension office serving Pampanga, Bataan, and Tarlac spectrum inspection and amateur licensing.",
    regionId: "073b2085-fab9-4cfb-9a6a-ca93ccf1fee2",
    regionName: "Region III - Central Luzon",
    provinceId: "p-pam",
    provinceName: "Pampanga",
    address: "Government Center, Maimpis, City of San Fernando, Pampanga",
    contactPhone: "+63 (045) 455-2144",
    contactEmail: "fo.pampanga@ntc.gov.ph",
    officerInChargeId: "m-101",
    officerInChargeName: "Engr. Manuel L. Santos",
    officerInChargeEmail: "manuel.santos@ntc.gov.ph",
    isActive: true,
    allowSpectrumInspection: true,
    allowPermitIssuance: true,
    allowComplaintReception: true,
    assignedMemberCount: 5,
    createdAt: "2026-01-10T08:00:00Z",
  },
  {
    id: "fo-2",
    tenantId: "t-101",
    name: "NTC Bulacan Field Sub-Office",
    code: "NTC-FO-BUL",
    description: "Local field office handling frequency monitoring and public complaint reception for Bulacan province.",
    regionId: "073b2085-fab9-4cfb-9a6a-ca93ccf1fee2",
    regionName: "Region III - Central Luzon",
    provinceId: "p-bul",
    provinceName: "Bulacan",
    address: "Capitol Compound, City of Malolos, Bulacan",
    contactPhone: "+63 (044) 791-0022",
    contactEmail: "fo.bulacan@ntc.gov.ph",
    officerInChargeId: "m-102",
    officerInChargeName: "Engr. Teresa M. Ramos",
    officerInChargeEmail: "teresa.ramos@ntc.gov.ph",
    isActive: true,
    allowSpectrumInspection: true,
    allowPermitIssuance: false,
    allowComplaintReception: true,
    assignedMemberCount: 3,
    createdAt: "2026-02-15T09:30:00Z",
  },
  {
    id: "fo-3",
    tenantId: "t-102",
    name: "NTC Cebu Extension Office",
    code: "NTC-FO-CEB",
    description: "Primary regional extension office for Central Visayas field spectrum audits and maritime radio licensing.",
    regionId: "7037536b-59d8-4786-8f92-fee3e0c78413",
    regionName: "Region VII - Central Visayas",
    provinceId: "p-ceb",
    provinceName: "Cebu",
    address: "Subangdaku, Mandaue City, Cebu",
    contactPhone: "+63 (032) 346-0123",
    contactEmail: "fo.cebu@ntc.gov.ph",
    officerInChargeId: "m-103",
    officerInChargeName: "Engr. Gabriel S. Mendoza",
    officerInChargeEmail: "gabriel.mendoza@ntc.gov.ph",
    isActive: true,
    allowSpectrumInspection: true,
    allowPermitIssuance: true,
    allowComplaintReception: true,
    assignedMemberCount: 6,
    createdAt: "2026-03-01T10:15:00Z",
  },
];

function FieldOfficesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRegionId = searchParams.get("regionId");

  const { isRegionAdmin, canManageTenants, selectedTenantId } = useAdminScope();
  const { useFieldOffices, createFieldOffice, updateFieldOffice, deleteFieldOffice } = useFieldOfficeService();
  const { useRegions } = useRegionService();
  const { useProvinces } = useProvinceService();
  const { useTenantMembers } = useTenantMemberService();
  const { useTenants } = useTenantService();

  const { data: regionsResponse } = useRegions();
  const { data: provincesResponse } = useProvinces();
  const { data: tenantsResponse } = useTenants();

  const [selectedTenantFilter, setSelectedTenantFilter] = useState<string>("");
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string>(
    initialRegionId !== null && initialRegionId.length > 0 ? initialRegionId : "ALL"
  );
  const [searchTerm, setSearchTerm] = useState("");

  const tenantsList = Array.isArray(tenantsResponse) ? tenantsResponse : tenantsResponse?.data ?? [];
  const activeTenantId = selectedTenantFilter || selectedTenantId || tenantsList[0]?.id || "";

  const { data: fetchedFieldOfficesResponse, isLoading: loadingFieldOffices, mutate } = useFieldOffices(
    activeTenantId,
    selectedRegionFilter !== "ALL" ? selectedRegionFilter : null
  );

  const { data: membersResponse } = useTenantMembers(activeTenantId);
  const tenantMembers: TenantMember[] = membersResponse ?? [];

  const regions: Region[] = regionsResponse?.data ?? [
    { id: "4570bda0-8fee-4c79-993c-7d73cfa29a0d", code: "NCR", name: "National Capital Region", isActive: true },
    { id: "073b2085-fab9-4cfb-9a6a-ca93ccf1fee2", code: "R3", name: "Region III - Central Luzon", isActive: true },
    { id: "7037536b-59d8-4786-8f92-fee3e0c78413", code: "R7", name: "Region VII - Central Visayas", isActive: true },
  ];

  const provinces: Province[] = provincesResponse?.data ?? [
    { id: "p-pam", regionId: "073b2085-fab9-4cfb-9a6a-ca93ccf1fee2", code: "PAM", name: "Pampanga", isActive: true },
    { id: "p-bul", regionId: "073b2085-fab9-4cfb-9a6a-ca93ccf1fee2", code: "BUL", name: "Bulacan", isActive: true },
    { id: "p-ceb", regionId: "7037536b-59d8-4786-8f92-fee3e0c78413", code: "CEB", name: "Cebu", isActive: true },
  ];

  const fieldOffices: FieldOffice[] = fetchedFieldOfficesResponse ?? [];

  // Filtered list
  const filteredOffices = fieldOffices.filter((fo) => {
    const matchesSearch =
      fo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fo.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (fo.officerInChargeName?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    const matchesRegion = selectedRegionFilter === "ALL" || fo.regionId === selectedRegionFilter;
    return matchesSearch && matchesRegion;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const paginatedOffices = filteredOffices.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedOffice, setSelectedOffice] = useState<FieldOffice | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    regionId: regions.length > 0 ? regions[0].id : "",
    provinceId: "",
    address: "",
    contactPhone: "",
    contactEmail: "",
    officerInChargeId: "",
    isActive: true,
    allowSpectrumInspection: true,
    allowPermitIssuance: true,
    allowComplaintReception: true,
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const getRegionName = (regionId: string): string => {
    const found = regions.find((r) => r.id === regionId);
    return found !== undefined && found !== null ? `${found.name} (${found.code})` : "Region";
  };

  const handleOpenCreate = () => {
    setFormData({
      name: "",
      code: "",
      description: "",
      regionId: selectedRegionFilter !== "ALL" ? selectedRegionFilter : (regions.length > 0 ? regions[0].id : ""),
      provinceId: "",
      address: "",
      contactPhone: "+63 (02) ",
      contactEmail: "field.office@ntc.gov.ph",
      officerInChargeId: tenantMembers.length > 0 ? tenantMembers[0].id : "",
      isActive: true,
      allowSpectrumInspection: true,
      allowPermitIssuance: true,
      allowComplaintReception: true,
    });
    setErrorMsg(null);
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (office: FieldOffice) => {
    setSelectedOffice(office);
    setFormData({
      name: office.name,
      code: office.code,
      description: office.description ?? "",
      regionId: office.regionId,
      provinceId: office.provinceId ?? "",
      address: office.address,
      contactPhone: office.contactPhone,
      contactEmail: office.contactEmail,
      officerInChargeId: office.officerInChargeId,
      isActive: office.isActive,
      allowSpectrumInspection: office.allowSpectrumInspection,
      allowPermitIssuance: office.allowPermitIssuance,
      allowComplaintReception: office.allowComplaintReception,
    });
    setErrorMsg(null);
    setIsEditOpen(true);
  };

  const handleOpenDelete = (office: FieldOffice) => {
    setSelectedOffice(office);
    setErrorMsg(null);
    setIsDeleteOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code || !formData.regionId || !formData.officerInChargeId) {
      setErrorMsg("Please fill in required fields (Name, Code, Region, Officer in Charge).");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      await createFieldOffice({
        tenantId: activeTenantId,
        name: formData.name,
        code: formData.code,
        description: formData.description || null,
        regionId: formData.regionId,
        provinceId: formData.provinceId || null,
        address: formData.address,
        contactPhone: formData.contactPhone,
        contactEmail: formData.contactEmail,
        officerInChargeId: formData.officerInChargeId,
        allowSpectrumInspection: formData.allowSpectrumInspection,
        allowPermitIssuance: formData.allowPermitIssuance,
        allowComplaintReception: formData.allowComplaintReception,
      });
      setIsCreateOpen(false);
      mutate();
    } catch (err: unknown) {
      // Local demo fallback
      const provObj = provinces.find((p) => p.id === formData.provinceId);
      const regObj = regions.find((r) => r.id === formData.regionId);
      const selectedMemberObj = tenantMembers.find((m) => m.id === formData.officerInChargeId);
      const newOffice: FieldOffice = {
        id: `fo-${Date.now()}`,
        tenantId: activeTenantId,
        name: formData.name,
        code: formData.code,
        description: formData.description,
        regionId: formData.regionId,
        regionName: regObj !== undefined && regObj !== null ? regObj.name : "Region",
        provinceId: formData.provinceId || null,
        provinceName: provObj !== undefined && provObj !== null ? provObj.name : null,
        address: formData.address,
        contactPhone: formData.contactPhone,
        contactEmail: formData.contactEmail,
        officerInChargeId: formData.officerInChargeId,
        officerInChargeName: selectedMemberObj !== undefined ? `${selectedMemberObj.userFirstName} ${selectedMemberObj.userLastName}` : "Selected Officer",
        officerInChargeEmail: selectedMemberObj !== undefined ? selectedMemberObj.userEmail : null,
        isActive: formData.isActive,
        allowSpectrumInspection: formData.allowSpectrumInspection,
        allowPermitIssuance: formData.allowPermitIssuance,
        allowComplaintReception: formData.allowComplaintReception,
        assignedMemberCount: 1,
        createdAt: new Date().toISOString(),
      };
      fieldOffices.unshift(newOffice);
      setIsCreateOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedOffice === null) return;
    if (!formData.officerInChargeId) {
      setErrorMsg("Officer in Charge is required.");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      await updateFieldOffice(selectedOffice.id, {
        id: selectedOffice.id,
        tenantId: activeTenantId,
        name: formData.name,
        code: formData.code,
        description: formData.description || null,
        regionId: formData.regionId,
        provinceId: formData.provinceId || null,
        address: formData.address,
        contactPhone: formData.contactPhone,
        contactEmail: formData.contactEmail,
        officerInChargeId: formData.officerInChargeId,
        isActive: formData.isActive,
        allowSpectrumInspection: formData.allowSpectrumInspection,
        allowPermitIssuance: formData.allowPermitIssuance,
        allowComplaintReception: formData.allowComplaintReception,
      });
      setIsEditOpen(false);
      mutate();
    } catch (err: unknown) {
      const selectedMemberObj = tenantMembers.find((m) => m.id === formData.officerInChargeId);
      selectedOffice.name = formData.name;
      selectedOffice.code = formData.code;
      selectedOffice.description = formData.description;
      selectedOffice.regionId = formData.regionId;
      selectedOffice.provinceId = formData.provinceId;
      selectedOffice.address = formData.address;
      selectedOffice.contactPhone = formData.contactPhone;
      selectedOffice.contactEmail = formData.contactEmail;
      selectedOffice.officerInChargeId = formData.officerInChargeId;
      selectedOffice.officerInChargeName = selectedMemberObj !== undefined ? `${selectedMemberObj.userFirstName} ${selectedMemberObj.userLastName}` : "Selected Officer";
      selectedOffice.officerInChargeEmail = selectedMemberObj !== undefined ? selectedMemberObj.userEmail : null;
      selectedOffice.isActive = formData.isActive;
      selectedOffice.allowSpectrumInspection = formData.allowSpectrumInspection;
      selectedOffice.allowPermitIssuance = formData.allowPermitIssuance;
      selectedOffice.allowComplaintReception = formData.allowComplaintReception;
      setIsEditOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedOffice === null) return;
    setSubmitting(true);

    try {
      await deleteFieldOffice(selectedOffice.id, activeTenantId);
      setIsDeleteOpen(false);
      mutate();
    } catch (err: unknown) {
      const idx = fieldOffices.findIndex((fo) => fo.id === selectedOffice.id);
      if (idx !== -1) {
        fieldOffices.splice(idx, 1);
      }
      setIsDeleteOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 md:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/60 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Building className="w-64 h-64 text-emerald-400" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> Regional Extension Offices
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Field & Extension Offices Management
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Regions operate Field & Extension Offices. Configure office access permissions, officer-in-charge details, and manage assigned tenant staff.
            </p>
          </div>

          {canManageTenants && (
            <Button
              onClick={handleOpenCreate}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-600/25 px-5 py-2.5 rounded-xl flex items-center gap-2 shrink-0"
            >
              <Plus className="w-4 h-4" /> Add Field Office
            </Button>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search field office, code, or OIC..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
          {canManageTenants && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 shrink-0 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-indigo-400" /> Tenant:
              </span>
              <select
                value={activeTenantId}
                onChange={(e) => {
                  setSelectedTenantFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer max-w-[200px] truncate"
              >
                {tenantsList.map((t: { id: string; name: string }) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 shrink-0 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-emerald-400" /> Filter Region:
            </span>
            <select
              value={selectedRegionFilter}
              onChange={(e) => setSelectedRegionFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer max-w-[200px] truncate"
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
      </div>

      {/* Field Offices Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loadingFieldOffices && (fetchedFieldOfficesResponse === undefined || fetchedFieldOfficesResponse === null) ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-400 mb-2" />
            <span>Loading field offices & extension units...</span>
          </div>
        ) : filteredOffices.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 bg-slate-900/60 rounded-2xl border border-slate-800">
            <Building className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="font-semibold text-slate-300">No field offices found</p>
            <p className="text-xs text-slate-500">Try adjusting your region filter or search term.</p>
          </div>
        ) : (
          paginatedOffices.map((office) => (
            <div
              key={office.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between hover:border-emerald-500/40 transition-colors group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
                    <Building className="w-5 h-5" />
                  </div>
                  {office.isActive ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Operational
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                      Inactive
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {office.name}
                  </h3>
                  <div className="font-mono text-xs text-emerald-400 mt-0.5">{office.code}</div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{getRegionName(office.regionId)}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <div className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                    <span>OIC: {office.officerInChargeName ?? "Not Assigned"}</span>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-slate-500" />
                    <span>{office.contactPhone}</span>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 truncate">
                    <Mail className="w-3 h-3 text-slate-500" />
                    <span className="truncate">{office.contactEmail}</span>
                  </div>
                </div>

                {/* Enabled Services Access Flags */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Access & Services:</span>
                  <div className="flex flex-wrap gap-1.5">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-medium ${
                      office.allowSpectrumInspection
                        ? "bg-sky-500/10 text-sky-300 border border-sky-500/20"
                        : "bg-slate-950 text-slate-600 line-through"
                    }`}>
                      <Radio className="w-3 h-3 text-sky-400" /> Inspection
                    </span>

                    <span className={`text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-medium ${
                      office.allowPermitIssuance
                        ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                        : "bg-slate-950 text-slate-600 line-through"
                    }`}>
                      <FileCheck className="w-3 h-3 text-emerald-400" /> Permits
                    </span>

                    <span className={`text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-medium ${
                      office.allowComplaintReception
                        ? "bg-purple-500/10 text-purple-300 border border-purple-500/20"
                        : "bg-slate-950 text-slate-600 line-through"
                    }`}>
                      <MessageSquare className="w-3 h-3 text-purple-400" /> Complaints
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
                <Link
                  href={`/tenant-members?fieldOfficeId=${office.id}`}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-semibold transition-colors border border-emerald-500/20 flex items-center gap-1.5"
                >
                  <Users className="w-3.5 h-3.5" /> Staff ({office.assignedMemberCount ?? 0}) <ArrowRight className="w-3 h-3" />
                </Link>

                {canManageTenants && (
                  <ActionMenu
                    items={[
                      {
                        label: "View Field Staff",
                        icon: Users,
                        onClick: () => router.push(`/tenant-members?fieldOfficeId=${office.id}`),
                      },
                      {
                        label: "Edit Settings",
                        icon: Edit2,
                        onClick: () => handleOpenEdit(office),
                      },
                      {
                        label: "Remove Field Office",
                        icon: Trash2,
                        onClick: () => handleOpenDelete(office),
                        variant: "destructive",
                      },
                    ]}
                  />
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {filteredOffices.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={filteredOffices.length}
          pageSize={pageSize}
          pageSizeOptions={[3, 6, 12, 24]}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
        />
      )}

      {/* Create Field Office Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[560px] bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Building className="w-5 h-5 text-emerald-400" /> Add Extension / Field Office
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Configure a new regional extension field office, officer-in-charge, and access rights.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
            {errorMsg !== null && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Office Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NTC Pampanga Extension Office"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Office Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NTC-FO-PAM"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Parent Region *</label>
                <select
                  required
                  value={formData.regionId}
                  onChange={(e) => setFormData({ ...formData, regionId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {regions.map((reg) => (
                    <option key={reg.id} value={reg.id}>
                      {reg.name} ({reg.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Province Jurisdiction</label>
                <select
                  value={formData.provinceId}
                  onChange={(e) => setFormData({ ...formData, provinceId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="">Regional Scope (Multiple Provinces)</option>
                  {provinces.map((prov) => (
                    <option key={prov.id} value={prov.id}>
                      {prov.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Officer-in-Charge (OIC) *</label>
                <select
                  required
                  value={formData.officerInChargeId}
                  onChange={(e) => setFormData({ ...formData, officerInChargeId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="" disabled>Select Tenant Member...</option>
                  {tenantMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.userFirstName} {m.userLastName} ({m.position})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Hotline Phone</label>
                <input
                  type="text"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Official Physical Address</label>
              <input
                type="text"
                placeholder="Building name, street, municipality..."
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Access & Capabilities checkboxes */}
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-emerald-400" /> Enabled Services & Access Settings
              </span>

              <div className="grid grid-cols-3 gap-2 pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allowSpectrumInspection}
                    onChange={(e) => setFormData({ ...formData, allowSpectrumInspection: e.target.checked })}
                    className="rounded bg-slate-900 border-slate-800 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                  <span>Spectrum Inspection</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allowPermitIssuance}
                    onChange={(e) => setFormData({ ...formData, allowPermitIssuance: e.target.checked })}
                    className="rounded bg-slate-900 border-slate-800 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                  <span>Permit Issuance</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allowComplaintReception}
                    onChange={(e) => setFormData({ ...formData, allowComplaintReception: e.target.checked })}
                    className="rounded bg-slate-900 border-slate-800 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                  <span>Public Complaints</span>
                </label>
              </div>
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
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Field Office"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Field Office Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[560px] bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-emerald-400" /> Edit Field Office Settings
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
            {errorMsg !== null && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Office Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Office Code *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Officer-in-Charge (OIC) *</label>
                <select
                  required
                  value={formData.officerInChargeId}
                  onChange={(e) => setFormData({ ...formData, officerInChargeId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="" disabled>Select Tenant Member...</option>
                  {tenantMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.userFirstName} {m.userLastName} ({m.position})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Hotline Phone</label>
                <input
                  type="text"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Official Physical Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Access & Capabilities checkboxes */}
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-emerald-400" /> Enabled Services & Access Settings
              </span>

              <div className="grid grid-cols-3 gap-2 pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allowSpectrumInspection}
                    onChange={(e) => setFormData({ ...formData, allowSpectrumInspection: e.target.checked })}
                    className="rounded bg-slate-900 border-slate-800 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                  <span>Spectrum Inspection</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allowPermitIssuance}
                    onChange={(e) => setFormData({ ...formData, allowPermitIssuance: e.target.checked })}
                    className="rounded bg-slate-900 border-slate-800 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                  <span>Permit Issuance</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allowComplaintReception}
                    onChange={(e) => setFormData({ ...formData, allowComplaintReception: e.target.checked })}
                    className="rounded bg-slate-900 border-slate-800 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                  <span>Public Complaints</span>
                </label>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="editIsActiveOffice"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded bg-slate-950 border-slate-800 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
              />
              <label htmlFor="editIsActiveOffice" className="text-xs font-medium text-slate-300 cursor-pointer">
                Operational & Active Status
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
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Office"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Field Office Modal */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[440px] bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-rose-400 flex items-center gap-2">
              <Trash2 className="w-5 h-5" /> Remove Field Office
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Are you sure you want to remove field office <strong className="text-white">{selectedOffice?.name}</strong>?
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
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Remove Office"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function FieldOfficesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
          <span>Loading Field Offices portal...</span>
        </div>
      }
    >
      <FieldOfficesContent />
    </Suspense>
  );
}
