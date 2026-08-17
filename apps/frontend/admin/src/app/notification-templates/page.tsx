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
  Search,
  Monitor,
  Smartphone,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { ToastNotification, ToastMessage, getErrorMessage } from "@/components/ui/toast-notification";
import { isForbiddenError, PageForbiddenState } from "@/components/PageForbiddenState";

function getEmailSrcDoc(content: string): string {
  if (!content) {
    return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head><body style="margin:0;padding:40px 16px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;text-align:center;color:#94a3b8;background-color:#f1f5f9;"><p style="font-size:13px;margin:0;">No email body content to preview.</p></body></html>`;
  }
  if (content.includes("<html") || content.includes("<!DOCTYPE")) {
    return content;
  }
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { margin: 0; padding: 20px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6; background-color: #f1f5f9; }
    * { box-sizing: border-box; }
    @media only screen and (max-width: 620px) {
      body { padding: 12px 6px !important; }
    }
  </style>
</head>
<body>
  ${content}
</body>
</html>`;
}

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
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  const { data: responseData, mutate, isLoading, error } = useNotificationTemplates(1, 50, searchTerm);

  const templates: NotificationTemplate[] = Array.isArray(responseData)
    ? responseData
    : responseData && Array.isArray(responseData.data)
    ? responseData.data
    : [];

  const handleEdit = (t: NotificationTemplate) => {
    setSelectedTemplate(t);
    setSubject(t.subject);
    setBodyHtml(t.bodyHtml);
    setIsActive(t.isActive);
    setPreviewTab("code");
    setIsEditModalOpen(true);
  };

  const handlePreview = (t: NotificationTemplate) => {
    setSelectedTemplate(t);
    setSubject(t.subject);
    setBodyHtml(t.bodyHtml);
    setIsActive(t.isActive);
    setPreviewTab("preview");
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
    <div className="p-6 md:p-8 space-y-8 max-w-[1400px] mx-auto transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/90 dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-500/20">
            <Mail className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Notification Templates</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
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
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Templates List */}
      {!!error && isForbiddenError(error) && <PageForbiddenState />}
      {!!error && !isForbiddenError(error) && (
        <div className="p-12 text-center bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800">
          <p className="text-rose-500 font-medium text-base">Failed to load notification templates</p>
          <button onClick={() => mutate()} className="mt-4 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm hover:bg-slate-200 dark:hover:bg-slate-700 font-medium">Retry</button>
        </div>
      )}
      {!error && (
        <>
          {isLoading ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400 font-mono text-sm">Loading notification templates...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {templates.map((t) => (
                <div
                  key={t.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:border-indigo-500/40 dark:hover:border-slate-700 transition-all shadow-sm"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2.5 flex-wrap sm:flex-nowrap">
                      <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 font-semibold break-all leading-snug">
                        {t.eventKey}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0 ${
                          t.isActive
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        <CheckCircle className="h-3 w-3" />
                        {t.isActive ? "Active" : "Disabled"}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">{t.name}</h3>
                    <p className="text-slate-800 dark:text-slate-200 text-xs font-mono bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800/80 break-words">
                      <span className="text-slate-500 dark:text-slate-400 font-semibold">Subject:</span> {t.subject}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase text-slate-600 dark:text-slate-400 tracking-wider mb-2">Available Placeholders</p>
                    <div className="flex flex-wrap gap-1.5">
                      {t.availablePlaceholders.split(",").map((p) => (
                        <span
                          key={p}
                          className="inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-0.5 bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-300 rounded-md border border-slate-200 dark:border-slate-800"
                        >
                          <Tag className="h-2.5 w-2.5 text-indigo-600 dark:text-indigo-400" />
                          {p.trim()}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handlePreview(t)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700 transition-all"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Preview</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEdit(t)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-50 dark:bg-indigo-600/20 hover:bg-indigo-600 text-indigo-700 dark:text-indigo-300 hover:text-white rounded-xl text-xs font-medium border border-indigo-200 dark:border-indigo-500/30 transition-all"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      <span>Edit Template</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Edit / Preview Template Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="w-[calc(100vw-24px)] sm:w-full sm:max-w-3xl max-h-[92vh] sm:max-h-[90vh] flex flex-col p-0 overflow-hidden shadow-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
          <DialogHeader className="px-4 py-3.5 sm:px-6 sm:py-4 border-b border-slate-200 dark:border-slate-800 flex-shrink-0 bg-slate-50 dark:bg-slate-900/80 pr-10 sm:pr-12">
            <div className="flex flex-col gap-1.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-700 break-all">
                  {selectedTemplate?.eventKey}
                </span>
                <span className="text-xs text-slate-400">Email Notification Template</span>
              </div>
              <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-white break-words">
                {selectedTemplate?.name}
              </DialogTitle>
            </div>
          </DialogHeader>

          <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden min-h-0">
            {/* Scrollable Modal Body */}
            <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Subject
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  placeholder="e.g. Application Status Update - {{ApplicationNumber}}"
                />
              </div>

              {/* Dynamic placeholders reference */}
              {selectedTemplate?.availablePlaceholders && (
                <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800/80">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Available Dynamic Variables (Click to copy)
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTemplate.availablePlaceholders.split(",").map((p) => {
                      const trimmed = p.trim();
                      return (
                        <button
                          key={trimmed}
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(`{{${trimmed}}}`);
                            setToast({ message: `Copied {{${trimmed}}} to clipboard!`, type: "info" });
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 rounded-md border border-slate-200 dark:border-slate-800 hover:border-indigo-300 transition-colors"
                          title="Click to copy variable tag"
                        >
                          <Tag className="h-2.5 w-2.5" />
                          <span>{`{{${trimmed}}}`}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Email Content Editor & Preview */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Email Body Content
                  </label>
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setPreviewTab("preview")}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                        previewTab === "preview"
                          ? "bg-indigo-600 text-white shadow-sm font-semibold"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <Eye className="h-3 w-3" /> Live Email Preview
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewTab("code")}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                        previewTab === "code"
                          ? "bg-indigo-600 text-white shadow-sm font-semibold"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <FileCode className="h-3 w-3" /> HTML Code
                    </button>
                  </div>
                </div>

                {previewTab === "code" ? (
                  <div className="space-y-1.5">
                    <textarea
                      rows={12}
                      required
                      value={bodyHtml}
                      onChange={(e) => setBodyHtml(e.target.value)}
                      className="w-full max-h-[380px] px-3.5 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-emerald-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 overflow-y-auto leading-relaxed resize-y shadow-inner"
                      placeholder="Enter HTML email markup..."
                    />
                    <p className="text-[11px] text-slate-400">
                      Use standard HTML styling and placeholders (e.g. <code className="font-mono text-indigo-500">{'{{ApplicantName}}'}</code>).
                    </p>
                  </div>
                ) : (
                  <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm bg-slate-100 dark:bg-slate-950">
                    {/* Simulated Email Client Top Bar */}
                    <div className="bg-slate-200/80 dark:bg-slate-800/80 px-3 py-2 sm:px-4 sm:py-2.5 border-b border-slate-300 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block shrink-0" />
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block shrink-0" />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block shrink-0" />
                        <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">
                          Subject: {subject || "(No Subject)"}
                        </span>
                      </div>

                      {/* Device Mode Switcher */}
                      <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-0.5 rounded-lg border border-slate-300 dark:border-slate-700 self-end sm:self-auto shrink-0 shadow-sm">
                        <button
                          type="button"
                          onClick={() => setPreviewDevice("desktop")}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all ${
                            previewDevice === "desktop"
                              ? "bg-indigo-600 text-white shadow-sm"
                              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                          }`}
                          title="Preview on Desktop Email Client (Full Width)"
                        >
                          <Monitor className="w-3.5 h-3.5" /> Desktop
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewDevice("mobile")}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all ${
                            previewDevice === "mobile"
                              ? "bg-indigo-600 text-white shadow-sm"
                              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                          }`}
                          title="Preview on Mobile Phone (375px Viewport)"
                        >
                          <Smartphone className="w-3.5 h-3.5" /> Mobile (375px)
                        </button>
                      </div>
                    </div>

                    {/* Email Preview Body with Isolated Sandboxed Iframe */}
                    <div className="p-3 sm:p-5 bg-slate-200/60 dark:bg-slate-950 flex justify-center items-start min-h-[460px] overflow-x-auto">
                      <div
                        className={`transition-all duration-300 bg-white rounded-2xl overflow-hidden shadow-md flex flex-col ${
                          previewDevice === "mobile"
                            ? "w-[375px] max-w-full border-4 border-slate-800 dark:border-slate-700 shadow-2xl"
                            : "w-full max-w-[650px] border border-slate-200 dark:border-slate-800"
                        }`}
                      >
                        {previewDevice === "mobile" && (
                          <div className="bg-slate-800 dark:bg-slate-700 py-1.5 px-4 flex items-center justify-between text-[10px] text-slate-300 font-mono select-none">
                            <span>9:41</span>
                            <div className="w-14 h-3 bg-slate-900 rounded-full mx-auto" />
                            <span>100%</span>
                          </div>
                        )}
                        <iframe
                          key={`${previewDevice}-${subject}`}
                          title="Email Template Preview"
                          srcDoc={getEmailSrcDoc(bodyHtml)}
                          className="w-full h-[460px] sm:h-[490px] border-0 bg-white"
                          sandbox="allow-same-origin"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Toggle Active status */}
              <div className="flex items-center gap-2.5 pt-2">
                <input
                  type="checkbox"
                  id="templateActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="templateActive" className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  Enable this automated notification template
                </label>
              </div>
            </div>

            {/* Fixed Pinned Modal Footer */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 px-4 py-3 sm:px-6 sm:py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="w-full sm:w-auto px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl text-xs hover:bg-slate-100 dark:hover:bg-slate-700 font-medium transition-colors text-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="w-full sm:w-auto px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs hover:bg-indigo-500 font-semibold shadow-sm transition-colors disabled:opacity-50 text-center"
              >
                {isSaving ? "Saving Template..." : "Save Template"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ToastNotification toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
