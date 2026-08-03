"use client"

import { useState } from "react";
import { Plus, Edit2, Trash2, Home, Loader2, Search, CheckCircle, XCircle } from "lucide-react";
import { useBarangayService } from "@/services/barangayService";
import { useMunicipalityService } from "@/services/municipalityService";
import { Button } from "@/components/ui/button";
import { ActionMenu } from "@/components/ui/action-menu";
import { Pagination } from "@/components/ui/pagination";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { isForbiddenError, PageForbiddenState } from "@/components/PageForbiddenState";

export default function BarangaysPage() {
  const { useBarangays, createBarangay, updateBarangay, deleteBarangay } = useBarangayService();
  const { useMunicipalities } = useMunicipalityService();

  // Load Municipalities for Dropdowns & Filters
  const { data: municipalitiesResponse } = useMunicipalities(null, true);
  const municipalities = municipalitiesResponse?.data ?? [];

  // Filter State
  const [selectedMunicipalityFilter, setSelectedMunicipalityFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">("all");

  // Load Barangays
  const { data: barangaysResponse, isLoading, mutate, error } = useBarangays(selectedMunicipalityFilter || null);
  const barangays = barangaysResponse?.data ?? [];

  // Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Form State
  const [selectedBarangayId, setSelectedBarangayId] = useState<string | null>(null);
  const [municipalityId, setMunicipalityId] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Filtered Barangays
  const filteredBarangays = barangays.filter((bar) => {
    const matchesSearch = 
      bar.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bar.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeFilter === "active") return matchesSearch && bar.isActive;
    if (activeFilter === "inactive") return matchesSearch && !bar.isActive;
    return matchesSearch;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const paginatedBarangays = filteredBarangays.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Handlers
  const handleOpenCreate = () => {
    setMunicipalityId(municipalities[0]?.id ?? "");
    setCode("");
    setName("");
    setFormError(null);
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (bar: typeof barangays[number]) => {
    setSelectedBarangayId(bar.id);
    setMunicipalityId(bar.municipalityId);
    setCode(bar.code);
    setName(bar.name);
    setIsActive(bar.isActive);
    setFormError(null);
    setIsEditOpen(true);
  };

  const handleOpenDelete = (bar: typeof barangays[number]) => {
    setSelectedBarangayId(bar.id);
    setName(bar.name);
    setFormError(null);
    setIsDeleteOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!municipalityId) {
      setFormError("Selecting a Municipality is required.");
      return;
    }
    if (!code.trim() || !name.trim()) {
      setFormError("Both Code and Name are required.");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    try {
      const response = await createBarangay({ municipalityId, code, name });
      if (response.succeeded) {
        setIsCreateOpen(false);
        mutate();
      } else {
        setFormError(response.message || "Failed to create barangay.");
      }
    } catch (err: unknown) {
      setFormError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBarangayId) return;
    if (!municipalityId) {
      setFormError("Selecting a Municipality is required.");
      return;
    }
    if (!code.trim() || !name.trim()) {
      setFormError("Both Code and Name are required.");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    try {
      const response = await updateBarangay(selectedBarangayId, { 
        id: selectedBarangayId, 
        municipalityId, 
        code, 
        name, 
        isActive 
      });
      if (response.succeeded) {
        setIsEditOpen(false);
        mutate();
      } else {
        setFormError(response.message || "Failed to update barangay.");
      }
    } catch (err: unknown) {
      setFormError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedBarangayId) return;
    setIsSubmitting(true);
    setFormError(null);
    try {
      const response = await deleteBarangay(selectedBarangayId);
      if (response.succeeded) {
        setIsDeleteOpen(false);
        mutate();
      } else {
        setFormError(response.message || "Failed to delete barangay.");
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
            <Home className="h-6 w-6 text-primary" /> Barangays Directory
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Configure local barangay boundaries and reference records.</p>
        </div>
        <Button onClick={handleOpenCreate} className="flex items-center gap-2 font-semibold">
          <Plus className="h-4 w-4" /> Add Barangay
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-slate-900/40 p-4 rounded-xl border border-slate-800/80">
        
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search barangays..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        </div>

        {/* Municipality Selector Filter */}
        <div className="w-full md:w-48">
          <select
            value={selectedMunicipalityFilter}
            onChange={(e) => setSelectedMunicipalityFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm cursor-pointer"
          >
            <option value="">All Municipalities</option>
            {municipalities.map((muni) => (
              <option key={muni.id} value={muni.id}>{muni.name} ({muni.code})</option>
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
            <p className="text-xs text-slate-400">Loading barangays database...</p>
          </div>
        ) : !!error && isForbiddenError(error) ? (
          <PageForbiddenState />
        ) : error ? (
          <div className="text-center py-16 px-4">
            <p className="text-sm font-semibold text-red-500">Failed to load barangays.</p>
            <p className="text-xs text-slate-400 mt-1">Please check your backend service connections.</p>
            <Button onClick={() => mutate()} className="mt-4" size="sm" variant="outline">Retry</Button>
          </div>
        ) : filteredBarangays.length === 0 ? (
          <div className="text-center py-16 px-4">
            <p className="text-sm font-semibold text-slate-300">No barangays found.</p>
            <p className="text-xs text-slate-400 mt-1">Try resetting your search query or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Parent Municipality</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-sm">
                {paginatedBarangays.map((bar) => (
                  <tr key={bar.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-white text-xs">{bar.code}</td>
                    <td className="px-6 py-4 text-slate-200">{bar.name}</td>
                    <td className="px-6 py-4 text-slate-400 text-xs">
                      {bar.municipality?.name || "Loading parent municipality..."}
                    </td>
                    <td className="px-6 py-4">
                      {bar.isActive ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                          <CheckCircle className="h-3 w-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          <XCircle className="h-3 w-3" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ActionMenu
                        items={[
                          {
                            label: "Edit Barangay",
                            icon: Edit2,
                            onClick: () => handleOpenEdit(bar),
                          },
                          {
                            label: "Delete Barangay",
                            icon: Trash2,
                            onClick: () => handleOpenDelete(bar),
                            variant: "destructive",
                          },
                        ]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredBarangays.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={filteredBarangays.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
          />
        )}
      </div>

      {/* CREATE DIALOG */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Barangay</DialogTitle>
            <DialogDescription>Define a new local barangay linked to an active municipality.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Parent Municipality</label>
              <select
                value={municipalityId}
                onChange={(e) => setMunicipalityId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary text-sm cursor-pointer"
              >
                <option value="" disabled>Select a Municipality</option>
                {municipalities.map((m) => (
                  <option key={m.id} value={m.id}>{m.name} ({m.code})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Barangay Code</label>
              <input
                type="text"
                placeholder="e.g. CDO-BAR-01"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Barangay Name</label>
              <input
                type="text"
                placeholder="e.g. Nazareth"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>

            {formError && <p className="text-xs font-semibold text-red-500">{formError}</p>}

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Barangay"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT DIALOG */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Barangay</DialogTitle>
            <DialogDescription>Modify parameters for barangay configuration.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Parent Municipality</label>
              <select
                value={municipalityId}
                onChange={(e) => setMunicipalityId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary text-sm cursor-pointer"
              >
                {municipalities.map((m) => (
                  <option key={m.id} value={m.id}>{m.name} ({m.code})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Barangay Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Barangay Name</label>
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
                Barangay is Active
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
            <DialogTitle className="text-red-500">Delete Barangay</DialogTitle>
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
