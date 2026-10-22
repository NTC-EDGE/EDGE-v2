"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Users,
  UserPlus,
  Mail,
  ShieldCheck,
  Building,
  Edit2,
  Trash2,
  Loader2,
  Eye,
  UserCheck,
  Key,
  Lock,
  EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActionMenu } from "@/components/ui/action-menu";
import { SearchableSelect, SelectOption } from "@/components/ui/searchable-select";
import { showToast, getErrorMessage } from "@/components/ui/toast-notification";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tenant, TenantMember, Role, FieldOffice, User } from "@edge/api";
import { useTenantMemberService } from "@/services/tenantMemberService";
import { useFieldOfficeService } from "@/services/fieldOfficeService";
import { useRoleService } from "@/services/roleService";
import { useUserService } from "@/services/userService";
import { useAdminScope } from "@/lib/admin-scope-context";

interface MembersTabProps {
  currentTenant: Tenant;
  fieldOfficesList: FieldOffice[];
  showToast?: (msg: string) => void;
}

interface NewEmployeeFormData {
  email: string;
  firstName: string;
  lastName: string;
  middleName: string;
  suffix: string;
  contactNumber: string;
  roleId: string;
  fieldOfficeId: string;
  jobTitle: string;
  level: string;
  division: string;
  position: string;
  designation: string;
  provisioningMethod: "email" | "manual";
  password: string;
}

function isRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null;
}

function isUser(val: unknown): val is User {
  return isRecord(val) && typeof val.id === "string";
}

function extractUsers(response: unknown): User[] {
  if (Array.isArray(response)) {
    return response.filter(isUser);
  }
  if (isRecord(response)) {
    if (Array.isArray(response.data)) {
      return response.data.filter(isUser);
    }
    if (Array.isArray(response.items)) {
      return response.items.filter(isUser);
    }
  }
  return [];
}

