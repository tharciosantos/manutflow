import type { ReactNode } from "react";
import { AppHeader } from "./app-header";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <main className="relative min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 bg-gradient-theme transition-colors duration-200">
      <AppHeader />
      {children}
    </main>
  );
}