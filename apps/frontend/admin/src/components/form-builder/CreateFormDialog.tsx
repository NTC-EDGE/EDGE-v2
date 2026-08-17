"use client";

import React, { useState } from "react";
import { Loader2, Building2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCatalogService, ServiceItem } from "@/services/catalogService";

interface CreateFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (name: string, description: string, serviceId?: string, serviceName?: string) => void;
  isCreating?: boolean;
}

export function CreateFormDialog({
  open,
  onOpenChange,
  onCreate,
  isCreating = false,
}: CreateFormDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");

  const { useServices } = useCatalogService();
  const { data: servicesResponse } = useServices(undefined, 1, 100);

  const servicesList: ServiceItem[] = Array.isArray(servicesResponse)
    ? servicesResponse
    : servicesResponse && Array.isArray(servicesResponse.data)
    ? servicesResponse.data
    : [];

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) return;

    const matchedService = servicesList.find((s) => s.id === selectedServiceId);
    onCreate(
      name.trim(),
      description.trim(),
      selectedServiceId || undefined,
      matchedService?.name || undefined
    );
    setName("");
    setDescription("");
    setSelectedServiceId("");
  };

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      setName("");
      setDescription("");
      setSelectedServiceId("");
    }
    onOpenChange(value);
  };

  const inputClass =
    "w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Form</DialogTitle>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Give your form a name and optional service association to get started.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Form Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Radio Station Permit Application..."
              className={inputClass}
              required
              autoFocus
              maxLength={120}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-indigo-500" />
              Associated Service (Optional)
            </label>
            <select
              value={selectedServiceId}
              onChange={(e) => {
                const sId = e.target.value;
                setSelectedServiceId(sId);
                if (!name && sId) {
                  const s = servicesList.find((x) => x.id === sId);
                  if (s) setName(`${s.name} Form`);
                }
              }}
              className={inputClass}
            >
              <option value="">-- No Specific Service (Standalone) --</option>
              {servicesList.map((svc) => (
                <option key={svc.id} value={svc.id}>
                  {svc.name} {svc.code ? `(${svc.code})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description of the form's purpose..."
              className={`${inputClass} h-20 resize-none`}
              maxLength={500}
            />
          </div>

          <DialogFooter className="mt-4 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || isCreating}
              className="bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating…
                </>
              ) : (
                "Create Form"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
