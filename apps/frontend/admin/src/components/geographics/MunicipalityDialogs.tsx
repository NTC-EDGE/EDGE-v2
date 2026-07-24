"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Municipality, Province } from "@edge/api";

export interface CreateMunicipalityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provinces: Province[];
  onSubmit: (data: { provinceId: string; code: string; name: string }) => Promise<void>;
}

export function CreateMunicipalityDialog({
  open,
  onOpenChange,
  provinces,
  onSubmit,
}: CreateMunicipalityDialogProps) {
  const [provinceId, setProvinceId] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setProvinceId(provinces[0]?.id ?? "");
      setCode("");
      setName("");
      setError(null);
    }
  }, [open, provinces]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provinceId) {
      setError("Selecting a Province is required.");
      return;
    }
    if (!code.trim() || !name.trim()) {
      setError("Both Code and Name are required.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onSubmit({ provinceId, code: code.trim(), name: name.trim() });
    } catch (err: any) {
      setError(err?.message || "Failed to create municipality.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white">
        <DialogHeader>
          <DialogTitle>Add New City/Municipality</DialogTitle>
          <DialogDescription className="text-slate-400 text-xs">
            Define a new city or municipality scoped under a province.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Province Scope</label>
            <select
              value={provinceId}
              onChange={(e) => setProvinceId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-850 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            >
              {provinces.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-950">
                  {p.code} - {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Municipality Code</label>
            <input
              type="text"
              placeholder="e.g. MAL"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-850 text-white placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Municipality Name</label>
            <input
              type="text"
              placeholder="e.g. Malaybalay"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-850 text-white placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          {error && <p className="text-xs font-semibold text-rose-500">{error}</p>}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Municipality"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export interface EditMunicipalityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provinces: Province[];
  selectedMunicipality: Municipality | null;
  onSubmit: (id: string, data: { provinceId: string; code: string; name: string }) => Promise<void>;
}

export function EditMunicipalityDialog({
  open,
  onOpenChange,
  provinces,
  selectedMunicipality,
  onSubmit,
}: EditMunicipalityDialogProps) {
  const [provinceId, setProvinceId] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && selectedMunicipality) {
      setProvinceId(selectedMunicipality.provinceId);
      setCode(selectedMunicipality.code);
      setName(selectedMunicipality.name);
      setError(null);
    }
  }, [open, selectedMunicipality]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMunicipality) return;
    if (!provinceId) {
      setError("Selecting a Province is required.");
      return;
    }
    if (!code.trim() || !name.trim()) {
      setError("Both Code and Name are required.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onSubmit(selectedMunicipality.id, { provinceId, code: code.trim(), name: name.trim() });
    } catch (err: any) {
      setError(err?.message || "Failed to update municipality.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white">
        <DialogHeader>
          <DialogTitle>Edit City/Municipality</DialogTitle>
          <DialogDescription className="text-slate-400 text-xs">
            Modify parameters for city or municipality configuration.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Province Scope</label>
            <select
              value={provinceId}
              onChange={(e) => setProvinceId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-850 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            >
              {provinces.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-950">
                  {p.code} - {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Municipality Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-850 text-white placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Municipality Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-850 text-white placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          {error && <p className="text-xs font-semibold text-rose-500">{error}</p>}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
