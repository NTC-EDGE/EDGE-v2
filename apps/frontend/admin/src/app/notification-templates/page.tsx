"use client";

import { useState } from "react";
import { safeAsync } from "@edge/api";
import { useNotificationTemplateService, NotificationTemplate } from "@/services/notificationTemplateService";
import {
  Mail,
  Edit2,
  CheckCircle,
  Eye,
  FileCode,
  Tag,
  Search
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { ToastNotification, ToastMessage, getErrorMessage } from "@/components/ui/toast-notification";

export default function NotificationTemplatesPage() {
  const { useNotificationTemplates, updateNotificationTemplate } = useNotificationTemplateService();
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [subject, setSubject] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [previewTab, setPreviewTab] = useState<"code" | "preview">("preview");

  const { data: responseData, mutate, isLoading } = useNotificationTemplates(1, 50, searchTerm);

  const templates: NotificationTemplate[] = Array.isArray(responseData)
    ? responseData
    : responseData && Array.isArray(responseData.data)
    ? responseData.data
    : [
        {
          id: "1",
          eventKey: "ApplicationSubmitted",
          name: "Application Submission Receipt",
          subject: "NTC EDGE - Application Submission Received [Ref: {{ReferenceNumber}}]",
          bodyHtml: "<p>Dear {{ApplicantName}},</p><p>Your application for <strong>{{ServiceName}}</strong> has been successfully received.</p>",
          availablePlaceholders: "{{ApplicantName}},{{ReferenceNumber}},{{ServiceName}},{{SubmissionDate}}",
          isActive: true,
        },
        {
          id: "2",
          eventKey: "ApplicationApproved",
          name: "Application Approval Notice",
          subject: "NTC EDGE - Permit Application Approved [Ref: {{ReferenceNumber}}]",
          bodyHtml: "<p>Dear {{ApplicantName}},</p><p>We are pleased to inform you that your application for <strong>{{ServiceName}}</strong> has been approved.</p>",
          availablePlaceholders: "{{ApplicantName}},{{ReferenceNumber}},{{ServiceName}},{{ApprovalDate}}",
          isActive: true,
        },
        {
          id: "3",
          eventKey: "PasswordReset",
          name: "Account Password Reset Instructions",
          subject: "NTC EDGE - Reset Your Password",
          bodyHtml: "<p>Hello {{ApplicantName}},</p><p>Click the link below to reset your portal password.</p>",
          availablePlaceholders: "{{ApplicantName}},{{ResetLink}},{{ExpiryTime}}",
          isActive: true,
        },
      ];

  const handleEdit = (t: NotificationTemplate) => {
    setSelectedTemplate(t);
    setSubject(t.subject);
    setBodyHtml(t.bodyHtml);
    setIsActive(t.isActive);
    setIsEditModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) return;

    setIsSaving(true);
    const [res, err] = await safeAsync(
      updateNotificationTemplate(selectedTemplate.id, {
        subject,
        bodyHtml,
        isActive,
      })
    );

    if (res) {
      setToast({ message: "Notification template updated successfully.", type: "success" });
      mutate();
      setIsEditModalOpen(false);
    } else {
      setToast({ message: getErrorMessage(err, "Failed to update notification template."), type: "error" });
    }
    setIsSaving(false);
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
            <Mail className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Notification Templates</h1>
            <p className="text-sm text-slate-400">
              Manage automated email templates triggered by system events with dynamic placeholders.
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search email templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Templates List */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-500 font-mono text-sm">Loading notification templates...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {templates.map((t) => (
            <div
              key={t.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    {t.eventKey}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      t.isActive
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    <CheckCircle className="h-3 w-3" />
                    {t.isActive ? "Active" : "Disabled"}
                  </span>
                </div>
                <h3 className="font-bold text-white text-lg">{t.name}</h3>
                <p className="text-slate-400 text-xs font-mono bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 truncate">
                  <span className="text-slate-500">Subject:</span> {t.subject}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase text-slate-500 tracking-wider mb-2">Available Placeholders</p>
                <div className="flex flex-wrap gap-1.5">
                  {t.availablePlaceholders.split(",").map((p) => (
                    <span
                      key={p}
                      className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 bg-slate-950 text-slate-300 rounded-md border border-slate-800"
                    >
                      <Tag className="h-2.5 w-2.5 text-indigo-400" />
                      {p.trim()}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => handleEdit(t)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-xl text-xs font-medium border border-indigo-500/30 transition-all"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  <span>Edit Template</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Template Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-slate-900 border border-slate-800 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">
              Edit Template: {selectedTemplate?.name}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 mt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Email Subject</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-400">Email Body (HTML)</label>
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setPreviewTab("preview")}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-all ${
                      previewTab === "preview" ? "bg-indigo-600 text-white font-medium" : "text-slate-400"
                    }`}
                  >
                    <Eye className="h-3 w-3" /> Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTab("code")}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-all ${
                      previewTab === "code" ? "bg-indigo-600 text-white font-medium" : "text-slate-400"
                    }`}
                  >
                    <FileCode className="h-3 w-3" /> HTML Code
                  </button>
                </div>
              </div>

              {previewTab === "code" ? (
                <textarea
                  rows={8}
                  required
                  value={bodyHtml}
                  onChange={(e) => setBodyHtml(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-emerald-400 focus:outline-none focus:border-indigo-500"
                />
              ) : (
                <div
                  className="w-full min-h-[160px] p-4 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: bodyHtml || "<p className='text-slate-500 text-xs'>No body content</p>" }}
                />
              )}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="templateActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="templateActive" className="text-xs text-slate-300">
                Enable this automated notification template
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm hover:bg-slate-700 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-500 font-medium disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Template"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ToastNotification toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
