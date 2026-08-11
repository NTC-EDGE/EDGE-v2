"use client";

import React, { useState } from "react";
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
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActionMenu } from "@/components/ui/action-menu";
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
import { useAdminScope } from "@/lib/admin-scope-context";

interface MembersTabProps {
  currentTenant: Tenant;
  fieldOfficesList: FieldOffice[];
  showToast: (msg: string) => void;
}

export function MembersTab({ currentTenant, fieldOfficesList, showToast }: MembersTabProps) {
  const tenantId = currentTenant.id;
  const { isSystemAdmin } = useAdminScope();
  const { useTenantMembers, useMemberDetails, assignUserToTenant, updateMemberDetails, removeUserFromTenant } = useTenantMemberService();
  const { useFieldOffices } = useFieldOfficeService();
  const { useRoles } = useRoleService();

  const { data: fetchedMembers, mutate: mutateMembers } = useTenantMembers(tenantId);
  const { data: fetchedRoles } = useRoles(tenantId);
  const rolesList: Role[] = fetchedRoles ?? [];

  const [isAssignMemberOpen, setIsAssignMemberOpen] = useState(false);
  const [isEditMemberOpen, setIsEditMemberOpen] = useState(false);
  const [isRemoveMemberOpen, setIsRemoveMemberOpen] = useState(false);
  const [isViewMemberOpen, setIsViewMemberOpen] = useState(false);
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
    roleId: "r-admin",
    fieldOfficeId: "",
    jobTitle: "",
    level: "SG-18",
    division: "Licensing Division",
    position: "Supervising Engineer",
    designation: "Spectrum Regulator",
  });

  const tenantMembersList: TenantMember[] = fetchedMembers ?? [];

  const handleOpenAssignMember = () => {
    setMemberFormData({
      userId: "",
      roleId: rolesList.length > 0 ? rolesList[0].id : "",
      fieldOfficeId: activeFieldOfficesList.length > 0 ? activeFieldOfficesList[0].id : "",
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
    if (!memberFormData.userId || !memberFormData.roleId) return;

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
      showToast(`Staff member assigned to tenant!`);
    } catch (err: unknown) {
      showToast(`Failed to assign staff member to tenant.`);
    }
  };

  const handleEditMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMember === null) return;

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
      showToast(`Member details updated.`);
    } catch (err: unknown) {
      showToast(`Failed to update member details.`);
    }
  };

  const handleRemoveMemberConfirm = async () => {
    if (selectedMember === null) return;

    try {
      await removeUserFromTenant(tenantId, selectedMember.id);
      await mutateMembers();
      setIsRemoveMemberOpen(false);
      showToast(`Member unassigned from tenant.`);
    } catch (err: unknown) {
      showToast(`Failed to unassign member.`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white">Assigned Tenant Members & Staff</h3>
          <p className="text-xs text-slate-400">Personnel assigned to this regional administrative tenant branch.</p>
        </div>
        {!isSystemAdmin && (
          <Button
            onClick={handleOpenAssignMember}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/20"
          >
            <UserPlus className="w-4 h-4" />
            <span>Assign Staff Member</span>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tenantMembersList.map((member) => (
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
                      label: "View Member Details",
                      icon: Eye,
                      onClick: () => handleOpenViewMember(member),
                    },
                    ...(!isSystemAdmin
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

      {/* Assign Member Modal */}
      <Dialog open={isAssignMemberOpen} onOpenChange={setIsAssignMemberOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-indigo-500 dark:text-indigo-400" /> Assign New Staff Member
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAssignMemberSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">User Account ID *</label>
              <input
                type="text"
                required
                placeholder="Enter User GUID (e.g. 123e4567-e89b-12d3-a456-426614174000)"
                value={memberFormData.userId}
                onChange={(e) => setMemberFormData({ ...memberFormData, userId: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Security Role *</label>
                <select
                  required
                  value={memberFormData.roleId}
                  onChange={(e) => setMemberFormData({ ...memberFormData, roleId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="" disabled className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">Select Role...</option>
                  {rolesList.map((r) => (
                    <option key={r.id} value={r.id} className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Field Office Assignment</label>
                <select
                  value={memberFormData.fieldOfficeId}
                  onChange={(e) => setMemberFormData({ ...memberFormData, fieldOfficeId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">Headquarters / Unassigned</option>
                  {activeFieldOfficesList.map((fo) => (
                    <option key={fo.id} value={fo.id} className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
                      {fo.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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

            <div className="grid grid-cols-2 gap-4">
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

            <DialogFooter className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button type="button" variant="outline" onClick={() => setIsAssignMemberOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">Assign Staff Member</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Member Modal */}
      <Dialog open={isEditMemberOpen} onOpenChange={setIsEditMemberOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-indigo-500 dark:text-indigo-400" /> Edit Member Details
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleEditMemberSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">User</label>
              <div className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-sm text-slate-800 dark:text-slate-300">
                {selectedMember ? `${selectedMember.userFirstName} ${selectedMember.userLastName} (${selectedMember.userEmail})` : ""}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Security Role *</label>
                <select
                  required
                  value={memberFormData.roleId}
                  onChange={(e) => setMemberFormData({ ...memberFormData, roleId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="" disabled className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">Select Role...</option>
                  {rolesList.map((r) => (
                    <option key={r.id} value={r.id} className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Field Office Assignment</label>
                <select
                  value={memberFormData.fieldOfficeId}
                  onChange={(e) => setMemberFormData({ ...memberFormData, fieldOfficeId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">Headquarters / Unassigned</option>
                  {activeFieldOfficesList.map((fo) => (
                    <option key={fo.id} value={fo.id} className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
                      {fo.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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

            <div className="grid grid-cols-2 gap-4">
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

            <DialogFooter className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button type="button" variant="outline" onClick={() => setIsEditMemberOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">Save Member Details</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Remove Member Modal */}
      <Dialog open={isRemoveMemberOpen} onOpenChange={setIsRemoveMemberOpen}>
        <DialogContent className="sm:max-w-[440px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2 text-rose-500 dark:text-rose-400">
              <Trash2 className="w-5 h-5" /> Unassign Staff Member
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400 text-xs">
              Are you sure you want to unassign <span className="text-slate-900 dark:text-white font-bold">{selectedMember?.userFirstName} {selectedMember?.userLastName}</span> from this tenant branch?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsRemoveMemberOpen(false)}>Cancel</Button>
            <Button type="button" onClick={handleRemoveMemberConfirm} className="bg-rose-600 hover:bg-rose-500 text-white font-semibold">Unassign Member</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Member Details Modal */}
      <Dialog open={isViewMemberOpen} onOpenChange={setIsViewMemberOpen}>
        <DialogContent className="sm:max-w-[550px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white p-6 rounded-2xl overflow-hidden">
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
