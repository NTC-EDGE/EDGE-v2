"use client";

import React, { useState, useRef, useEffect } from "react";
import { MoreVertical, LucideIcon } from "lucide-react";

export interface ActionMenuItem {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  variant?: "default" | "destructive";
}

export interface ActionMenuProps {
  items: ActionMenuItem[];
}

export function ActionMenu({ items }: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current !== null && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-label="Actions menu"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-1 w-48 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-1.5 animate-in fade-in-50 zoom-in-95">
          {items.map((item, index) => {
            const Icon = item.icon;
            const isDestructive = item.variant === "destructive";
            return (
              <button
                key={index}
                onClick={() => {
                  setIsOpen(false);
                  item.onClick();
                }}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium transition-colors text-left ${
                  isDestructive
                    ? "text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                    : "text-slate-200 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {Icon && <Icon className={`w-4 h-4 ${isDestructive ? "text-rose-400" : "text-slate-400"}`} />}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
