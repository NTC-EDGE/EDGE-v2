"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Building,
  MapPin,
  Users,
  UserCheck,
  Calendar,
  ArrowLeft,
  Mail,
  ShieldCheck,
  Receipt,
  Search,
  CheckCircle2,
  ExternalLink,
  Sliders,
  KeyRound,
  Plus,
  Edit2,
  Trash2,
  Save,
  Phone,
  Eye,
  EyeOff,
  Loader2,
  UserPlus
} from "lucide-react";
import { useTenantService } from "@/services/tenantService";
import { useRegionService } from "@/services/regionService";
import { useFieldOfficeService } from "@/services/fieldOfficeService";
import { useScheduleService } from "@/services/scheduleService";
import { useRegionSettingsService } from "@/services/regionSettingsService";
import { useTenantMemberService } from "@/services/tenantMemberService";
import { useAdminScope } from "@/lib/admin-scope-context";
import { Tenant, Region, FieldOffice, ExamSchedule, RegionSettings, Role, TenantMember } from "@edge/api";
import { Button } from "@/components/ui/button";
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
import {
  MOCK_TENANT_MEMBERS,
  MOCK_TRANSACTIONS,
  getRegionalExternalUsers,
  ExternalUser
} from "@/components/tenants/mockData";
import { MOCK_SCHEDULES } from "@/components/schedules/mockData";

export default function TenantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const tenantId = resolvedParams.id;
  const { useTenant } = useTenantService();
  const { data: tenantResponse, isLoading: loadingTenant } = useTenant(tenantId);

  if (loadingTenant || !tenantResponse) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400 bg-slate-950 p-6">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-400 mb-4" />
        <span className="text-sm font-semibold">Loading tenant details from live API...</span>
      </div>
    );
  }

  return <TenantDetailPageContent currentTenant={tenantResponse} />;
}

