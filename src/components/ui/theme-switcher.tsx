"use client";

import { useSyncExternalStore, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function ThemeSwitcher({ className = "" }: { className?: string }) {
  const mounted = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
  const [rotation, setRotation] = useState(0);
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  if (!mounted) {
    return (
      <div className={`h-8 w-8 rounded-lg border border-slate-200 dark:border-slate-800 opacity-0 ${className}`} />
    );
  }

  const toggleTheme = () => {
    setRotation((prev) => prev + 180);
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-xs transition-all duration-200 hover:border-teal-500 hover:text-teal-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-teal-500 dark:hover:text-teal-400 cursor-pointer ${className}`}
      aria-label={isDark ? "Alternar para modo claro" : "Alternar para modo escuro"}
      title={isDark ? "Ativar Modo Claro" : "Ativar Modo Escuro"}
    >
      <span
        className="block transition-transform duration-300 ease-in-out"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
      </span>
    </button>
  );
}
