"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Loader2,
  Building2,
  Layers,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Search,
  Check,
  X,
  Tag,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCatalogService, ServiceItem } from "@/services/catalogService";
import { FormSchema } from "./types";

const EMPTY_FORMS: FormSchema[] = [];

interface CreateFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (
    name: string,
    description: string,
    version: string,
    isActive: boolean,
    serviceId?: string,
    serviceName?: string
  ) => void;
  isCreating?: boolean;
  existingForms?: FormSchema[];
}

export function CreateFormDialog({
  open,
  onOpenChange,
  onCreate,
  isCreating = false,
  existingForms = EMPTY_FORMS,
}: CreateFormDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [version, setVersion] = useState("1.0");
  const [isActive, setIsActive] = useState(true);
  const [selectedServiceId, setSelectedServiceId] = useState("");

  // Custom Service Dropdown state
  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false);
  const [serviceSearch, setServiceSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const { useServices, useServiceCategories } = useCatalogService();
  const { data: servicesResponse } = useServices(undefined, 1, 200);
  const { data: categoriesResponse } = useServiceCategories();

  const servicesList: ServiceItem[] = React.useMemo(() => {
    if (!servicesResponse) return [];
    return Array.isArray(servicesResponse)
      ? servicesResponse
      : Array.isArray(servicesResponse.data)
      ? servicesResponse.data
      : [];
  }, [servicesResponse]);

  const categoriesMap = React.useMemo(() => {
    const map = new Map<string, string>();
    const list = Array.isArray(categoriesResponse)
      ? categoriesResponse
      : categoriesResponse && Array.isArray(categoriesResponse.data)
      ? categoriesResponse.data
      : [];
    for (const c of list) {
      map.set(c.id, c.name);
    }
    return map;
  }, [categoriesResponse]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isServiceDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && e.target instanceof Node && !dropdownRef.current.contains(e.target)) {
        setIsServiceDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isServiceDropdownOpen]);

  const selectedService = React.useMemo(
    () => servicesList.find((s) => s.id === selectedServiceId) ?? null,
    [servicesList, selectedServiceId]
  );

  // Filter services by search query
  const filteredServices = React.useMemo(() => {
    const q = serviceSearch.trim().toLowerCase();
    if (!q) return servicesList;
    return servicesList.filter((s) => {
      const catName = s.serviceCategoryId ? categoriesMap.get(s.serviceCategoryId) : undefined;
      return (
        s.name.toLowerCase().includes(q) ||
        (s.code && s.code.toLowerCase().includes(q)) ||
        (catName && catName.toLowerCase().includes(q))
      );
    });
  }, [servicesList, serviceSearch, categoriesMap]);

  // Inspect existing forms for the selected service
  const matchedServiceForm = React.useMemo(() => {
    if (!selectedServiceId) return null;
    return existingForms.find((f) => f.serviceId === selectedServiceId) ?? null;
  }, [selectedServiceId, existingForms]);

  const activeServiceVersion = React.useMemo(() => {
    if (!matchedServiceForm) return null;
    if (matchedServiceForm.availableVersions && matchedServiceForm.availableVersions.length > 0) {
      return matchedServiceForm.availableVersions.find((v) => v.isActive)?.version ?? null;
    }
    return matchedServiceForm.isPublished || matchedServiceForm.isActive
      ? matchedServiceForm.version || "1.0"
      : null;
  }, [matchedServiceForm]);

  // Handle selecting a service and computing initial version/active defaults ONCE per selection
  const handleSelectService = (sId: string) => {
    setSelectedServiceId(sId);
    setIsServiceDropdownOpen(false);
    setServiceSearch("");

    if (!sId) {
      setVersion("1.0");
      setIsActive(true);
      return;
    }

    const svc = servicesList.find((x) => x.id === sId);
    if (svc && !name.trim()) {
      const match = svc.code ? svc.code.match(/^NTC[_-]1[_-](\d{2})$/i) : null;
      if (match) {
        setName(`NTC 1-${match[1]}: ${svc.name}`);
      } else {
        setName(`${svc.name} Form`);
      }
    }

    const existingForService = existingForms.find((f) => f.serviceId === sId);
    if (existingForService) {
      const allVers =
        existingForService.availableVersions && existingForService.availableVersions.length > 0
          ? existingForService.availableVersions.map((v) => parseFloat(v.version)).filter((n) => !isNaN(n))
          : [parseFloat(existingForService.version || "1.0")].filter((n) => !isNaN(n));
      const maxVer = allVers.length > 0 ? Math.max(...allVers) : 1;
      const nextVer = `${(Math.floor(maxVer) + 1).toFixed(1)}`;
      setVersion(nextVer);
      // Default to false when an active form already exists so it doesn't accidentally override live form,
      // but user can freely check the checkbox if they want to activate it immediately!
      setIsActive(false);
    } else {
      setVersion("1.0");
      setIsActive(true);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) return;

    onCreate(
      name.trim(),
      description.trim(),
      version.trim() || "1.0",
      isActive,
      selectedServiceId || undefined,
      selectedService?.name || undefined
    );
    resetForm();
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setVersion("1.0");
    setIsActive(true);
    setSelectedServiceId("");
    setServiceSearch("");
    setIsServiceDropdownOpen(false);
  };

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      resetForm();
    }
    onOpenChange(value);
  };

  const inputClass =
    "w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-xl max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
            Create New Form
          </DialogTitle>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure form details, associated application service, and version settings.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Associated Service Searchable Dropdown */}
          <div ref={dropdownRef} className="relative">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              Associated Service (Application Type)
            </label>

            <button
              type="button"
              onClick={() => setIsServiceDropdownOpen((prev) => !prev)}
              className="w-full flex items-start justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600 rounded-xl text-left transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer overflow-hidden"
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
                  {selectedService ? (
                    <Building2 className="w-4 h-4" />
                  ) : (
                    <Tag className="w-4 h-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  {selectedService ? (
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap min-w-0">
                        {selectedService.code && (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shrink-0">
                            {selectedService.code}
                          </span>
                        )}
                        {selectedService.serviceCategoryId && categoriesMap.get(selectedService.serviceCategoryId) && (
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {categoriesMap.get(selectedService.serviceCategoryId)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white leading-snug break-words">
                        {selectedService.name}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
                        No Specific Service (Standalone Form)
                      </span>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                        Click to select an application service from catalog
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 mt-1">
                {selectedService && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectService("");
                    }}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
                    title="Clear selection"
                  >
                    <X className="w-3.5 h-3.5" />
                  </span>
                )}
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-150 ${
                    isServiceDropdownOpen ? "rotate-180 text-indigo-500" : ""
                  }`}
                />
              </div>
            </button>

            {/* Custom Presentable Dropdown Menu */}
            {isServiceDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
                {/* Search Input inside Dropdown */}
                <div className="p-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60">
                  <div className="relative flex items-center">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                    <input
                      type="text"
                      value={serviceSearch}
                      onChange={(e) => setServiceSearch(e.target.value)}
                      placeholder="Search service name or code..."
                      className="w-full pl-8 pr-8 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      autoFocus
                    />
                    {serviceSearch && (
                      <button
                        type="button"
                        onClick={() => setServiceSearch("")}
                        className="absolute right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Options List — Strictly limited to 5 visible rows (5 x 44px = 220px) and scrollable */}
                <div
                  onWheel={(e) => e.stopPropagation()}
                  className="max-h-[220px] overflow-y-auto overscroll-contain divide-y divide-slate-100 dark:divide-slate-800/60 p-1"
                >
                  {/* Standalone Option */}
                  {!serviceSearch.trim() && (
                    <button
                      type="button"
                      onClick={() => handleSelectService("")}
                      className={`w-full min-h-[44px] py-2 px-3 flex items-center justify-between gap-2.5 rounded-lg text-left transition-colors cursor-pointer min-w-0 overflow-hidden ${
                        selectedServiceId === ""
                          ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-xs font-semibold truncate">
                          No Specific Service (Standalone)
                        </span>
                      </div>
                      {selectedServiceId === "" && (
                        <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      )}
                    </button>
                  )}

                  {filteredServices.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      No application services match &ldquo;{serviceSearch}&rdquo;
                    </div>
                  ) : (
                    filteredServices.map((svc) => {
                      const isSelected = svc.id === selectedServiceId;

                      return (
                        <button
                          key={svc.id}
                          type="button"
                          onClick={() => handleSelectService(svc.id)}
                          title={svc.name}
                          className={`w-full min-h-[44px] py-2 px-3 flex items-center justify-between gap-2.5 rounded-lg text-left transition-colors cursor-pointer min-w-0 overflow-hidden ${
                            isSelected
                              ? "bg-indigo-50 dark:bg-indigo-950/60"
                              : "hover:bg-slate-50 dark:hover:bg-slate-800/60"
                          }`}
                        >
                          <span
                            className={`text-xs font-semibold truncate min-w-0 flex-1 ${
                              isSelected
                                ? "text-indigo-700 dark:text-indigo-300"
                                : "text-slate-800 dark:text-slate-200"
                            }`}
                          >
                            {svc.name}
                          </span>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {svc.code && (
                              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                {svc.code}
                              </span>
                            )}
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                            )}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Form Name */}
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
              maxLength={150}
            />
          </div>

          {/* Version & Set Active Checkbox */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                Version <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="e.g. 1.0 or 2.0"
                className={inputClass}
                required
                maxLength={20}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Client Portal Status
              </label>
              <button
                type="button"
                role="checkbox"
                aria-checked={isActive}
                onClick={() => setIsActive((prev) => !prev)}
                className={`w-full h-[42px] px-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold transition-all cursor-pointer select-none ${
                  isActive
                    ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300"
                    : "bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                      isActive
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600"
                    }`}
                  >
                    {isActive && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span>Set as Active</span>
                </div>
                <span className="text-[10px] font-normal opacity-80">
                  {isActive ? "Live" : "Draft"}
                </span>
              </button>
            </div>
          </div>

          {/* Contextual notice when service already has an active form */}
          {selectedServiceId && activeServiceVersion ? (
            <div
              className={`p-3 rounded-xl border text-xs leading-relaxed flex items-start gap-2.5 min-w-0 overflow-hidden ${
                isActive
                  ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200"
                  : "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-200"
              }`}
            >
              {isActive ? (
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              )}
              <div className="min-w-0 flex-1 break-words">
                {isActive ? (
                  <span>
                    <strong>Note:</strong> This service currently has active version{" "}
                    <strong>v{activeServiceVersion}</strong>. Setting <strong>v{version}</strong> as active
                    will replace it on the client portal.
                  </span>
                ) : (
                  <span>
                    <strong>Safe Draft:</strong> Version <strong>v{version}</strong> will be created as an
                    inactive draft. Current active version <strong>v{activeServiceVersion}</strong> will
                    remain live on the client portal.
                  </span>
                )}
              </div>
            </div>
          ) : null}

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description of the form's purpose or version notes..."
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
              disabled={!name.trim() || !version.trim() || isCreating}
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
