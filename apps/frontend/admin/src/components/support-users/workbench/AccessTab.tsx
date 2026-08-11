"use client";

import React, { useState } from "react";
import {
  Globe,
  UserCheck,
  CheckCircle2,
  Pencil,
  Save,
  X,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import { GlobalSupportUser, UserDiagnosticDetails } from "@edge/api";
import { useUserService } from "@/services/userService";
import { Button } from "@/components/ui/button";

interface AccessTabProps {
  user: GlobalSupportUser;
  diagnosticData: UserDiagnosticDetails;
  onUserUpdated?: (updated: { firstName: string; lastName: string; isSuperAdmin: boolean }) => void;
}

export function AccessTab({ user, diagnosticData, onUserUpdated }: AccessTabProps) {
  const { updateUser } = useUserService();

  // Edit profile state
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const handleEdit = () => {
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setFeedback(null);
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setFeedback(null);
  };

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) return;
    setSaving(true);
    setFeedback(null);
    try {
      await updateUser(user.id, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      if (onUserUpdated !== undefined) {
        onUserUpdated({ firstName: firstName.trim(), lastName: lastName.trim(), isSuperAdmin });
      }
      setFeedback({ type: "success", msg: "User profile updated successfully." });
      setEditing(false);
    } catch {
      setFeedback({ type: "error", msg: "Failed to update user profile. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleSuperAdmin = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      await updateUser(user.id, {
        firstName: user.firstName,
        lastName: user.lastName,
      });
      const next = !isSuperAdmin;
      setIsSuperAdmin(next);
      setFeedback({
        type: "success",
        msg: next
          ? "Super Admin privilege granted. User now has elevated platform access."
          : "Super Admin privilege revoked.",
      });
    } catch {
      setFeedback({ type: "error", msg: "Failed to update Super Admin status." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Feedback Banner */}
      {feedback !== null && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          ) : (
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" />
          )}
          <span>{feedback.msg}</span>
        </div>
      )}

      {/* Editable User Profile */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-sky-500 dark:text-sky-400" /> User Identity & Profile
          </h3>
          {!editing ? (
            <Button
              onClick={handleEdit}
              className="h-7 px-3 text-xs bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center gap-1.5"
            >
              <Pencil className="w-3 h-3" /> Edit
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="h-7 px-3 text-xs bg-sky-600 hover:bg-sky-500 text-white rounded-lg flex items-center gap-1.5 font-semibold"
              >
                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                Save
              </Button>
              <Button
                onClick={handleCancel}
                disabled={saving}
                className="h-7 px-3 text-xs bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center gap-1.5"
              >
                <X className="w-3 h-3" /> Cancel
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">First Name</label>
            {editing ? (
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-sky-500 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none transition-colors"
              />
            ) : (
              <p className="text-sm font-semibold text-slate-900 dark:text-white px-3 py-2 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                {user.firstName}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Last Name</label>
            {editing ? (
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-sky-500 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none transition-colors"
              />
            ) : (
              <p className="text-sm font-semibold text-slate-900 dark:text-white px-3 py-2 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                {user.lastName}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email Address</label>
            <p className="text-sm text-slate-600 dark:text-slate-400 px-3 py-2 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
              {user.email}
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Assigned Roles</label>
            <div className="flex flex-wrap gap-1.5 px-3 py-2 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 min-h-9">
              {user.assignedRoles.length > 0
                ? user.assignedRoles.map((r) => (
                    <span key={r} className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-500/25 font-mono">
                      {r}
                    </span>
                  ))
                : <span className="text-xs text-slate-500 italic">No roles assigned</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Super Admin Toggle */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-amber-500/30 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-500 dark:text-amber-400" /> Super Admin Privilege
            </h3>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
              Grants elevated platform-wide access. Use with caution — this bypasses tenant-level restrictions.
            </p>
          </div>
          <button
            onClick={handleToggleSuperAdmin}
            disabled={saving}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 transition-colors focus:outline-none ${
              isSuperAdmin ? "bg-amber-500 border-amber-500" : "bg-slate-300 dark:bg-slate-700 border-slate-400 dark:border-slate-600"
            } ${saving ? "opacity-50" : ""}`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 mt-0.5 rounded-full bg-white shadow-lg transform transition-transform ${
                isSuperAdmin ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
        <div className={`text-xs px-3 py-2 rounded-lg border ${
          isSuperAdmin
            ? "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300"
            : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-500"
        }`}>
          {isSuperAdmin ? "⚡ Super Admin — has unrestricted system access." : "Standard user — tenant-scoped permissions apply."}
        </div>
      </div>

      {/* Regional Access (read-only info) */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Globe className="w-4 h-4 text-cyan-500 dark:text-cyan-400" /> Regional Access & Tenant Assignment
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="text-slate-500 dark:text-slate-400 font-semibold">Primary Regional Domain</div>
            <div className="text-slate-900 dark:text-white font-medium">{user.regionName}</div>
          </div>
          <div className="p-3 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="text-slate-500 dark:text-slate-400 font-semibold">Assigned Tenant Office</div>
            <div className="text-slate-900 dark:text-white font-medium">{user.tenantName ?? "Global Platform Level"}</div>
            <div className="text-[10px] text-slate-500">Field Office: {user.fieldOfficeName ?? "Headquarters"}</div>
          </div>
        </div>
      </div>

      {/* Effective Permissions Matrix */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" /> Evaluated Effective Permissions
        </h3>
        {diagnosticData.effectivePermissions.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {diagnosticData.effectivePermissions.map((perm) => (
              <span key={perm} className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-xs font-mono flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> {perm}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">No effective permissions loaded from diagnostics endpoint.</p>
        )}
      </div>
    </div>
  );
}
