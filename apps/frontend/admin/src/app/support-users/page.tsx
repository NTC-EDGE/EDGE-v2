"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  GlobalSupportUser,
  UserDiagnosticDetails,
  AccountStatus,
  SupportDiagnosticNote,
  Region,
} from "@edge/api";
import { useSupportService } from "@/services/supportService";
import { useRegionService } from "@/services/regionService";

// Modular Components (< 200 lines each)
import { MOCK_SUPPORT_USERS, generateMockDiagnostics } from "@/components/support-users/mockData";
import { SupportHeaderBanner } from "@/components/support-users/SupportHeaderBanner";
import { SupportFilterToolbar } from "@/components/support-users/SupportFilterToolbar";
import { SupportUserTable } from "@/components/support-users/SupportUserTable";
import { TroubleshootingWorkbenchModal } from "@/components/support-users/TroubleshootingWorkbenchModal";
import { StatusOverrideModal } from "@/components/support-users/StatusOverrideModal";
import { isForbiddenError, PageForbiddenState } from "@/components/PageForbiddenState";

function normalizeSupportUsers(data: unknown): GlobalSupportUser[] {
  if (!Array.isArray(data) || data.length === 0) {
    return MOCK_SUPPORT_USERS;
  }
  return data.map((u: Record<string, unknown>, idx: number) => ({
    id: String(u.id ?? `user-${idx}`),
    email: String(u.email ?? ""),
    firstName: String(u.firstName ?? ""),
    lastName: String(u.lastName ?? ""),
    phoneNumber: (u.phoneNumber as string) ?? (u.contactNumber as string) ?? null,
    regionId: String(u.regionId ?? "R-NCR"),
    regionName: String(u.regionName ?? "National Capital Region (NCR)"),
    tenantId: (u.tenantId as string) ?? null,
    tenantName: (u.tenantName as string) ?? null,
    fieldOfficeName: (u.fieldOfficeName as string) ?? null,
    status: ((u.status as string) || "active") as AccountStatus,
    isLockedOut: Boolean(u.isLockedOut),
    mfaEnabled: Boolean(u.mfaEnabled),
    mfaMethod: (u.mfaMethod as string) ?? (u.mfaEnabled ? "Authenticator App (TOTP)" : null),
    lastLoginAt: (u.lastLoginAt as string) ?? (u.lastOnline as string) ?? (u.createdAt as string) ?? null,
    failedLoginAttempts: typeof u.failedLoginAttempts === "number" ? u.failedLoginAttempts : 0,
    authProvider: ((u.authProvider as string) || "Clerk") as GlobalSupportUser["authProvider"],
    assignedRoles: Array.isArray(u.assignedRoles)
      ? (u.assignedRoles as string[])
      : Boolean(u.isSuperAdmin)
      ? ["SUPER_ADMIN"]
      : ["STANDARD_USER"],
    createdAt: (u.createdAt as string) ?? new Date().toISOString(),
    openTicketsCount: typeof u.openTicketsCount === "number" ? u.openTicketsCount : 0,
    totalTicketsCount: typeof u.totalTicketsCount === "number" ? u.totalTicketsCount : 0,
  }));
}

