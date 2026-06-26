import { AppShell } from "@/components/layout/app-shell";
import { DashboardOverview } from "@/features/dashboard/dashboard-overview";

export default function Home() {
  return (
    <AppShell>
      <section className="mx-auto flex max-w-5xl flex-col justify-center px-6 py-20">
        <div className="text-center">
          <p className="mb-4 inline-flex rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-300">
            Sistema Full Stack
          </p>

          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            ManutFlow
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">
            Sistema de Controle de Manutenção e Ordens de Serviço para
            gerenciar equipamentos, prioridades, responsáveis e histórico de
            atendimento.
          </p>
        </div>

        <DashboardOverview />
      </section>
    </AppShell>
  );
}