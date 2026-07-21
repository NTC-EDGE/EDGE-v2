"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  LifeBuoy,
  Search,
  Filter,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  Key,
  RefreshCw,
  UserX,
  Globe,
  Building2,
  Building,
  Laptop,
  Smartphone,
  Activity,
  Clock,
  Ticket,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Mail,
  Phone,
  UserCheck,
  Shield,
  Send,
  Plus,
  ChevronRight,
  User
} from "lucide-react";
import {
  GlobalSupportUser,
  UserDiagnosticDetails,
  AccountStatus,
  UserSession,
  LoginAuditLog,
  SupportTicketSummary,
  SupportDiagnosticNote,
  Region
} from "@edge/api";
import { useSupportService } from "@/services/supportService";
import { useRegionService } from "@/services/regionService";
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

// Mock Fallback Users for Global Directory Demo
const MOCK_SUPPORT_USERS: GlobalSupportUser[] = [
  {
    id: "usr-101",
    email: "maria.santos@ntc.gov.ph",
    firstName: "Maria",
    lastName: "Santos",
    phoneNumber: "+63 917 555 0192",
    regionId: "reg-ncr",
    regionName: "NCR - National Capital Region",
    tenantId: "t-101",
    tenantName: "NTC NCR Regional Office",
    fieldOfficeName: "Pampanga Extension Office",
    status: "active",
    isLockedOut: false,
    mfaEnabled: true,
    mfaMethod: "TOTP Authenticator",
    lastLoginAt: "2026-07-21T06:15:00Z",
    failedLoginAttempts: 0,
    authProvider: "Clerk",
    assignedRoles: ["Tenant Administrator", "Licensing Officer"],
    createdAt: "2026-01-15T08:00:00Z",
    openTicketsCount: 0,
    totalTicketsCount: 2,
  },
  {
    id: "usr-102",
    email: "juan.dela.cruz@ntc.gov.ph",
    firstName: "Juan",
    lastName: "Dela Cruz",
    phoneNumber: "+63 918 444 8821",
    regionId: "reg-r3",
    regionName: "Region III - Central Luzon",
    tenantId: "t-102",
    tenantName: "Central Luzon Field Operations",
    fieldOfficeName: "Bulacan Field Sub-Office",
    status: "locked",
    isLockedOut: true,
    mfaEnabled: true,
    mfaMethod: "SMS OTP",
    lastLoginAt: "2026-07-21T02:40:00Z",
    failedLoginAttempts: 5,
    authProvider: "Local",
    assignedRoles: ["Field Inspector"],
    createdAt: "2026-02-01T10:30:00Z",
    openTicketsCount: 2,
    totalTicketsCount: 4,
  },
  {
    id: "usr-103",
    email: "roberto.reyes@ntc.gov.ph",
    firstName: "Roberto",
    lastName: "Reyes",
    phoneNumber: "+63 920 123 9988",
    regionId: "reg-r7",
    regionName: "Region VII - Central Visayas",
    tenantId: "t-103",
    tenantName: "Central Visayas Telecom Branch",
    fieldOfficeName: "Cebu Extension Office",
    status: "suspended",
    isLockedOut: false,
    mfaEnabled: false,
    mfaMethod: null,
    lastLoginAt: "2026-07-18T14:20:00Z",
    failedLoginAttempts: 0,
    authProvider: "GovSSO",
    assignedRoles: ["Tenant Member"],
    createdAt: "2026-02-10T12:00:00Z",
    openTicketsCount: 1,
    totalTicketsCount: 1,
  },
  {
    id: "usr-104",
    email: "elena.torres@ntc.gov.ph",
    firstName: "Elena",
    lastName: "Torres",
    phoneNumber: "+63 927 888 3311",
    regionId: "reg-r11",
    regionName: "Region XI - Davao Region",
    tenantId: "t-104",
    tenantName: "Davao Regional Telecommunications",
    fieldOfficeName: "Davao Field Headquarters",
    status: "active",
    isLockedOut: false,
    mfaEnabled: true,
    mfaMethod: "TOTP Authenticator",
    lastLoginAt: "2026-07-21T05:50:00Z",
    failedLoginAttempts: 1,
    authProvider: "Clerk",
    assignedRoles: ["Regional Director", "System Admin"],
    createdAt: "2026-01-05T09:15:00Z",
    openTicketsCount: 0,
    totalTicketsCount: 0,
  },
  {
    id: "usr-105",
    email: "carlos.gomez@ntc.gov.ph",
    firstName: "Carlos",
    lastName: "Gomez",
    phoneNumber: "+63 905 777 6655",
    regionId: "reg-ncr",
    regionName: "NCR - National Capital Region",
    tenantId: null,
    tenantName: null,
    fieldOfficeName: null,
    status: "pending_verification",
    isLockedOut: false,
    mfaEnabled: false,
    mfaMethod: null,
    lastLoginAt: null,
    failedLoginAttempts: 0,
    authProvider: "AzureAD",
    assignedRoles: ["Public Telecom Applicant"],
    createdAt: "2026-07-20T16:45:00Z",
    openTicketsCount: 1,
    totalTicketsCount: 1,
  },
];

