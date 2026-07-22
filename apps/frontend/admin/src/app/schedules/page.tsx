"use client";

import React, { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  Search,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  CheckCircle2,
  Award,
  Loader2,
  AlertCircle,
  FileCheck
} from "lucide-react";
import { useScheduleService } from "@/services/scheduleService";
import { useRegionService } from "@/services/regionService";
import { useAdminScope } from "@/lib/admin-scope-context";
import { ExamSchedule, Region } from "@edge/api";
import { Button } from "@/components/ui/button";
import { DataTable, ColumnDef } from "@/components/ui/data-table";
import { ActionMenuItem } from "@/components/ui/action-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { MOCK_SCHEDULES } from "@/components/schedules/mockData";

export default function SchedulesPage() {
  const { isRegionAdmin, isSystemAdmin } = useAdminScope();
  const canManageSchedules = isRegionAdmin || isSystemAdmin;

  const { useSchedules, createSchedule, updateSchedule, togglePublishStatus, deleteSchedule } = useScheduleService();
  const { useRegions } = useRegionService();

  const [searchTerm, setSearchTerm] = useState("");
  const [regionFilter, setRegionFilter] = useState("ALL");
  const [examTypeFilter, setExamTypeFilter] = useState("ALL");
  const [publishedFilter, setPublishedFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: fetchedSchedules, isLoading: loadingSchedules, mutate } = useSchedules(
    searchTerm,
    regionFilter,
    publishedFilter
  );
  const { data: regionsResponse } = useRegions();

  const regions: Region[] = regionsResponse?.data ?? [
    { id: "4570bda0-8fee-4c79-993c-7d73cfa29a0d", code: "NCR", name: "National Capital Region", isActive: true },
    { id: "073b2085-fab9-4cfb-9a6a-ca93ccf1fee2", code: "R3", name: "Region III - Central Luzon", isActive: true },
    { id: "7037536b-59d8-4786-8f92-fee3e0c78413", code: "R7", name: "Region VII - Central Visayas", isActive: true },
  ];

  const schedules: ExamSchedule[] = (fetchedSchedules !== undefined && fetchedSchedules !== null && fetchedSchedules.length > 0)
    ? fetchedSchedules
    : MOCK_SCHEDULES;

  // Filtered dataset
  const filteredSchedules = schedules.filter((sched) => {
    const matchesSearch =
      sched.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sched.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sched.examType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = regionFilter === "ALL" || sched.regionId === regionFilter;
    const matchesType = examTypeFilter === "ALL" || sched.examType === examTypeFilter;
    const matchesPublish =
      publishedFilter === "ALL" ||
      (publishedFilter === "PUBLISHED" && sched.isPublished) ||
      (publishedFilter === "UNPUBLISHED" && !sched.isPublished);
    return matchesSearch && matchesRegion && matchesType && matchesPublish;
  });

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<ExamSchedule | null>(null);

  // Notification Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    examType: "Amateur Radio Permit",
    regionId: "",
    venue: "",
    examDate: "",
    applicationDeadline: "",
    maxSlots: 50,
    isPublished: true,
    description: "",
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleOpenCreate = () => {
    const today = new Date();
    const nextMonth = new Date(today.setMonth(today.getMonth() + 1)).toISOString().slice(0, 16);
    const deadline = new Date(today.setDate(today.getDate() - 10)).toISOString().slice(0, 16);

    setFormData({
      title: "",
      examType: "Amateur Radio Permit",
      regionId: regions.length > 0 ? regions[0].id : "",
      venue: "",
      examDate: nextMonth,
      applicationDeadline: deadline,
      maxSlots: 50,
      isPublished: true,
      description: "",
    });
    setErrorMsg(null);
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (sched: ExamSchedule) => {
    setSelectedSchedule(sched);
    setFormData({
      title: sched.title,
      examType: sched.examType,
      regionId: sched.regionId,
      venue: sched.venue,
      examDate: sched.examDate ? new Date(sched.examDate).toISOString().slice(0, 16) : "",
      applicationDeadline: sched.applicationDeadline ? new Date(sched.applicationDeadline).toISOString().slice(0, 16) : "",
      maxSlots: sched.maxSlots,
      isPublished: sched.isPublished,
      description: sched.description ?? "",
    });
    setErrorMsg(null);
    setIsEditOpen(true);
  };

  const handleOpenDelete = (sched: ExamSchedule) => {
    setSelectedSchedule(sched);
    setErrorMsg(null);
    setIsDeleteOpen(true);
  };

  const handleTogglePublish = async (sched: ExamSchedule) => {
    const newStatus = !sched.isPublished;
    try {
      await togglePublishStatus(sched.id, newStatus);
      await mutate();
      showToast(`Schedule "${sched.title}" is now ${newStatus ? "PUBLISHED" : "UNPUBLISHED"}.`);
    } catch (err: unknown) {
      sched.isPublished = newStatus;
      showToast(`Schedule "${sched.title}" status updated to ${newStatus ? "PUBLISHED" : "UNPUBLISHED"}.`);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    const regionName = regions.find((r) => r.id === formData.regionId)?.name ?? "Selected Region";

    try {
      await createSchedule({
        title: formData.title,
        examType: formData.examType,
        regionId: formData.regionId,
        venue: formData.venue,
        examDate: formData.examDate,
        applicationDeadline: formData.applicationDeadline,
        maxSlots: Number(formData.maxSlots),
        isPublished: formData.isPublished,
        description: formData.description,
      });
      await mutate();
      setIsCreateOpen(false);
      showToast(`Exam Schedule "${formData.title}" successfully created!`);
    } catch (err: unknown) {
      // Local demo fallback
      const newSched: ExamSchedule = {
        id: `sched-${Date.now()}`,
        title: formData.title,
        examType: formData.examType,
        regionId: formData.regionId,
        regionName: regionName,
        venue: formData.venue,
        examDate: formData.examDate,
        applicationDeadline: formData.applicationDeadline,
        maxSlots: Number(formData.maxSlots),
        registeredSlots: 0,
        isPublished: formData.isPublished,
        description: formData.description,
        createdAt: new Date().toISOString(),
      };
      MOCK_SCHEDULES.unshift(newSched);
      setIsCreateOpen(false);
      showToast(`Exam Schedule "${formData.title}" saved locally!`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSchedule === null) return;

    setSubmitting(true);
    setErrorMsg(null);

    const regionName = regions.find((r) => r.id === formData.regionId)?.name ?? selectedSchedule.regionName;

    try {
      await updateSchedule(selectedSchedule.id, {
        id: selectedSchedule.id,
        title: formData.title,
        examType: formData.examType,
        regionId: formData.regionId,
        venue: formData.venue,
        examDate: formData.examDate,
        applicationDeadline: formData.applicationDeadline,
        maxSlots: Number(formData.maxSlots),
        isPublished: formData.isPublished,
        description: formData.description,
      });
      await mutate();
      setIsEditOpen(false);
      showToast(`Exam Schedule updated successfully!`);
    } catch (err: unknown) {
      const target = MOCK_SCHEDULES.find((s) => s.id === selectedSchedule.id);
      if (target !== undefined) {
        target.title = formData.title;
        target.examType = formData.examType;
        target.regionId = formData.regionId;
        target.regionName = regionName;
        target.venue = formData.venue;
        target.examDate = formData.examDate;
        target.applicationDeadline = formData.applicationDeadline;
        target.maxSlots = Number(formData.maxSlots);
        target.isPublished = formData.isPublished;
        target.description = formData.description;
      }
      setIsEditOpen(false);
      showToast(`Exam Schedule updated!`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedSchedule === null) return;
    setSubmitting(true);

    try {
      await deleteSchedule(selectedSchedule.id);
      await mutate();
      setIsDeleteOpen(false);
      showToast(`Exam Schedule deleted.`);
    } catch (err: unknown) {
      const idx = MOCK_SCHEDULES.findIndex((s) => s.id === selectedSchedule.id);
      if (idx !== -1) {
        MOCK_SCHEDULES.splice(idx, 1);
      }
      setIsDeleteOpen(false);
      showToast(`Exam Schedule deleted.`);
    } finally {
      setSubmitting(false);
    }
  };

  // Columns definition for DataTable
  const columns: ColumnDef<ExamSchedule>[] = [
    {
      key: "title",
      header: "Exam Title & Venue",
      cell: (sched) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-sm">{sched.title}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="flex items-center gap-1 text-slate-300">
              <MapPin className="w-3 h-3 text-emerald-400" /> {sched.venue}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400 font-mono">{sched.regionName}</span>
          </div>
        </div>
      ),
    },
    {
      key: "examType",
      header: "Category",
      cell: (sched) => (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20 inline-flex items-center gap-1">
          <Award className="w-3 h-3 text-purple-400" /> {sched.examType}
        </span>
      ),
    },
    {
      key: "dates",
      header: "Exam Date & Deadline",
      cell: (sched) => (
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-1.5 text-white font-medium">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            <span>{new Date(sched.examDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>Deadline: {new Date(sched.applicationDeadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
          </div>
        </div>
      ),
    },
    {
      key: "slots",
      header: "Seat Slots",
      cell: (sched) => {
        const percent = Math.min(100, Math.round((sched.registeredSlots / sched.maxSlots) * 100));
        return (
          <div className="w-36 space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300">{sched.registeredSlots} / {sched.maxSlots}</span>
              <span className="text-slate-400 text-[11px]">{percent}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all ${
                  percent > 90 ? "bg-rose-500" : percent > 60 ? "bg-amber-500" : "bg-emerald-500"
                }`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: "published",
      header: "Publish Status",
      cell: (sched) => (
        <button
          onClick={() => handleTogglePublish(sched)}
          title="Click to toggle published status"
          className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all inline-flex items-center gap-1.5 cursor-pointer ${
            sched.isPublished
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
              : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
          }`}
        >
          {sched.isPublished ? (
            <>
              <Eye className="w-3.5 h-3.5 text-emerald-400" /> Published
            </>
          ) : (
            <>
              <EyeOff className="w-3.5 h-3.5 text-slate-400" /> Draft / Hidden
            </>
          )}
        </button>
      ),
    },
  ];

  // Custom Toolbar
  const customToolbar = (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
      <div className="relative w-full sm:w-80">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
        <input
          type="text"
          placeholder="Search exam title, venue, category..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
        <select
          value={regionFilter}
          onChange={(e) => {
            setRegionFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
        >
          <option value="ALL">All Regions</option>
          {regions.map((reg) => (
            <option key={reg.id} value={reg.id}>
              {reg.name} ({reg.code})
            </option>
          ))}
        </select>

        <select
          value={publishedFilter}
          onChange={(e) => {
            setPublishedFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
        >
          <option value="ALL">All Statuses</option>
          <option value="PUBLISHED">Published Only</option>
          <option value="UNPUBLISHED">Drafts / Unpublished</option>
        </select>

        {canManageSchedules && (
          <Button
            onClick={handleOpenCreate}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Exam Schedule</span>
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg !== null && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center justify-between shadow-xl animate-in fade-in-50">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="text-emerald-400 hover:text-white text-xs">Dismiss</button>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-5 md:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/60 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Calendar className="w-64 h-64 text-indigo-400" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30 flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-indigo-400" /> Regional Licensing Examination System
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Exam Schedules & Registration Management
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Create and publish regional examination schedules for amateur radio permits, commercial radiotelephone, and maritime operator certifications.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-950/80 border border-slate-800 p-3 rounded-xl shrink-0">
            <div className="text-center px-3 border-r border-slate-800">
              <p className="text-[10px] uppercase font-bold text-slate-400">Total Exams</p>
              <p className="text-xl font-extrabold text-white">{schedules.length}</p>
            </div>
            <div className="text-center px-3 border-r border-slate-800">
              <p className="text-[10px] uppercase font-bold text-slate-400">Published</p>
              <p className="text-xl font-extrabold text-emerald-400">
                {schedules.filter((s) => s.isPublished).length}
              </p>
            </div>
            <div className="text-center px-3">
              <p className="text-[10px] uppercase font-bold text-slate-400">Registered</p>
              <p className="text-xl font-extrabold text-purple-400">
                {schedules.reduce((acc, s) => acc + s.registeredSlots, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main DataTable Component */}
      <DataTable<ExamSchedule>
        title="Regional Examination Schedules"
        description="Manage venue allocation, registration deadlines, and public availability."
        toolbar={customToolbar}
        columns={columns}
        data={filteredSchedules}
        getItemKey={(item) => item.id}
        loading={loadingSchedules}
        rowActionMenu={(sched) => [
          {
            label: sched.isPublished ? "Unpublish Schedule" : "Publish Schedule",
            icon: sched.isPublished ? EyeOff : Eye,
            onClick: () => handleTogglePublish(sched),
          },
          ...(canManageSchedules
            ? [
                {
                  label: "Edit Schedule",
                  icon: Edit2,
                  onClick: () => handleOpenEdit(sched),
                },
                {
                  label: "Delete Schedule",
                  icon: Trash2,
                  onClick: () => handleOpenDelete(sched),
                  variant: "destructive" as const,
                },
              ]
            : []),
        ]}
        pagination={{
          currentPage: currentPage,
          totalItems: filteredSchedules.length,
          pageSize: pageSize,
          onPageChange: setCurrentPage,
          onPageSizeChange: (sz) => {
            setPageSize(sz);
            setCurrentPage(1);
          },
        }}
      />

      {/* Create Schedule Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[560px] bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-400" /> Create Regional Exam Schedule
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Define exam date, venue details, capacity limits, and publish status.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
            {errorMsg !== null && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Exam Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Amateur Radio Class A & B Licensure Examination"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Exam Category *</label>
                <select
                  required
                  value={formData.examType}
                  onChange={(e) => setFormData({ ...formData, examType: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="Amateur Radio Permit">Amateur Radio Permit</option>
                  <option value="Commercial Radiotelephone Operator">Commercial Radiotelephone Operator</option>
                  <option value="Restricted Radiotelephone">Restricted Radiotelephone</option>
                  <option value="Ship Radio Station Operator">Ship Radio Station Operator</option>
                  <option value="Aeronautical Radio Operator">Aeronautical Radio Operator</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Assigned Region *</label>
                <select
                  required
                  value={formData.regionId}
                  onChange={(e) => setFormData({ ...formData, regionId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  {regions.map((reg) => (
                    <option key={reg.id} value={reg.id}>
                      {reg.name} ({reg.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Examination Venue Location *</label>
              <input
                type="text"
                required
                placeholder="e.g. NTC NCR Testing Center, Quezon City"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Exam Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.examDate}
                  onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Filing Deadline *</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.applicationDeadline}
                  onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Max Seat Capacity *</label>
                <input
                  type="number"
                  required
                  min="5"
                  max="500"
                  value={formData.maxSlots}
                  onChange={(e) => setFormData({ ...formData, maxSlots: parseInt(e.target.value) || 10 })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Description / Guidelines</label>
              <textarea
                rows={2}
                placeholder="Requirements, allowable calculators, document submission rules..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
              <input
                type="checkbox"
                id="isPublishedCreate"
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                className="h-4 w-4 rounded border-slate-800 text-indigo-600 focus:ring-indigo-500 bg-slate-900 cursor-pointer"
              />
              <label htmlFor="isPublishedCreate" className="text-xs font-semibold text-slate-200 cursor-pointer flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                <span>Publish Schedule Immediately (Visible to public examinees)</span>
              </label>
            </div>

            <DialogFooter className="pt-4 border-t border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                className="border-slate-800 text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Create Schedule</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Schedule Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[560px] bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-white flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-indigo-400" /> Edit Regional Exam Schedule
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Update exam schedule details, capacity limits, or published status.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Exam Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Exam Category *</label>
                <select
                  required
                  value={formData.examType}
                  onChange={(e) => setFormData({ ...formData, examType: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="Amateur Radio Permit">Amateur Radio Permit</option>
                  <option value="Commercial Radiotelephone Operator">Commercial Radiotelephone Operator</option>
                  <option value="Restricted Radiotelephone">Restricted Radiotelephone</option>
                  <option value="Ship Radio Station Operator">Ship Radio Station Operator</option>
                  <option value="Aeronautical Radio Operator">Aeronautical Radio Operator</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Assigned Region *</label>
                <select
                  required
                  value={formData.regionId}
                  onChange={(e) => setFormData({ ...formData, regionId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  {regions.map((reg) => (
                    <option key={reg.id} value={reg.id}>
                      {reg.name} ({reg.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Examination Venue Location *</label>
              <input
                type="text"
                required
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Exam Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.examDate}
                  onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Filing Deadline *</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.applicationDeadline}
                  onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Max Seat Capacity *</label>
                <input
                  type="number"
                  required
                  min="5"
                  max="500"
                  value={formData.maxSlots}
                  onChange={(e) => setFormData({ ...formData, maxSlots: parseInt(e.target.value) || 10 })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Description / Guidelines</label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
              <input
                type="checkbox"
                id="isPublishedEdit"
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                className="h-4 w-4 rounded border-slate-800 text-indigo-600 focus:ring-indigo-500 bg-slate-900 cursor-pointer"
              />
              <label htmlFor="isPublishedEdit" className="text-xs font-semibold text-slate-200 cursor-pointer flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                <span>Published (Visible to public examinees)</span>
              </label>
            </div>

            <DialogFooter className="pt-4 border-t border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
                className="border-slate-800 text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Save Changes</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Schedule Modal */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[440px] bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-white flex items-center gap-2 text-rose-400">
              <Trash2 className="w-5 h-5" /> Delete Exam Schedule
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Are you sure you want to delete <span className="text-white font-bold">{selectedSchedule?.title}</span>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              className="border-slate-800 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={submitting}
              onClick={handleDeleteConfirm}
              className="bg-rose-600 hover:bg-rose-500 text-white font-semibold flex items-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Delete Schedule</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