export function MembersTab({ currentTenant, fieldOfficesList }: MembersTabProps) {
  const tenantId = currentTenant.id;
  const { canManageTenantMembers } = useAdminScope();
  const { useTenantMembers, useMemberDetails, assignUserToTenant, updateMemberDetails, removeUserFromTenant } = useTenantMemberService();
  const { useFieldOffices } = useFieldOfficeService();
  const { useRoles } = useRoleService();
  const { useUsers, createUser } = useUserService();

  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [addMode, setAddMode] = useState<"create" | "assign">("create");
  const [isEditMemberOpen, setIsEditMemberOpen] = useState(false);
  const [isRemoveMemberOpen, setIsRemoveMemberOpen] = useState(false);
  const [isViewMemberOpen, setIsViewMemberOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TenantMember | null>(null);
  const [viewingMemberId, setViewingMemberId] = useState<string | null>(null);

  const isFormOpen = isAddEmployeeOpen || isEditMemberOpen;
  const isAssignMode = isAddEmployeeOpen && addMode === "assign";

  const { data: fetchedMembers, mutate: mutateMembers, isLoading: loadingMembers } = useTenantMembers(tenantId);
  const { data: fetchedRoles, isLoading: loadingRoles } = useRoles(isFormOpen ? tenantId : null);
  const { data: allUsers, isLoading: loadingUsers } = useUsers(isAssignMode);
  const rolesList: Role[] = fetchedRoles ?? [];

  const { data: localFieldOffices, isLoading: loadingFieldOffices } = useFieldOffices(isFormOpen ? tenantId : null);
  const activeFieldOfficesList = localFieldOffices ?? [];

  const { data: memberDetails, isLoading: loadingMemberDetails } = useMemberDetails(
    tenantId,
    viewingMemberId
  );

  const handleOpenViewMember = (member: TenantMember) => {
    setViewingMemberId(member.id);
    setIsViewMemberOpen(true);
  };

  // Form state for creating a new employee account (with automatic tenant membership)
  const [newEmployeeData, setNewEmployeeData] = useState<NewEmployeeFormData>({
    email: "",
    firstName: "",
    lastName: "",
    middleName: "",
    suffix: "",
    contactNumber: "",
    roleId: "",
    fieldOfficeId: "",
    jobTitle: "",
    level: "",
    division: "",
    position: "",
    designation: "",
    provisioningMethod: "email",
    password: "",
  });

  // Form state for assigning an existing user or editing an existing member
  const [memberFormData, setMemberFormData] = useState({
    userId: "",
    roleId: "",
    fieldOfficeId: "",
    jobTitle: "",
    level: "",
    division: "",
    position: "",
    designation: "",
  });

  const tenantMembersList: TenantMember[] = fetchedMembers ?? [];
  const userList: User[] = useMemo(() => extractUsers(allUsers), [allUsers]);

  // Form options
  const userOptions: SelectOption[] = useMemo(() => {
    return userList.map((u) => {
      const isAlreadyMember = tenantMembersList.some((tm) => tm.userId === u.id);
      const fullName = `${u.firstName || ""} ${u.lastName || ""}`.trim() || "Platform User";
      return {
        value: u.id,
        label: `${fullName} (${u.email || "No email"})`,
        description: u.email ? `Email: ${u.email}` : `User ID: ${u.id.substring(0, 8)}...`,
        badge: isAlreadyMember ? "Assigned" : undefined,
        disabled: isAlreadyMember,
      };
    });
  }, [userList, tenantMembersList]);

  const roleOptions: SelectOption[] = useMemo(() => {
    return rolesList.map((r) => ({
      value: r.id,
      label: r.name,
      description: r.description || undefined,
    }));
  }, [rolesList]);

  const fieldOfficeOptions: SelectOption[] = useMemo(() => {
    return (activeFieldOfficesList || []).map((fo) => {
      const details = [fo.provinceName, fo.address].filter(Boolean).join(" • ");
      return {
        value: fo.id,
        label: fo.code ? `${fo.name} (${fo.code})` : fo.name,
        description: details || undefined,
        badge: fo.isActive ? "Active" : "Inactive",
      };
    });
  }, [activeFieldOfficesList]);

  // Sync default roleId once roles are fetched on-demand
  useEffect(() => {
    if (rolesList.length > 0) {
      setNewEmployeeData((prev) => (prev.roleId ? prev : { ...prev, roleId: rolesList[0].id }));
      setMemberFormData((prev) => (prev.roleId ? prev : { ...prev, roleId: rolesList[0].id }));
    }
  }, [rolesList]);

  // Sync default userId once users are fetched in assign mode
  useEffect(() => {
    if (userOptions.length > 0) {
      const firstAvailable = userOptions.find((u) => !u.disabled);
      if (firstAvailable) {
        setMemberFormData((prev) => (prev.userId ? prev : { ...prev, userId: firstAvailable.value }));
      }
    }
  }, [userOptions]);

  const handleOpenAddEmployee = () => {
    const defaultRoleId = rolesList.length > 0 ? rolesList[0].id : "";
    const availableUser = userOptions.find((u) => !u.disabled);

    setAddMode("create");
    setShowPassword(false);

    setNewEmployeeData({
      email: "",
      firstName: "",
      lastName: "",
      middleName: "",
      suffix: "",
      contactNumber: "",
      roleId: defaultRoleId,
      fieldOfficeId: "",
      jobTitle: "",
      level: "",
      division: "",
      position: "",
      designation: "",
      provisioningMethod: "email",
      password: "",
    });

    setMemberFormData({
      userId: availableUser ? availableUser.value : "",
      roleId: defaultRoleId,
      fieldOfficeId: "",
      jobTitle: "",
      level: "",
      division: "",
      position: "",
      designation: "",
    });

    setIsAddEmployeeOpen(true);
  };

  const handleOpenEditMember = (member: TenantMember) => {
    setSelectedMember(member);
    setMemberFormData({
      userId: member.userId,
      roleId: member.roleId,
      fieldOfficeId: member.fieldOfficeId ?? "",
      jobTitle: member.jobTitle ?? "",
      level: member.level ?? "",
      division: member.division ?? "",
      position: member.position ?? "",
      designation: member.designation ?? "",
    });
    setIsEditMemberOpen(true);
  };

  const handleOpenRemoveMember = (member: TenantMember) => {
    setSelectedMember(member);
    setIsRemoveMemberOpen(true);
  };

  const handleAddEmployeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (addMode === "create") {
      // 1. Validation for New Account Creation
      if (!newEmployeeData.email.trim() || !newEmployeeData.firstName.trim() || !newEmployeeData.lastName.trim()) {
        showToast.error("Email address, first name, and last name are required.");
        return;
      }
      if (!newEmployeeData.roleId) {
        showToast.error("Please select a security role for the employee.");
        return;
      }
      if (!newEmployeeData.division.trim() || !newEmployeeData.position.trim()) {
        showToast.error("Division and position are required.");
        return;
      }

      const matchedRole = rolesList.find((r) => r.id === newEmployeeData.roleId);
      const isEmailInvitation = newEmployeeData.provisioningMethod === "email";
      const manualPassword =
        newEmployeeData.provisioningMethod === "manual" && newEmployeeData.password.trim().length > 0
          ? newEmployeeData.password.trim()
          : undefined;

      setIsSubmitting(true);
      try {
        await createUser({
          email: newEmployeeData.email.trim().toLowerCase(),
          firstName: newEmployeeData.firstName.trim(),
          lastName: newEmployeeData.lastName.trim(),
          middleName: newEmployeeData.middleName.trim() || undefined,
          suffix: newEmployeeData.suffix.trim() || undefined,
          contactNumber: newEmployeeData.contactNumber.trim() || undefined,
          roleKey: matchedRole?.key || "evaluator",
          tenantId: tenantId,
          fieldOfficeId: newEmployeeData.fieldOfficeId || undefined,
          jobTitle: newEmployeeData.jobTitle.trim() || undefined,
          level: newEmployeeData.level.trim() || undefined,
          division: newEmployeeData.division.trim(),
          position: newEmployeeData.position.trim(),
          designation: newEmployeeData.designation.trim() || undefined,
          sendInvitation: isEmailInvitation,
          password: manualPassword,
        });

        await mutateMembers();
        setIsAddEmployeeOpen(false);

        const fullName = `${newEmployeeData.firstName} ${newEmployeeData.lastName}`.trim();
        if (isEmailInvitation) {
          showToast.success(`Employee account created for ${fullName}. An invitation email was sent to ${newEmployeeData.email}.`);
        } else {
          showToast.success(`Employee account created for ${fullName} and automatically assigned to ${currentTenant.name}.`);
        }
      } catch (err: unknown) {
        showToast.error(getErrorMessage(err, "Failed to create employee account."));
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // 2. Assigning Existing User Account
      if (!memberFormData.userId || !memberFormData.roleId) {
        showToast.error("Please select a user account and security role.");
        return;
      }

      setIsSubmitting(true);
      try {
        await assignUserToTenant(tenantId, {
          tenantId: tenantId,
          userId: memberFormData.userId,
          roleId: memberFormData.roleId,
          fieldOfficeId: memberFormData.fieldOfficeId || null,
          jobTitle: memberFormData.jobTitle || null,
          level: memberFormData.level || null,
          division: memberFormData.division,
          position: memberFormData.position,
          designation: memberFormData.designation || null,
        });
        await mutateMembers();
        setIsAddEmployeeOpen(false);
        showToast.success("Employee assigned to tenant branch successfully!");
      } catch (err: unknown) {
        showToast.error(getErrorMessage(err, "Failed to assign employee to tenant."));
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleEditMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMember === null) return;

    setIsSubmitting(true);
    try {
      await updateMemberDetails(tenantId, selectedMember.id, {
        memberId: selectedMember.id,
        tenantId: tenantId,
        roleId: memberFormData.roleId,
        fieldOfficeId: memberFormData.fieldOfficeId || null,
        jobTitle: memberFormData.jobTitle || null,
        level: memberFormData.level || null,
        division: memberFormData.division,
        position: memberFormData.position,
        designation: memberFormData.designation || null,
      });
      await mutateMembers();
      setIsEditMemberOpen(false);
      showToast.success("Employee details updated successfully.");
    } catch (err: unknown) {
      showToast.error(getErrorMessage(err, "Failed to update employee details."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMemberConfirm = async () => {
    if (selectedMember === null) return;

    setIsSubmitting(true);
    try {
      await removeUserFromTenant(tenantId, selectedMember.id);
      await mutateMembers();
      setIsRemoveMemberOpen(false);
      showToast.success("Employee unassigned from tenant successfully.");
    } catch (err: unknown) {
      showToast.error(getErrorMessage(err, "Failed to unassign employee."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Tenant Employees</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Employees assigned to this regional administrative tenant branch.</p>
        </div>
        {canManageTenantMembers && (
          <Button
            onClick={handleOpenAddEmployee}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Employee</span>
          </Button>
        )}
      </div>

      {loadingMembers && !fetchedMembers ? (
        <div className="p-12 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center justify-center border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/40">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
          <span className="text-xs font-semibold">Loading assigned employees...</span>
        </div>
      ) : tenantMembersList.length === 0 ? (
        <div className="p-12 text-center flex flex-col items-center justify-center border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/40 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 border border-indigo-500/20 shadow-sm">
            <Users className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">No Employees Assigned</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
            There are currently no employees assigned to this regional tenant office. Click the button above to create a new employee account.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-w-0">
          {tenantMembersList.map((member) => (
            <div
              key={member.id}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors space-y-3 shadow-sm min-w-0 overflow-hidden"
            >
              <div className="flex items-start justify-between gap-2 min-w-0">
                <div className="flex items-center gap-3 min-w-0 overflow-hidden">
                  <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow shrink-0">
                    {(member.userFirstName || "U").charAt(0)}{(member.userLastName || "S").charAt(0)}
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{member.userFirstName} {member.userLastName}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate">
                      <Mail className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
                      <span className="truncate">{member.userEmail}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20 items-center gap-1 shrink-0">
                    <ShieldCheck className="w-3 h-3 text-sky-500 dark:text-sky-400 shrink-0" /> <span className="truncate max-w-[90px]">{member.jobTitle ?? "Employee"}</span>
                  </span>

                  <ActionMenu
                    items={[
                      {
                        label: "View Employee Details",
                        icon: Eye,
                        onClick: () => handleOpenViewMember(member),
                      },
                      ...(canManageTenantMembers
                        ? [
                            {
                              label: "Edit Employee Details",
                              icon: Edit2,
                              onClick: () => handleOpenEditMember(member),
                            },
                            {
                              label: "Unassign Employee",
                              icon: Trash2,
                              onClick: () => handleOpenRemoveMember(member),
                              variant: "destructive" as const,
                            },
                          ]
                        : []),
                    ]}
                  />
                </div>
              </div>

              <div className="sm:hidden">
                <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20 items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-sky-500 dark:text-sky-400 shrink-0" /> {member.jobTitle ?? "Employee"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800/80 text-xs min-w-0">
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold block truncate">Division & Position</span>
                  <span className="text-slate-800 dark:text-slate-300 font-medium block truncate">{member.position}</span>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px] truncate">{member.division}</span>
                </div>

                <div className="min-w-0">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold block truncate">Office Location</span>
                  <span className="text-slate-800 dark:text-slate-300 font-medium flex items-center gap-1 truncate">
                    <Building className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
                    <span className="truncate">{member.fieldOfficeName ?? "Headquarters"}</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Create Employee Modal */}
      <Dialog open={isAddEmployeeOpen} onOpenChange={setIsAddEmployeeOpen}>
        <DialogContent className="w-[calc(100vw-24px)] sm:w-full sm:max-w-[620px] max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white p-5 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
              {addMode === "create" ? "Create Employee Account" : "Assign Existing Platform User"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
              {addMode === "create"
                ? `Create a new staff user account via Clerk with automatic membership in ${currentTenant.name}.`
                : `Select an existing platform user account and configure their deployment in ${currentTenant.name}.`}
            </DialogDescription>
          </DialogHeader>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 mt-2">
            <button
              type="button"
              onClick={() => setAddMode("create")}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                addMode === "create"
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Create New Employee Account
            </button>
            <button
              type="button"
              onClick={() => setAddMode("assign")}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                addMode === "assign"
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Assign Existing User
            </button>
          </div>

          <form onSubmit={handleAddEmployeeSubmit} className="space-y-4 pt-2">
            {addMode === "create" ? (
              <>
                {/* Basic Personal Information */}
                <div className="space-y-3 p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Basic Information
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        First Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="First Name"
                        value={newEmployeeData.firstName}
                        onChange={(e) => setNewEmployeeData({ ...newEmployeeData, firstName: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Last Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Last Name"
                        value={newEmployeeData.lastName}
                        onChange={(e) => setNewEmployeeData({ ...newEmployeeData, lastName: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Middle Name</label>
                      <input
                        type="text"
                        placeholder="Middle Name"
                        value={newEmployeeData.middleName}
                        onChange={(e) => setNewEmployeeData({ ...newEmployeeData, middleName: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Suffix</label>
                      <input
                        type="text"
                        placeholder="e.g. Jr., III"
                        value={newEmployeeData.suffix}
                        onChange={(e) => setNewEmployeeData({ ...newEmployeeData, suffix: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="staff.email@ntc.gov.ph"
                        value={newEmployeeData.email}
                        onChange={(e) => setNewEmployeeData({ ...newEmployeeData, email: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Contact Number</label>
                      <input
                        type="tel"
                        placeholder="+63 900 000 0000"
                        value={newEmployeeData.contactNumber}
                        onChange={(e) => setNewEmployeeData({ ...newEmployeeData, contactNumber: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Provisioning / Signup Method Selection */}
                <div className="space-y-3 p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Signup & Account Provisioning
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div
                      onClick={() => setNewEmployeeData({ ...newEmployeeData, provisioningMethod: "email" })}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        newEmployeeData.provisioningMethod === "email"
                          ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30"
                          : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Mail className={`w-4 h-4 ${newEmployeeData.provisioningMethod === "email" ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500"}`} />
                          <span className="text-xs font-bold text-slate-900 dark:text-white">Email Invitation</span>
                        </div>
                        <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${newEmployeeData.provisioningMethod === "email" ? "border-indigo-600" : "border-slate-400"}`}>
                          {newEmployeeData.provisioningMethod === "email" && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                        Dispatches an official Clerk email invitation link for the employee to choose their password.
                      </p>
                    </div>

                    <div
                      onClick={() => setNewEmployeeData({ ...newEmployeeData, provisioningMethod: "manual" })}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        newEmployeeData.provisioningMethod === "manual"
                          ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30"
                          : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Key className={`w-4 h-4 ${newEmployeeData.provisioningMethod === "manual" ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500"}`} />
                          <span className="text-xs font-bold text-slate-900 dark:text-white">Manual Setup</span>
                        </div>
                        <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${newEmployeeData.provisioningMethod === "manual" ? "border-indigo-600" : "border-slate-400"}`}>
                          {newEmployeeData.provisioningMethod === "manual" && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                        Provisions account credentials immediately without waiting for invitation email delivery.
                      </p>
                    </div>
                  </div>

                  {newEmployeeData.provisioningMethod === "manual" && (
                    <div className="space-y-1 pt-1">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                        <span>Initial Password <span className="text-slate-400 font-normal">(Optional)</span></span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Leave blank for auto-generated password (NtcStaff_XXXXX!)"
                          value={newEmployeeData.password}
                          onChange={(e) => setNewEmployeeData({ ...newEmployeeData, password: e.target.value })}
                          className="w-full px-3 py-2 pr-9 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Role and Office Assignment */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Security Role <span className="text-rose-500">*</span>
                    </label>
                    <SearchableSelect
                      value={newEmployeeData.roleId}
                      onChange={(val) => setNewEmployeeData({ ...newEmployeeData, roleId: val })}
                      options={roleOptions}
                      placeholder={loadingRoles ? "Loading security roles..." : "Select Security Role..."}
                      searchPlaceholder="Filter roles..."
                      maxHeight="max-h-48"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Field Office Assignment</label>
                    <SearchableSelect
                      value={newEmployeeData.fieldOfficeId}
                      onChange={(val) => setNewEmployeeData({ ...newEmployeeData, fieldOfficeId: val })}
                      options={fieldOfficeOptions}
                      placeholder={loadingFieldOffices ? "Loading field offices..." : "Select Field Office (Optional)..."}
                      searchPlaceholder="Filter offices..."
                      maxHeight="max-h-48"
                      clearable
                    />
                  </div>
                </div>

                {/* Employment Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Job Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Senior Spectrum Officer"
                      value={newEmployeeData.jobTitle}
                      onChange={(e) => setNewEmployeeData({ ...newEmployeeData, jobTitle: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Salary Grade Level</label>
                    <input
                      type="text"
                      placeholder="e.g. SG-18"
                      value={newEmployeeData.level}
                      onChange={(e) => setNewEmployeeData({ ...newEmployeeData, level: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Division <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Operations & Enforcement"
                      value={newEmployeeData.division}
                      onChange={(e) => setNewEmployeeData({ ...newEmployeeData, division: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Position <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Engineer III"
                      value={newEmployeeData.position}
                      onChange={(e) => setNewEmployeeData({ ...newEmployeeData, position: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Designation</label>
                  <input
                    type="text"
                    placeholder="e.g. Chief Spectrum Audit Investigator"
                    value={newEmployeeData.designation}
                    onChange={(e) => setNewEmployeeData({ ...newEmployeeData, designation: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </>
            ) : (
              <>
                {/* Assign Existing Platform User Mode */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Select User Account *</label>
                  {loadingUsers ? (
                    <div className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-500">
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                      <span>Loading platform users...</span>
                    </div>
                  ) : (
                    <SearchableSelect
                      value={memberFormData.userId}
                      onChange={(val) => setMemberFormData({ ...memberFormData, userId: val })}
                      options={userOptions}
                      placeholder="Search user by name or email..."
                      searchPlaceholder="Type name or email..."
                      maxHeight="max-h-56"
                    />
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Security Role *</label>
                    <SearchableSelect
                      value={memberFormData.roleId}
                      onChange={(val) => setMemberFormData({ ...memberFormData, roleId: val })}
                      options={roleOptions}
                      placeholder={loadingRoles ? "Loading security roles..." : "Select Security Role..."}
                      searchPlaceholder="Filter roles..."
                      maxHeight="max-h-48"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Field Office Assignment</label>
                    <SearchableSelect
                      value={memberFormData.fieldOfficeId}
                      onChange={(val) => setMemberFormData({ ...memberFormData, fieldOfficeId: val })}
                      options={fieldOfficeOptions}
                      placeholder={loadingFieldOffices ? "Loading field offices..." : "Select Field Office (Optional)..."}
                      searchPlaceholder="Filter offices..."
                      maxHeight="max-h-48"
                      clearable
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Job Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Senior Spectrum Officer"
                      value={memberFormData.jobTitle}
                      onChange={(e) => setMemberFormData({ ...memberFormData, jobTitle: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Salary Grade Level</label>
                    <input
                      type="text"
                      placeholder="e.g. SG-18"
                      value={memberFormData.level}
                      onChange={(e) => setMemberFormData({ ...memberFormData, level: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Division *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Operations & Enforcement"
                      value={memberFormData.division}
                      onChange={(e) => setMemberFormData({ ...memberFormData, division: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Position *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Engineer III"
                      value={memberFormData.position}
                      onChange={(e) => setMemberFormData({ ...memberFormData, position: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Designation</label>
                  <input
                    type="text"
                    placeholder="e.g. Chief Spectrum Audit Investigator"
                    value={memberFormData.designation}
                    onChange={(e) => setMemberFormData({ ...memberFormData, designation: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </>
            )}

            <DialogFooter className="pt-4 border-t border-slate-200 dark:border-slate-800 flex-col-reverse sm:flex-row gap-2">
              <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => setIsAddEmployeeOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || (addMode === "assign" && !memberFormData.userId)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> {addMode === "create" ? "Creating Account..." : "Assigning..."}
                  </span>
                ) : (
                  addMode === "create" ? "Create Employee Account" : "Assign Employee"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Member Modal */}
      <Dialog open={isEditMemberOpen} onOpenChange={setIsEditMemberOpen}>
        <DialogContent className="w-[calc(100vw-24px)] sm:w-full sm:max-w-[540px] max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white p-5 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-indigo-500 dark:text-indigo-400" /> Edit Employee Details
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleEditMemberSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Assigned User</label>
              <div className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-300 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-500" />
                <span>{selectedMember ? `${selectedMember.userFirstName} ${selectedMember.userLastName} (${selectedMember.userEmail})` : ""}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Security Role *</label>
                <SearchableSelect
                  value={memberFormData.roleId}
                  onChange={(val) => setMemberFormData({ ...memberFormData, roleId: val })}
                  options={roleOptions}
                  placeholder={loadingRoles ? "Loading security roles..." : "Select Security Role..."}
                  searchPlaceholder="Filter roles..."
                  maxHeight="max-h-48"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Field Office Assignment</label>
                <SearchableSelect
                  value={memberFormData.fieldOfficeId}
                  onChange={(val) => setMemberFormData({ ...memberFormData, fieldOfficeId: val })}
                  options={fieldOfficeOptions}
                  placeholder={loadingFieldOffices ? "Loading field offices..." : "Select Field Office (Optional)..."}
                  searchPlaceholder="Filter offices..."
                  maxHeight="max-h-48"
                  clearable
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Job Title</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Spectrum Officer"
                  value={memberFormData.jobTitle}
                  onChange={(e) => setMemberFormData({ ...memberFormData, jobTitle: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Salary Grade Level</label>
                <input
                  type="text"
                  placeholder="e.g. SG-18"
                  value={memberFormData.level}
                  onChange={(e) => setMemberFormData({ ...memberFormData, level: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Division *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Operations & Enforcement"
                  value={memberFormData.division}
                  onChange={(e) => setMemberFormData({ ...memberFormData, division: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Position *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Engineer III"
                  value={memberFormData.position}
                  onChange={(e) => setMemberFormData({ ...memberFormData, position: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Designation</label>
              <input
                type="text"
                placeholder="e.g. Chief Spectrum Audit Investigator"
                value={memberFormData.designation}
                onChange={(e) => setMemberFormData({ ...memberFormData, designation: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <DialogFooter className="pt-4 border-t border-slate-200 dark:border-slate-800 flex-col-reverse sm:flex-row gap-2">
              <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => setIsEditMemberOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                  </span>
                ) : (
                  "Save Employee Details"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Remove Member Modal */}
      <Dialog open={isRemoveMemberOpen} onOpenChange={setIsRemoveMemberOpen}>
        <DialogContent className="w-[calc(100vw-24px)] sm:w-full sm:max-w-[440px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white p-5 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2 text-rose-500 dark:text-rose-400">
              <Trash2 className="w-5 h-5" /> Unassign Employee
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400 text-xs">
              Are you sure you want to unassign <span className="text-slate-900 dark:text-white font-bold">{selectedMember?.userFirstName} {selectedMember?.userLastName}</span> from this tenant branch?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-4 border-t border-slate-200 dark:border-slate-800 flex-col-reverse sm:flex-row gap-2">
            <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => setIsRemoveMemberOpen(false)}>Cancel</Button>
            <Button type="button" disabled={isSubmitting} onClick={handleRemoveMemberConfirm} className="bg-rose-600 hover:bg-rose-500 text-white font-semibold">
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Unassigning...
                </span>
              ) : (
                "Unassign Employee"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Member Details Modal */}
      <Dialog open={isViewMemberOpen} onOpenChange={setIsViewMemberOpen}>
        <DialogContent className="w-[calc(100vw-24px)] sm:w-full sm:max-w-[550px] max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white p-5 sm:p-6 rounded-2xl">
          <DialogHeader className="pb-4 border-b border-slate-200 dark:border-slate-800/80">
            <DialogTitle className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-sky-500 dark:text-sky-400" /> Employee Details
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400 text-xs">
              Detailed employment and deployment profile information.
            </DialogDescription>
          </DialogHeader>

          {loadingMemberDetails && !memberDetails ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500 dark:text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-sky-500 dark:text-sky-400 mb-3" />
              <span className="text-xs font-semibold">Fetching details from API...</span>
            </div>
          ) : (memberDetails !== undefined && memberDetails !== null) || (viewingMemberId !== null && tenantMembersList.find((m) => m.id === viewingMemberId) !== undefined) ? (() => {
            const fallbackMember = viewingMemberId !== null ? tenantMembersList.find((m) => m.id === viewingMemberId) : undefined;
            const displayedMember = (memberDetails !== undefined && memberDetails !== null)
              ? memberDetails
              : fallbackMember;
            if (!displayedMember) return null;
            return (
              <div className="space-y-6 pt-4">
                {/* Header profile details */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/50">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xl shadow-lg shrink-0">
                    {displayedMember.userFirstName.charAt(0)}{displayedMember.userLastName.charAt(0)}
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                      {displayedMember.userFirstName} {displayedMember.userLastName}
                    </h4>
                    <p className="text-xs text-sky-600 dark:text-sky-400 font-semibold">{displayedMember.jobTitle ?? "Employee"}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" /> {displayedMember.userEmail}
                    </p>
                  </div>
                </div>

                {/* Grid properties */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 bg-slate-50 dark:bg-slate-950/30 p-3 rounded-lg border border-slate-200 dark:border-slate-800/40">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block tracking-wider">Salary Grade Level</span>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{displayedMember.level ?? "N/A"}</span>
                  </div>
                  <div className="space-y-1 bg-slate-50 dark:bg-slate-950/30 p-3 rounded-lg border border-slate-200 dark:border-slate-800/40">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block tracking-wider">Security Role</span>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {rolesList.find(r => r.id === displayedMember.roleId)?.name ?? "Member"}
                    </span>
                  </div>
                  <div className="space-y-1 bg-slate-50 dark:bg-slate-950/30 p-3 rounded-lg border border-slate-200 dark:border-slate-800/40">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block tracking-wider">Division</span>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{displayedMember.division}</span>
                  </div>
                  <div className="space-y-1 bg-slate-50 dark:bg-slate-950/30 p-3 rounded-lg border border-slate-200 dark:border-slate-800/40">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block tracking-wider">Position</span>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{displayedMember.position}</span>
                  </div>
                </div>

                <div className="space-y-4 border-t border-slate-200 dark:border-slate-800/60 pt-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block tracking-wider">Designation</span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/20 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800/30">
                      {displayedMember.designation ?? "No specific designation assigned."}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block tracking-wider">Field Office Assignment</span>
                    <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/20 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800/30">
                      <Building className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                      <span>{displayedMember.fieldOfficeName ?? "Regional Headquarters / Unassigned"}</span>
                    </div>
                  </div>
                </div>

                {/* Metadata if available */}
                {(displayedMember.createdAt || displayedMember.createdBy) && (
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800/40 text-[10px] text-slate-500 flex flex-wrap justify-between gap-2">
                    {displayedMember.createdAt && (
                      <span>Created: {new Date(displayedMember.createdAt).toLocaleDateString()}</span>
                    )}
                    {displayedMember.createdBy && (
                      <span>By: {displayedMember.createdBy}</span>
                    )}
                  </div>
                )}

                <DialogFooter className="pt-4 border-t border-slate-200 dark:border-slate-800">
                  <Button type="button" onClick={() => setIsViewMemberOpen(false)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white font-semibold">
                    Close
                  </Button>
                </DialogFooter>
              </div>
            );
          })() : (
            <div className="py-8 text-center text-slate-500 dark:text-slate-400 text-sm">
              Failed to load employee details.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
