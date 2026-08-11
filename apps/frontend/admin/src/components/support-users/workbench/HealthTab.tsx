import React from "react";
import { Lock, CheckCircle2, Unlock, Key, Mail, ShieldCheck, RefreshCw, Loader2 } from "lucide-react";
import { GlobalSupportUser } from "@edge/api";
import { Button } from "@/components/ui/button";

interface HealthTabProps {
  user: GlobalSupportUser;
  actionLoading: boolean;
  onUnlockAccount: (userId: string) => void;
  onResetPassword: (userId: string) => void;
  onToggleMfa: (userId: string, currentMfa: boolean) => void;
  onRevokeSessions: (userId: string) => void;
}

export function HealthTab({
  user,
  actionLoading,
  onUnlockAccount,
  onResetPassword,
  onToggleMfa,
  onRevokeSessions,
}: HealthTabProps) {
  return (
    <div className="space-y-6">
      {/* Status Alert Summary */}
      {user.isLockedOut ? (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 flex items-start gap-3">
          <Lock className="w-5 h-5 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-rose-900 dark:text-rose-200 text-sm">Account Is Currently Locked Out</h4>
            <p className="text-xs text-rose-800/90 dark:text-rose-300/90 mt-0.5">
              User triggered security lockout due to {user.failedLoginAttempts} consecutive failed login attempts. Unlocking will clear the failure count and allow immediate sign-in.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-emerald-900 dark:text-emerald-200 text-sm">Account Health Normal</h4>
            <p className="text-xs text-emerald-800/90 dark:text-emerald-300/90 mt-0.5">
              No active lockout flags detected. User is authorized for regional operations under assigned roles.
            </p>
          </div>
        </div>
      )}

      {/* Troubleshooting Tool Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Account Lockout Control */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-rose-500/20 text-rose-500 dark:text-rose-400">
              <Unlock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Lockout Recovery</h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">Clear failed password counters and unlock user login.</p>
            </div>
          </div>
          <Button
            onClick={() => onUnlockAccount(user.id)}
            disabled={actionLoading}
            className="w-full bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-medium text-xs py-2 rounded-lg border border-slate-300 dark:border-slate-700 flex items-center justify-center gap-2"
          >
            {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Unlock className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />}
            <span>Execute Account Unlock</span>
          </Button>
        </div>

        {/* Card 2: Password Reset */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-500 dark:text-indigo-400">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Password Reset Dispatch</h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">Send an emergency password reset link to user email.</p>
            </div>
          </div>
          <Button
            onClick={() => onResetPassword(user.id)}
            disabled={actionLoading}
            className="w-full bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-medium text-xs py-2 rounded-lg border border-slate-300 dark:border-slate-700 flex items-center justify-center gap-2"
          >
            {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />}
            <span>Send Password Reset Email</span>
          </Button>
        </div>

        {/* Card 3: MFA Management */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-500 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white text-sm">MFA Security Control</h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Status: {user.mfaEnabled ? `Enrolled (${user.mfaMethod})` : "Not Enrolled"}
              </p>
            </div>
          </div>
          <Button
            onClick={() => onToggleMfa(user.id, user.mfaEnabled)}
            disabled={actionLoading}
            className="w-full bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-medium text-xs py-2 rounded-lg border border-slate-300 dark:border-slate-700 flex items-center justify-center gap-2"
          >
            {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />}
            <span>{user.mfaEnabled ? "Reset MFA Requirements" : "Enable MFA Safeguard"}</span>
          </Button>
        </div>

        {/* Card 4: Session Revocation */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-500 dark:text-amber-400">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Force Session Logout</h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">Revoke all active browser and mobile app session tokens.</p>
            </div>
          </div>
          <Button
            onClick={() => onRevokeSessions(user.id)}
            disabled={actionLoading}
            className="w-full bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-amber-700 dark:text-amber-300 font-medium text-xs py-2 rounded-lg border border-slate-300 dark:border-slate-700 flex items-center justify-center gap-2"
          >
            {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />}
            <span>Revoke All Sessions</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