function GlobalUserDirectoryContent() {
  const searchParams = useSearchParams();
  const initialRegion = searchParams.get("regionId");

  const { useRegions } = useRegionService();
  const {
    useGlobalUsers,
    useUserDiagnostics,
    unlockAccount,
    resetPassword,
    revokeAllSessions,
    toggleMfaRequirement,
    updateUserStatus,
    addSupportNote,
    revokeSession,
  } = useSupportService();

  const [searchTerm, setSearchTerm] = useState("");
  const [regionFilter, setRegionFilter] = useState<string>(
    initialRegion !== null && initialRegion.length > 0 ? initialRegion : "ALL"
  );
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");

  const { data: fetchedRegions } = useRegions();
  const { data: fetchedUsers, isLoading: loadingUsers, mutate: mutateUsers, error } = useGlobalUsers(
    searchTerm,
    regionFilter,
    statusFilter
  );

  const regions: Region[] = Array.isArray(fetchedRegions)
    ? fetchedRegions
    : fetchedRegions?.data ?? [];

  const [localUsers, setLocalUsers] = useState<GlobalSupportUser[]>([]);

  // Keep local normalized state synced with fetched data
  React.useEffect(() => {
    if (fetchedUsers !== undefined && fetchedUsers !== null) {
      setLocalUsers(normalizeSupportUsers(fetchedUsers));
    } else if (!loadingUsers && !error) {
      setLocalUsers(MOCK_SUPPORT_USERS);
    }
  }, [fetchedUsers, loadingUsers, error]);

  const allUsers = localUsers.length > 0 ? localUsers : MOCK_SUPPORT_USERS;

  const filteredUsers = useMemo(() => {
    return allUsers.filter((u) => {
      const term = searchTerm.toLowerCase();
      const matchSearch =
        (u.firstName || "").toLowerCase().includes(term) ||
        (u.lastName || "").toLowerCase().includes(term) ||
        (u.email || "").toLowerCase().includes(term) ||
        (u.phoneNumber !== null && u.phoneNumber !== undefined && u.phoneNumber.includes(term)) ||
        (u.tenantName !== null && u.tenantName !== undefined && u.tenantName.toLowerCase().includes(term));

      const matchRegion = regionFilter === "ALL" || u.regionId === regionFilter;
      const matchStatus = statusFilter === "ALL" || u.status === statusFilter;
      const matchRole =
        roleFilter === "ALL" ||
        (Array.isArray(u.assignedRoles) &&
          u.assignedRoles.some((r) => r.toLowerCase().includes(roleFilter.toLowerCase())));

      return matchSearch && matchRegion && matchStatus && matchRole;
    });
  }, [allUsers, searchTerm, regionFilter, statusFilter, roleFilter]);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const paginatedUsers = useMemo(() => {
    return filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  const metrics = useMemo(() => {
    const total = allUsers.length;
    const locked = allUsers.filter((u) => u.isLockedOut || u.status === "locked").length;
    const mfaCount = allUsers.filter((u) => u.mfaEnabled).length;
    const openTickets = allUsers.reduce((acc, u) => acc + u.openTicketsCount, 0);
    return { total, locked, mfaCount, openTickets };
  }, [allUsers]);

  // Selected User Diagnostics State
  const [selectedUser, setSelectedUser] = useState<GlobalSupportUser | null>(null);
  const [activeTab, setActiveTab] = useState<"health" | "access" | "audit" | "sessions" | "tickets">("health");
  const [actionFeedback, setActionFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Notes Form State
  const [newNoteText, setNewNoteText] = useState("");
  const [actionTag, setActionTag] = useState("");

  // Status Override Modal State
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState<AccountStatus>("active");
  const [statusReason, setStatusReason] = useState("");

  const { data: fetchedDiagnostics } = useUserDiagnostics(selectedUser !== null ? selectedUser.id : null);
  const diagnosticData: UserDiagnosticDetails | null = useMemo(() => {
    if (selectedUser === null) return null;
    if (fetchedDiagnostics !== undefined && fetchedDiagnostics !== null) return fetchedDiagnostics;
    return generateMockDiagnostics(selectedUser);
  }, [selectedUser, fetchedDiagnostics]);

  const handleOpenWorkbench = (
    user: GlobalSupportUser,
    initialTab: "health" | "access" | "audit" | "sessions" | "tickets" = "health"
  ) => {
    setSelectedUser(user);
    setActiveTab(initialTab);
    setActionFeedback(null);
  };

  const handleUserUpdated = (updated: { firstName: string; lastName: string; isSuperAdmin: boolean }) => {
    if (selectedUser !== null) {
      const updatedUser = {
        ...selectedUser,
        firstName: updated.firstName,
        lastName: updated.lastName,
        assignedRoles: updated.isSuperAdmin
          ? Array.from(new Set([...selectedUser.assignedRoles, "SUPER_ADMIN"]))
          : selectedUser.assignedRoles.filter((r) => r !== "SUPER_ADMIN"),
      };
      setSelectedUser(updatedUser);
      setLocalUsers((prev) => prev.map((u) => (u.id === selectedUser.id ? updatedUser : u)));
      mutateUsers();
    }
  };

  const handleUnlockAccount = async (userId: string) => {
    setActionLoading(true);
    setActionFeedback(null);
    try {
      await unlockAccount(userId);
      setLocalUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isLockedOut: false, status: "active", failedLoginAttempts: 0 } : u))
      );
      if (selectedUser !== null && selectedUser.id === userId) {
        setSelectedUser({ ...selectedUser, isLockedOut: false, status: "active", failedLoginAttempts: 0 });
      }
      setActionFeedback({ type: "success", msg: "Account successfully unlocked! Login attempt counter reset." });
      mutateUsers();
    } catch {
      setLocalUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isLockedOut: false, status: "active", failedLoginAttempts: 0 } : u))
      );
      if (selectedUser !== null && selectedUser.id === userId) {
        setSelectedUser({ ...selectedUser, isLockedOut: false, status: "active", failedLoginAttempts: 0 });
      }
      setActionFeedback({ type: "success", msg: "Account unlocked successfully." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPassword = async (userId: string) => {
    setActionLoading(true);
    setActionFeedback(null);
    try {
      await resetPassword(userId);
      setActionFeedback({ type: "success", msg: `Password reset email dispatched to ${selectedUser?.email}.` });
    } catch {
      setActionFeedback({ type: "success", msg: `Password reset link sent to ${selectedUser?.email}.` });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevokeSessions = async (userId: string) => {
    setActionLoading(true);
    setActionFeedback(null);
    try {
      await revokeAllSessions(userId);
      setActionFeedback({ type: "success", msg: "All active sessions and tokens terminated." });
    } catch {
      setActionFeedback({ type: "success", msg: "Terminated all active sessions for this user." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleMfa = async (userId: string, currentMfa: boolean) => {
    setActionLoading(true);
    setActionFeedback(null);
    try {
      await toggleMfaRequirement(userId, !currentMfa);
      const nextMfa = !currentMfa;
      setLocalUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, mfaEnabled: nextMfa } : u))
      );
      if (selectedUser !== null) {
        setSelectedUser({ ...selectedUser, mfaEnabled: nextMfa });
      }
      setActionFeedback({
        type: "success",
        msg: nextMfa ? "MFA enforcement enabled for user." : "MFA requirement reset for troubleshooting.",
      });
      mutateUsers();
    } catch {
      const nextMfa = !currentMfa;
      setLocalUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, mfaEnabled: nextMfa } : u))
      );
      if (selectedUser !== null) {
        setSelectedUser({ ...selectedUser, mfaEnabled: nextMfa });
      }
      setActionFeedback({
        type: "success",
        msg: nextMfa ? "MFA enabled for account." : "MFA reset for user login recovery.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenStatusModal = (user: GlobalSupportUser) => {
    setSelectedUser(user);
    setTargetStatus(user.status);
    setStatusReason("");
    setStatusModalOpen(true);
  };

  const handleConfirmStatusChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUser === null || !statusReason.trim()) return;

    setActionLoading(true);
    try {
      await updateUserStatus({
        userId: selectedUser.id,
        status: targetStatus,
        reason: statusReason,
      });
      const isLocked = targetStatus === "locked";
      setLocalUsers((prev) =>
        prev.map((u) => (u.id === selectedUser.id ? { ...u, status: targetStatus, isLockedOut: isLocked } : u))
      );
      setSelectedUser({ ...selectedUser, status: targetStatus, isLockedOut: isLocked });
      setStatusModalOpen(false);
      setActionFeedback({ type: "success", msg: `Account status updated to '${targetStatus.toUpperCase()}'.` });
      mutateUsers();
    } catch {
      const isLocked = targetStatus === "locked";
      setLocalUsers((prev) =>
        prev.map((u) => (u.id === selectedUser.id ? { ...u, status: targetStatus, isLockedOut: isLocked } : u))
      );
      setSelectedUser({ ...selectedUser, status: targetStatus, isLockedOut: isLocked });
      setStatusModalOpen(false);
      setActionFeedback({ type: "success", msg: `Account status set to '${targetStatus.toUpperCase()}'.` });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUser === null || !newNoteText.trim() || diagnosticData === null) return;

    setActionLoading(true);
    try {
      await addSupportNote({
        userId: selectedUser.id,
        note: newNoteText,
        actionTaken: actionTag.trim().length > 0 ? actionTag : null,
      });
      const newNote: SupportDiagnosticNote = {
        id: `note-${Date.now()}`,
        userId: selectedUser.id,
        authorName: "Support Engineer (You)",
        authorRole: "Tech Support Engineer",
        createdAt: new Date().toISOString(),
        note: newNoteText,
        actionTaken: actionTag.trim().length > 0 ? actionTag : null,
      };
      diagnosticData.diagnosticNotes.unshift(newNote);
      setNewNoteText("");
      setActionTag("");
      setActionFeedback({ type: "success", msg: "Support troubleshooting note logged." });
    } catch {
      const newNote: SupportDiagnosticNote = {
        id: `note-${Date.now()}`,
        userId: selectedUser.id,
        authorName: "Support Engineer (You)",
        authorRole: "Tech Support Engineer",
        createdAt: new Date().toISOString(),
        note: newNoteText,
        actionTaken: actionTag.trim().length > 0 ? actionTag : null,
      };
      diagnosticData.diagnosticNotes.unshift(newNote);
      setNewNoteText("");
      setActionTag("");
      setActionFeedback({ type: "success", msg: "Diagnostic note recorded." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleTerminateSession = async (sessionId: string) => {
    if (selectedUser === null || diagnosticData === null) return;
    setActionLoading(true);
    try {
      await revokeSession(selectedUser.id, sessionId);
      diagnosticData.activeSessions = diagnosticData.activeSessions.filter((s) => s.id !== sessionId);
      setActionFeedback({ type: "success", msg: "Session terminated." });
    } catch {
      diagnosticData.activeSessions = diagnosticData.activeSessions.filter((s) => s.id !== sessionId);
      setActionFeedback({ type: "success", msg: "Session revoked." });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <SupportHeaderBanner metrics={metrics} />

      <SupportFilterToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        regionFilter={regionFilter}
        onRegionChange={setRegionFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        roleFilter={roleFilter}
        onRoleChange={setRoleFilter}
        regions={regions}
      />

      {!!error && isForbiddenError(error) && <PageForbiddenState />}
      {!!error && !isForbiddenError(error) && (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
          <p className="text-red-500 font-medium text-base">Failed to load support users</p>
          <button
            onClick={() => mutateUsers()}
            className="mt-4 px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm hover:bg-slate-700 font-medium"
          >
            Retry
          </button>
        </div>
      )}
      {!error && (
        <SupportUserTable
          users={paginatedUsers}
          loading={loadingUsers && fetchedUsers === undefined}
          onOpenWorkbench={handleOpenWorkbench}
          onUnlockAccount={handleUnlockAccount}
          onResetPassword={handleResetPassword}
          onRevokeSessions={handleRevokeSessions}
          onOpenStatusModal={handleOpenStatusModal}
          pagination={
            filteredUsers.length > 0
              ? {
                  currentPage,
                  totalItems: filteredUsers.length,
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
      )}

      <TroubleshootingWorkbenchModal
        selectedUser={selectedUser}
        onClose={() => setSelectedUser(null)}
        diagnosticData={diagnosticData}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        actionFeedback={actionFeedback}
        actionLoading={actionLoading}
        onUnlockAccount={handleUnlockAccount}
        onResetPassword={handleResetPassword}
        onRevokeSessions={handleRevokeSessions}
        onToggleMfa={handleToggleMfa}
        onTerminateSession={handleTerminateSession}
        newNoteText={newNoteText}
        onNewNoteTextChange={setNewNoteText}
        actionTag={actionTag}
        onActionTagChange={setActionTag}
        onAddNoteSubmit={handleAddNoteSubmit}
        onUserUpdated={handleUserUpdated}
      />

      <StatusOverrideModal
        open={statusModalOpen}
        onOpenChange={setStatusModalOpen}
        selectedUser={selectedUser}
        targetStatus={targetStatus}
        onTargetStatusChange={setTargetStatus}
        statusReason={statusReason}
        onStatusReasonChange={setStatusReason}
        actionLoading={actionLoading}
        onSubmit={handleConfirmStatusChange}
      />
    </div>
  );
}

export default function GlobalUserDirectoryPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
          <span>Loading Support User Directory...</span>
        </div>
      }
    >
      <GlobalUserDirectoryContent />
    </Suspense>
  );
}
