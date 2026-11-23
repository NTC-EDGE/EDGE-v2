"use client";

import { useState, useMemo } from "react";
import {
  MessageSquare,
  Search,
  Star,
  Building2,
  Mail,
  User,
  EyeOff,
  Trash2,
  RefreshCw,
  AlertTriangle,
  Calendar,
} from "lucide-react";
import { safeAsync } from "@edge/api";
import {
  useFeedbackService,
  AdminFeedbackItem,
  PublicRegionalOfficeOption,
} from "@/services/feedbackService";
import { ConfirmActionDialog } from "@/components/ui/confirm-action-dialog";
import {
  ToastNotification,
  ToastMessage,
  getErrorMessage,
} from "@/components/ui/toast-notification";
import {
  isForbiddenError,
  PageForbiddenState,
} from "@/components/PageForbiddenState";

export default function FeedbackPage() {
  const { useFeedbacks, useRegionalOffices, deleteFeedback } =
    useFeedbackService();

  const [selectedTenantId, setSelectedTenantId] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [ratingFilter, setRatingFilter] = useState<string>("ALL");
  const [deletingItem, setDeletingItem] = useState<AdminFeedbackItem | null>(
    null
  );
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const {
    data: feedbackResponse,
    mutate,
    isLoading,
    error,
  } = useFeedbacks(selectedTenantId);

  const { data: officesResponse } = useRegionalOffices();

  const feedbacks: AdminFeedbackItem[] = useMemo(() => {
    if (Array.isArray(feedbackResponse)) {
      return feedbackResponse;
    }
    if (feedbackResponse && Array.isArray(feedbackResponse.data)) {
      return feedbackResponse.data;
    }
    return [];
  }, [feedbackResponse]);

  const regionalOffices: PublicRegionalOfficeOption[] = useMemo(() => {
    if (Array.isArray(officesResponse)) {
      return officesResponse;
    }
    if (officesResponse && Array.isArray(officesResponse.data)) {
      return officesResponse.data;
    }
    return [];
  }, [officesResponse]);

  const filteredFeedbacks = useMemo(() => {
    const lower = searchTerm.trim().toLowerCase();
    return feedbacks.filter((item) => {
      const matchesSearch =
        lower.length === 0 ||
        item.subject.toLowerCase().includes(lower) ||
        item.message.toLowerCase().includes(lower) ||
        item.senderName.toLowerCase().includes(lower) ||
        item.senderEmail.toLowerCase().includes(lower) ||
        (item.tenantName ?? "").toLowerCase().includes(lower) ||
        (item.tenantCode ?? "").toLowerCase().includes(lower);

      const matchesRating =
        ratingFilter === "ALL" ||
        (ratingFilter === "5" && item.rating === 5) ||
        (ratingFilter === "4" && item.rating === 4) ||
        (ratingFilter === "3" && item.rating === 3) ||
        (ratingFilter === "LOW" && item.rating <= 2);

      return matchesSearch && matchesRating;
    });
  }, [feedbacks, searchTerm, ratingFilter]);

  const stats = useMemo(() => {
    const total = feedbacks.length;
    const avgRating =
      total > 0
        ? (
            feedbacks.reduce((sum, item) => sum + item.rating, 0) / total
          ).toFixed(1)
        : "0.0";
    const distinctOffices = new Set(
      feedbacks.map((f) => f.tenantName || "NTC Central Office")
    ).size;
    const anonymousCount = feedbacks.filter((f) => f.isAnonymous).length;

    return {
      total,
      avgRating,
      distinctOffices,
      anonymousCount,
    };
  }, [feedbacks]);

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    const [, err] = await safeAsync(deleteFeedback(deletingItem.id));
    if (err) {
      setToast({
        message: getErrorMessage(err, "Failed to delete feedback submission."),
        type: "error",
      });
    } else {
      setToast({
        message: "Feedback report deleted successfully.",
        type: "success",
      });
      mutate();
    }
    setDeletingItem(null);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3.5 w-3.5 ${
              star <= rating
                ? "fill-amber-400 text-amber-400"
                : "text-slate-300 dark:text-slate-700"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1400px] mx-auto transition-colors duration-200">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/90 dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-500/20">
            <MessageSquare className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Reported Client Feedbacks
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Review citizen and client feedback reports addressed to NTC
              Regional Offices nationwide.
            </p>
          </div>
        </div>
        <button
          onClick={() => mutate()}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-medium transition-all"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Reported Feedbacks
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {stats.total}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Average Satisfaction
          </p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-2xl font-bold text-amber-500">
              {stats.avgRating}
            </p>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              / 5.0 stars
            </span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Regional Offices Addressed
          </p>
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
            {stats.distinctOffices}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Anonymous Reports
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {stats.anonymousCount}
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search subject, message, sender, or regional office..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <select
            value={selectedTenantId}
            onChange={(e) => setSelectedTenantId(e.target.value)}
            className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="ALL">All NTC Regional Offices</option>
            {regionalOffices.map((office) => (
              <option key={office.id} value={office.id}>
                {office.name} ({office.regionCode || office.code})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {[
            { key: "ALL", label: "All Ratings" },
            { key: "5", label: "5 ★" },
            { key: "4", label: "4 ★" },
            { key: "3", label: "3 ★" },
            { key: "LOW", label: "1-2 ★" },
          ].map((r) => (
            <button
              key={r.key}
              onClick={() => setRatingFilter(r.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                ratingFilter === r.key
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error / Forbidden States */}
      {!!error && isForbiddenError(error) && <PageForbiddenState />}
      {!!error && !isForbiddenError(error) && (
        <div className="p-12 text-center bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800">
          <AlertTriangle className="h-10 w-10 text-rose-500 mx-auto mb-3" />
          <p className="text-rose-500 font-medium text-base">
            Failed to load reported feedbacks
          </p>
          <button
            onClick={() => mutate()}
            className="mt-4 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm hover:bg-slate-200 dark:hover:bg-slate-700 font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Feedback List */}
      {!error && (
        <>
          {isLoading ? (
            <div className="p-12 text-center text-slate-500 font-mono text-sm">
              Loading reported feedbacks...
            </div>
          ) : filteredFeedbacks.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800">
              <MessageSquare className="h-10 w-10 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-900 dark:text-white font-medium text-base">
                No feedback submissions found
              </p>
              <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">
                Client feedback reports addressed to NTC Regional Offices will
                appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFeedbacks.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-indigo-500/40 dark:hover:border-slate-700 transition-all shadow-sm"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                        <Building2 className="h-3.5 w-3.5" />
                        {item.tenantName || "NTC Central Office"}
                      </span>

                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                        {item.subject || "General Feedback"}
                      </span>

                      {renderStars(item.rating)}

                      {item.isAnonymous && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          <EyeOff className="h-3 w-3" />
                          Anonymous
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(item.createdAt).toLocaleString()}
                      </span>
                      <button
                        onClick={() => setDeletingItem(item)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-all"
                        title="Delete feedback"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <p className="mt-3 text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {item.message}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      {item.senderName}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      {item.senderEmail}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <ConfirmActionDialog
        isOpen={Boolean(deletingItem)}
        title="Delete Feedback Report"
        description={`Are you sure you want to permanently delete this feedback report${
          deletingItem ? ` ("${deletingItem.subject}")` : ""
        }? This action cannot be undone.`}
        confirmLabel="Delete Feedback"
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeletingItem(null)}
      />

      <ToastNotification toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
