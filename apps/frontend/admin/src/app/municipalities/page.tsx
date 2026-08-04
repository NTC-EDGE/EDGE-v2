"use client"

import { useState } from "react";
import { Plus, Edit2, Trash2, Building2, Loader2, Search, CheckCircle, XCircle } from "lucide-react";
import { useMunicipalityService } from "@/services/municipalityService";
import { useProvinceService } from "@/services/provinceService";
import { Button } from "@/components/ui/button";
import { DataTable, ColumnDef } from "@/components/ui/data-table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { isForbiddenError, PageForbiddenState } from "@/components/PageForbiddenState";

export default function MunicipalitiesPage() {
  const { useMunicipalities, createMunicipality, updateMunicipality, deleteMunicipality } = useMunicipalityService();
  const { useProvinces } = useProvinceService();

  // Load Provinces for Dropdowns & Filters
  const { data: provincesResponse } = useProvinces(null, true);
  const provinces = provincesResponse?.data ?? [];

  // Filter State
  const [selectedProvinceFilter, setSelectedProvinceFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">("all");

  // Load Municipalities
  const { data: municipalitiesResponse, isLoading, mutate, error } = useMunicipalities(selectedProvinceFilter || null);
  const municipalities = municipalitiesResponse?.data ?? [];

  // Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Form State
  const [selectedMunicipalityId, setSelectedMunicipalityId] = useState<string | null>(null);
  const [provinceId, setProvinceId] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Filtered Municipalities
  const filteredMunicipalities = municipalities.filter((muni) => {
    const matchesSearch = 
      muni.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      muni.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeFilter === "active") return matchesSearch && muni.isActive;
    if (activeFilter === "inactive") return matchesSearch && !muni.isActive;
    return matchesSearch;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const paginatedMunicipalities = filteredMunicipalities.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Handlers
  const handleOpenCreate = () => {
    setProvinceId(provinces[0]?.id ?? "");
    setCode("");
    setName("");
    setFormError(null);
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (muni: typeof municipalities[number]) => {
    setSelectedMunicipalityId(muni.id);
    setProvinceId(muni.provinceId);
    setCode(muni.code);
    setName(muni.name);
    setIsActive(muni.isActive);
    setFormError(null);
    setIsEditOpen(true);
  };

  const handleOpenDelete = (muni: typeof municipalities[number]) => {
    setSelectedMunicipalityId(muni.id);
    setName(muni.name);
    setFormError(null);
    setIsDeleteOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provinceId) {
      setFormError("Selecting a Province is required.");
      return;
    }
    if (!code.trim() || !name.trim()) {
      setFormError("Both Code and Name are required.");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    try {
      const response = await createMunicipality({ provinceId, code, name });
      if (response.succeeded) {
        setIsCreateOpen(false);
        mutate();
      } else {
        setFormError(response.message || "Failed to create municipality.");
      }
    } catch (err: unknown) {
      setFormError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMunicipalityId) return;
    if (!provinceId) {
      setFormError("Selecting a Province is required.");
      return;
    }
    if (!code.trim() || !name.trim()) {
      setFormError("Both Code and Name are required.");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    try {
      const response = await updateMunicipality(selectedMunicipalityId, { 
        id: selectedMunicipalityId, 
        provinceId, 
        code, 
        name, 
        isActive 
      });
      if (response.succeeded) {
        setIsEditOpen(false);
        mutate();
      } else {
        setFormError(response.message || "Failed to update municipality.");
      }
    } catch (err: unknown) {
      setFormError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedMunicipalityId) return;
    setIsSubmitting(true);
    setFormError(null);
    try {
      const response = await deleteMunicipality(selectedMunicipalityId);
      if (response.succeeded) {
        setIsDeleteOpen(false);
        mutate();
      } else {
        setFormError(response.message || "Failed to delete municipality. Ensure no barangays are linked to it.");
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
            <Building2 className="h-6 w-6 text-primary" /> Municipalities / Cities Directory
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Configure local cities, municipalities, or township zones.</p>
        </div>
        <Button onClick={handleOpenCreate} className="flex items-center gap-2 font-semibold">
          <Plus className="h-4 w-4" /> Add Municipality
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-slate-900/40 p-4 rounded-xl border border-slate-800/80">
        
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search municipalities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        </div>

        {/* Province Selector Filter */}
        <div className="w-full md:w-48">
          <select
            value={selectedProvinceFilter}
            onChange={(e) => setSelectedProvinceFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm cursor-pointer"
          >
            <option value="">All Provinces</option>
            {provinces.map((prov) => (
              <option key={prov.id} value={prov.id}>{prov.name} ({prov.code})</option>
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
      {isLoading ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-lg flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-xs text-slate-400">Loading municipalities database...</p>
        </div>
      ) : !!error && isForbiddenError(error) ? (
        <PageForbiddenState />
      ) : error ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-lg text-center py-16 px-4">
          <p className="text-sm font-semibold text-red-500">Failed to load municipalities.</p>
          <p className="text-xs text-slate-400 mt-1">Please check your backend service connections.</p>
          <Button onClick={() => mutate()} className="mt-4" size="sm" variant="outline">Retry</Button>
        </div>
      ) : (
        <DataTable
          columns={[
            {
              key: "code",
              header: "Code",
              cell: (muni) => <span className="font-mono font-bold text-white text-xs">{muni.code}</span>,
            },
            {
              key: "name",
              header: "Name",
              cell: (muni) => <span className="text-slate-200">{muni.name}</span>,
            },
            {
              key: "province",
              header: "Parent Province",
              cell: (muni) => <span className="text-slate-400 text-xs">{muni.province?.name || "Loading parent province..."}</span>,
            },
            {
              key: "status",
              header: "Status",
              cell: (muni) => muni.isActive ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                  <CheckCircle className="h-3 w-3" /> Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  <XCircle className="h-3 w-3" /> Inactive
                </span>
              ),
            },
          ]}
          data={paginatedMunicipalities}
          getItemKey={(muni) => muni.id}
          rowActionMenu={(muni) => [
            {
              label: "Edit Municipality",
              icon: Edit2,
              onClick: () => handleOpenEdit(muni),
            },
            {
              label: "Delete Municipality",
              icon: Trash2,
              onClick: () => handleOpenDelete(muni),
              variant: "destructive",
            },
          ]}
          pagination={filteredMunicipalities.length > 0 ? {
            currentPage: currentPage,
            totalItems: filteredMunicipalities.length,
            pageSize: pageSize,
            onPageChange: setCurrentPage,
            onPageSizeChange: (newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }
          } : undefined}
          emptyState={{
            title: "No municipalities found.",
            description: "Try resetting your search query or filters.",
          }}
        />
      )}

      {/* CREATE DIALOG */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Municipality</DialogTitle>
            <DialogDescription>Define a new municipality linked to an active province.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Parent Province</label>
              <select
                value={provinceId}
                onChange={(e) => setProvinceId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary text-sm cursor-pointer"
              >
                <option value="" disabled>Select a Province</option>
                {provinces.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Municipality Code</label>
              <input
                type="text"
                placeholder="e.g. CDO"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Municipality Name</label>
              <input
                type="text"
                placeholder="e.g. Cagayan de Oro City"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>

            {formError && <p className="text-xs font-semibold text-red-500">{formError}</p>}

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Municipality"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT DIALOG */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Municipality</DialogTitle>
            <DialogDescription>Modify parameters for municipality configuration.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Parent Province</label>
              <select
                value={provinceId}
                onChange={(e) => setProvinceId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary text-sm cursor-pointer"
              >
                {provinces.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Municipality Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Municipality Name</label>
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
                Municipality is Active
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
            <DialogTitle className="text-red-500">Delete Municipality</DialogTitle>
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
