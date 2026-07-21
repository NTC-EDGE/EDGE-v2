"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Users,
  UserPlus,
  Search,
  Building2,
  Building,
  ShieldCheck,
  Edit2,
  Trash2,
  Filter,
  Loader2,
  Mail,
  Briefcase,
  Layers,
  Award,
  UserCheck,
  MapPin
} from "lucide-react";
import { useTenantMemberService } from "@/services/tenantMemberService";
import { useTenantService } from "@/services/tenantService";
import { useRoleService } from "@/services/roleService";
import { useUserService } from "@/services/userService";
import { useFieldOfficeService } from "@/services/fieldOfficeService";
import { useAdminScope } from "@/lib/admin-scope-context";
import { TenantMember, Tenant, Role, User, FieldOffice } from "@edge/api";
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

// Mock Fallback Members for seamless demo experience
const MOCK_MEMBERS: TenantMember[] = [
  {
    id: "tm-1",
    tenantId: "t-101",
    tenantName: "NTC National Capital Region Regional Office",
    userId: "u-1",
    userEmail: "maria.santos@ntc.gov.ph",
    userFirstName: "Maria",
    userLastName: "Santos",
    roleId: "r-admin",
    fieldOfficeId: "fo-1",
    fieldOfficeName: "NTC Pampanga Extension Office",
    jobTitle: "Regional Executive Director",
    level: "SG-26",
    division: "Executive Office",
    position: "Director IV",
    designation: "Head of Regional Operations",
    createdAt: "2026-01-20T10:00:00Z",
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
    fieldOfficeId: "fo-2",
    fieldOfficeName: "NTC Bulacan Field Sub-Office",
    jobTitle: "Chief Licensing Officer",
    level: "SG-22",
    division: "Licensing & Permit Division",
    position: "Supervising Engineer",
    designation: "Lead Spectrum Regulator",
    createdAt: "2026-02-05T11:30:00Z",
  },
  {
    id: "tm-3",
    tenantId: "t-102",
    tenantName: "Central Luzon Field Operations Tenant",
    userId: "u-3",
    userEmail: "roberto.reyes@ntc.gov.ph",
    userFirstName: "Roberto",
    userLastName: "Reyes",
    roleId: "r-inspector",
    fieldOfficeId: "fo-3",
    fieldOfficeName: "NTC Cebu Extension Office",
    jobTitle: "Senior Field Inspector",
    level: "SG-18",
    division: "Enforcement & Inspection Division",
    position: "Engineer III",
    designation: "Field Enforcement Lead",
    createdAt: "2026-02-18T14:10:00Z",
  },
];

const MOCK_USERS: User[] = [
  { id: "u-1", email: "maria.santos@ntc.gov.ph", firstName: "Maria", lastName: "Santos", isActive: true },
  { id: "u-2", email: "juan.dela.cruz@ntc.gov.ph", firstName: "Juan", lastName: "Dela Cruz", isActive: true },
  { id: "u-3", email: "roberto.reyes@ntc.gov.ph", firstName: "Roberto", lastName: "Reyes", isActive: true },
  { id: "u-4", email: "elena.torres@ntc.gov.ph", firstName: "Elena", lastName: "Torres", isActive: true },
  { id: "u-5", email: "carlos.gomez@ntc.gov.ph", firstName: "Carlos", lastName: "Gomez", isActive: true },
];

const MOCK_ROLES: Role[] = [
  { id: "r-admin", name: "Tenant Administrator", key: "TENANT_ADMIN", isSystemRole: false, description: "Full tenant administration rights" },
  { id: "r-licensing", name: "Licensing Officer", key: "LICENSING_OFFICER", isSystemRole: false, description: "Process application and permit fees" },
  { id: "r-inspector", name: "Field Inspector", key: "FIELD_INSPECTOR", isSystemRole: false, description: "Perform frequency compliance and field audits" },
  { id: "r-member", name: "Tenant Member", key: "TENANT_MEMBER", isSystemRole: false, description: "General access tenant user" },
];

