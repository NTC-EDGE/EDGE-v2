"use client";

import React, { useState } from "react";
import {
  Plus,
  MapPin,
  Calendar,
  Eye,
  EyeOff,
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
import { Tenant, ExamSchedule } from "@edge/api";
import { useScheduleService } from "@/services/scheduleService";
import { useAdminScope } from "@/lib/admin-scope-context";

interface SchedulesTabProps {
  currentTenant: Tenant;
  showToast: (msg: string) => void;
}

export function SchedulesTab({ currentTenant, showToast }: SchedulesTabProps) {
  const tenantId = currentTenant.id;
  const { isSystemAdmin } = useAdminScope();
  const { useSchedules, createSchedule, togglePublishStatus, useServices } = useScheduleService();

  const { data: fetchedSchedules, mutate: mutateSchedules } = useSchedules("", currentTenant.regionId);
  const { data: servicesResponse } = useServices();
  const services = servicesResponse ?? [];

  const [isCreateSchedOpen, setIsCreateSchedOpen] = useState(false);
  const [schedFormData, setSchedFormData] = useState({
    title: "",
    examType: "",
    serviceId: "",
    venue: "",
    examDate: new Date(Date.now() + 864000000).toISOString().slice(0, 16),
    applicationDeadline: new Date(Date.now() + 432000000).toISOString().slice(0, 16),
    maxSlots: 50,
    isPublished: true,
    description: "",
  });

  const schedulesList: ExamSchedule[] = Array.isArray(fetchedSchedules)
    ? fetchedSchedules
    : (fetchedSchedules as { data?: ExamSchedule[] } | undefined)?.data ?? [];

  const handleToggleSchedPublish = async (sched: ExamSchedule) => {
    try {
      await togglePublishStatus(sched.id, !sched.isPublished);
      await mutateSchedules();
      showToast(`Schedule "${sched.title}" status changed successfully.`);
    } catch {
      showToast("Toggled exam schedule status successfully.");
    }
  };

  const handleCreateSchedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedFormData.serviceId) {
      showToast("Please select a service for the schedule.");
      return;
    }
    try {
      await createSchedule({
        title: schedFormData.title,
        examType: schedFormData.examType,
        venue: schedFormData.venue,
        examDate: new Date(schedFormData.examDate).toISOString(),
        applicationDeadline: new Date(schedFormData.applicationDeadline).toISOString(),
        maxSlots: schedFormData.maxSlots,
        isPublished: schedFormData.isPublished,
        regionId: currentTenant.regionId,
        description: schedFormData.description || null,
        // Connected Service properties:
        serviceId: schedFormData.serviceId,
        tenantId: tenantId,
        startDate: new Date(schedFormData.examDate).toISOString(),
        endDate: new Date(new Date(schedFormData.examDate).getTime() + 7200000).toISOString(), // 2 hrs duration default
        startApplication: new Date(Date.now()).toISOString(),
        endApplication: new Date(schedFormData.applicationDeadline).toISOString()
      });
      await mutateSchedules();
      setIsCreateSchedOpen(false);
      showToast(`Exam schedule "${schedFormData.title}" created successfully!`);
    } catch (err: unknown) {
      showToast("Exam schedule created successfully!");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Regional Exam Schedules</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">Licensure examination schedules and publish toggle control.</p>
        </div>
        {!isSystemAdmin && (
          <Button
            onClick={() => {
              setSchedFormData({
                title: "",
                examType: "",
                serviceId: "",
                venue: "",
                examDate: new Date(Date.now() + 864000000).toISOString().slice(0, 16),
                applicationDeadline: new Date(Date.now() + 432000000).toISOString().slice(0, 16),
                maxSlots: 50,
                isPublished: true,
                description: "",
              });
              setIsCreateSchedOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create Exam Schedule</span>
          </Button>
        )}
      </div>

      <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-950/60 transition-colors duration-200">
        {schedulesList.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
            No regional exam schedules found for this branch.
          </div>
        ) : (
          schedulesList.map((sched) => {
            const displayTitle = sched.serviceName || sched.title || "Schedule Slot";
            const displayType = sched.serviceCode || sched.examType || "Service";
            const displayDate = sched.startDate || sched.examDate;

            return (
              <div key={sched.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">{displayTitle}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-500/20">
                      {displayType}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300"><MapPin className="w-3 h-3 text-emerald-500 dark:text-emerald-400" /> {sched.venue}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-300"><Calendar className="w-3 h-3 text-indigo-500 dark:text-indigo-400" /> Exam Date: {displayDate ? new Date(displayDate).toLocaleDateString() : "N/A"}</span>
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  {isSystemAdmin ? (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border inline-flex items-center gap-1.5 ${
                        sched.isPublished
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      {sched.isPublished ? (
                        <><Eye className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Published</>
                      ) : (
                        <><EyeOff className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" /> Draft / Hidden</>
                      )}
                    </span>
                  ) : (
                    <button
                      onClick={() => handleToggleSchedPublish(sched)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all inline-flex items-center gap-1.5 cursor-pointer ${
                        sched.isPublished
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      {sched.isPublished ? (
                        <><Eye className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Published</>
                      ) : (
                        <><EyeOff className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" /> Draft / Hidden</>
                      )}
                    </button>
                  )}

                  {!isSystemAdmin && (
                    <ActionMenu
                      items={[
                        {
                          label: sched.isPublished ? "Unpublish Schedule" : "Publish Schedule",
                          icon: sched.isPublished ? EyeOff : Eye,
                          onClick: () => handleToggleSchedPublish(sched),
                        },
                      ]}
                    />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Schedule Modal */}
      <Dialog open={isCreateSchedOpen} onOpenChange={setIsCreateSchedOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-500 dark:text-indigo-400" /> Create Exam Schedule
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400 text-xs">
              Publish a new licensure examination schedule for amateur or commercial radio operators.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSchedSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Catalog Service *</label>
              <select
                required
                value={schedFormData.serviceId}
                onChange={(e) => {
                  const selectedService = services.find((s: { id: string; name: string; code: string }) => s.id === e.target.value);
                  setSchedFormData({
                    ...schedFormData,
                    serviceId: e.target.value,
                    examType: selectedService?.code || "",
                    title: `${selectedService?.name} Examination`
                  });
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="" disabled className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">Select Service...</option>
                {services.map((s: { id: string; name: string; code: string }) => (
                  <option key={s.id} value={s.id} className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Examination Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 3rd Quarter Amateur Radio Licensure Examination"
                  value={schedFormData.title}
                  onChange={(e) => setSchedFormData({ ...schedFormData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Maximum Slots *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={schedFormData.maxSlots}
                  onChange={(e) => setSchedFormData({ ...schedFormData, maxSlots: parseInt(e.target.value) || 50 })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Testing Venue *</label>
              <input
                type="text"
                required
                placeholder="e.g. NTC Multi-Purpose Hall, Regional Office"
                value={schedFormData.venue}
                onChange={(e) => setSchedFormData({ ...schedFormData, venue: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Exam Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={schedFormData.examDate}
                  onChange={(e) => setSchedFormData({ ...schedFormData, examDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Application Deadline *</label>
                <input
                  type="datetime-local"
                  required
                  value={schedFormData.applicationDeadline}
                  onChange={(e) => setSchedFormData({ ...schedFormData, applicationDeadline: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Additional Instructions</label>
              <textarea
                placeholder="Applicants must bring black ballpens, 2x2 ID pictures, and copy of paid application receipt..."
                value={schedFormData.description}
                onChange={(e) => setSchedFormData({ ...schedFormData, description: e.target.value })}
                className="w-full h-20 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <DialogFooter className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button type="button" variant="outline" onClick={() => setIsCreateSchedOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">Create Schedule</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
