"use client";

import { useState } from "react";
import { useApplicationStatusService, ApplicationStatusRef } from "@/services/applicationStatusService";
import {
  Layers,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Send,
  CreditCard,
  ShieldCheck,
  Info
} from "lucide-react";

const DEFAULT_STATUSES: ApplicationStatusRef[] = [
  {
    id: "1",
    statusCode: "DRAFT",
    name: "Draft Application",
    description: "Application initiated by applicant or system proxy; pending final submission.",
    category: "Draft",
    badgeColor: "cyan",
    displayOrder: 10,
    isActive: true,
  },
  {
    id: "2",
    statusCode: "SUBMITTED",
    name: "Submitted / Pending Screening",
    description: "Application successfully submitted; queued for initial document completeness review.",
    category: "Processing",
    badgeColor: "indigo",
    displayOrder: 20,
    isActive: true,
  },
  {
    id: "3",
    statusCode: "UNDER_REVIEW",
    name: "Technical Evaluation in Progress",
    description: "Assigned regulator officers are evaluating technical specifications and radio frequency details.",
    category: "Processing",
    badgeColor: "purple",
    displayOrder: 30,
    isActive: true,
  },
  {
    id: "4",
    statusCode: "PENDING_PAYMENT",
    name: "Payment Order Issued",
    description: "Statement of account generated; awaiting payment confirmation from gateway or Treasury.",
    category: "Payment",
    badgeColor: "amber",
    displayOrder: 40,
    isActive: true,
  },
  {
    id: "5",
    statusCode: "INSPECTION_SCHEDULED",
    name: "On-Site / Radio Inspection Scheduled",
    description: "Field inspectors dispatched or scheduled for radio station physical verification.",
    category: "Processing",
    badgeColor: "sky",
    displayOrder: 50,
    isActive: true,
  },
  {
    id: "6",
    statusCode: "APPROVED",
    name: "Application Approved",
    description: "Regional Director approved license issuance; permit generation queued.",
    category: "Final",
    badgeColor: "emerald",
    displayOrder: 60,
    isActive: true,
  },
  {
    id: "7",
    statusCode: "REJECTED",
    name: "Application Disapproved / Denied",
    description: "Application failed compliance requirements or document validation checks.",
    category: "Final",
    badgeColor: "rose",
    displayOrder: 70,
    isActive: true,
  },
];

import { ToastNotification, ToastMessage, getErrorMessage } from "@/components/ui/toast-notification";

export default function ApplicationStatusesPage() {
  const { useApplicationStatuses } = useApplicationStatusService();
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const { data: responseData, isLoading } = useApplicationStatuses();

  const statuses: ApplicationStatusRef[] = Array.isArray(responseData)
    ? responseData
    : responseData && Array.isArray(responseData.data)
    ? responseData.data
    : [];

  const filteredStatuses = statuses.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.statusCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "ALL" || s.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "Draft":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            Draft State
          </span>
        );
      case "Processing":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Processing Workflow
          </span>
        );
      case "Payment":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Payment Stage
          </span>
        );
      case "Final":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Terminal State
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">
            {category}
          </span>
        );
    }
  };

  const getStatusIcon = (statusCode: string) => {
    switch (statusCode) {
      case "DRAFT":
        return <Clock className="h-5 w-5 text-cyan-400" />;
      case "SUBMITTED":
        return <Send className="h-5 w-5 text-indigo-400" />;
      case "UNDER_REVIEW":
        return <Layers className="h-5 w-5 text-purple-400" />;
      case "PENDING_PAYMENT":
        return <CreditCard className="h-5 w-5 text-amber-400" />;
      case "INSPECTION_SCHEDULED":
        return <ShieldCheck className="h-5 w-5 text-sky-400" />;
      case "APPROVED":
        return <CheckCircle2 className="h-5 w-5 text-emerald-400" />;
      case "REJECTED":
        return <XCircle className="h-5 w-5 text-rose-400" />;
      default:
        return <Info className="h-5 w-5 text-slate-400" />;
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1400px] mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
            <Layers className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Application Statuses Reference</h1>
            <p className="text-sm text-slate-400">
              Master catalog of application lifecycle states, workflow progression codes, and state definitions.
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search status code or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {["ALL", "Draft", "Processing", "Payment", "Final"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                categoryFilter === cat
                  ? "bg-purple-600 text-white"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Statuses */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-500 font-mono text-sm">Loading application status references...</div>
      ) : filteredStatuses.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400 text-sm">
          No application statuses match your filter criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStatuses.map((st) => (
            <div
              key={st.id}
              className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-800 rounded-xl border border-slate-700">
                      {getStatusIcon(st.statusCode)}
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white">{st.name}</h3>
                      <p className="font-mono text-xs text-purple-400">{st.statusCode}</p>
                    </div>
                  </div>
                  {getCategoryBadge(st.category)}
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">{st.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>Display Order: #{st.displayOrder}</span>
                <span className="inline-flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" /> System Active
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
      <ToastNotification toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
