import React from "react";
import { Edit2, Loader2 } from "lucide-react";
import { TenantMember, Role, FieldOffice } from "@edge/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { MemberFormData } from "./AssignMemberModal";

interface EditMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedMember: TenantMember | null;
  formData: MemberFormData;
  setFormData: React.Dispatch<React.SetStateAction<MemberFormData>>;
  errorMsg: string | null;
  submitting: boolean;
  roles: Role[];
  fieldOffices: FieldOffice[];
  onSubmit: (e: React.FormEvent) => void;
}

export function EditMemberModal({
  open,
  onOpenChange,
  selectedMember,
  formData,
  setFormData,
  errorMsg,
  submitting,
  roles,
  fieldOffices,
  onSubmit,
}: EditMemberModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] bg-slate-900 border-slate-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Edit2 className="w-5 h-5 text-sky-400" /> Edit Member & Field Office Assignment
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-xs">
            Update role assignment, field extension office, division, and position for {selectedMember?.userFirstName} {selectedMember?.userLastName}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4 py-2">
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
              onClick={() => onOpenChange(false)}
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
  );
}
