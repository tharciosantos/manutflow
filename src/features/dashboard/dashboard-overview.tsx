'use client';

import { useEffect, useState } from 'react';
import { StatusCard } from '@/components/ui/status-card';

type DashboardSummary = {
  totalEquipments: number;
  totalServiceOrders: number;
  openServiceOrders: number;
  inProgressServiceOrders: number;
  closedServiceOrders: number;
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
    <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
  );
}