"use client";

import React, { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Fee, ServiceFee, Note } from "@edge/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ServiceCatalogItem, ServiceCategoryItem } from "@/services/feesNotesService";

export interface DeleteRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeTab: "fees" | "service-fees" | "notes";
  fees: Fee[];
  services: ServiceCatalogItem[];
  categories: ServiceCategoryItem[];
  selectedFee: Fee | null;
  selectedServiceFee: ServiceFee | null;
  selectedNote: Note | null;
  onConfirm: () => Promise<void>;
}

export function DeleteRecordDialog({
  open,
  onOpenChange,
  activeTab,
  selectedFee,
  selectedServiceFee,
  selectedNote,
  services,
  categories,
  onConfirm,
}: DeleteRecordDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setErrorMsg(null);
      setSubmitting(false);
    }
  }, [open]);

  const handleConfirm = async () => {
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (err: unknown) {
      setErrorMsg("Deletion failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border border-slate-800 text-slate-200">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-rose-400">Confirm Deletion</DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            Are you sure you want to permanently delete this configuration? This action is irreversible.
          </DialogDescription>
        </DialogHeader>

        {activeTab === "fees" && selectedFee !== null && (
          <div className="py-2 space-y-2">
            <p className="text-sm">
              Deleting fee code <strong className="text-white">{selectedFee.code}</strong> (
              {selectedFee.name}) will also cascade-delete any Service Fee charge mappings associated
              with it.
            </p>
          </div>
        )}

        {activeTab === "service-fees" && selectedServiceFee !== null && (
          <div className="py-2 space-y-2">
            <p className="text-sm">
              Are you sure you want to delete the mapping fee rule for:
              <br />
              <strong className="text-white">
                {services.find((s) => s.id === selectedServiceFee.serviceId)?.name}
              </strong>
              ?
            </p>
          </div>
        )}

        {activeTab === "notes" && selectedNote !== null && (
          <div className="py-2 space-y-2">
            <p className="text-sm">
              Are you sure you want to delete the regulatory guideline for category:
              <br />
              <strong className="text-indigo-300">
                {categories.find((c) => c.id === selectedNote.serviceCategoryId)?.name}
              </strong>
              ?
            </p>
          </div>
        )}

        {errorMsg !== null && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{errorMsg}</span>
          </div>
        )}

        <DialogFooter className="pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-slate-400 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={submitting}
            onClick={handleConfirm}
            className="bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-lg"
          >
            {submitting ? "Deleting..." : "Delete Permanently"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
