"use client"

import { useState } from "react";
import { Plus, Edit2, Trash2, Building, Loader2, Search, CheckCircle, XCircle } from "lucide-react";
import { useProvinceService } from "@/services/provinceService";
import { useRegionService } from "@/services/regionService";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";

export default function ProvincesPage() {
  const { useProvinces, createProvince, updateProvince, deleteProvince } = useProvinceService();
  const { useRegions } = useRegionService();

  // Load Regions for Dropdowns & Filters
  const { data: regionsResponse } = useRegions(true);
  const regions = regionsResponse?.data ?? [];

  // Filter State
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">("all");

  // Load Provinces
  const { data: provincesResponse, isLoading, mutate, error } = useProvinces(selectedRegionFilter || null);
  const provinces = provincesResponse?.data ?? [];

  // Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Form State
  const [selectedProvinceId, setSelectedProvinceId] = useState<string | null>(null);
  const [regionId, setRegionId] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Filtered Provinces
  const filteredProvinces = provinces.filter((province) => {
    const matchesSearch = 
      province.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      province.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeFilter === "active") return matchesSearch && province.isActive;
    if (activeFilter === "inactive") return matchesSearch && !province.isActive;
    return matchesSearch;
  });

  // Handlers
  const handleOpenCreate = () => {
    setRegionId(regions[0]?.id ?? "");
    setCode("");
    setName("");
    setFormError(null);
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (province: typeof provinces[number]) => {
    setSelectedProvinceId(province.id);
    setRegionId(province.regionId);
    setCode(province.code);
    setName(province.name);
    setIsActive(province.isActive);
    setFormError(null);
    setIsEditOpen(true);
  };

  const handleOpenDelete = (province: typeof provinces[number]) => {
    setSelectedProvinceId(province.id);
    setName(province.name);
    setFormError(null);
    setIsDeleteOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regionId) {
      setFormError("Selecting a Region is required.");
      return;
    }
    if (!code.trim() || !name.trim()) {
      setFormError("Both Code and Name are required.");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    try {
      const response = await createProvince({ regionId, code, name });
      if (response.succeeded) {
        setIsCreateOpen(false);
        mutate();
      } else {
        setFormError(response.message || "Failed to create province.");
      }
    } catch (err: unknown) {
      setFormError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProvinceId) return;
    if (!regionId) {
      setFormError("Selecting a Region is required.");
      return;
    }
    if (!code.trim() || !name.trim()) {
      setFormError("Both Code and Name are required.");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    try {
      const response = await updateProvince(selectedProvinceId, { 
        id: selectedProvinceId, 
        regionId, 
        code, 
        name, 
        isActive 
      });
      if (response.succeeded) {
        setIsEditOpen(false);
        mutate();
      } else {
        setFormError(response.message || "Failed to update province.");
      }
    } catch (err: unknown) {
      setFormError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedProvinceId) return;
    setIsSubmitting(true);
    setFormError(null);
    try {
      const response = await deleteProvince(selectedProvinceId);
      if (response.succeeded) {
        setIsDeleteOpen(false);
        mutate();
      } else {
        setFormError(response.message || "Failed to delete province. Ensure no municipalities are linked to it.");
      }
    } catch (err: unknown) {
      setFormError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Building className="h-6 w-6 text-primary" /> Provinces Directory
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Configure provincial administrative districts.</p>
        </div>
        <Button onClick={handleOpenCreate} className="flex items-center gap-2 font-semibold">
          <Plus className="h-4 w-4" /> Add Province
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-slate-900/40 p-4 rounded-xl border border-slate-800/80">
        
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search provinces..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        </div>

        {/* Region Selector Filter */}
        <div className="w-full md:w-48">
          <select
            value={selectedRegionFilter}
            onChange={(e) => setSelectedRegionFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm cursor-pointer"
          >
            <option value="">All Regions</option>
            {regions.map((r) => (
              <option key={r.id} value={r.id}>{r.name} ({r.code})</option>
            ))}
          </select>
        </div>
        
        {/* Active Toggle Filters */}
        <div className="flex gap-2 w-full md:w-auto md:ml-auto">
          <Button
            variant={activeFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("all")}
          >
            All
          </Button>
          <Button
            variant={activeFilter === "active" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("active")}
          >
            Active Only
          </Button>
          <Button
            variant={activeFilter === "inactive" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("inactive")}
          >
            Inactive Only
          </Button>
        </div>
      </div>

      {/* Main Content Pane */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-lg">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-xs text-slate-400">Loading provinces database...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16 px-4">
            <p className="text-sm font-semibold text-red-500">Failed to load provinces.</p>
            <p className="text-xs text-slate-400 mt-1">Please check your backend service connections.</p>
            <Button onClick={() => mutate()} className="mt-4" size="sm" variant="outline">Retry</Button>
          </div>
        ) : filteredProvinces.length === 0 ? (
          <div className="text-center py-16 px-4">
            <p className="text-sm font-semibold text-slate-300">No provinces found.</p>
            <p className="text-xs text-slate-400 mt-1">Try resetting your search query or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Parent Region</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-sm">
                {filteredProvinces.map((province) => (
                  <tr key={province.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-white text-xs">{province.code}</td>
                    <td className="px-6 py-4 text-slate-200">{province.name}</td>
                    <td className="px-6 py-4 text-slate-400 text-xs">
                      {province.region?.name || "Loading parent region..."}
                    </td>
                    <td className="px-6 py-4">
                      {province.isActive ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                          <CheckCircle className="h-3 w-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          <XCircle className="h-3 w-3" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-1">
                      <Button onClick={() => handleOpenEdit(province)} size="icon" variant="ghost">
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button onClick={() => handleOpenDelete(province)} size="icon" variant="ghost" className="hover:text-red-400">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE DIALOG */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Province</DialogTitle>
            <DialogDescription>Define a new province linked to an active region.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Parent Region</label>
              <select
                value={regionId}
                onChange={(e) => setRegionId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary text-sm cursor-pointer"
              >
                <option value="" disabled>Select a Region</option>
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>{r.name} ({r.code})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Province Code</label>
              <input
                type="text"
                placeholder="e.g. MIS-OR"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Province Name</label>
              <input
                type="text"
                placeholder="e.g. Misamis Oriental"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>

            {formError && <p className="text-xs font-semibold text-red-500">{formError}</p>}

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Province"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT DIALOG */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Province</DialogTitle>
            <DialogDescription>Modify parameters for province configuration.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Parent Region</label>
              <select
                value={regionId}
                onChange={(e) => setRegionId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary text-sm cursor-pointer"
              >
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>{r.name} ({r.code})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Province Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Province Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>

            <div className="flex items-center gap-2 py-1">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-slate-800 bg-slate-900 text-primary focus:ring-primary focus:ring-offset-slate-950"
              />
              <label htmlFor="isActive" className="text-xs font-semibold text-slate-300 cursor-pointer">
                Province is Active
              </label>
            </div>

            {formError && <p className="text-xs font-semibold text-red-500">{formError}</p>}

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE DIALOG */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-500">Delete Province</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-bold text-white">{name}</span>? This action is permanent.
            </DialogDescription>
          </DialogHeader>

          {formError && <p className="text-xs font-semibold text-red-500 py-1">{formError}</p>}

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button type="button" variant="destructive" disabled={isSubmitting} onClick={handleDeleteSubmit}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
