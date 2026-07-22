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
  Loader2
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
import { Tenant, TenantMember, Role, User, FieldOffice } from "@edge/api";
import { useTenantMemberService } from "@/services/tenantMemberService";
import { useUserService } from "@/services/userService";
import { useRoleService } from "@/services/roleService";
import { MOCK_TENANT_MEMBERS } from "@/components/tenants/mockData";

interface MembersTabProps {
  currentTenant: Tenant;
  fieldOfficesList: FieldOffice[];
  showToast: (msg: string) => void;
}

export function MembersTab({ currentTenant, fieldOfficesList, showToast }: MembersTabProps) {
  const tenantId = currentTenant.id;
  const { useTenantMembers, assignUserToTenant, updateMemberDetails, removeUserFromTenant } = useTenantMemberService();
  const { useUsers } = useUserService();
  const { useRoles } = useRoleService();

  const { data: fetchedMembers, mutate: mutateMembers } = useTenantMembers(tenantId);
  const { data: fetchedUsers } = useUsers();
  const { data: fetchedRoles } = useRoles();

  // Local state fallbacks
  const [membersList, setMembersList] = useState<TenantMember[]>(
    MOCK_TENANT_MEMBERS[currentTenant.id] ?? MOCK_TENANT_MEMBERS["t-101"]
  );

  const [rolesList] = useState<Role[]>([
    { id: "r-admin", name: "System Administrator", key: "system_admin", isSystemRole: true, description: "Full system governance and tenant management" },
    { id: "r-licensing", name: "Regional Executive Director", key: "region_admin", isSystemRole: false, description: "Regional fee rules, schedules, and field office oversight" },
    { id: "r-inspector", name: "Field Inspector Lead", key: "inspector_lead", isSystemRole: false, description: "On-site frequency verification and field station inspection" },
  ]);

  const [isAssignMemberOpen, setIsAssignMemberOpen] = useState(false);
  const [isEditMemberOpen, setIsEditMemberOpen] = useState(false);
  const [isRemoveMemberOpen, setIsRemoveMemberOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TenantMember | null>(null);

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

  const tenantMembersList: TenantMember[] = fetchedMembers ?? membersList;

  const handleOpenAssignMember = () => {
    setMemberFormData({
      userId: fetchedUsers && fetchedUsers.length > 0 ? fetchedUsers[0].id : "",
      roleId: rolesList.length > 0 ? rolesList[0].id : "",
      fieldOfficeId: fieldOfficesList.length > 0 ? fieldOfficesList[0].id : "",
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
      const userObj = fetchedUsers?.find((u) => u.id === memberFormData.userId);
      const newMember: TenantMember = {
        id: `tm-${Date.now()}`,
        tenantId: currentTenant.id,
        tenantName: currentTenant.name,
        userId: memberFormData.userId,
        userEmail: userObj?.email ?? "user@ntc.gov.ph",
        userFirstName: userObj?.firstName ?? "User",
        userLastName: userObj?.lastName ?? "Member",
        roleId: memberFormData.roleId,
        fieldOfficeId: memberFormData.fieldOfficeId || null,
        fieldOfficeName: memberFormData.fieldOfficeId ? "Pasig Extension Office" : "Headquarters",
        jobTitle: memberFormData.jobTitle,
        level: memberFormData.level,
        division: memberFormData.division,
        position: memberFormData.position,
        designation: memberFormData.designation,
      };
      setMembersList((prev) => [newMember, ...prev]);
      setIsAssignMemberOpen(false);
      showToast(`Staff member saved locally!`);
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
      setMembersList((prev) =>
        prev.map((m) =>
          m.id === selectedMember.id
            ? {
                ...m,
                roleId: memberFormData.roleId,
                fieldOfficeId: memberFormData.fieldOfficeId || null,
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
      showToast(`Member details updated locally.`);
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
      setMembersList((prev) => prev.filter((m) => m.id !== selectedMember.id));
      setIsRemoveMemberOpen(false);
      showToast(`Member unassigned locally.`);
    }
  };

  return (
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

      {/* Assign Member Modal */}
      <Dialog open={isAssignMemberOpen} onOpenChange={setIsAssignMemberOpen}>
        <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-indigo-400" /> Assign New Staff Member
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAssignMemberSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Select User *</label>
              <select
                required
                value={memberFormData.userId}
                onChange={(e) => setMemberFormData({ ...memberFormData, userId: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="" disabled>Select User...</option>
                {(fetchedUsers ?? []).map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.firstName} {u.lastName} ({u.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Security Role *</label>
                <select
                  required
                  value={memberFormData.roleId}
                  onChange={(e) => setMemberFormData({ ...memberFormData, roleId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="" disabled>Select Role...</option>
                  {(fetchedRoles ?? rolesList).map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Field Office Assignment</label>
                <select
                  value={memberFormData.fieldOfficeId}
                  onChange={(e) => setMemberFormData({ ...memberFormData, fieldOfficeId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="">Headquarters / Unassigned</option>
                  {fieldOfficesList.map((fo) => (
                    <option key={fo.id} value={fo.id}>
                      {fo.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Job Title</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Spectrum Officer"
                  value={memberFormData.jobTitle}
                  onChange={(e) => setMemberFormData({ ...memberFormData, jobTitle: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Salary Grade Level</label>
                <input
                  type="text"
                  placeholder="e.g. SG-18"
                  value={memberFormData.level}
                  onChange={(e) => setMemberFormData({ ...memberFormData, level: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Division *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Operations & Enforcement"
                  value={memberFormData.division}
                  onChange={(e) => setMemberFormData({ ...memberFormData, division: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Position *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Engineer III"
                  value={memberFormData.position}
                  onChange={(e) => setMemberFormData({ ...memberFormData, position: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Designation</label>
              <input
                type="text"
                placeholder="e.g. Chief Spectrum Audit Investigator"
                value={memberFormData.designation}
                onChange={(e) => setMemberFormData({ ...memberFormData, designation: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
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
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">User</label>
              <div className="px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-300">
                {selectedMember ? `${selectedMember.userFirstName} ${selectedMember.userLastName} (${selectedMember.userEmail})` : ""}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Security Role *</label>
                <select
                  required
                  value={memberFormData.roleId}
                  onChange={(e) => setMemberFormData({ ...memberFormData, roleId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="" disabled>Select Role...</option>
                  {(fetchedRoles ?? rolesList).map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Field Office Assignment</label>
                <select
                  value={memberFormData.fieldOfficeId}
                  onChange={(e) => setMemberFormData({ ...memberFormData, fieldOfficeId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="">Headquarters / Unassigned</option>
                  {fieldOfficesList.map((fo) => (
                    <option key={fo.id} value={fo.id}>
                      {fo.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Job Title</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Spectrum Officer"
                  value={memberFormData.jobTitle}
                  onChange={(e) => setMemberFormData({ ...memberFormData, jobTitle: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Salary Grade Level</label>
                <input
                  type="text"
                  placeholder="e.g. SG-18"
                  value={memberFormData.level}
                  onChange={(e) => setMemberFormData({ ...memberFormData, level: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Division *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Operations & Enforcement"
                  value={memberFormData.division}
                  onChange={(e) => setMemberFormData({ ...memberFormData, division: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Position *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Engineer III"
                  value={memberFormData.position}
                  onChange={(e) => setMemberFormData({ ...memberFormData, position: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Designation</label>
              <input
                type="text"
                placeholder="e.g. Chief Spectrum Audit Investigator"
                value={memberFormData.designation}
                onChange={(e) => setMemberFormData({ ...memberFormData, designation: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
    </div>
  );
}
