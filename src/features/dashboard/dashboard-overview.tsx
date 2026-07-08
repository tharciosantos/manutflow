'use client';

import { useEffect, useState } from 'react';
import { StatusCard } from '@/components/ui/status-card';

type DashboardSummary = {
  totalEquipments: number;
  totalServiceOrders: number;
  openServiceOrders: number;
  inProgressServiceOrders: number;
  closedServiceOrders: number;
  lowPriorityServiceOrders: number;
  mediumPriorityServiceOrders: number;
  highPriorityServiceOrders: number;
  criticalPriorityServiceOrders: number;
};

async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const response = await fetch('/api/dashboard-summary');

  if (!response.ok) {
    throw new Error('Erro ao carregar resumo do dashboard.');
  }

  return response.json();
}

export function DashboardOverview() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadDashboardSummary() {
      try {
        const data = await fetchDashboardSummary();

        if (ignore) {
          return;
        }

        setSummary(data);
        setErrorMessage('');
      } catch {
        if (!ignore) {
          setErrorMessage('Não foi possível carregar os indicadores.');
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    void loadDashboardSummary();

    // Auto-refresh ao voltar para a aba
    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        void loadDashboardSummary();
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      ignore = true;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/70 p-5 sm:p-6">
        <p className="text-sm text-slate-400">
          Carregando indicadores do dashboard...
        </p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 sm:p-6">
        <p className="text-sm text-red-300">{errorMessage}</p>
      </div>
    );
  }

  return (      <div className="mt-6 space-y-6 sm:mt-10">
      <div className="grid grid-cols-3 gap-4">
          <StatusCard
            title="Equipamentos"
            value={String(summary?.totalEquipments ?? 0)}
            description="Máquinas e ativos cadastrados"
            cardClassName="border-teal-500/20 bg-gradient-to-br from-slate-900 to-slate-900/50"
            valueClassName="text-teal-300"
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
              </svg>
            }
          />

        <StatusCard
          title="Abertas"
          value={String(summary?.openServiceOrders ?? 0)}
          description="Aguardando atendimento"
          cardClassName="border-amber-500/20 bg-gradient-to-br from-slate-900 to-slate-900/50"
          valueClassName="text-amber-300"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        <StatusCard
          title="Em andamento"
          value={String(summary?.inProgressServiceOrders ?? 0)}
          description="Manutenções em execução"
          cardClassName="border-orange-500/20 bg-gradient-to-br from-slate-900 to-slate-900/50"
          valueClassName="text-orange-300"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
            </svg>
          }
        />

      </div>

      <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
        <h3 className="text-sm font-medium text-slate-400 mb-4">Ordens por Prioridade</h3>
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <div>
            <span className="text-slate-500">Baixa:</span>
            <span className="ml-2 font-semibold text-slate-200">{summary?.lowPriorityServiceOrders ?? 0}</span>
          </div>
          <div>
            <span className="text-slate-500">Média:</span>
            <span className="ml-2 font-semibold text-yellow-300">{summary?.mediumPriorityServiceOrders ?? 0}</span>
          </div>
          <div>
            <span className="text-slate-500">Alta:</span>
            <span className="ml-2 font-semibold text-orange-300">{summary?.highPriorityServiceOrders ?? 0}</span>
          </div>
          <div>
            <span className="text-slate-500">Crítica:</span>
            <span className="ml-2 font-semibold text-red-300">{summary?.criticalPriorityServiceOrders ?? 0}</span>
          </div>
        </div>
      </section>
    </div>
  );
}