import type { ReactNode } from "react";
import { AppHeader } from "./app-header";

type AppShellProps = {
    children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
    return (
        <main className="relative min-h-screen bg-slate-950 text-slate-100 bg-gradient-theme">
            <AppHeader />
            {children}
        </main>
    );
}