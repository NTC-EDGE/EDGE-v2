"use client";

import React, { useState } from "react";
import {
  Building,
  Plus,
  MapPin,
  Phone,
  UserCheck,
  Power,
  PowerOff,
  Edit2,
  Trash2,
  AlertCircle,
  Loader2,
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
import { ConfirmActionDialog } from "@/components/ui/confirm-action-dialog";
import { showToast } from "@/components/ui/toast-notification";
import { Tenant, FieldOffice, TenantMember } from "@edge/api";
import { useFieldOfficeService } from "@/services/fieldOfficeService";
import { useTenantMemberService } from "@/services/tenantMemberService";

interface FieldOfficesTabProps {
  currentTenant: Tenant;
  getRegionCode: (regionId: string) => string;
}

export function FieldOfficesTab({ currentTenant, getRegionCode }: FieldOfficesTabProps) {
  const tenantId = currentTenant.id;
  const { useFieldOffices, createFieldOffice, updateFieldOffice, deleteFieldOffice, toggleFieldOfficeActive } = useFieldOfficeService();
  const { useTenantMembers } = useTenantMemberService();

  const [isCreateOfficeOpen, setIsCreateOfficeOpen] = useState(false);
  const [isEditOfficeOpen, setIsEditOfficeOpen] = useState(false);
  const [isDeleteOfficeOpen, setIsDeleteOfficeOpen] = useState(false);
  const [isToggleConfirmOpen, setIsToggleConfirmOpen] = useState(false);
  const [selectedOffice, setSelectedOffice] = useState<FieldOffice | null>(null);
  const [officeToToggle, setOfficeToToggle] = useState<FieldOffice | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [togglingActive, setTogglingActive] = useState(false);

  const { data: fetchedFieldOfficesResponse, mutate: mutateFieldOffices } = useFieldOffices(tenantId, currentTenant.regionId);
  const { data: membersResponse } = useTenantMembers(isCreateOfficeOpen || isEditOfficeOpen ? tenantId : null);
  const tenantMembers: TenantMember[] = membersResponse ?? [];

  const [officeFormData, setOfficeFormData] = useState({
    code: "",
    name: "",
    address: "",
    contactPhone: "",
    contactEmail: "",
    officerInChargeId: "",
    isActive: false,
    allowSpectrumInspection: true,
    allowPermitIssuance: true,
    allowComplaintReception: true,
  });

  const fieldOfficesList: FieldOffice[] = fetchedFieldOfficesResponse ?? [];

  const handleOpenCreate = () => {
    setOfficeFormData({
      code: `${getRegionCode(currentTenant.regionId)}-FO-${Date.now().toString().slice(-4)}`,
      name: "",
      address: "",
      contactPhone: "",
      contactEmail: "",
      officerInChargeId: tenantMembers.length > 0 ? tenantMembers[0].id : "",
      isActive: false,
      allowSpectrumInspection: true,
      allowPermitIssuance: true,
      allowComplaintReception: true,
    });
    setIsCreateOfficeOpen(true);
  };

  const handleOpenEdit = (fo: FieldOffice) => {
    setSelectedOffice(fo);
    setOfficeFormData({
      code: fo.code,
      name: fo.name,
      address: fo.address,
      contactPhone: fo.contactPhone,
      contactEmail: fo.contactEmail,
      officerInChargeId: fo.officerInChargeId ?? "",
      isActive: fo.isActive,
      allowSpectrumInspection: fo.allowSpectrumInspection,
      allowPermitIssuance: fo.allowPermitIssuance,
      allowComplaintReception: fo.allowComplaintReception,
    });
    setIsEditOfficeOpen(true);
  };

  const handleCreateOfficeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!officeFormData.officerInChargeId) {
      showToast.error("Please assign an Officer in Charge (OIC) first.");
      return;
    }
    setSubmitting(true);
    try {
      await createFieldOffice({
        tenantId: tenantId,
        regionId: currentTenant.regionId,
        code: officeFormData.code,
        name: officeFormData.name,
        address: officeFormData.address,
        contactPhone: officeFormData.contactPhone,
        contactEmail: officeFormData.contactEmail,
        officerInChargeId: officeFormData.officerInChargeId,
        allowSpectrumInspection: officeFormData.allowSpectrumInspection,
        allowPermitIssuance: officeFormData.allowPermitIssuance,
        allowComplaintReception: officeFormData.allowComplaintReception,
      });
      await mutateFieldOffices();
      setIsCreateOfficeOpen(false);
      showToast.success(
        `Field office "${officeFormData.name}" registered successfully as Inactive.`,
        "Provisioned with Inactive status."
      );
    } catch {
      showToast.error("Failed to register field office. Please verify the office code and fields.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditOfficeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOffice) return;
    setSubmitting(true);
    try {
      await updateFieldOffice(selectedOffice.id, {
        id: selectedOffice.id,
        tenantId: tenantId,
        regionId: currentTenant.regionId,
        code: officeFormData.code,
        name: officeFormData.name,
        address: officeFormData.address,
        contactPhone: officeFormData.contactPhone,
        contactEmail: officeFormData.contactEmail,
        officerInChargeId: officeFormData.officerInChargeId,
        isActive: officeFormData.isActive,
        allowSpectrumInspection: officeFormData.allowSpectrumInspection,
        allowPermitIssuance: officeFormData.allowPermitIssuance,
        allowComplaintReception: officeFormData.allowComplaintReception,
      });
      await mutateFieldOffices();
      setIsEditOfficeOpen(false);
      showToast.success(`Field office "${officeFormData.name}" updated successfully.`);
    } catch {
      showToast.error("Failed to update field office details.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActiveClick = (fo: FieldOffice) => {
    setOfficeToToggle(fo);
    setIsToggleConfirmOpen(true);
  };

  const handleConfirmToggleActive = async () => {
    if (!officeToToggle) return;
    setTogglingActive(true);
    try {
      const updated = await toggleFieldOfficeActive(officeToToggle.id, tenantId);
      await mutateFieldOffices();
      setIsToggleConfirmOpen(false);
      showToast.success(
        `Field office "${officeToToggle.name}" is now ${updated.isActive ? "Active" : "Inactive"}.`,
        updated.isActive ? "Operational services and permits enabled." : "Operations temporarily suspended."
      );
      setOfficeToToggle(null);
    } catch {
      showToast.error("Failed to toggle field office status. Please try again.");
    } finally {
      setTogglingActive(false);
    }
  };

  const handleDeleteOffice = async () => {
    if (!selectedOffice) return;
    setSubmitting(true);
    try {
      await deleteFieldOffice(selectedOffice.id, tenantId);
      await mutateFieldOffices();
      setIsDeleteOfficeOpen(false);
      showToast.success(`Field office "${selectedOffice.name}" deleted successfully.`);
    } catch {
      showToast.error("Failed to delete field office.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Field & Sub-Offices</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">Regional extension branches, physical testing locations, and regulatory desks.</p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Sub-Office</span>
        </Button>
      </div>

      {fieldOfficesList.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <Building className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">No Sub-Offices Registered</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Click &quot;Add Sub-Office&quot; to establish an extension branch or inspection station.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fieldOfficesList.map((fo) => (
            <div key={fo.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3 hover:border-emerald-500/30 transition-all shadow-sm">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2 min-w-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                      <Building className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate" title={fo.name}>{fo.name}</h4>
                      <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 block">{fo.code}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {fo.isActive ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        Inactive
                      </span>
                    )}

                    <ActionMenu
                      items={[
                        {
                          label: fo.isActive ? "Deactivate Sub-Office" : "Activate Sub-Office",
                          icon: fo.isActive ? PowerOff : Power,
                          onClick: () => handleToggleActiveClick(fo),
                        },
                        {
                          label: "Edit Sub-Office",
                          icon: Edit2,
                          onClick: () => handleOpenEdit(fo),
                        },
                        {
                          label: "Delete Sub-Office",
                          icon: Trash2,
                          onClick: () => {
                            setSelectedOffice(fo);
                            setIsDeleteOfficeOpen(true);
                          },
                          variant: "destructive" as const,
                        },
                      ]}
                    />
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 min-w-0">
                  <p className="flex items-start gap-1.5 min-w-0">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
                    <span className="break-words min-w-0">{fo.address || "No address provided"}</span>
                  </p>
                  <p className="flex items-start gap-1.5 min-w-0">
                    <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span className="break-all min-w-0">{fo.contactPhone || "No phone"} • {fo.contactEmail || "No email"}</span>
                  </p>
                  <p className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 min-w-0">
                    <UserCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span className="truncate">OIC: <strong className="text-slate-900 dark:text-white font-semibold">{fo.officerInChargeName ?? "Not Assigned"}</strong></span>
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1 text-[10px]">
                  {fo.allowSpectrumInspection && <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-300 border border-sky-500/20 shrink-0">Spectrum Inspection</span>}
                  {fo.allowPermitIssuance && <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20 shrink-0">Permit Issuance</span>}
                  {fo.allowComplaintReception && <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/20 shrink-0">Complaint Reception</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Field Office Modal */}
      <Dialog open={isCreateOfficeOpen} onOpenChange={setIsCreateOfficeOpen}>
        <DialogContent className="w-[calc(100vw-24px)] sm:w-full sm:max-w-[500px] max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white p-5 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Building className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> Register Sub-Office
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400 text-xs">
              Establish a new physical extension office or regulatory desk under this tenant organization.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateOfficeSubmit} className="space-y-4 pt-2">
            {/* Status Informational Note */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Default Inactive Status:</span> Newly created sub-offices start as <strong>Inactive</strong> by default until activated by an administrator.
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5 sm:col-span-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Office Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NCR-FO2"
                  value={officeFormData.code}
                  onChange={(e) => setOfficeFormData({ ...officeFormData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Office Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pasig Extension Office"
                  value={officeFormData.name}
                  onChange={(e) => setOfficeFormData({ ...officeFormData, name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Location Address *</label>
              <input
                type="text"
                required
                placeholder="e.g. 2/F City Hall Annex, Caruncho Ave, Pasig"
                value={officeFormData.address}
                onChange={(e) => setOfficeFormData({ ...officeFormData, address: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Contact Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +63 (02) 8643-1111"
                  value={officeFormData.contactPhone}
                  onChange={(e) => setOfficeFormData({ ...officeFormData, contactPhone: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Official Email *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. pasig@ntc.gov.ph"
                  value={officeFormData.contactEmail}
                  onChange={(e) => setOfficeFormData({ ...officeFormData, contactEmail: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Officer in Charge (OIC) *</label>
              <select
                required
                value={officeFormData.officerInChargeId}
                onChange={(e) => setOfficeFormData({ ...officeFormData, officerInChargeId: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="" disabled className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">Select Staff OIC...</option>
                {tenantMembers.map((m) => (
                  <option key={m.id} value={m.id} className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
                    {m.userFirstName} {m.userLastName} ({m.jobTitle})
                  </option>
                ))}
              </select>
            </div>


            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider block">Service Capabilities</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <label className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg cursor-pointer hover:border-slate-300 dark:hover:border-slate-700">
                  <input
                    type="checkbox"
                    checked={officeFormData.allowSpectrumInspection}
                    onChange={(e) => setOfficeFormData({ ...officeFormData, allowSpectrumInspection: e.target.checked })}
                    className="rounded border-slate-300 dark:border-slate-800 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="text-slate-700 dark:text-slate-300 text-xs">Inspect</span>
                </label>

                <label className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg cursor-pointer hover:border-slate-300 dark:hover:border-slate-700">
                  <input
                    type="checkbox"
                    checked={officeFormData.allowPermitIssuance}
                    onChange={(e) => setOfficeFormData({ ...officeFormData, allowPermitIssuance: e.target.checked })}
                    className="rounded border-slate-300 dark:border-slate-800 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="text-slate-700 dark:text-slate-300 text-xs">Permits</span>
                </label>

                <label className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg cursor-pointer hover:border-slate-300 dark:hover:border-slate-700">
                  <input
                    type="checkbox"
                    checked={officeFormData.allowComplaintReception}
                    onChange={(e) => setOfficeFormData({ ...officeFormData, allowComplaintReception: e.target.checked })}
                    className="rounded border-slate-300 dark:border-slate-800 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="text-slate-700 dark:text-slate-300 text-xs">Complaints</span>
                </label>
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-slate-200 dark:border-slate-800 flex-col-reverse sm:flex-row gap-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateOfficeOpen(false)} className="w-full sm:w-auto">Cancel</Button>
              <Button type="submit" disabled={submitting} className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold w-full sm:w-auto">
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
                Register Office
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Field Office Modal */}
      <Dialog open={isEditOfficeOpen} onOpenChange={setIsEditOfficeOpen}>
        <DialogContent className="w-[calc(100vw-24px)] sm:w-full sm:max-w-[500px] max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white p-5 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-indigo-500" /> Edit Sub-Office
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400 text-xs">
              Update branch information and operational active status.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditOfficeSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5 sm:col-span-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Office Code *</label>
                <input
                  type="text"
                  required
                  value={officeFormData.code}
                  onChange={(e) => setOfficeFormData({ ...officeFormData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Office Name *</label>
                <input
                  type="text"
                  required
                  value={officeFormData.name}
                  onChange={(e) => setOfficeFormData({ ...officeFormData, name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Location Address *</label>
              <input
                type="text"
                required
                value={officeFormData.address}
                onChange={(e) => setOfficeFormData({ ...officeFormData, address: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Contact Number *</label>
                <input
                  type="text"
                  required
                  value={officeFormData.contactPhone}
                  onChange={(e) => setOfficeFormData({ ...officeFormData, contactPhone: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Official Email *</label>
                <input
                  type="email"
                  required
                  value={officeFormData.contactEmail}
                  onChange={(e) => setOfficeFormData({ ...officeFormData, contactEmail: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Officer in Charge (OIC) *</label>
              <select
                required
                value={officeFormData.officerInChargeId}
                onChange={(e) => setOfficeFormData({ ...officeFormData, officerInChargeId: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="" disabled className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">Select Staff OIC...</option>
                {tenantMembers.map((m) => (
                  <option key={m.id} value={m.id} className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
                    {m.userFirstName} {m.userLastName} ({m.jobTitle})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
              <input
                type="checkbox"
                id="editFoActive"
                checked={officeFormData.isActive}
                onChange={(e) => setOfficeFormData({ ...officeFormData, isActive: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 dark:border-slate-800 text-emerald-600 focus:ring-emerald-500 bg-slate-100 dark:bg-slate-900 cursor-pointer"
              />
              <label htmlFor="editFoActive" className="text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer">
                Operational Active (Enable operations and services for this sub-office)
              </label>
            </div>

            <DialogFooter className="pt-4 border-t border-slate-200 dark:border-slate-800 flex-col-reverse sm:flex-row gap-2">
              <Button type="button" variant="outline" onClick={() => setIsEditOfficeOpen(false)} className="w-full sm:w-auto">Cancel</Button>
              <Button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold w-full sm:w-auto">
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Status Toggle Confirmation Dialog */}
      <ConfirmActionDialog
        isOpen={isToggleConfirmOpen}
        onClose={() => {
          if (!togglingActive) {
            setIsToggleConfirmOpen(false);
            setOfficeToToggle(null);
          }
        }}
        onConfirm={handleConfirmToggleActive}
        title={officeToToggle?.isActive ? "Deactivate Sub-Office Confirmation" : "Activate Sub-Office Confirmation"}
        description={
          officeToToggle?.isActive
            ? `Are you sure you want to deactivate "${officeToToggle.name}" (${officeToToggle.code})? Deactivating this sub-office will temporarily suspend its local spectrum inspection, permit issuance, and application reception services.`
            : `Are you sure you want to activate "${officeToToggle?.name}" (${officeToToggle?.code})? This will restore active operations and services for this sub-office.`
        }
        confirmLabel={officeToToggle?.isActive ? "Deactivate Sub-Office" : "Activate Sub-Office"}
        loading={togglingActive}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmActionDialog
        isOpen={isDeleteOfficeOpen}
        onClose={() => setIsDeleteOfficeOpen(false)}
        onConfirm={handleDeleteOffice}
        title="Delete Sub-Office"
        description={`Are you sure you want to delete "${selectedOffice?.name}"? This action cannot be undone.`}
        confirmLabel="Delete Office"
        loading={submitting}
      />
    </div>
  );
}

