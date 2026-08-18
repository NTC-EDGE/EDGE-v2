"use client";

import React, { useState, useMemo } from "react";
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
  Info,
  UserCheck
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
import { Tenant, TenantMember, Role, FieldOffice } from "@edge/api";
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

export function MembersTab({ currentTenant, fieldOfficesList }: MembersTabProps) {
  const tenantId = currentTenant.id;
  const { canManageTenantMembers } = useAdminScope();
  const { useTenantMembers, useMemberDetails, assignUserToTenant, updateMemberDetails, removeUserFromTenant } = useTenantMemberService();
  const { useFieldOffices } = useFieldOfficeService();
  const { useRoles } = useRoleService();
  const { useUsers } = useUserService();

  const { data: fetchedMembers, mutate: mutateMembers, isLoading: loadingMembers } = useTenantMembers(tenantId);
  const { data: fetchedRoles } = useRoles(tenantId);
  const { data: allUsers, isLoading: loadingUsers } = useUsers();
  const rolesList: Role[] = fetchedRoles ?? [];

  const [isAssignMemberOpen, setIsAssignMemberOpen] = useState(false);
  const [isEditMemberOpen, setIsEditMemberOpen] = useState(false);
  const [isRemoveMemberOpen, setIsRemoveMemberOpen] = useState(false);
  const [isViewMemberOpen, setIsViewMemberOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TenantMember | null>(null);
  const [viewingMemberId, setViewingMemberId] = useState<string | null>(null);

  const { data: localFieldOffices } = useFieldOffices(
    isAssignMemberOpen || isEditMemberOpen ? tenantId : null,
    isAssignMemberOpen || isEditMemberOpen ? currentTenant.regionId : null
  );
  const activeFieldOfficesList = localFieldOffices ?? fieldOfficesList;

  const { data: memberDetails, isLoading: loadingMemberDetails } = useMemberDetails(
    tenantId,
    viewingMemberId
  );

  const handleOpenViewMember = (member: TenantMember) => {
    setViewingMemberId(member.id);
    setIsViewMemberOpen(true);
  };

  const [memberFormData, setMemberFormData] = useState({
    userId: "",
    roleId: "",
    fieldOfficeId: "",
    jobTitle: "",
    level: "SG-18",
    division: "Licensing & Permit Division",
    position: "Engineer III",
    designation: "Spectrum Regulator",
  });

  const tenantMembersList: TenantMember[] = fetchedMembers ?? [];

  // Form options
  const userOptions: SelectOption[] = useMemo(() => {
    if (!allUsers) return [];
    return allUsers.map((u) => {
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
  }, [allUsers, tenantMembersList]);

  const roleOptions: SelectOption[] = useMemo(() => {
    return rolesList.map((r) => ({
      value: r.id,
      label: r.name,
      description: r.description || undefined,
    }));
  }, [rolesList]);

  const fieldOfficeOptions: SelectOption[] = useMemo(() => {
    return [
      { value: "", label: "Headquarters / Main Regional Office (Unassigned)" },
      ...activeFieldOfficesList.map((fo) => ({
        value: fo.id,
        label: fo.name,
        description: fo.address || undefined,
      })),
    ];
  }, [activeFieldOfficesList]);

  const handleOpenAssignMember = () => {
    const defaultRoleId = rolesList.length > 0 ? rolesList[0].id : "";
    const defaultFieldOfficeId = activeFieldOfficesList.length > 0 ? activeFieldOfficesList[0].id : "";
    const availableUser = userOptions.find((u) => !u.disabled);

    setMemberFormData({
      userId: availableUser ? availableUser.value : "",
      roleId: defaultRoleId,
      fieldOfficeId: defaultFieldOfficeId,
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
      userId: member.userId,
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
      setIsAssignMemberOpen(false);
      showToast.success("Staff member assigned to tenant branch successfully!");
    } catch (err: unknown) {
      showToast.error(getErrorMessage(err, "Failed to assign staff member to tenant."));
    } finally {
      setIsSubmitting(false);
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
      showToast.success("Member details updated successfully.");
    } catch (err: unknown) {
      showToast.error(getErrorMessage(err, "Failed to update member details."));
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
      showToast.success("Staff member unassigned from tenant successfully.");
    } catch (err: unknown) {
      showToast.error(getErrorMessage(err, "Failed to unassign member."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Assigned Tenant Members & Staff</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Personnel assigned to this regional administrative tenant branch.</p>
        </div>
        {canManageTenantMembers && (
          <Button
            onClick={handleOpenAssignMember}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Assign Staff Member</span>
          </Button>
        )}
      </div>

      {loadingMembers && !fetchedMembers ? (
        <div className="p-12 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center justify-center border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/40">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
          <span className="text-xs font-semibold">Loading assigned staff members...</span>
        </div>
      ) : tenantMembersList.length === 0 ? (
        <div className="p-12 text-center flex flex-col items-center justify-center border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/40 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 border border-indigo-500/20 shadow-sm">
            <Users className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">No Staff Members Assigned</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
            There are currently no staff officers or personnel assigned to this regional tenant office. Click the button above to assign a staff member.
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
                    <ShieldCheck className="w-3 h-3 text-sky-500 dark:text-sky-400 shrink-0" /> <span className="truncate max-w-[90px]">{member.jobTitle ?? "Staff"}</span>
                  </span>

                  <ActionMenu
                    items={[
                      {
                        label: "View Member Details",
                        icon: Eye,
                        onClick: () => handleOpenViewMember(member),
                      },
                      ...(canManageTenantMembers
                        ? [
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
                          ]
                        : []),
                    ]}
                  />
                </div>
              </div>

              <div className="sm:hidden">
                <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20 items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-sky-500 dark:text-sky-400 shrink-0" /> {member.jobTitle ?? "Staff Officer"}
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

      {/* Assign Member Modal */}
      <Dialog open={isAssignMemberOpen} onOpenChange={setIsAssignMemberOpen}>
        <DialogContent className="w-[calc(100vw-24px)] sm:w-full sm:max-w-[540px] max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white p-5 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-indigo-500 dark:text-indigo-400" /> Assign New Staff Member
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
              Select an existing platform user account and configure their regional role and office details.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAssignMemberSubmit} className="space-y-4 pt-2">
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
                  placeholder="Select Security Role..."
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
                  placeholder="Select Field Office..."
                  searchPlaceholder="Filter offices..."
                  maxHeight="max-h-48"
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
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Salary Grade Level</label>
                <input
                  type="text"
                  placeholder="e.g. SG-18"
                  value={memberFormData.level}
                  onChange={(e) => setMemberFormData({ ...memberFormData, level: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <DialogFooter className="pt-4 border-t border-slate-200 dark:border-slate-800 flex-col-reverse sm:flex-row gap-2">
              <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => setIsAssignMemberOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting || !memberFormData.userId} className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Assigning...
                  </span>
                ) : (
                  "Assign Staff Member"
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
              <Edit2 className="w-5 h-5 text-indigo-500 dark:text-indigo-400" /> Edit Member Details
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
                  placeholder="Select Security Role..."
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
                  placeholder="Select Field Office..."
                  searchPlaceholder="Filter offices..."
                  maxHeight="max-h-48"
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
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Salary Grade Level</label>
                <input
                  type="text"
                  placeholder="e.g. SG-18"
                  value={memberFormData.level}
                  onChange={(e) => setMemberFormData({ ...memberFormData, level: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  "Save Member Details"
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
              <Trash2 className="w-5 h-5" /> Unassign Staff Member
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
                "Unassign Member"
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
              <Eye className="w-5 h-5 text-sky-500 dark:text-sky-400" /> Staff Member Details
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400 text-xs">
              Detailed membership and deployment profile information.
            </DialogDescription>
          </DialogHeader>

          {loadingMemberDetails && !memberDetails ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500 dark:text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-sky-500 dark:text-sky-400 mb-3" />
              <span className="text-xs font-semibold">Fetching details from API...</span>
            </div>
          ) : (memberDetails !== undefined && memberDetails !== null) || (viewingMemberId !== null && tenantMembersList.find((m) => m.id === viewingMemberId) !== undefined) ? (() => {
            const displayedMember = memberDetails !== undefined && memberDetails !== null
              ? memberDetails
              : (tenantMembersList.find((m) => m.id === viewingMemberId) as TenantMember);
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
                    <p className="text-xs text-sky-600 dark:text-sky-400 font-semibold">{displayedMember.jobTitle ?? "Staff Member"}</p>
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
              Failed to load member details.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
