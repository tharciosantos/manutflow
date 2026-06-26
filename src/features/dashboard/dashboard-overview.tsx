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

    return () => {
      ignore = true;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-950/70 p-6">
        <p className="text-sm text-slate-400">
          Carregando indicadores do dashboard...
        </p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="mt-10 rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
        <p className="text-sm text-red-300">{errorMessage}</p>
      </div>
    );
  }

  return (
    <div className="mt-10 space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatusCard
          title="Equipamentos"
          value={String(summary?.totalEquipments ?? 0)}
          description="Máquinas e ativos cadastrados"
        />

        <StatusCard
          title="Ordens"
          value={String(summary?.totalServiceOrders ?? 0)}
          description="Total de ordens cadastradas"
        />

        <StatusCard
          title="Abertas"
          value={String(summary?.openServiceOrders ?? 0)}
          description="Aguardando atendimento"
        />

        <StatusCard
          title="Em andamento"
          value={String(summary?.inProgressServiceOrders ?? 0)}
          description="Manutenções em execução"
        />

        <StatusCard
          title="Fechadas"
          value={String(summary?.closedServiceOrders ?? 0)}
          description="Serviços finalizados"
        />
      </div>

      <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6">
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

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatusCard
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