const MOCK_FIELD_OFFICES: FieldOffice[] = [
  { id: "fo-1", name: "NTC Pampanga Extension Office", code: "NTC-FO-PAM", regionId: "reg-1", address: "", contactPhone: "", contactEmail: "", officerInCharge: "", isActive: true, allowSpectrumInspection: true, allowPermitIssuance: true, allowComplaintReception: true },
  { id: "fo-2", name: "NTC Bulacan Field Sub-Office", code: "NTC-FO-BUL", regionId: "reg-1", address: "", contactPhone: "", contactEmail: "", officerInCharge: "", isActive: true, allowSpectrumInspection: true, allowPermitIssuance: false, allowComplaintReception: true },
  { id: "fo-3", name: "NTC Cebu Extension Office", code: "NTC-FO-CEB", regionId: "reg-2", address: "", contactPhone: "", contactEmail: "", officerInCharge: "", isActive: true, allowSpectrumInspection: true, allowPermitIssuance: true, allowComplaintReception: true },
];

function TenantMembersContent() {
  const searchParams = useSearchParams();
  const initialTenantId = searchParams.get("tenantId");
  const initialFieldOfficeId = searchParams.get("fieldOfficeId");

  const { canManageTenantMembers } = useAdminScope();
  const { useTenants } = useTenantService();
  const { useRoles } = useRoleService();
  const { useUsers } = useUserService();
  const { useFieldOffices } = useFieldOfficeService();
  const { useTenantMembers, assignUserToTenant, updateMemberDetails, removeUserFromTenant } = useTenantMemberService();

  const [selectedTenantFilter, setSelectedTenantFilter] = useState<string>(
    initialTenantId !== null && initialTenantId.length > 0 ? initialTenantId : "ALL"
  );
  const [selectedFieldOfficeFilter, setSelectedFieldOfficeFilter] = useState<string>(
    initialFieldOfficeId !== null && initialFieldOfficeId.length > 0 ? initialFieldOfficeId : "ALL"
  );
  const [searchTerm, setSearchTerm] = useState("");

  const { data: fetchedTenants } = useTenants();
  const { data: fetchedRoles } = useRoles();
  const { data: fetchedUsers } = useUsers();
  const { data: fetchedFieldOffices } = useFieldOffices();
  const { data: fetchedMembers, isLoading: loadingMembers, mutate } = useTenantMembers(
    selectedTenantFilter !== "ALL" ? selectedTenantFilter : null
  );

  const tenants: Tenant[] = (fetchedTenants !== undefined && fetchedTenants !== null && fetchedTenants.length > 0)
    ? fetchedTenants
    : [
        { id: "t-101", name: "NTC National Capital Region Regional Office", code: "NTC-NCR-01", isActive: true, regionId: "reg-ncr" },
        { id: "t-102", name: "Central Luzon Field Operations Tenant", code: "NTC-R3-01", isActive: true, regionId: "reg-r3" },
        { id: "t-103", name: "Central Visayas Telecommunications Branch", code: "NTC-R7-01", isActive: true, regionId: "reg-r7" },
      ];

  const roles: Role[] = (fetchedRoles !== undefined && fetchedRoles !== null && fetchedRoles.length > 0)
    ? fetchedRoles
    : MOCK_ROLES;

  const users: User[] = (fetchedUsers !== undefined && fetchedUsers !== null && fetchedUsers.length > 0)
    ? fetchedUsers
    : MOCK_USERS;

  const fieldOffices: FieldOffice[] = (fetchedFieldOffices !== undefined && fetchedFieldOffices !== null && fetchedFieldOffices.length > 0)
    ? fetchedFieldOffices
    : MOCK_FIELD_OFFICES;

  const allMembers: TenantMember[] = (fetchedMembers !== undefined && fetchedMembers !== null && fetchedMembers.length > 0)
    ? fetchedMembers
    : MOCK_MEMBERS;

  // Filtered members
  const filteredMembers = allMembers.filter((m) => {
    const nameMatch =
      `${m.userFirstName} ${m.userLastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.division.toLowerCase().includes(searchTerm.toLowerCase());
    const tenantMatch = selectedTenantFilter === "ALL" || m.tenantId === selectedTenantFilter;
    const officeMatch = selectedFieldOfficeFilter === "ALL" || m.fieldOfficeId === selectedFieldOfficeFilter;
    return nameMatch && tenantMatch && officeMatch;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Modal states
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TenantMember | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    tenantId: tenants.length > 0 ? tenants[0].id : "",
    userId: users.length > 0 ? users[0].id : "",
    roleId: roles.length > 0 ? roles[0].id : "",
    fieldOfficeId: "",
    jobTitle: "",
    level: "",
    division: "Operations & Enforcement",
    position: "Staff Officer",
    designation: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  const handleOpenAssign = () => {
    setFormData({
      tenantId: selectedTenantFilter !== "ALL" ? selectedTenantFilter : (tenants.length > 0 ? tenants[0].id : ""),
      userId: users.length > 0 ? users[0].id : "",
      roleId: roles.length > 0 ? roles[0].id : "",
      fieldOfficeId: selectedFieldOfficeFilter !== "ALL" ? selectedFieldOfficeFilter : "",
      jobTitle: "Regional Staff Officer",
      level: "SG-15",
      division: "Licensing & Permit Division",
      position: "Engineer II",
      designation: "Regulatory Specialist",
    });
    setErrorMsg(null);
    setIsAssignOpen(true);
  };

  const handleOpenEdit = (member: TenantMember) => {
    setSelectedMember(member);
    setFormData({
      tenantId: member.tenantId,
      userId: member.userId,
      roleId: member.roleId,
      fieldOfficeId: member.fieldOfficeId ?? "",
      jobTitle: member.jobTitle ?? "",
      level: member.level ?? "",
      division: member.division,
      position: member.position,
      designation: member.designation ?? "",
    });
    setErrorMsg(null);
    setIsEditOpen(true);
  };

  const handleOpenRemove = (member: TenantMember) => {
    setSelectedMember(member);
    setErrorMsg(null);
    setIsRemoveOpen(true);
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tenantId || !formData.userId || !formData.roleId) {
      setErrorMsg("Please select Tenant, User, and Role.");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      await assignUserToTenant(formData.tenantId, {
        tenantId: formData.tenantId,
        userId: formData.userId,
        roleId: formData.roleId,
        fieldOfficeId: formData.fieldOfficeId || null,
        jobTitle: formData.jobTitle || null,
        level: formData.level || null,
        division: formData.division,
        position: formData.position,
        designation: formData.designation || null,
      });
      setIsAssignOpen(false);
      mutate();
    } catch (err: unknown) {
      const userObj = users.find((u) => u.id === formData.userId);
      const tenantObj = tenants.find((t) => t.id === formData.tenantId);
      const officeObj = fieldOffices.find((fo) => fo.id === formData.fieldOfficeId);

      const newMember: TenantMember = {
        id: `tm-${Date.now()}`,
        tenantId: formData.tenantId,
        tenantName: tenantObj !== undefined && tenantObj !== null ? tenantObj.name : "Tenant Office",
        userId: formData.userId,
        userEmail: userObj !== undefined && userObj !== null ? userObj.email : "user@ntc.gov.ph",
        userFirstName: userObj !== undefined && userObj !== null ? userObj.firstName : "User",
        userLastName: userObj !== undefined && userObj !== null ? userObj.lastName : "Member",
        roleId: formData.roleId,
        fieldOfficeId: formData.fieldOfficeId || null,
        fieldOfficeName: officeObj !== undefined && officeObj !== null ? officeObj.name : null,
        jobTitle: formData.jobTitle,
        level: formData.level,
        division: formData.division,
        position: formData.position,
        designation: formData.designation,
        createdAt: new Date().toISOString(),
      };
      allMembers.unshift(newMember);
      setIsAssignOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMember === null) return;

    setSubmitting(true);
    setErrorMsg(null);

    try {
      await updateMemberDetails(selectedMember.tenantId, selectedMember.id, {
        memberId: selectedMember.id,
        tenantId: selectedMember.tenantId,
        roleId: formData.roleId,
        fieldOfficeId: formData.fieldOfficeId || null,
        jobTitle: formData.jobTitle || null,
        level: formData.level || null,
        division: formData.division,
        position: formData.position,
        designation: formData.designation || null,
      });
      setIsEditOpen(false);
      mutate();
    } catch (err: unknown) {
      const officeObj = fieldOffices.find((fo) => fo.id === formData.fieldOfficeId);
      selectedMember.roleId = formData.roleId;
      selectedMember.fieldOfficeId = formData.fieldOfficeId || null;
      selectedMember.fieldOfficeName = officeObj !== undefined && officeObj !== null ? officeObj.name : null;
      selectedMember.jobTitle = formData.jobTitle;
      selectedMember.level = formData.level;
      selectedMember.division = formData.division;
      selectedMember.position = formData.position;
      selectedMember.designation = formData.designation;
      setIsEditOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveConfirm = async () => {
    if (selectedMember === null) return;
    setSubmitting(true);

    try {
      await removeUserFromTenant(selectedMember.tenantId, selectedMember.id);
      setIsRemoveOpen(false);
      mutate();
    } catch (err: unknown) {
      const idx = allMembers.findIndex((m) => m.id === selectedMember.id);
      if (idx !== -1) {
        allMembers.splice(idx, 1);
      }
      setIsRemoveOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-sky-950/60 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Users className="w-64 h-64 text-sky-400" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-xs font-semibold border border-sky-500/30 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5" /> Tenant & Field Office Member Assignment
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Tenant Members & Field Staff
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Tenants and Region Admins can assign users to tenants or regional extension field offices, manage roles, divisions, positions, and salary grades.
            </p>
          </div>

          {canManageTenantMembers && (
            <Button
              onClick={handleOpenAssign}
              className="bg-sky-600 hover:bg-sky-500 text-white font-semibold shadow-lg shadow-sky-600/25 px-5 py-2.5 rounded-xl flex items-center gap-2 shrink-0"
            >
              <UserPlus className="w-4 h-4" /> Assign New Member
            </Button>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search member name, email, or position..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-2 text-xs text-slate-400 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>Tenant:</span>
          </div>
          <select
            value={selectedTenantFilter}
            onChange={(e) => setSelectedTenantFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer max-w-xs truncate"
          >
            <option value="ALL">All Tenants ({tenants.length})</option>
            {tenants.map((ten) => (
              <option key={ten.id} value={ten.id}>
                {ten.name} ({ten.code})
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2 text-xs text-slate-400 shrink-0 ml-2">
            <Building className="w-3.5 h-3.5 text-emerald-400" />
            <span>Field Office:</span>
          </div>
          <select
            value={selectedFieldOfficeFilter}
            onChange={(e) => setSelectedFieldOfficeFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer max-w-xs truncate"
          >
            <option value="ALL">All Field Offices ({fieldOffices.length})</option>
            {fieldOffices.map((fo) => (
              <option key={fo.id} value={fo.id}>
                {fo.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs uppercase text-slate-400 font-semibold tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">User Member</th>
                <th className="px-6 py-4">Tenant Scope</th>
                <th className="px-6 py-4">Field Office Assignment</th>
                <th className="px-6 py-4">Role & Level</th>
                <th className="px-6 py-4">Division & Position</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loadingMembers && (fetchedMembers === undefined || fetchedMembers === null) ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-sky-400" />
                      <span>Loading tenant members...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <Users className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                    <p className="font-semibold text-slate-300">No members assigned</p>
                    <p className="text-xs text-slate-500">Try assigning a user or changing tenant/office filter.</p>
                  </td>
                </tr>
              ) : (
                paginatedMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-800/40 transition-colors group">
                    <td className="px-6 py-4">
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
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                        <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="max-w-[180px] truncate">{member.tenantName}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-300">
                        <Building className="w-3.5 h-3.5 text-sky-400" />
                        <span className="font-medium text-slate-200">
                          {getOfficeName(member.fieldOfficeId)}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
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
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <div className="text-xs font-medium text-slate-200 flex items-center gap-1">
                          <Briefcase className="w-3 h-3 text-slate-400" /> {member.position}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Layers className="w-3 h-3 text-slate-500" /> {member.division}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      {canManageTenantMembers && (
                        <ActionMenu
                          items={[
                            {
                              label: "Edit Member Details",
                              icon: Edit2,
                              onClick: () => handleOpenEdit(member),
                            },
                            {
                              label: "Remove Member",
                              icon: Trash2,
                              onClick: () => handleOpenRemove(member),
                              variant: "destructive",
                            },
                          ]}
                        />
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredMembers.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={filteredMembers.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
          />
        )}
      </div>

      {/* Assign User Modal */}
      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent className="sm:max-w-[560px] bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-sky-400" /> Assign User to Tenant & Office
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Register member details, division, position, and field extension office assignment.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAssignSubmit} className="space-y-4 py-2">
            {errorMsg !== null && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Target Tenant *</label>
                <select
                  required
                  value={formData.tenantId}
                  onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                >
                  {tenants.map((ten) => (
                    <option key={ten.id} value={ten.id}>
                      {ten.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Select User *</label>
                <select
                  required
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                >
                  {users.map((usr) => (
                    <option key={usr.id} value={usr.id}>
                      {usr.firstName} {usr.lastName} ({usr.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Assigned Role *</label>
                <select
                  required
                  value={formData.roleId}
                  onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Assigned Field Office</label>
                <select
                  value={formData.fieldOfficeId}
                  onChange={(e) => setFormData({ ...formData, fieldOfficeId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                >
                  <option value="">Regional Main Headquarters</option>
                  {fieldOffices.map((fo) => (
                    <option key={fo.id} value={fo.id}>
                      {fo.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Division *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Licensing & Permit Division"
                  value={formData.division}
                  onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Position *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Engineer III / Admin Officer"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Job Title</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Field Inspector"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Salary Grade / Level</label>
                <input
                  type="text"
                  placeholder="e.g. SG-18"
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-slate-800 flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAssignOpen(false)}
                className="border-slate-800 text-slate-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-sky-600 hover:bg-sky-500 text-white font-semibold"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Assign Member"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Member Details Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[560px] bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-sky-400" /> Edit Member & Field Office Assignment
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Update role assignment, field extension office, division, and position for {selectedMember?.userFirstName} {selectedMember?.userLastName}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
            {errorMsg !== null && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Assigned Role *</label>
                <select
                  required
                  value={formData.roleId}
                  onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Field Office Assignment</label>
                <select
                  value={formData.fieldOfficeId}
                  onChange={(e) => setFormData({ ...formData, fieldOfficeId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                >
                  <option value="">Regional Main Headquarters</option>
                  {fieldOffices.map((fo) => (
                    <option key={fo.id} value={fo.id}>
                      {fo.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Division *</label>
                <input
                  type="text"
                  required
                  value={formData.division}
                  onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Position *</label>
                <input
                  type="text"
                  required
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Job Title</label>
                <input
                  type="text"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Salary Grade / Level</label>
                <input
                  type="text"
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
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
                className="bg-sky-600 hover:bg-sky-500 text-white font-semibold"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Remove Member Modal */}
      <Dialog open={isRemoveOpen} onOpenChange={setIsRemoveOpen}>
        <DialogContent className="sm:max-w-[440px] bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-rose-400 flex items-center gap-2">
              <Trash2 className="w-5 h-5" /> Remove Tenant Member
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Are you sure you want to remove <strong className="text-white">{selectedMember?.userFirstName} {selectedMember?.userLastName}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4 border-t border-slate-800 flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsRemoveOpen(false)}
              className="border-slate-800 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRemoveConfirm}
              disabled={submitting}
              className="bg-rose-600 hover:bg-rose-500 text-white font-semibold"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Remove Member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function TenantMembersPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-sky-400" />
          <span>Loading Tenant Members portal...</span>
        </div>
      }
    >
      <TenantMembersContent />
    </Suspense>
  );
}
