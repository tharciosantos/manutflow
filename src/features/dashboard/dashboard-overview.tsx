'use client';

import { useEffect, useState } from 'react';
import { StatusCard } from '@/components/ui/status-card';
import { serviceOrderPriorityLabels } from '@/features/service-orders/service-order-config';

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
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
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
          title="Ordens"
          value={String(summary?.totalServiceOrders ?? 0)}
          description="Total de ordens cadastradas"
          cardClassName="border-blue-500/20 bg-gradient-to-br from-slate-900 to-slate-900/50"
          valueClassName="text-blue-300"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
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

        <StatusCard
          title="Fechadas"
          value={String(summary?.closedServiceOrders ?? 0)}
          description="Serviços finalizados"
          cardClassName="border-emerald-500/20 bg-gradient-to-br from-slate-900 to-slate-900/50"
          valueClassName="text-emerald-300"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 sm:p-6">
        <div>
          <span className="rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-300">
            Prioridades
          </span>

          <h2 className="mt-3 text-xl font-semibold text-white">
            Ordens por prioridade
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Distribuição das ordens de serviço por nível de urgência.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">                    <StatusCard
                        title={serviceOrderPriorityLabels.low}
                        value={String(summary?.lowPriorityServiceOrders ?? 0)}
                        description="Baixa urgência"
                        cardClassName="border-slate-700 bg-slate-900"
                        valueClassName="text-slate-100"
                      />

                      <StatusCard
                        title={serviceOrderPriorityLabels.medium}
                        value={String(summary?.mediumPriorityServiceOrders ?? 0)}
                        description="Atenção moderada"
                        cardClassName="border-yellow-500/30 bg-slate-900"
                        valueClassName="text-yellow-300"
                      />

                      <StatusCard
                        title={serviceOrderPriorityLabels.high}
                        value={String(summary?.highPriorityServiceOrders ?? 0)}
                        description="Alta prioridade"
                        cardClassName="border-orange-500/30 bg-slate-900"
                        valueClassName="text-orange-300"
                      />

                      <StatusCard
                        title={serviceOrderPriorityLabels.critical}
                        value={String(summary?.criticalPriorityServiceOrders ?? 0)}
                        description="Atendimento crítico"
                        cardClassName="border-red-500/30 bg-slate-900"
                        valueClassName="text-red-300"
                      />
        </div>
      </section>
    </div>
  );
}