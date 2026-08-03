"use client";

import { useState } from "react";
import useSWR from "swr";
import {
  Megaphone,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Wrench,
  AlertOctagon,
  Trash2,
  Edit,
  Globe
} from "lucide-react";
import { safeAsync } from "@edge/api";
import { useAnnouncementService, SystemAnnouncement } from "@/services/announcementService";
import { ConfirmActionDialog } from "@/components/ui/confirm-action-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { ToastNotification, ToastMessage, getErrorMessage } from "@/components/ui/toast-notification";
import { isForbiddenError, PageForbiddenState } from "@/components/PageForbiddenState";

export default function AnnouncementsPage() {
  const {
    useAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    togglePublishStatus,
    deleteAnnouncement,
  } = useAnnouncementService();

  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<SystemAnnouncement | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("Info");
  const [targetAudience, setTargetAudience] = useState("All");
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: responseData, mutate, isLoading, error } = useAnnouncements(1, 50, searchTerm, filterType);

  const announcements: SystemAnnouncement[] = Array.isArray(responseData)
    ? responseData
    : responseData && Array.isArray(responseData.data)
    ? responseData.data
    : [];

  const filteredAnnouncements = announcements.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "ALL" || a.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleOpenCreateModal = () => {
    setEditingAnnouncement(null);
    setTitle("");
    setMessage("");
    setType("Info");
    setTargetAudience("All");
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (a: SystemAnnouncement) => {
    setEditingAnnouncement(a);
    setTitle(a.title);
    setMessage(a.message);
    setType(a.type);
    setTargetAudience(a.targetAudience);
    setIsActive(a.isActive);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setIsSubmitting(true);

    if (editingAnnouncement) {
      const [res, err] = await safeAsync(
        updateAnnouncement(editingAnnouncement.id, {
          title,
          message,
          type,
          isActive,
          targetAudience,
        })
      );
      if (res) {
        setToast({ message: "System announcement updated successfully.", type: "success" });
        mutate();
        setIsModalOpen(false);
      } else {
        setToast({ message: getErrorMessage(err, "Failed to update announcement."), type: "error" });
      }
    } else {
      const [res, err] = await safeAsync(
        createAnnouncement({
          title,
          message,
          type,
          isActive,
          targetAudience,
        })
      );
      if (res) {
        setToast({ message: "New system announcement published successfully.", type: "success" });
        mutate();
        setIsModalOpen(false);
      } else {
        setToast({ message: getErrorMessage(err, "Failed to create announcement."), type: "error" });
      }
    }
    setIsSubmitting(false);
  };

  const handleTogglePublish = async (a: SystemAnnouncement) => {
    const [res, err] = await safeAsync(togglePublishStatus(a.id, !a.isActive));
    if (res) {
      setToast({ message: `Announcement status changed to ${!a.isActive ? "Published" : "Draft"}.`, type: "success" });
      mutate();
    } else {
      setToast({ message: getErrorMessage(err, "Failed to update publish status."), type: "error" });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    const [res, err] = await safeAsync(deleteAnnouncement(deletingId));
    if (err) {
      setToast({ message: getErrorMessage(err, "Failed to delete announcement."), type: "error" });
    } else {
      setToast({ message: "System announcement deleted successfully.", type: "success" });
      mutate();
    }
    setDeletingId(null);
  };

  const getTypeBadge = (announcementType: string) => {
    switch (announcementType) {
      case "Warning":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="h-3 w-3" /> Warning
          </span>
        );
      case "Maintenance":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Wrench className="h-3 w-3" /> Maintenance
          </span>
        );
      case "Emergency":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertOctagon className="h-3 w-3" /> Emergency
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Info className="h-3 w-3" /> Info
          </span>
        );
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1400px] mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
            <Megaphone className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">System Announcements</h1>
            <p className="text-sm text-slate-400">
              Create and publish global advisories, maintenance notices, and emergency banners for all portal users.
            </p>
          </div>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-600/20"
        >
          <Plus className="h-4 w-4" />
          <span>New Announcement</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 py-0.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search announcements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {["ALL", "Info", "Warning", "Maintenance", "Emergency"].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterType === t
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Announcements */}
      {!!error && isForbiddenError(error) && <PageForbiddenState />}
      {!!error && !isForbiddenError(error) && (
        <div className="p-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800">
          <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-3" />
          <p className="text-red-500 font-medium text-base">Failed to load announcements</p>
          <button onClick={() => mutate()} className="mt-4 px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm hover:bg-slate-700 font-medium">Retry</button>
        </div>
      )}
      {!error && (
        <>
          {isLoading ? (
            <div className="p-12 text-center text-slate-500 font-mono text-sm">Loading system announcements...</div>
          ) : filteredAnnouncements.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800">
              <Megaphone className="h-10 w-10 text-slate-600 mx-auto mb-3" />
              <p className="text-white font-medium text-base">No announcements found</p>
              <p className="text-slate-400 text-xs mt-1">Create an announcement banner to notify operational users.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAnnouncements.map((a) => (
                <div
                  key={a.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      {getTypeBadge(a.type)}
                      <button
                        onClick={() => handleTogglePublish(a)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                          a.isActive
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-slate-800 text-slate-400 border border-slate-700"
                        }`}
                      >
                        {a.isActive ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        {a.isActive ? "Published" : "Draft"}
                      </button>
                    </div>
                    <h3 className="font-bold text-white text-lg group-hover:text-indigo-400 transition-colors">
                      {a.title}
                    </h3>
                    <p className="text-slate-400 text-sm line-clamp-3 leading-relaxed">{a.message}</p>
                  </div>

                  <div className="pt-5 mt-5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-slate-400" />
                      <span>Audience: {a.targetAudience}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditModal(a)}
                        className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-all"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeletingId(a.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-all"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Create / Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-slate-900 border border-slate-800 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">
              {editingAnnouncement ? "Edit Announcement" : "New System Announcement"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Announcement Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Scheduled System Maintenance"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Info">Info</option>
                  <option value="Warning">Warning</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Target Audience</label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="All">All Users</option>
                  <option value="Clients">Clients / Applicants</option>
                  <option value="Staff">Staff & Admins</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Announcement Message</label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Detailed notification message text..."
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="isActive" className="text-xs text-slate-300">
                Publish immediately upon saving
              </label>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm hover:bg-slate-700 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-500 font-medium disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : editingAnnouncement ? "Update Announcement" : "Create Announcement"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <ConfirmActionDialog
        isOpen={Boolean(deletingId)}
        title="Delete System Announcement"
        description="Are you sure you want to permanently delete this announcement banner? This action cannot be undone."
        confirmLabel="Delete Announcement"
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeletingId(null)}
      />

      <ToastNotification toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
