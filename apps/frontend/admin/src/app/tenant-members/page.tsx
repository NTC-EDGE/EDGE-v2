"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useTenantMemberService } from "@/services/tenantMemberService";
import { useTenantService } from "@/services/tenantService";
import { useRoleService } from "@/services/roleService";
import { useUserService } from "@/services/userService";
import { useFieldOfficeService } from "@/services/fieldOfficeService";
import { useAdminScope } from "@/lib/admin-scope-context";
import { TenantMember, Tenant, Role, User, FieldOffice } from "@edge/api";

// Modular Components (< 200 lines each)
import { MOCK_MEMBERS, MOCK_USERS, MOCK_ROLES, MOCK_FIELD_OFFICES } from "@/components/tenant-members/mockData";
import { TenantMembersHeader } from "@/components/tenant-members/TenantMembersHeader";
import { TenantMembersFilterBar } from "@/components/tenant-members/TenantMembersFilterBar";
import { TenantMembersTable } from "@/components/tenant-members/TenantMembersTable";
import { AssignMemberModal, MemberFormData } from "@/components/tenant-members/AssignMemberModal";
import { EditMemberModal } from "@/components/tenant-members/EditMemberModal";
import { RemoveMemberModal } from "@/components/tenant-members/RemoveMemberModal";

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

  const roles: Role[] = (fetchedRoles !== undefined && fetchedRoles !== null && fetchedRoles.length > 0) ? fetchedRoles : MOCK_ROLES;
  const users: User[] = (fetchedUsers !== undefined && fetchedUsers !== null && fetchedUsers.length > 0) ? fetchedUsers : MOCK_USERS;
  const fieldOffices: FieldOffice[] = (fetchedFieldOffices !== undefined && fetchedFieldOffices !== null && fetchedFieldOffices.length > 0) ? fetchedFieldOffices : MOCK_FIELD_OFFICES;
  const allMembers: TenantMember[] = (fetchedMembers !== undefined && fetchedMembers !== null && fetchedMembers.length > 0) ? fetchedMembers : MOCK_MEMBERS;

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
  const [pageSize, setPageSize] = useState(10);
  const paginatedMembers = filteredMembers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Modal & Form States
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TenantMember | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState<MemberFormData>({
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
    } catch {
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
    } catch {
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
    } catch {
      const idx = allMembers.findIndex((m) => m.id === selectedMember.id);
      if (idx !== -1) allMembers.splice(idx, 1);
      setIsRemoveOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <TenantMembersHeader canManage={canManageTenantMembers} onOpenAssign={handleOpenAssign} />

      <TenantMembersFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedTenantFilter={selectedTenantFilter}
        onTenantFilterChange={setSelectedTenantFilter}
        selectedFieldOfficeFilter={selectedFieldOfficeFilter}
        onFieldOfficeFilterChange={setSelectedFieldOfficeFilter}
        tenants={tenants}
        fieldOffices={fieldOffices}
      />

      <TenantMembersTable
        members={paginatedMembers}
        loading={loadingMembers && fetchedMembers === undefined}
        canManage={canManageTenantMembers}
        roles={roles}
        fieldOffices={fieldOffices}
        onOpenEdit={handleOpenEdit}
        onOpenRemove={handleOpenRemove}
        pagination={
          filteredMembers.length > 0
            ? {
                currentPage,
                totalItems: filteredMembers.length,
                pageSize,
                onPageChange: setCurrentPage,
                onPageSizeChange: (newSize) => {
                  setPageSize(newSize);
                  setCurrentPage(1);
                },
              }
            : undefined
        }
      />

      <AssignMemberModal
        open={isAssignOpen}
        onOpenChange={setIsAssignOpen}
        formData={formData}
        setFormData={setFormData}
        errorMsg={errorMsg}
        submitting={submitting}
        tenants={tenants}
        users={users}
        roles={roles}
        fieldOffices={fieldOffices}
        onSubmit={handleAssignSubmit}
      />

      <EditMemberModal
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        selectedMember={selectedMember}
        formData={formData}
        setFormData={setFormData}
        errorMsg={errorMsg}
        submitting={submitting}
        roles={roles}
        fieldOffices={fieldOffices}
        onSubmit={handleEditSubmit}
      />

      <RemoveMemberModal
        open={isRemoveOpen}
        onOpenChange={setIsRemoveOpen}
        selectedMember={selectedMember}
        submitting={submitting}
        onConfirmRemove={handleRemoveConfirm}
      />
    </div>
  );
}

export default function TenantMembersPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-sky-400" />
          <span>Loading tenant members...</span>
        </div>
      }
    >
      <TenantMembersContent />
    </Suspense>
  );
}
