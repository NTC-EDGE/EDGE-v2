"use client";

import { useTheme } from "./theme-provider";
import { Sun, Moon, Laptop } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
        <Sun className="w-4 h-4 animate-pulse" />
      </div>
    );
  }

  const cycleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  return (
    <button
      onClick={cycleTheme}
      title={`Current Theme: ${theme.toUpperCase()} (Click to switch)`}
      className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-900/40 hover:bg-slate-200 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-all shadow-sm group active:scale-95"
    >
      {theme === "light" && (
        <Sun className="w-4 h-4 text-amber-500 rotate-0 transition-transform duration-300 group-hover:rotate-45" />
      )}
      {theme === "dark" && (
        <Moon className="w-4 h-4 text-sky-400 rotate-0 transition-transform duration-300 group-hover:-rotate-12" />
      )}
      {theme === "system" && (
        <Laptop className="w-4 h-4 text-indigo-500 dark:text-indigo-400 transition-transform duration-300 group-hover:scale-110" />
      )}
    </button>
  );
}