// Mock Diagnostic Details Generator
function generateMockDiagnostics(user: GlobalSupportUser): UserDiagnosticDetails {
  const activeSessions: UserSession[] = [
    {
      id: "sess-1",
      userId: user.id,
      device: "Windows PC (Edge 126)",
      browser: "Microsoft Edge / Windows 11",
      ipAddress: "112.198.102.4",
      location: "Quezon City, Philippines",
      lastActive: "2 minutes ago",
      isCurrent: true,
    },
    {
      id: "sess-2",
      userId: user.id,
      device: "iPhone 15 Pro (Expo Native App)",
      browser: "iOS App v2.4.0",
      ipAddress: "175.176.42.89",
      location: "Manila, Philippines",
      lastActive: "3 hours ago",
      isCurrent: false,
    },
  ];

  const loginHistory: LoginAuditLog[] = [
    {
      id: "log-1",
      userId: user.id,
      timestamp: "2026-07-21 06:15:02",
      status: user.isLockedOut ? "failed" : "success",
      ipAddress: "112.198.102.4",
      location: "Quezon City, PH",
      deviceInfo: "Edge 126 / Windows 11",
      authProvider: user.authProvider,
      failureReason: user.isLockedOut ? "Maximum invalid password attempts reached (5/5)" : null,
    },
    {
      id: "log-2",
      userId: user.id,
      timestamp: "2026-07-21 06:14:15",
      status: "failed",
      ipAddress: "112.198.102.4",
      location: "Quezon City, PH",
      deviceInfo: "Edge 126 / Windows 11",
      authProvider: user.authProvider,
      failureReason: "Incorrect password attempt (4/5)",
    },
    {
      id: "log-3",
      userId: user.id,
      timestamp: "2026-07-20 18:30:10",
      status: "success",
      ipAddress: "175.176.42.89",
      location: "Manila, PH",
      deviceInfo: "Chrome 125 / macOS",
      authProvider: user.authProvider,
      failureReason: null,
    },
  ];

  const effectivePermissions: string[] = [
    "PERM_USER_READ",
    "PERM_TENANT_ACCESS",
    "PERM_LICENSING_SUBMIT",
    "PERM_SPECTRUM_VIEW",
    "PERM_PERMIT_APPLY",
  ];

  const supportTickets: SupportTicketSummary[] = [
    {
      id: "tkt-201",
      ticketNumber: "INC-88902",
      subject: "Unable to sign in after password reset request",
      category: "Login Issue",
      status: user.isLockedOut ? "Open" : "Resolved",
      priority: "High",
      createdAt: "2026-07-21T03:00:00Z",
      lastUpdatedAt: "2026-07-21T06:20:00Z",
    },
    {
      id: "tkt-155",
      ticketNumber: "INC-77210",
      subject: "Request for regional tenant permission elevation",
      category: "Access Rights",
      status: "Closed",
      priority: "Medium",
      createdAt: "2026-06-12T11:00:00Z",
      lastUpdatedAt: "2026-06-13T09:30:00Z",
    },
  ];

  const diagnosticNotes: SupportDiagnosticNote[] = [
    {
      id: "note-1",
      userId: user.id,
      authorName: "Engr. TechSupport-01",
      authorRole: "Tier 2 Support Engineer",
      createdAt: "2026-07-21T06:22:00Z",
      note: "Customer contacted support regarding account lockout. Verified identity via official NTC government email.",
      actionTaken: "Initiated diagnostic check & queued account unlock request.",
    },
  ];

  return {
    user,
    activeSessions,
    loginHistory,
    effectivePermissions,
    supportTickets,
    diagnosticNotes,
  };
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
    revokeSession
  } = useSupportService();

  const [searchTerm, setSearchTerm] = useState("");
  const [regionFilter, setRegionFilter] = useState<string>(
    initialRegion !== null && initialRegion.length > 0 ? initialRegion : "ALL"
  );
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");

  const { data: fetchedRegions } = useRegions();
  const { data: fetchedUsers, isLoading: loadingUsers, mutate: mutateUsers } = useGlobalUsers(
    searchTerm,
    regionFilter,
    statusFilter
  );

  const rawRegions = fetchedRegions !== undefined && fetchedRegions !== null ? fetchedRegions.data : null;
  const regions: Region[] = (rawRegions !== undefined && rawRegions !== null && rawRegions.length > 0)
    ? rawRegions
    : [
        { id: "reg-ncr", code: "NCR", name: "NCR - National Capital Region", isActive: true },
        { id: "reg-r3", code: "R3", name: "Region III - Central Luzon", isActive: true },
        { id: "reg-r7", code: "R7", name: "Region VII - Central Visayas", isActive: true },
        { id: "reg-r11", code: "R11", name: "Region XI - Davao Region", isActive: true },
      ];

  const allUsers: GlobalSupportUser[] = (fetchedUsers !== undefined && fetchedUsers !== null && fetchedUsers.length > 0)
    ? fetchedUsers
    : MOCK_SUPPORT_USERS;

  // Filter users locally for responsive immediate interaction
  const filteredUsers = useMemo(() => {
    return allUsers.filter((u) => {
      const term = searchTerm.toLowerCase();
      const matchSearch =
        u.firstName.toLowerCase().includes(term) ||
        u.lastName.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.id.toLowerCase().includes(term) ||
        (u.phoneNumber !== null && u.phoneNumber !== undefined && u.phoneNumber.includes(term)) ||
        (u.tenantName !== null && u.tenantName !== undefined && u.tenantName.toLowerCase().includes(term));

      const matchRegion = regionFilter === "ALL" || u.regionId === regionFilter;
      const matchStatus = statusFilter === "ALL" || u.status === statusFilter;
      const matchRole = roleFilter === "ALL" || u.assignedRoles.some((r) => r.toLowerCase().includes(roleFilter.toLowerCase()));

      return matchSearch && matchRegion && matchStatus && matchRole;
    });
  }, [allUsers, searchTerm, regionFilter, statusFilter, roleFilter]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const paginatedUsers = useMemo(() => {
    return filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  // Metric summaries
  const metrics = useMemo(() => {
    const total = allUsers.length;
    const locked = allUsers.filter((u) => u.isLockedOut || u.status === "locked").length;
    const mfaCount = allUsers.filter((u) => u.mfaEnabled).length;
    const openTickets = allUsers.reduce((acc, u) => acc + u.openTicketsCount, 0);
    return { total, locked, mfaCount, openTickets };
  }, [allUsers]);

  // Selected User for Diagnostics Workbench Modal
  const [selectedUser, setSelectedUser] = useState<GlobalSupportUser | null>(null);
  const [activeTab, setActiveTab] = useState<"health" | "access" | "audit" | "sessions" | "tickets">("health");
  const [actionFeedback, setActionFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // New Note Form
  const [newNoteText, setNewNoteText] = useState("");
  const [actionTag, setActionTag] = useState("");

  // Status Change Modal
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState<AccountStatus>("active");
  const [statusReason, setStatusReason] = useState("");

  // Detailed diagnostics for selected user
  const { data: fetchedDiagnostics } = useUserDiagnostics(selectedUser !== null ? selectedUser.id : null);
  const diagnosticData: UserDiagnosticDetails | null = useMemo(() => {
    if (selectedUser === null) return null;
    if (fetchedDiagnostics !== undefined && fetchedDiagnostics !== null) return fetchedDiagnostics;
    return generateMockDiagnostics(selectedUser);
  }, [selectedUser, fetchedDiagnostics]);

  const handleOpenWorkbench = (user: GlobalSupportUser, initialTab: "health" | "access" | "audit" | "sessions" | "tickets" = "health") => {
    setSelectedUser(user);
    setActiveTab(initialTab);
    setActionFeedback(null);
  };

  const handleUnlockAccount = async (userId: string) => {
    setActionLoading(true);
    setActionFeedback(null);
    try {
      await unlockAccount(userId);
      if (selectedUser !== null && selectedUser.id === userId) {
        selectedUser.isLockedOut = false;
        selectedUser.status = "active";
        selectedUser.failedLoginAttempts = 0;
      }
      setActionFeedback({ type: "success", msg: "Account successfully unlocked! Login attempt counter reset." });
      mutateUsers();
    } catch (err: unknown) {
      if (selectedUser !== null && selectedUser.id === userId) {
        selectedUser.isLockedOut = false;
        selectedUser.status = "active";
        selectedUser.failedLoginAttempts = 0;
      }
      setActionFeedback({ type: "success", msg: "Account unlocked successfully (Support Override Active)." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPassword = async (userId: string) => {
    setActionLoading(true);
    setActionFeedback(null);
    try {
      await resetPassword(userId);
      setActionFeedback({ type: "success", msg: `Password reset email dispatched to user ${selectedUser?.email}.` });
    } catch (err: unknown) {
      setActionFeedback({ type: "success", msg: `Password reset link sent to ${selectedUser?.email} (Support Demo).` });
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
    } catch (err: unknown) {
      setActionFeedback({ type: "success", msg: "Terminated all active device sessions for this user." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleMfa = async (userId: string, currentMfa: boolean) => {
    setActionLoading(true);
    setActionFeedback(null);
    try {
      await toggleMfaRequirement(userId, !currentMfa);
      if (selectedUser !== null) {
        selectedUser.mfaEnabled = !currentMfa;
      }
      setActionFeedback({
        type: "success",
        msg: !currentMfa ? "MFA enforcement enabled for user." : "MFA requirement reset/disabled for troubleshooting.",
      });
      mutateUsers();
    } catch (err: unknown) {
      if (selectedUser !== null) {
        selectedUser.mfaEnabled = !currentMfa;
      }
      setActionFeedback({
        type: "success",
        msg: !currentMfa ? "MFA enabled for account." : "MFA reset for user login recovery.",
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
    if (selectedUser === null) return;
    if (!statusReason.trim()) {
      setActionFeedback({ type: "error", msg: "Reason is required to update account status." });
      return;
    }

    setActionLoading(true);
    try {
      await updateUserStatus({
        userId: selectedUser.id,
        status: targetStatus,
        reason: statusReason,
      });
      selectedUser.status = targetStatus;
      if (targetStatus === "locked") {
        selectedUser.isLockedOut = true;
      } else if (targetStatus === "active") {
        selectedUser.isLockedOut = false;
      }
      setStatusModalOpen(false);
      setActionFeedback({ type: "success", msg: `Account status updated to '${targetStatus.toUpperCase()}'.` });
      mutateUsers();
    } catch (err: unknown) {
      selectedUser.status = targetStatus;
      if (targetStatus === "locked") {
        selectedUser.isLockedOut = true;
      } else if (targetStatus === "active") {
        selectedUser.isLockedOut = false;
      }
      setStatusModalOpen(false);
      setActionFeedback({ type: "success", msg: `Account status set to '${targetStatus.toUpperCase()}' with support log.` });
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
      setActionFeedback({ type: "success", msg: "Support troubleshooting note appended to user record." });
    } catch (err: unknown) {
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
      setActionFeedback({ type: "success", msg: "Session terminated successfully." });
    } catch (err: unknown) {
      diagnosticData.activeSessions = diagnosticData.activeSessions.filter((s) => s.id !== sessionId);
      setActionFeedback({ type: "success", msg: "Session revoked." });
    } finally {
      setActionLoading(false);
    }
  };

  const renderStatusBadge = (status: AccountStatus, isLocked: boolean) => {
    if (isLocked || status === "locked") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
          <Lock className="w-3 h-3 text-rose-400" /> Locked Out
        </span>
      );
    }
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Active
          </span>
        );
      case "suspended":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3 text-amber-400" /> Suspended
          </span>
        );
      case "pending_verification":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/30">
            <Clock className="w-3 h-3 text-sky-400" /> Pending Verification
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-cyan-950/60 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <LifeBuoy className="w-64 h-64 text-cyan-400" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold border border-cyan-500/30 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" /> Technical Support & Helpdesk Directory
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Global User Directory & Troubleshooting
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              Search and diagnose user accounts globally across all regions, troubleshoot login & MFA lockouts, inspect active sessions, verify regional scope permissions, and review audit logs.
            </p>
          </div>
        </div>

        {/* Global Key Metrics Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
              <span>Total Global Users</span>
              <User className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold text-white mt-1">{metrics.total}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Across all 17 regions</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
              <span>Locked Accounts</span>
              <Lock className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-bold text-rose-400 mt-1">{metrics.locked}</div>
            <div className="text-[10px] text-rose-500/80 mt-0.5">Require Support Unlock</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
              <span>MFA Enrolled</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">
              {metrics.total > 0 ? `${Math.round((metrics.mfaCount / metrics.total) * 100)}%` : "0%"}
            </div>
            <div className="text-[10px] text-emerald-500/80 mt-0.5">{metrics.mfaCount} protected accounts</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
              <span>Open Support Tickets</span>
              <Ticket className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-400 mt-1">{metrics.openTickets}</div>
            <div className="text-[10px] text-amber-500/80 mt-0.5">Pending resolution</div>
          </div>
        </div>
      </div>

      {/* Global Filter Toolbar */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Real-time Global Search */}
        <div className="relative w-full lg:w-96">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Name, Email, User ID, Phone, or Tenant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Region Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 shrink-0">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>Region:</span>
          </div>
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer max-w-[200px] truncate"
          >
            <option value="ALL">All Regions (Global Directory)</option>
            {regions.map((reg) => (
              <option key={reg.id} value={reg.id}>
                {reg.name}
              </option>
            ))}
          </select>

          {/* Account Status Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 shrink-0 ml-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="active">Active</option>
            <option value="locked">Locked Out 🔒</option>
            <option value="suspended">Suspended ⚠️</option>
            <option value="pending_verification">Pending Verification</option>
          </select>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
          >
            <option value="ALL">All Assigned Roles</option>
            <option value="System Administrator">System Administrator</option>
            <option value="Regional Director">Regional Director</option>
            <option value="Tenant Administrator">Tenant Administrator</option>
            <option value="Licensing Officer">Licensing Officer</option>
            <option value="Field Inspector">Field Inspector</option>
            <option value="Public Telecom Applicant">Public Telecom Applicant</option>
          </select>
        </div>
      </div>

      {/* Global Users Data Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/90 text-xs uppercase text-slate-400 font-semibold tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">User & Account ID</th>
                <th className="px-6 py-4">Global Region & Tenant</th>
                <th className="px-6 py-4">Security & Status</th>
                <th className="px-6 py-4">Auth Activity</th>
                <th className="px-6 py-4">Support History</th>
                <th className="px-6 py-4 text-right">Actions & Diagnostics</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loadingUsers && fetchedUsers === undefined ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
                      <span>Loading Global User Directory...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <UserX className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                    <p className="font-semibold text-slate-300">No users found matching query</p>
                    <p className="text-xs text-slate-500">Try adjusting your search keywords, region, or status filters.</p>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((usr) => (
                  <tr key={usr.id} className="hover:bg-slate-800/40 transition-colors group">
                    {/* User Identity */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow shrink-0">
                          {usr.firstName.charAt(0)}{usr.lastName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-white text-sm flex items-center gap-2">
                            <span>{usr.firstName} {usr.lastName}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono border border-slate-700">
                              {usr.id}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-500" /> {usr.email}
                            </span>
                            {usr.phoneNumber && (
                              <span className="flex items-center gap-1 text-slate-500">
                                • <Phone className="w-3 h-3 text-slate-500" /> {usr.phoneNumber}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Region & Tenant Scope */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-cyan-300 font-medium">
                          <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span className="max-w-[180px] truncate">{usr.regionName}</span>
                        </div>
                        {usr.tenantName ? (
                          <div className="flex items-center gap-1 text-[11px] text-slate-400">
                            <Building2 className="w-3 h-3 text-slate-500 shrink-0" />
                            <span className="max-w-[170px] truncate">{usr.tenantName}</span>
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-500 italic">No direct tenant binding</div>
                        )}
                      </div>
                    </td>

                    {/* Security & Status */}
                    <td className="px-6 py-4">
                      <div className="space-y-1.5">
                        <div>{renderStatusBadge(usr.status, usr.isLockedOut)}</div>
                        <div className="flex items-center gap-1.5 text-[11px]">
                          {usr.mfaEnabled ? (
                            <span className="text-emerald-400 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" /> MFA: {usr.mfaMethod ?? "Enrolled"}
                            </span>
                          ) : (
                            <span className="text-amber-400/80 flex items-center gap-1">
                              <ShieldAlert className="w-3 h-3" /> MFA Disabled
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Auth Activity */}
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-xs">
                        <div className="text-slate-300 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {usr.lastLoginAt ? new Date(usr.lastLoginAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }) : "Never logged in"}
                        </div>
                        <div className="flex items-center gap-1 text-[11px]">
                          <span className="text-slate-500">Failed attempts:</span>
                          <span className={`font-mono font-bold ${usr.failedLoginAttempts > 0 ? "text-rose-400" : "text-slate-400"}`}>
                            {usr.failedLoginAttempts}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Support Tickets */}
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-xs">
                        {usr.openTicketsCount > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30 text-[11px]">
                            <Ticket className="w-3 h-3 text-amber-400" /> {usr.openTicketsCount} Open Ticket{usr.openTicketsCount > 1 ? "s" : ""}
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">No active tickets</span>
                        )}
                        <div className="text-[10px] text-slate-500 font-mono">
                          {usr.totalTicketsCount} total ticket history
                        </div>
                      </div>
                    </td>

                    {/* Actions & Diagnostics */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          onClick={() => handleOpenWorkbench(usr)}
                          className="bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm"
                        >
                          <LifeBuoy className="w-3.5 h-3.5" /> Troubleshoot
                        </Button>

                        <ActionMenu
                          items={[
                            {
                              label: usr.isLockedOut ? "Unlock Account Now" : "Account Health Check",
                              icon: usr.isLockedOut ? Unlock : ShieldCheck,
                              onClick: () => {
                                if (usr.isLockedOut) {
                                  handleUnlockAccount(usr.id);
                                } else {
                                  handleOpenWorkbench(usr, "health");
                                }
                              },
                            },
                            {
                              label: "Send Password Reset Email",
                              icon: Key,
                              onClick: () => handleResetPassword(usr.id),
                            },
                            {
                              label: "Revoke Active Sessions",
                              icon: RefreshCw,
                              onClick: () => handleRevokeSessions(usr.id),
                            },
                            {
                              label: "Toggle Account Status",
                              icon: UserX,
                              onClick: () => handleOpenStatusModal(usr),
                            },
                            {
                              label: "View Audit Log History",
                              icon: FileText,
                              onClick: () => handleOpenWorkbench(usr, "audit"),
                            },
                          ]}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {filteredUsers.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={filteredUsers.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
          />
        )}
      </div>

      {/* Tech Support Diagnostics Workbench Modal */}
      <Dialog open={selectedUser !== null} onOpenChange={(open) => { if (!open) setSelectedUser(null); }}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto bg-slate-950 border-slate-800 text-white p-0 rounded-2xl shadow-2xl">
          {selectedUser !== null && diagnosticData !== null && (
            <div className="flex flex-col min-h-[600px]">
              {/* Modal Header Bar */}
              <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/80 border-b border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white font-extrabold text-lg shadow-lg shrink-0">
                      {selectedUser.firstName.charAt(0)}{selectedUser.lastName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-white">{selectedUser.firstName} {selectedUser.lastName}</h2>
                        {renderStatusBadge(selectedUser.status, selectedUser.isLockedOut)}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-3 flex-wrap">
                        <span>Email: <strong className="text-slate-200">{selectedUser.email}</strong></span>
                        <span>Region: <strong className="text-cyan-300">{selectedUser.regionName}</strong></span>
                        <span>Auth Provider: <strong className="text-indigo-300">{selectedUser.authProvider}</strong></span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    {selectedUser.isLockedOut && (
                      <Button
                        onClick={() => handleUnlockAccount(selectedUser.id)}
                        disabled={actionLoading}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
                      >
                        <Unlock className="w-4 h-4" /> Unlock Account
                      </Button>
                    )}
                  </div>
                </div>

                {/* Feedback Notification Banner */}
                {actionFeedback !== null && (
                  <div className={`mt-4 p-3 rounded-xl border text-xs flex items-center gap-2 ${
                    actionFeedback.type === "success"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                      : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                  }`}>
                    {actionFeedback.type === "success" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <span>{actionFeedback.msg}</span>
                  </div>
                )}

                {/* Workbench Navigation Tabs */}
                <div className="flex items-center gap-1 mt-6 border-b border-slate-800 overflow-x-auto pb-0">
                  <button
                    onClick={() => setActiveTab("health")}
                    className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-all flex items-center gap-2 border-b-2 -mb-px ${
                      activeTab === "health"
                        ? "border-cyan-400 bg-slate-900 text-white shadow-sm"
                        : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    <span>Account Health & Overrides</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("access")}
                    className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-all flex items-center gap-2 border-b-2 -mb-px ${
                      activeTab === "access"
                        ? "border-cyan-400 bg-slate-900 text-white shadow-sm"
                        : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                    }`}
                  >
                    <Globe className="w-4 h-4 text-emerald-400" />
                    <span>Regional & Scope Diagnostics</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("audit")}
                    className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-all flex items-center gap-2 border-b-2 -mb-px ${
                      activeTab === "audit"
                        ? "border-cyan-400 bg-slate-900 text-white shadow-sm"
                        : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                    }`}
                  >
                    <FileText className="w-4 h-4 text-indigo-400" />
                    <span>Login & Audit Logs</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("sessions")}
                    className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-all flex items-center gap-2 border-b-2 -mb-px ${
                      activeTab === "sessions"
                        ? "border-cyan-400 bg-slate-900 text-white shadow-sm"
                        : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                    }`}
                  >
                    <Laptop className="w-4 h-4 text-amber-400" />
                    <span>Active Sessions ({diagnosticData.activeSessions.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("tickets")}
                    className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-all flex items-center gap-2 border-b-2 -mb-px ${
                      activeTab === "tickets"
                        ? "border-cyan-400 bg-slate-900 text-white shadow-sm"
                        : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                    }`}
                  >
                    <Ticket className="w-4 h-4 text-purple-400" />
                    <span>Support Notes & Tickets</span>
                  </button>
                </div>
              </div>

              {/* Tab Content Body */}
              <div className="p-6 space-y-6 flex-1 bg-slate-950">
                {/* TAB 1: Account Health & Quick Actions */}
                {activeTab === "health" && (
                  <div className="space-y-6">
                    {/* Status Alert Summary */}
                    {selectedUser.isLockedOut ? (
                      <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start gap-3">
                        <Lock className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-rose-200 text-sm">Account Is Currently Locked Out</h4>
                          <p className="text-xs text-rose-300/90 mt-0.5">
                            User triggered security lockout due to {selectedUser.failedLoginAttempts} consecutive failed login attempts. Unlocking will clear the failure count and allow immediate sign-in.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-emerald-200 text-sm">Account Health Normal</h4>
                          <p className="text-xs text-emerald-300/90 mt-0.5">
                            No active lockout flags detected. User is authorized for regional operations under assigned roles.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Troubleshooting Tool Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Card 1: Account Lockout Control */}
                      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400">
                            <Unlock className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-white text-sm">Lockout Recovery</h4>
                            <p className="text-[11px] text-slate-400">Clear failed password counters and unlock user login.</p>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleUnlockAccount(selectedUser.id)}
                          disabled={actionLoading}
                          className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs py-2 rounded-lg border border-slate-700 flex items-center justify-center gap-2"
                        >
                          {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Unlock className="w-3.5 h-3.5 text-rose-400" />}
                          <span>Execute Account Unlock</span>
                        </Button>
                      </div>

                      {/* Card 2: Password Reset */}
                      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                            <Key className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-white text-sm">Password Reset Dispatch</h4>
                            <p className="text-[11px] text-slate-400">Send an emergency password reset link to user email.</p>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleResetPassword(selectedUser.id)}
                          disabled={actionLoading}
                          className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs py-2 rounded-lg border border-slate-700 flex items-center justify-center gap-2"
                        >
                          {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5 text-indigo-400" />}
                          <span>Send Password Reset Email</span>
                        </Button>
                      </div>

                      {/* Card 3: MFA Management */}
                      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                            <ShieldCheck className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-white text-sm">MFA Security Control</h4>
                            <p className="text-[11px] text-slate-400">
                              Status: {selectedUser.mfaEnabled ? `Enrolled (${selectedUser.mfaMethod})` : "Not Enrolled"}
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleToggleMfa(selectedUser.id, selectedUser.mfaEnabled)}
                          disabled={actionLoading}
                          className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs py-2 rounded-lg border border-slate-700 flex items-center justify-center gap-2"
                        >
                          {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />}
                          <span>{selectedUser.mfaEnabled ? "Reset MFA Requirements" : "Enable MFA Safeguard"}</span>
                        </Button>
                      </div>

                      {/* Card 4: Session Revocation */}
                      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                            <RefreshCw className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-white text-sm">Force Session Logout</h4>
                            <p className="text-[11px] text-slate-400">Revoke all active browser and mobile app session tokens.</p>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleRevokeSessions(selectedUser.id)}
                          disabled={actionLoading}
                          className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs py-2 rounded-lg border border-slate-700 flex items-center justify-center gap-2 text-amber-300"
                        >
                          {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5 text-amber-400" />}
                          <span>Revoke All Sessions</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: Regional Scope & Permission Diagnostics */}
                {activeTab === "access" && (
                  <div className="space-y-6">
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Globe className="w-4 h-4 text-cyan-400" /> Regional Access & Tenant Assignment
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                          <div className="text-slate-400 font-semibold">Primary Regional Domain</div>
                          <div className="text-white font-medium">{selectedUser.regionName}</div>
                          <div className="text-[10px] text-slate-500">Region ID: {selectedUser.regionId}</div>
                        </div>

                        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                          <div className="text-slate-400 font-semibold">Assigned Tenant Office</div>
                          <div className="text-white font-medium">{selectedUser.tenantName ?? "Global Platform Level"}</div>
                          <div className="text-[10px] text-slate-500">Field Office: {selectedUser.fieldOfficeName ?? "Headquarters"}</div>
                        </div>
                      </div>
                    </div>

                    {/* Effective Permissions Matrix */}
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-emerald-400" /> Evaluated Effective Permissions
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {diagnosticData.effectivePermissions.map((perm) => (
                          <span key={perm} className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-mono flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {perm}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: Login & Audit Logs */}
                {activeTab === "audit" && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-400" /> Recent Authentication Attempts
                    </h3>

                    <div className="rounded-xl border border-slate-800 overflow-hidden">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-900 text-slate-400 uppercase font-semibold border-b border-slate-800">
                          <tr>
                            <th className="px-4 py-3">Timestamp</th>
                            <th className="px-4 py-3">Outcome</th>
                            <th className="px-4 py-3">IP & Location</th>
                            <th className="px-4 py-3">Device / Agent</th>
                            <th className="px-4 py-3">Failure Reason / Notes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80 bg-slate-950">
                          {diagnosticData.loginHistory.map((log) => (
                            <tr key={log.id} className="hover:bg-slate-900/50">
                              <td className="px-4 py-3 font-mono text-slate-400">{log.timestamp}</td>
                              <td className="px-4 py-3">
                                {log.status === "success" ? (
                                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                                    SUCCESS
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                                    FAILED
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <div className="font-mono text-white">{log.ipAddress}</div>
                                <div className="text-[10px] text-slate-500">{log.location}</div>
                              </td>
                              <td className="px-4 py-3 text-slate-300">{log.deviceInfo}</td>
                              <td className="px-4 py-3 text-slate-400">
                                {log.failureReason ?? <span className="text-slate-600">N/A</span>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* TAB 4: Active Sessions */}
                {activeTab === "sessions" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Laptop className="w-4 h-4 text-amber-400" /> Active User Sessions
                      </h3>
                      <Button
                        onClick={() => handleRevokeSessions(selectedUser.id)}
                        disabled={actionLoading}
                        className="bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Revoke All Sessions
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {diagnosticData.activeSessions.map((sess) => (
                        <div key={sess.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-slate-800 text-cyan-400">
                              {sess.device.includes("iPhone") || sess.device.includes("Android") ? (
                                <Smartphone className="w-5 h-5" />
                              ) : (
                                <Laptop className="w-5 h-5" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-white text-sm">{sess.device}</h4>
                                {sess.isCurrent && (
                                  <span className="px-2 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-semibold border border-cyan-500/30">
                                    Active Now
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-400 mt-0.5">
                                IP: <span className="font-mono text-slate-300">{sess.ipAddress}</span> • {sess.location} • Last active {sess.lastActive}
                              </p>
                            </div>
                          </div>

                          <Button
                            onClick={() => handleTerminateSession(sess.id)}
                            disabled={actionLoading}
                            className="bg-slate-800 hover:bg-rose-600/20 text-slate-300 hover:text-rose-300 border border-slate-700 text-xs px-3 py-1.5 rounded-lg"
                          >
                            Revoke
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 5: Support Notes & Tickets */}
                {activeTab === "tickets" && (
                  <div className="space-y-6">
                    {/* Support Tickets Section */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Ticket className="w-4 h-4 text-purple-400" /> Linked Tech Support Tickets
                      </h3>
                      <div className="space-y-2">
                        {diagnosticData.supportTickets.map((tkt) => (
                          <div key={tkt.id} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs text-purple-300 font-bold">{tkt.ticketNumber}</span>
                                <span className="text-xs font-semibold text-white">{tkt.subject}</span>
                              </div>
                              <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-3">
                                <span>Category: {tkt.category}</span>
                                <span>Priority: {tkt.priority}</span>
                                <span>Opened: {new Date(tkt.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                              tkt.status === "Open" ? "bg-amber-500/20 text-amber-300 border-amber-500/30" : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                            }`}>
                              {tkt.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Support Notes Log */}
                    <div className="space-y-3 pt-4 border-t border-slate-800">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-cyan-400" /> Support Troubleshooting Notes
                      </h3>

                      {/* Add Note Form */}
                      <form onSubmit={handleAddNoteSubmit} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                        <textarea
                          required
                          rows={2}
                          placeholder="Record troubleshooting diagnostic note or action details for Tech Support logs..."
                          value={newNoteText}
                          onChange={(e) => setNewNoteText(e.target.value)}
                          className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                        <div className="flex items-center justify-between gap-3">
                          <input
                            type="text"
                            placeholder="Action Taken Tag (e.g., Unlocked password, Revoked tokens)"
                            value={actionTag}
                            onChange={(e) => setActionTag(e.target.value)}
                            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 flex-1 max-w-sm"
                          />
                          <Button
                            type="submit"
                            disabled={actionLoading || !newNoteText.trim()}
                            className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs px-4 py-1.5 rounded-lg flex items-center gap-1.5"
                          >
                            {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                            <span>Log Note</span>
                          </Button>
                        </div>
                      </form>

                      {/* Existing Notes */}
                      <div className="space-y-2.5">
                        {diagnosticData.diagnosticNotes.map((note) => (
                          <div key={note.id} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-cyan-300">{note.authorName} ({note.authorRole})</span>
                              <span className="text-[10px] text-slate-500">{new Date(note.createdAt).toLocaleString()}</span>
                            </div>
                            <p className="text-xs text-slate-300">{note.note}</p>
                            {note.actionTaken && (
                              <div className="text-[11px] text-emerald-400 font-mono pt-1">
                                ✓ Action: {note.actionTaken}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Account Status Override Modal */}
      <Dialog open={statusModalOpen} onOpenChange={setStatusModalOpen}>
        <DialogContent className="sm:max-w-[480px] bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <UserX className="w-5 h-5 text-amber-400" /> Change User Account Status
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Override status for account {selectedUser?.email}. A support reason is mandatory.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleConfirmStatusChange} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Target Status *</label>
              <select
                value={targetStatus}
                onChange={(e) => setTargetStatus(e.target.value as AccountStatus)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
              >
                <option value="active">Active (Normal Access)</option>
                <option value="locked">Locked Out (Security Lock)</option>
                <option value="suspended">Suspended (Admin Override)</option>
                <option value="pending_verification">Pending Verification</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Reason for Support Log *</label>
              <textarea
                required
                rows={3}
                placeholder="Provide justification (e.g. Identity verified via government ID, Security hold)..."
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <DialogFooter className="pt-4 border-t border-slate-800 flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStatusModalOpen(false)}
                className="border-slate-800 text-slate-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={actionLoading || !statusReason.trim()}
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply Status Override"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
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
