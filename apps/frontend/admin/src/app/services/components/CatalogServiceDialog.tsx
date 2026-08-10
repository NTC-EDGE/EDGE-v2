"use client";

import { useState, useEffect } from "react";
import { Boxes } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ServiceCategory, ServiceItem } from "@/services/catalogService";

interface CatalogServiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    serviceCategoryId: string;
    tenantId: string | null;
    name: string;
    code: string | null;
    group: string | null;
    description: string | null;
  }) => Promise<void>;
  editingService: ServiceItem | null;
  isSubmitting: boolean;
  categories: ServiceCategory[];
  tenants: any[];
}

export function CatalogServiceDialog({
  isOpen,
  onClose,
  onSubmit,
  editingService,
  isSubmitting,
  categories,
  tenants,
}: CatalogServiceDialogProps) {
  const [serviceCategoryId, setServiceCategoryId] = useState("");
  const [serviceTenantId, setServiceTenantId] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [serviceCode, setServiceCode] = useState("");
  const [serviceGroup, setServiceGroup] = useState("");
  const [serviceDescription, setServiceDescription] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (editingService) {
        setServiceCategoryId(editingService.serviceCategoryId);
        setServiceTenantId(editingService.tenantId ?? "");
        setServiceName(editingService.name);
        setServiceCode(editingService.code ?? "");
        setServiceGroup(editingService.group ?? "");
        setServiceDescription(editingService.description ?? "");
      } else {
        setServiceCategoryId(categories.length > 0 ? categories[0].id : "");
        setServiceTenantId("");
        setServiceName("");
        setServiceCode("");
        setServiceGroup("");
        setServiceDescription("");
      }
    }
  }, [isOpen, editingService, categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      serviceCategoryId,
      tenantId: serviceTenantId.trim() ? serviceTenantId : null,
      name: serviceName.trim(),
      code: serviceCode.trim() ? serviceCode.trim() : null,
      group: serviceGroup.trim() ? serviceGroup.trim() : null,
      description: serviceDescription.trim() ? serviceDescription.trim() : null,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white max-w-lg w-full rounded-2xl p-6 shadow-2xl">
        <DialogHeader className="pb-3 border-b border-slate-200 dark:border-slate-800/60">
          <DialogTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Boxes className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
            {editingService ? "Edit Catalog Service" : "New Catalog Service"}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Create a new license type or general public service that users can apply for.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1.5">Service Category *</label>
            <select
              required
              value={serviceCategoryId}
              onChange={(e) => setServiceCategoryId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id} className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
                  {c.name} ({c.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1.5">
              Target Tenant / Branch <span className="text-slate-500 font-normal font-sans text-[9px]">(Optional)</span>
            </label>
            <select
              value={serviceTenantId}
              onChange={(e) => setServiceTenantId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
            >
              <option value="" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">Global / System-Wide Service (All Tenants)</option>
              {tenants.map((t) => (
                <option key={t.id} value={t.id} className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
                  {t.name} ({t.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1.5">Service Name *</label>
            <input
              type="text"
              required
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              placeholder="e.g. Amateur Radio Station License - Class A"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1.5">Service Code</label>
              <input
                type="text"
                value={serviceCode}
                onChange={(e) => setServiceCode(e.target.value)}
                placeholder="e.g. ARL-CLA"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono uppercase"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1.5">Service Group</label>
              <input
                type="text"
                value={serviceGroup}
                onChange={(e) => setServiceGroup(e.target.value)}
                placeholder="e.g. Amateur Radio"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1.5">Description</label>
            <textarea
              rows={3}
              value={serviceDescription}
              onChange={(e) => setServiceDescription(e.target.value)}
              placeholder="Summary description of service scope..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none font-medium"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-200 dark:border-slate-800/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-indigo-600/10 disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : editingService ? "Update Service" : "Create Service"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
