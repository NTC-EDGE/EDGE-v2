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
import { Province, Region } from "@edge/api";

export interface CreateProvinceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  regions: Region[];
  onSubmit: (data: { regionId: string; code: string; name: string }) => Promise<void>;
}

export function CreateProvinceDialog({
  open,
  onOpenChange,
  regions,
  onSubmit,
}: CreateProvinceDialogProps) {
  const [regionId, setRegionId] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setRegionId(regions[0]?.id ?? "");
      setCode("");
      setName("");
      setError(null);
    }
  }, [open, regions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regionId) {
      setError("Selecting a Region is required.");
      return;
    }
    if (!code.trim() || !name.trim()) {
      setError("Both Code and Name are required.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onSubmit({ regionId, code: code.trim(), name: name.trim() });
    } catch (err: any) {
      setError(err?.message || "Failed to create province.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white">
        <DialogHeader>
          <DialogTitle>Add New Province</DialogTitle>
          <DialogDescription className="text-slate-400 text-xs">
            Define a new province mapped under a primary region.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Region Scope</label>
            <select
              value={regionId}
              onChange={(e) => setRegionId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-850 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            >
              {regions.map((r) => (
                <option key={r.id} value={r.id} className="bg-slate-950">
                  {r.code} - {r.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Province Code</label>
            <input
              type="text"
              placeholder="e.g. BUK"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-850 text-white placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Province Name</label>
            <input
              type="text"
              placeholder="e.g. Bukidnon"
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
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Province"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export interface EditProvinceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  regions: Region[];
  selectedProvince: Province | null;
  onSubmit: (id: string, data: { regionId: string; code: string; name: string }) => Promise<void>;
}

export function EditProvinceDialog({
  open,
  onOpenChange,
  regions,
  selectedProvince,
  onSubmit,
}: EditProvinceDialogProps) {
  const [regionId, setRegionId] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && selectedProvince) {
      setRegionId(selectedProvince.regionId);
      setCode(selectedProvince.code);
      setName(selectedProvince.name);
      setError(null);
    }
  }, [open, selectedProvince]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProvince) return;
    if (!regionId) {
      setError("Selecting a Region is required.");
      return;
    }
    if (!code.trim() || !name.trim()) {
      setError("Both Code and Name are required.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onSubmit(selectedProvince.id, { regionId, code: code.trim(), name: name.trim() });
    } catch (err: any) {
      setError(err?.message || "Failed to update province.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white">
        <DialogHeader>
          <DialogTitle>Edit Province</DialogTitle>
          <DialogDescription className="text-slate-400 text-xs">
            Modify parameters for province configuration.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Region Scope</label>
            <select
              value={regionId}
              onChange={(e) => setRegionId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-850 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            >
              {regions.map((r) => (
                <option key={r.id} value={r.id} className="bg-slate-950">
                  {r.code} - {r.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Province Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-850 text-white placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Province Name</label>
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
