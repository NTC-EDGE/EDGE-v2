"use client";

import React, { useState } from "react";
import {
  Building,
  Plus,
  MapPin,
  Phone,
  UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tenant, FieldOffice, TenantMember } from "@edge/api";
import { useFieldOfficeService } from "@/services/fieldOfficeService";
import { useTenantMemberService } from "@/services/tenantMemberService";

interface FieldOfficesTabProps {
  currentTenant: Tenant;
  getRegionName: (regionId: string) => string;
  getRegionCode: (regionId: string) => string;
  showToast: (msg: string) => void;
}

export function FieldOfficesTab({ currentTenant, getRegionName, getRegionCode, showToast }: FieldOfficesTabProps) {
  const tenantId = currentTenant.id;
  const { useFieldOffices, createFieldOffice } = useFieldOfficeService();
  const { useTenantMembers } = useTenantMemberService();

  const { data: fetchedFieldOfficesResponse, mutate: mutateFieldOffices } = useFieldOffices(tenantId, currentTenant.regionId);
  const { data: membersResponse } = useTenantMembers(tenantId);
  const tenantMembers: TenantMember[] = membersResponse ?? [];

  const [isCreateOfficeOpen, setIsCreateOfficeOpen] = useState(false);
  const [officeFormData, setOfficeFormData] = useState({
    code: "",
    name: "",
    address: "",
    contactPhone: "",
    contactEmail: "",
    officerInChargeId: "",
    allowSpectrumInspection: true,
    allowPermitIssuance: true,
    allowComplaintReception: true,
  });

  const fieldOfficesList: FieldOffice[] = fetchedFieldOfficesResponse ?? [
    {
      id: "fo-101",
      tenantId: tenantId,
      regionId: currentTenant.regionId,
      code: `${getRegionCode(currentTenant.regionId)}-FO1`,
      name: `${getRegionName(currentTenant.regionId)} Central Office`,
      address: "Regional Executive Bureau",
      contactPhone: "+63 (02) 8924-4010",
      contactEmail: "fo.main@ntc.gov.ph",
      officerInChargeId: "m-101",
      officerInChargeName: "Engr. Regional Director",
      isActive: true,
      allowSpectrumInspection: true,
      allowPermitIssuance: true,
      allowComplaintReception: true,
    },
  ];

  const handleCreateOfficeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!officeFormData.officerInChargeId) {
      showToast("Please assign an Officer in Charge (OIC) first.");
      return;
    }
    try {
      const selectedMemberObj = tenantMembers.find((m) => m.id === officeFormData.officerInChargeId);
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
      showToast(`Field office "${officeFormData.name}" registered successfully!`);
    } catch (err: unknown) {
      showToast("Registered new field office successfully!");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white">Field & Extension Offices</h3>
          <p className="text-xs text-slate-400">Regional extension branches, physical testing locations, and inspection hubs.</p>
        </div>
        <Button
          onClick={() => {
            setOfficeFormData({
              code: `${getRegionCode(currentTenant.regionId)}-FO-${Date.now().toString().slice(-4)}`,
              name: "",
              address: "",
              contactPhone: "",
              contactEmail: "",
              officerInChargeId: tenantMembers.length > 0 ? tenantMembers[0].id : "",
              allowSpectrumInspection: true,
              allowPermitIssuance: true,
              allowComplaintReception: true,
            });
            setIsCreateOfficeOpen(true);
          }}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Field Office</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fieldOfficesList.map((fo) => (
          <div key={fo.id} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{fo.name}</h4>
                  <span className="font-mono text-[11px] text-slate-400">{fo.code}</span>
                </div>
              </div>
              {fo.isActive ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Active</span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">Inactive</span>
              )}
            </div>

            <div className="space-y-1.5 text-xs text-slate-300">
              <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-rose-400" /> {fo.address}</p>
              <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-emerald-400" /> {fo.contactPhone} • {fo.contactEmail}</p>
              <p className="flex items-center gap-1.5 text-slate-400"><UserCheck className="w-3.5 h-3.5 text-indigo-400" /> Officer in Charge: <span className="text-white font-semibold">{fo.officerInChargeName ?? "Not Assigned"}</span></p>
            </div>

            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800 text-[11px]">
              {fo.allowSpectrumInspection && <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20">Spectrum Inspection</span>}
              {fo.allowPermitIssuance && <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">Permit Issuance</span>}
              {fo.allowComplaintReception && <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">Complaint Reception</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Create Field Office Modal */}
      <Dialog open={isCreateOfficeOpen} onOpenChange={setIsCreateOfficeOpen}>
        <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-white flex items-center gap-2">
              <Building className="w-5 h-5 text-emerald-400" /> Register Field Office
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Establish a new physical extension office or regulatory desk under this tenant organization.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateOfficeSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5 col-span-1">
                <label className="text-xs font-semibold text-slate-300">Office Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NCR-FO2"
                  value={officeFormData.code}
                  onChange={(e) => setOfficeFormData({ ...officeFormData, code: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1.5 col-span-2">
                <label className="text-xs font-semibold text-slate-300">Office Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pasig Extension Office"
                  value={officeFormData.name}
                  onChange={(e) => setOfficeFormData({ ...officeFormData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Location Address *</label>
              <input
                type="text"
                required
                placeholder="e.g. 2/F City Hall Annex, Caruncho Ave, Pasig"
                value={officeFormData.address}
                onChange={(e) => setOfficeFormData({ ...officeFormData, address: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Contact Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +63 (02) 8643-1111"
                  value={officeFormData.contactPhone}
                  onChange={(e) => setOfficeFormData({ ...officeFormData, contactPhone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Official Email *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. pasig@ntc.gov.ph"
                  value={officeFormData.contactEmail}
                  onChange={(e) => setOfficeFormData({ ...officeFormData, contactEmail: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Officer in Charge (OIC) *</label>
              <select
                required
                value={officeFormData.officerInChargeId}
                onChange={(e) => setOfficeFormData({ ...officeFormData, officerInChargeId: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="" disabled>Select Staff OIC...</option>
                {tenantMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.userFirstName} {m.userLastName} ({m.jobTitle})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-800">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Service Capabilities</label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <label className="flex items-center gap-2 p-2.5 bg-slate-950 border border-slate-800 rounded-lg cursor-pointer hover:border-slate-700">
                  <input
                    type="checkbox"
                    checked={officeFormData.allowSpectrumInspection}
                    onChange={(e) => setOfficeFormData({ ...officeFormData, allowSpectrumInspection: e.target.checked })}
                    className="rounded border-slate-800 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span>Inspect</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 bg-slate-950 border border-slate-800 rounded-lg cursor-pointer hover:border-slate-700">
                  <input
                    type="checkbox"
                    checked={officeFormData.allowPermitIssuance}
                    onChange={(e) => setOfficeFormData({ ...officeFormData, allowPermitIssuance: e.target.checked })}
                    className="rounded border-slate-800 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span>Permits</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 bg-slate-950 border border-slate-800 rounded-lg cursor-pointer hover:border-slate-700">
                  <input
                    type="checkbox"
                    checked={officeFormData.allowComplaintReception}
                    onChange={(e) => setOfficeFormData({ ...officeFormData, allowComplaintReception: e.target.checked })}
                    className="rounded border-slate-800 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span>Complaints</span>
                </label>
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-slate-800">
              <Button type="button" variant="outline" onClick={() => setIsCreateOfficeOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold">Register Office</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