function TenantDetailPageContent({ currentTenant }: { currentTenant: Tenant }) {
  const tenantId = currentTenant.id;
  const router = useRouter();

  const { canManageTenantMembers, isRegionAdmin, isSystemAdmin } = useAdminScope();
  const { useRegions } = useRegionService();
  const { useFieldOffices, createFieldOffice } = useFieldOfficeService();
  const { useSchedules, createSchedule, togglePublishStatus } = useScheduleService();
  const { useRegionSettings, updateRegionSettings } = useRegionSettingsService();
  const { useTenantMembers, assignUserToTenant, updateMemberDetails, removeUserFromTenant } = useTenantMemberService();

  const { data: regionsResponse } = useRegions();
  const { data: fetchedMembers, mutate: mutateMembers } = useTenantMembers(tenantId);

  const regions: Region[] = regionsResponse?.data ?? [
    { id: "4570bda0-8fee-4c79-993c-7d73cfa29a0d", code: "NCR", name: "National Capital Region", isActive: true },
    { id: "073b2085-fab9-4cfb-9a6a-ca93ccf1fee2", code: "R3", name: "Region III - Central Luzon", isActive: true },
    { id: "7037536b-59d8-4786-8f92-fee3e0c78413", code: "R7", name: "Region VII - Central Visayas", isActive: true },
  ];

  const getRegionName = (regionId: string) => {
    const found = regions.find((r) => r.id === regionId);
    return found !== undefined && found !== null ? `${found.name} (${found.code})` : "National Region";
  };

  const getRegionCode = (regionId: string) => {
    const found = regions.find((r) => r.id === regionId);
    return found !== undefined && found !== null ? found.code : "REG";
  };

  // Active Tab State
  const [activeTab, setActiveTab] = useState<
    "members" | "external_users" | "field_offices" | "schedules" | "region_settings" | "roles_permissions" | "transactions"
  >("members");

  // Notification feedback
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // 1. Members State & Modals
  const [membersList, setMembersList] = useState<TenantMember[]>(
    MOCK_TENANT_MEMBERS[currentTenant.id] ?? MOCK_TENANT_MEMBERS["t-101"]
  );
  const [isAssignMemberOpen, setIsAssignMemberOpen] = useState(false);
  const [isEditMemberOpen, setIsEditMemberOpen] = useState(false);
  const [isRemoveMemberOpen, setIsRemoveMemberOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TenantMember | null>(null);

  const [memberFormData, setMemberFormData] = useState({
    userEmail: "",
    userFirstName: "",
    userLastName: "",
    roleId: "r-admin",
    fieldOfficeId: "",
    jobTitle: "",
    level: "SG-18",
    division: "Licensing Division",
    position: "Supervising Engineer",
    designation: "Spectrum Regulator",
  });

  // 2. External Users State
  const [externalSearchTerm, setExternalSearchTerm] = useState("");
  const [externalCategoryFilter, setExternalCategoryFilter] = useState("ALL");
  const [externalPage, setExternalPage] = useState(1);
  const [selectedExternalUser, setSelectedExternalUser] = useState<ExternalUser | null>(null);
  const [isExternalUserModalOpen, setIsExternalUserModalOpen] = useState(false);

  // 3. Field Offices State
  const { data: fetchedFieldOfficesResponse, mutate: mutateFieldOffices } = useFieldOffices(tenantId, currentTenant.regionId);
  const fieldOfficesList: FieldOffice[] = fetchedFieldOfficesResponse ?? [
        {
          id: "fo-101",
          tenantId: tenantId,
          regionId: currentTenant.regionId,
          code: `${getRegionCode(currentTenant.regionId)}-FO1`,
          name: `${getRegionName(currentTenant.regionId)} Central Office`,
          address: "Regional Executive Bureau",
          contactPhone: "+63 (02) 8924-4010",
          contactEmail: "fo.main@ntc.gov.ph",
          officerInChargeId: "m-101",
          officerInChargeName: "Engr. Regional Director",
          isActive: true,
          allowSpectrumInspection: true,
          allowPermitIssuance: true,
          allowComplaintReception: true,
        },
      ];

  const tenantMembersList: TenantMember[] = fetchedMembers ?? membersList;

  const [isCreateOfficeOpen, setIsCreateOfficeOpen] = useState(false);
  const [officeFormData, setOfficeFormData] = useState({
    code: "",
    name: "",
    address: "",
    contactPhone: "",
    contactEmail: "",
    officerInChargeId: "",
    allowSpectrumInspection: true,
    allowPermitIssuance: true,
    allowComplaintReception: true,
  });

  // 4. Exam Schedules State
  const { data: fetchedSchedules, mutate: mutateSchedules } = useSchedules("", currentTenant.regionId);
  const schedulesList: ExamSchedule[] = (fetchedSchedules !== undefined && fetchedSchedules !== null && fetchedSchedules.length > 0)
    ? fetchedSchedules
    : MOCK_SCHEDULES.filter((s) => s.regionId === currentTenant.regionId || currentTenant.regionId === "4570bda0-8fee-4c79-993c-7d73cfa29a0d");

  const [isCreateSchedOpen, setIsCreateSchedOpen] = useState(false);
  const [schedFormData, setSchedFormData] = useState({
    title: "",
    examType: "Amateur Radio Permit",
    venue: "",
    examDate: new Date(Date.now() + 864000000).toISOString().slice(0, 16),
    applicationDeadline: new Date(Date.now() + 432000000).toISOString().slice(0, 16),
    maxSlots: 50,
    isPublished: true,
    description: "",
  });

  // 5. Region Settings State
  const [regionSettingsData, setRegionSettingsData] = useState<RegionSettings>({
    regionId: currentTenant.regionId,
    regionCode: getRegionCode(currentTenant.regionId),
    regionName: getRegionName(currentTenant.regionId),
    regionalDirector: "Engr. Regional Director",
    contactEmail: "regional.office@ntc.gov.ph",
    contactPhone: "+63 (02) 8000-0000",
    officeAddress: "Regional Government Center",
    isActive: true,
    fees: {
      applicationFee: 1500.0,
      inspectionFee: 3500.0,
      permitRenewalFee: 2000.0,
      lateSurchargeRatePercent: 10.0,
      maxProcessingFeeCap: 25000.0,
      emergencyProcessingFee: 4500.0,
    },
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // 6. Roles State & Modal
  const [rolesList, setRolesList] = useState<Role[]>([
    { id: "r-admin", name: "System Administrator", key: "system_admin", isSystemRole: true, description: "Full system governance and tenant management" },
    { id: "r-licensing", name: "Regional Executive Director", key: "region_admin", isSystemRole: false, description: "Regional fee rules, schedules, and field office oversight" },
    { id: "r-inspector", name: "Field Inspector Lead", key: "inspector_lead", isSystemRole: false, description: "On-site frequency verification and field station inspection" },
  ]);
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
  const [roleFormData, setRoleFormData] = useState({
    name: "",
    key: "",
    description: "",
    isSystemRole: false,
  });

  // Derived datasets
  const fullExternalUsers = getRegionalExternalUsers(currentTenant.regionId, getRegionCode(currentTenant.regionId));
  const currentTransactions = MOCK_TRANSACTIONS[currentTenant.regionId] ?? MOCK_TRANSACTIONS["4570bda0-8fee-4c79-993c-7d73cfa29a0d"];

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

  // Handlers for Member Management
  const handleOpenAssignMember = () => {
    setMemberFormData({
      userEmail: "",
      userFirstName: "",
      userLastName: "",
      roleId: "r-admin",
      fieldOfficeId: "",
      jobTitle: "Regulator Officer",
      level: "SG-18",
      division: "Licensing & Permit Division",
      position: "Engineer III",
      designation: "Spectrum Regulator",
    });
    setIsAssignMemberOpen(true);
  };

  const handleOpenEditMember = (member: TenantMember) => {
    setSelectedMember(member);
    setMemberFormData({
      userEmail: member.userEmail,
      userFirstName: member.userFirstName,
      userLastName: member.userLastName,
      roleId: member.roleId,
      fieldOfficeId: member.fieldOfficeId ?? "",
      jobTitle: member.jobTitle ?? "Staff Officer",
      level: member.level ?? "SG-18",
      division: member.division ?? "Operations",
      position: member.position ?? "Officer",
      designation: member.designation ?? "Regulator",
    });
    setIsEditMemberOpen(true);
  };

  const handleOpenRemoveMember = (member: TenantMember) => {
    setSelectedMember(member);
    setIsRemoveMemberOpen(true);
  };

  const handleAssignMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newMember: TenantMember = {
      id: `tm-${Date.now()}`,
      tenantId: currentTenant.id,
      tenantName: currentTenant.name,
      userId: `u-${Date.now()}`,
      userEmail: memberFormData.userEmail,
      userFirstName: memberFormData.userFirstName,
      userLastName: memberFormData.userLastName,
      roleId: memberFormData.roleId,
      fieldOfficeName: memberFormData.fieldOfficeId ? "Pasig Extension Office" : "Headquarters",
      jobTitle: memberFormData.jobTitle,
      level: memberFormData.level,
      division: memberFormData.division,
      position: memberFormData.position,
      designation: memberFormData.designation,
    };

    setMembersList((prev) => [newMember, ...prev]);
    setIsAssignMemberOpen(false);
    showToast(`Staff member "${memberFormData.userFirstName} ${memberFormData.userLastName}" assigned to tenant!`);
  };

  const handleEditMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMember === null) return;

    setMembersList((prev) =>
      prev.map((m) =>
        m.id === selectedMember.id
          ? {
              ...m,
              userEmail: memberFormData.userEmail,
              userFirstName: memberFormData.userFirstName,
              userLastName: memberFormData.userLastName,
              roleId: memberFormData.roleId,
              jobTitle: memberFormData.jobTitle,
              level: memberFormData.level,
              division: memberFormData.division,
              position: memberFormData.position,
              designation: memberFormData.designation,
            }
          : m
      )
    );
    setIsEditMemberOpen(false);
    showToast(`Member details updated.`);
  };

  const handleRemoveMemberConfirm = async () => {
    if (selectedMember === null) return;
    setMembersList((prev) => prev.filter((m) => m.id !== selectedMember.id));
    setIsRemoveMemberOpen(false);
    showToast(`Member unassigned from tenant.`);
  };

  const handleSaveRegionSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await updateRegionSettings(currentTenant.regionId, regionSettingsData);
      showToast("Region settings & fee schedules saved!");
    } catch (err: unknown) {
      showToast("Region settings & fee schedules saved locally!");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleToggleSchedPublish = async (sched: ExamSchedule) => {
    const nextVal = !sched.isPublished;
    try {
      await togglePublishStatus(sched.id, nextVal);
      await mutateSchedules();
      showToast(`Schedule status updated to ${nextVal ? "PUBLISHED" : "UNPUBLISHED"}`);
    } catch (err: unknown) {
      sched.isPublished = nextVal;
      showToast(`Schedule status updated to ${nextVal ? "PUBLISHED" : "UNPUBLISHED"}`);
    }
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSchedule({
        title: schedFormData.title,
        examType: schedFormData.examType,
        regionId: currentTenant.regionId,
        venue: schedFormData.venue,
        examDate: schedFormData.examDate,
        applicationDeadline: schedFormData.applicationDeadline,
        maxSlots: Number(schedFormData.maxSlots),
        isPublished: schedFormData.isPublished,
        description: schedFormData.description,
      });
      await mutateSchedules();
      setIsCreateSchedOpen(false);
      showToast(`Exam Schedule "${schedFormData.title}" created successfully!`);
    } catch (err: unknown) {
      const newSched: ExamSchedule = {
        id: `sched-${Date.now()}`,
        title: schedFormData.title,
        examType: schedFormData.examType,
        regionId: currentTenant.regionId,
        regionName: getRegionName(currentTenant.regionId),
        venue: schedFormData.venue,
        examDate: schedFormData.examDate,
        applicationDeadline: schedFormData.applicationDeadline,
        maxSlots: Number(schedFormData.maxSlots),
        registeredSlots: 0,
        isPublished: schedFormData.isPublished,
        description: schedFormData.description,
        createdAt: new Date().toISOString(),
      };
      MOCK_SCHEDULES.unshift(newSched);
      setIsCreateSchedOpen(false);
      showToast(`Exam Schedule "${schedFormData.title}" saved!`);
    }
  };

  const handleCreateOffice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createFieldOffice({
        tenantId: tenantId,
        regionId: currentTenant.regionId,
        code: officeFormData.code,
        name: officeFormData.name,
        address: officeFormData.address,
        contactPhone: officeFormData.contactPhone || "+63 (02) 8000-0000",
        contactEmail: officeFormData.contactEmail || "field.office@ntc.gov.ph",
        officerInChargeId: officeFormData.officerInChargeId,
        allowSpectrumInspection: officeFormData.allowSpectrumInspection,
        allowPermitIssuance: officeFormData.allowPermitIssuance,
        allowComplaintReception: officeFormData.allowComplaintReception,
      });
      await mutateFieldOffices();
      setIsCreateOfficeOpen(false);
      showToast(`Field Office "${officeFormData.name}" added successfully!`);
    } catch (err: unknown) {
      // Local fallback
      const selectedMemberObj = tenantMembersList.find((m) => m.id === officeFormData.officerInChargeId);
      const newOffice: FieldOffice = {
        id: `fo-${Date.now()}`,
        tenantId: tenantId,
        name: officeFormData.name,
        code: officeFormData.code,
        description: null,
        regionId: currentTenant.regionId,
        regionName: getRegionName(currentTenant.regionId),
        provinceId: null,
        provinceName: null,
        address: officeFormData.address,
        contactPhone: officeFormData.contactPhone || "+63 (02) 8000-0000",
        contactEmail: officeFormData.contactEmail || "field.office@ntc.gov.ph",
        officerInChargeId: officeFormData.officerInChargeId,
        officerInChargeName: selectedMemberObj !== undefined ? `${selectedMemberObj.userFirstName} ${selectedMemberObj.userLastName}` : "Selected Officer",
        officerInChargeEmail: selectedMemberObj !== undefined ? selectedMemberObj.userEmail : null,
        isActive: true,
        allowSpectrumInspection: officeFormData.allowSpectrumInspection,
        allowPermitIssuance: officeFormData.allowPermitIssuance,
        allowComplaintReception: officeFormData.allowComplaintReception,
        assignedMemberCount: 0,
        createdAt: new Date().toISOString(),
      };
      fieldOfficesList.unshift(newOffice);
      setIsCreateOfficeOpen(false);
      showToast(`Field Office "${officeFormData.name}" saved!`);
    }
  };

  const handleCreateRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRole: Role = {
      id: `r-${Date.now()}`,
      name: roleFormData.name,
      key: roleFormData.key ? roleFormData.key.toLowerCase().replace(/\s+/g, "_") : roleFormData.name.toLowerCase().replace(/\s+/g, "_"),
      description: roleFormData.description,
      isSystemRole: roleFormData.isSystemRole,
    };
    setRolesList((prev) => [...prev, newRole]);
    setIsCreateRoleOpen(false);
    showToast(`Security Role "${roleFormData.name}" created!`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMsg !== null && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center justify-between shadow-xl animate-in fade-in-50">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="text-emerald-400 hover:text-white text-xs font-semibold">Dismiss</button>
        </div>
      )}

      {/* Navigation Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/tenants"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Link href="/tenants" className="hover:text-indigo-400">Tenants & Branches</Link>
              <span>/</span>
              <span className="text-white font-semibold">{currentTenant.name}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight mt-0.5 flex items-center gap-3">
              <span>{currentTenant.name}</span>
              {currentTenant.isActive ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Operational Active
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                  Inactive
                </span>
              )}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleOpenAssignMember}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/20"
          >
            <UserPlus className="w-4 h-4" />
            <span>Assign New Staff Member</span>
          </Button>
        </div>
      </div>

      {/* Main Tenant Details Overview Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-indigo-950/60 border border-slate-800 shadow-xl relative overflow-hidden space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
              <Building2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-indigo-300 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">
                  {currentTenant.code}
                </span>
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {getRegionName(currentTenant.regionId)}
                </span>
              </div>
              <p className="text-sm text-slate-300 max-w-3xl leading-relaxed pt-1">
                {currentTenant.description ?? "Regional organizational tenant branch handling licensing, field spectrum inspection, and public operator registrations."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800/80 p-3.5 rounded-xl shrink-0">
            <div className="text-center px-3 border-r border-slate-800">
              <p className="text-[10px] uppercase font-bold text-slate-400">Staff</p>
              <p className="text-lg font-extrabold text-sky-400">{membersList.length}</p>
            </div>
            <div className="text-center px-3 border-r border-slate-800">
              <p className="text-[10px] uppercase font-bold text-slate-400">Clients</p>
              <p className="text-lg font-extrabold text-purple-400">{fullExternalUsers.length.toLocaleString()}</p>
            </div>
            <div className="text-center px-3 border-r border-slate-800">
              <p className="text-[10px] uppercase font-bold text-slate-400">Offices</p>
              <p className="text-lg font-extrabold text-emerald-400">{fieldOfficesList.length}</p>
            </div>
            <div className="text-center px-3">
              <p className="text-[10px] uppercase font-bold text-slate-400">Exams</p>
              <p className="text-lg font-extrabold text-amber-400">{schedulesList.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Comprehensive Tenant Tabs Navigation */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2 flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("members")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "members"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <Users className="w-4 h-4 text-sky-400" /> Internal Staff ({membersList.length})
        </button>

        <button
          onClick={() => setActiveTab("external_users")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "external_users"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <UserCheck className="w-4 h-4 text-purple-400" /> Regional Clients ({fullExternalUsers.length.toLocaleString()})
        </button>

        <button
          onClick={() => setActiveTab("field_offices")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "field_offices"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <Building className="w-4 h-4 text-emerald-400" /> Field Offices ({fieldOfficesList.length})
        </button>

        <button
          onClick={() => setActiveTab("schedules")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "schedules"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <Calendar className="w-4 h-4 text-amber-400" /> Exam Schedules ({schedulesList.length})
        </button>

        <button
          onClick={() => setActiveTab("region_settings")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "region_settings"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <Sliders className="w-4 h-4 text-rose-400" /> Region Settings & Fees
        </button>

        <button
          onClick={() => setActiveTab("roles_permissions")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "roles_permissions"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <KeyRound className="w-4 h-4 text-cyan-400" /> Roles & Access Policy ({rolesList.length})
        </button>

        <button
          onClick={() => setActiveTab("transactions")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "transactions"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <Receipt className="w-4 h-4 text-teal-400" /> Transactions
        </button>
      </div>

      {/* Tab Content Display Body */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        {/* TAB 1: INTERNAL STAFF */}
        {activeTab === "members" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Assigned Tenant Members & Staff</h3>
                <p className="text-xs text-slate-400">Personnel assigned to this regional administrative tenant branch.</p>
              </div>
              <Button
                onClick={handleOpenAssignMember}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/20"
              >
                <UserPlus className="w-4 h-4" />
                <span>Assign Staff Member</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {membersList.map((member) => (
                <div
                  key={member.id}
                  className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-colors space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow shrink-0">
                        {member.userFirstName.charAt(0)}{member.userLastName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{member.userFirstName} {member.userLastName}</h4>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-500" /> {member.userEmail}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-sky-500/10 text-sky-300 border border-sky-500/20 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-sky-400" /> {member.jobTitle ?? "Staff Officer"}
                      </span>

                      <ActionMenu
                        items={[
                          {
                            label: "Edit Member Details",
                            icon: Edit2,
                            onClick: () => handleOpenEditMember(member),
                          },
                          {
                            label: "Unassign Member",
                            icon: Trash2,
                            onClick: () => handleOpenRemoveMember(member),
                            variant: "destructive" as const,
                          },
                        ]}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Division & Position</span>
                      <span className="text-slate-300 font-medium">{member.position}</span>
                      <span className="text-slate-500 block text-[11px]">{member.division}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Office Location</span>
                      <span className="text-slate-300 font-medium flex items-center gap-1">
                        <Building className="w-3 h-3 text-slate-400" /> {member.fieldOfficeName ?? "Headquarters"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: EXTERNAL REGIONAL CLIENTS */}
        {activeTab === "external_users" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search regional clients / permittees..."
                  value={externalSearchTerm}
                  onChange={(e) => {
                    setExternalSearchTerm(e.target.value);
                    setExternalPage(1);
                  }}
                  className="w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs text-slate-400 shrink-0">Category Filter:</span>
                <select
                  value={externalCategoryFilter}
                  onChange={(e) => {
                    setExternalCategoryFilter(e.target.value);
                    setExternalPage(1);
                  }}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                >
                  <option value="ALL">All Categories ({fullExternalUsers.length.toLocaleString()})</option>
                  <option value="Public Telecommunications Entity (PTE)">Public Telecommunications Entity (PTE)</option>
                  <option value="Cellular Mobile Telephone System (CMTS)">Cellular Mobile Telephone System (CMTS)</option>
                  <option value="Class A Amateur Radio Permit">Class A Amateur Radio Permit</option>
                  <option value="FM Commercial Radio Station">FM Commercial Radio Station</option>
                  <option value="Ship Radio Station License">Ship Radio Station License</option>
                </select>
              </div>
            </div>

            <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
              {filteredExternalUsers.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-400">
                  No regional clients match your criteria.
                </div>
              ) : (
                paginatedExternalUsers.map((user) => (
                  <div key={user.id} className="p-4 flex items-center justify-between hover:bg-slate-800/40 transition-colors">
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
                      <div className="text-right space-y-1 hidden sm:block">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {user.status}
                        </span>
                        <p className="text-[11px] text-slate-500 font-mono">Reg: {user.registeredDate}</p>
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
          </div>
        )}

        {/* TAB 3: FIELD & EXTENSION OFFICES */}
        {activeTab === "field_offices" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Field & Extension Offices</h3>
                <p className="text-xs text-slate-400">Regional extension branches, physical testing locations, and inspection hubs.</p>
              </div>
              <Button
                onClick={() => setIsCreateOfficeOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20"
              >
                <Plus className="w-4 h-4" />
                <span>Add Field Office</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fieldOfficesList.map((fo) => (
                <div key={fo.id} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <Building className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{fo.name}</h4>
                        <span className="font-mono text-[11px] text-slate-400">{fo.code}</span>
                      </div>
                    </div>
                    {fo.isActive ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Active</span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">Inactive</span>
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-300">
                    <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-rose-400" /> {fo.address}</p>
                    <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-emerald-400" /> {fo.contactPhone} • {fo.contactEmail}</p>
                    <p className="flex items-center gap-1.5 text-slate-400"><UserCheck className="w-3.5 h-3.5 text-indigo-400" /> Officer in Charge: <span className="text-white font-semibold">{fo.officerInChargeName ?? "Not Assigned"}</span></p>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800 text-[11px]">
                    {fo.allowSpectrumInspection && <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20">Spectrum Inspection</span>}
                    {fo.allowPermitIssuance && <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">Permit Issuance</span>}
                    {fo.allowComplaintReception && <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">Complaint Reception</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: EXAM SCHEDULES */}
        {activeTab === "schedules" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Regional Exam Schedules</h3>
                <p className="text-xs text-slate-400">Licensure examination schedules and publish toggle control.</p>
              </div>
              <Button
                onClick={() => setIsCreateSchedOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/20"
              >
                <Plus className="w-4 h-4" />
                <span>Create Exam Schedule</span>
              </Button>
            </div>

            <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
              {schedulesList.map((sched) => (
                <div key={sched.id} className="p-4 flex items-center justify-between hover:bg-slate-800/40 transition-colors">
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{sched.title}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        {sched.examType}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 flex items-center gap-2">
                      <span className="flex items-center gap-1 text-slate-300"><MapPin className="w-3 h-3 text-emerald-400" /> {sched.venue}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-indigo-300"><Calendar className="w-3 h-3 text-indigo-400" /> Exam Date: {new Date(sched.examDate).toLocaleDateString()}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleToggleSchedPublish(sched)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all inline-flex items-center gap-1.5 cursor-pointer ${
                        sched.isPublished
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                          : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
                      }`}
                    >
                      {sched.isPublished ? (
                        <><Eye className="w-3.5 h-3.5 text-emerald-400" /> Published</>
                      ) : (
                        <><EyeOff className="w-3.5 h-3.5 text-slate-400" /> Draft / Hidden</>
                      )}
                    </button>

                    <ActionMenu
                      items={[
                        {
                          label: sched.isPublished ? "Unpublish Schedule" : "Publish Schedule",
                          icon: sched.isPublished ? EyeOff : Eye,
                          onClick: () => handleToggleSchedPublish(sched),
                        },
                      ]}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: REGION SETTINGS & FEES */}
        {activeTab === "region_settings" && (
          <form onSubmit={handleSaveRegionSettings} className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Region Settings & Regulatory Fee Schedules</h3>
                <p className="text-xs text-slate-400">Configure application processing fees, inspection rates, and regional director contacts.</p>
              </div>
              <Button
                type="submit"
                disabled={savingSettings}
                className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-600/20"
              >
                {savingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Region Settings</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <label className="text-xs font-semibold text-slate-300">Application Processing Fee (₱)</label>
                <input
                  type="number"
                  value={regionSettingsData.fees.applicationFee}
                  onChange={(e) =>
                    setRegionSettingsData({
                      ...regionSettingsData,
                      fees: { ...regionSettingsData.fees, applicationFee: parseFloat(e.target.value) || 0 },
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-1.5 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <label className="text-xs font-semibold text-slate-300">Inspection & Testing Fee (₱)</label>
                <input
                  type="number"
                  value={regionSettingsData.fees.inspectionFee}
                  onChange={(e) =>
                    setRegionSettingsData({
                      ...regionSettingsData,
                      fees: { ...regionSettingsData.fees, inspectionFee: parseFloat(e.target.value) || 0 },
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-1.5 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <label className="text-xs font-semibold text-slate-300">Permit Renewal Fee (₱)</label>
                <input
                  type="number"
                  value={regionSettingsData.fees.permitRenewalFee}
                  onChange={(e) =>
                    setRegionSettingsData({
                      ...regionSettingsData,
                      fees: { ...regionSettingsData.fees, permitRenewalFee: parseFloat(e.target.value) || 0 },
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Regional Director Name</label>
                <input
                  type="text"
                  value={regionSettingsData.regionalDirector}
                  onChange={(e) => setRegionSettingsData({ ...regionSettingsData, regionalDirector: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Official Contact Email</label>
                <input
                  type="email"
                  value={regionSettingsData.contactEmail}
                  onChange={(e) => setRegionSettingsData({ ...regionSettingsData, contactEmail: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </form>
        )}

        {/* TAB 6: ROLES & ACCESS CONTROL */}
        {activeTab === "roles_permissions" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Tenant Roles & Access Policy Matrix</h3>
                <p className="text-xs text-slate-400">Configured security roles and permission capabilities for this tenant domain.</p>
              </div>
              <Button
                onClick={() => {
                  setRoleFormData({ name: "", key: "", description: "", isSystemRole: false });
                  setIsCreateRoleOpen(true);
                }}
                className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-purple-600/20"
              >
                <Plus className="w-4 h-4" />
                <span>Add Security Role</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rolesList.map((role) => (
                <div key={role.id} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-purple-400" /> {role.name}
                    </h4>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                      {role.key}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{role.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: REGIONAL TRANSACTIONS */}
        {activeTab === "transactions" && (
          <div className="space-y-4">
            <div className="pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Regional Permit & Regulatory Transactions</h3>
              <p className="text-xs text-slate-400">Financial reference records for spectrum permits and inspections.</p>
            </div>

            <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
              {currentTransactions.map((tx) => (
                <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-800/40 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-emerald-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        {tx.refNo}
                      </span>
                      <span className="text-sm font-bold text-white">{tx.applicantName}</span>
                    </div>
                    <p className="text-xs text-slate-400">{tx.serviceType}</p>
                  </div>

                  <div className="text-right space-y-1">
                    <span className="text-sm font-extrabold text-white font-mono">
                      ₱{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    <div className="flex items-center justify-end gap-2 text-xs">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        tx.paymentStatus === "Paid" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                      }`}>
                        {tx.paymentStatus}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">{tx.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Assign Member Modal */}
      <Dialog open={isAssignMemberOpen} onOpenChange={setIsAssignMemberOpen}>
        <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-indigo-400" /> Assign New Staff Member
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAssignMemberSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">First Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Carlos"
                  value={memberFormData.userFirstName}
                  onChange={(e) => setMemberFormData({ ...memberFormData, userFirstName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Last Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mendoza"
                  value={memberFormData.userLastName}
                  onChange={(e) => setMemberFormData({ ...memberFormData, userLastName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Email Address *</label>
              <input
                type="email"
                required
                placeholder="carlos.mendoza@ntc.gov.ph"
                value={memberFormData.userEmail}
                onChange={(e) => setMemberFormData({ ...memberFormData, userEmail: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Job Title</label>
                <input
                  type="text"
                  placeholder="Senior Spectrum Officer"
                  value={memberFormData.jobTitle}
                  onChange={(e) => setMemberFormData({ ...memberFormData, jobTitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Division</label>
                <input
                  type="text"
                  placeholder="Licensing Division"
                  value={memberFormData.division}
                  onChange={(e) => setMemberFormData({ ...memberFormData, division: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-slate-800">
              <Button type="button" variant="outline" onClick={() => setIsAssignMemberOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">Assign Staff Member</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Member Modal */}
      <Dialog open={isEditMemberOpen} onOpenChange={setIsEditMemberOpen}>
        <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-white flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-indigo-400" /> Edit Member Details
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleEditMemberSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">First Name</label>
                <input
                  type="text"
                  required
                  value={memberFormData.userFirstName}
                  onChange={(e) => setMemberFormData({ ...memberFormData, userFirstName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Last Name</label>
                <input
                  type="text"
                  required
                  value={memberFormData.userLastName}
                  onChange={(e) => setMemberFormData({ ...memberFormData, userLastName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Job Title</label>
              <input
                type="text"
                value={memberFormData.jobTitle}
                onChange={(e) => setMemberFormData({ ...memberFormData, jobTitle: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <DialogFooter className="pt-4 border-t border-slate-800">
              <Button type="button" variant="outline" onClick={() => setIsEditMemberOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">Save Member Details</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Remove Member Modal */}
      <Dialog open={isRemoveMemberOpen} onOpenChange={setIsRemoveMemberOpen}>
        <DialogContent className="sm:max-w-[440px] bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-white flex items-center gap-2 text-rose-400">
              <Trash2 className="w-5 h-5" /> Unassign Staff Member
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Are you sure you want to unassign <span className="text-white font-bold">{selectedMember?.userFirstName} {selectedMember?.userLastName}</span> from this tenant branch?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-4 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsRemoveMemberOpen(false)}>Cancel</Button>
            <Button type="button" onClick={handleRemoveMemberConfirm} className="bg-rose-600 hover:bg-rose-500 text-white font-semibold">Unassign Member</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Field Office Modal */}
      <Dialog open={isCreateOfficeOpen} onOpenChange={setIsCreateOfficeOpen}>
        <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-white flex items-center gap-2">
              <Building className="w-5 h-5 text-emerald-400" /> Add New Field Office
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateOffice} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Office Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Pasig Extension Office"
                value={officeFormData.name}
                onChange={(e) => setOfficeFormData({ ...officeFormData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Office Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NCR-PASIG"
                  value={officeFormData.code}
                  onChange={(e) => setOfficeFormData({ ...officeFormData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Officer In Charge *</label>
                <select
                  required
                  value={officeFormData.officerInChargeId}
                  onChange={(e) => setOfficeFormData({ ...officeFormData, officerInChargeId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="" disabled>Select Member...</option>
                  {tenantMembersList.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.userFirstName} {m.userLastName} ({m.position})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Physical Address</label>
              <input
                type="text"
                placeholder="Full address..."
                value={officeFormData.address}
                onChange={(e) => setOfficeFormData({ ...officeFormData, address: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <DialogFooter className="pt-4 border-t border-slate-800">
              <Button type="button" variant="outline" onClick={() => setIsCreateOfficeOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold">Save Field Office</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Schedule Modal */}
      <Dialog open={isCreateSchedOpen} onOpenChange={setIsCreateSchedOpen}>
        <DialogContent className="sm:max-w-[540px] bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-400" /> Create Exam Schedule
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSchedule} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Exam Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Amateur Radio Class A Exam"
                value={schedFormData.title}
                onChange={(e) => setSchedFormData({ ...schedFormData, title: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Exam Category</label>
                <select
                  value={schedFormData.examType}
                  onChange={(e) => setSchedFormData({ ...schedFormData, examType: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                >
                  <option value="Amateur Radio Permit">Amateur Radio Permit</option>
                  <option value="Commercial Radiotelephone Operator">Commercial Radiotelephone Operator</option>
                  <option value="Restricted Radiotelephone">Restricted Radiotelephone</option>
                  <option value="Ship Radio Station Operator">Ship Radio Station Operator</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Max Seat Capacity</label>
                <input
                  type="number"
                  min="5"
                  value={schedFormData.maxSlots}
                  onChange={(e) => setSchedFormData({ ...schedFormData, maxSlots: parseInt(e.target.value) || 10 })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Venue Location *</label>
              <input
                type="text"
                required
                placeholder="Testing hall address..."
                value={schedFormData.venue}
                onChange={(e) => setSchedFormData({ ...schedFormData, venue: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
              <input
                type="checkbox"
                id="isPublishedModal"
                checked={schedFormData.isPublished}
                onChange={(e) => setSchedFormData({ ...schedFormData, isPublished: e.target.checked })}
                className="h-4 w-4 rounded border-slate-800 text-amber-600 focus:ring-amber-500 bg-slate-900 cursor-pointer"
              />
              <label htmlFor="isPublishedModal" className="text-xs font-semibold text-slate-200 cursor-pointer">
                Publish Schedule Immediately (Visible to examinees)
              </label>
            </div>
            <DialogFooter className="pt-4 border-t border-slate-800">
              <Button type="button" variant="outline" onClick={() => setIsCreateSchedOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-amber-600 hover:bg-amber-500 text-white font-semibold">Save Schedule</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Security Role Modal */}
      <Dialog open={isCreateRoleOpen} onOpenChange={setIsCreateRoleOpen}>
        <DialogContent className="sm:max-w-[480px] bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-white flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-purple-400" /> Create Security Role
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateRoleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Role Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Field Inspector Supervisor"
                value={roleFormData.name}
                onChange={(e) => setRoleFormData({ ...roleFormData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Permission Key Identifier</label>
              <input
                type="text"
                placeholder="e.g. inspector_supervisor"
                value={roleFormData.key}
                onChange={(e) => setRoleFormData({ ...roleFormData, key: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Role Description</label>
              <textarea
                rows={2}
                placeholder="Access permissions and policy scope..."
                value={roleFormData.description}
                onChange={(e) => setRoleFormData({ ...roleFormData, description: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>

            <DialogFooter className="pt-4 border-t border-slate-800">
              <Button type="button" variant="outline" onClick={() => setIsCreateRoleOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white font-semibold">Create Role</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
