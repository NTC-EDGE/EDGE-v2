"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { FormField } from "../types";
import {
  DEFAULT_EQUIPMENT_COLUMNS,
  DEFAULT_REQUEST_DEVICE_COLUMNS,
  DEFAULT_REQUEST_SIM_COLUMNS,
  DEFAULT_COMPLAINT_ATTACHMENT_COLUMNS,
  DEFAULT_STATION_PARTICULARS_COLUMNS,
  DEFAULT_DEVICE_REGISTRATION_COLUMNS,
  DEFAULT_TVRO_EQUIPMENT_COLUMNS,
} from "../utils";

export function RepeaterPresetsBar({
  onUpdateField,
}: {
  onUpdateField: (updates: Partial<FormField>) => void;
}) {
  return (
    <div className="space-y-1 mb-2">
      <span className="text-[10px] font-semibold text-slate-400 block">Quick Presets:</span>
      <div className="grid grid-cols-2 gap-1.5">
        <button
          type="button"
          onClick={() =>
            onUpdateField({
              label: "Equipment Inventory / Specifications",
              helpText: "List all radio equipment units included in this application.",
              addButtonLabel: "Add Equipment",
              repeaterColumns: [...DEFAULT_EQUIPMENT_COLUMNS],
              minRows: 1,
            })
          }
          className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-[11px] text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 font-semibold transition-colors"
        >
          <Sparkles className="w-3 h-3 flex-shrink-0" />
          <span>Radio Equipment</span>
        </button>
        <button
          type="button"
          onClick={() =>
            onUpdateField({
              label: "Device Particulars",
              helpText: "List all mobile phone handsets to be blocked/unblocked.",
              addButtonLabel: "Add Another Device (Dual SIM / Multiple Handsets)",
              repeaterColumns: [...DEFAULT_REQUEST_DEVICE_COLUMNS],
              minRows: 1,
            })
          }
          className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-[11px] text-blue-700 dark:text-blue-300 hover:bg-blue-100 font-semibold transition-colors"
        >
          <Sparkles className="w-3 h-3 flex-shrink-0" />
          <span>Device / Handset</span>
        </button>
        <button
          type="button"
          onClick={() =>
            onUpdateField({
              label: "SIM Card / Mobile Numbers",
              helpText: "Enter all mobile numbers and SIM details associated with this request.",
              addButtonLabel: "Add Another Mobile Number",
              repeaterColumns: [...DEFAULT_REQUEST_SIM_COLUMNS],
              minRows: 1,
            })
          }
          className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-[11px] text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 font-semibold transition-colors"
        >
          <Sparkles className="w-3 h-3 flex-shrink-0" />
          <span>SIM / Mobile No.</span>
        </button>
        <button
          type="button"
          onClick={() =>
            onUpdateField({
              label: "Attached Proof / Supporting Documents",
              helpText: "Upload evidence, screenshots, or billing statements supporting the complaint.",
              addButtonLabel: "Add Another Proof / Attachment",
              repeaterColumns: [...DEFAULT_COMPLAINT_ATTACHMENT_COLUMNS],
              minRows: 1,
            })
          }
          className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-[11px] text-amber-700 dark:text-amber-300 hover:bg-amber-100 font-semibold transition-colors"
        >
          <Sparkles className="w-3 h-3 flex-shrink-0" />
          <span>Proof Documents</span>
        </button>
        <button
          type="button"
          onClick={() =>
            onUpdateField({
              label: "Particulars of Station & Equipment",
              helpText: "Enter station specifications, equipment units, frequencies, and serial numbers.",
              addButtonLabel: "Add Station",
              repeaterColumns: [...DEFAULT_STATION_PARTICULARS_COLUMNS],
              minRows: 1,
            })
          }
          className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 text-[11px] text-purple-700 dark:text-purple-300 hover:bg-purple-100 font-semibold transition-colors"
        >
          <Sparkles className="w-3 h-3 flex-shrink-0" />
          <span>Station &amp; Equip</span>
        </button>
        <button
          type="button"
          onClick={() =>
            onUpdateField({
              label: "Particulars of Equipment",
              helpText: "Enter make/type/model, serial numbers, and frequency range.",
              addButtonLabel: "Add Equipment",
              repeaterColumns: [...DEFAULT_DEVICE_REGISTRATION_COLUMNS],
              minRows: 1,
            })
          }
          className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 text-[11px] text-teal-700 dark:text-teal-300 hover:bg-teal-100 font-semibold transition-colors"
        >
          <Sparkles className="w-3 h-3 flex-shrink-0" />
          <span>Device Reg.</span>
        </button>
        <button
          type="button"
          onClick={() =>
            onUpdateField({
              label: "Particulars of Equipment",
              helpText: "Enter TVRO equipment units, serial numbers, and frequency range.",
              addButtonLabel: "Add Equipment",
              repeaterColumns: [...DEFAULT_TVRO_EQUIPMENT_COLUMNS],
              minRows: 1,
            })
          }
          className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/60 text-[11px] text-cyan-700 dark:text-cyan-300 hover:bg-cyan-100 font-semibold transition-colors col-span-2"
        >
          <Sparkles className="w-3 h-3 flex-shrink-0" />
          <span>TVRO / CATV Equipment</span>
        </button>
      </div>
    </div>
  );
}
