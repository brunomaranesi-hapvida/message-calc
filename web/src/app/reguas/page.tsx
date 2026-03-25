"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useJourneys, Journey } from "@/hooks/useJourneys";
import { useCalculatorConfig } from "@/hooks/useCalculatorConfig";
import { runSimulation, SimulationResult } from "@/lib/simulation";
import { SimulationConfig } from "@/lib/types";
import AppNavbar from "@/components/AppNavbar";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function formatNumber(v: number) {
  return v.toLocaleString("pt-BR");
}

function formatCurrency(v: number) {
  return v.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function daysPending(createdAt: string): number {
  const created = new Date(createdAt);
  const now = new Date();
  return Math.max(0, Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)));
}

const statusLabel: Record<string, string> = {
  pending: "Pendente",
  approved: "Aprovada",
  rejected: "Rejeitada",
};
const statusClass: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700",
  approved: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700",
};

export default function ReguasPage() {
  const { journeys, loading, error } = useJourneys();
  const { calcConfig, loading: configLoading } = useCalculatorConfig();

  const journeyCosts = useMemo(() => {
    if (configLoading) return new Map<number, SimulationResult>();
    const map = new Map<number, SimulationResult>();
    for (const j of journeys) {
      const cfg: SimulationConfig = {
        journeyName: j.name,
        peopleReached: j.base_volume,
        startMonth: 1,
        providersByChannel: { ...calcConfig.defaultProviders },
        optInRate: j.opt_in_rate,
        deliveryRateWhats: j.wa_delivery,
        deliveryRateSMS: j.sms_delivery,
        steps: j.steps ?? [],
      };
      map.set(j.id, runSimulation(cfg, calcConfig.prices));
    }
    return map;
  }, [journeys, calcConfig, configLoading]);

  const isLoading = loading || configLoading;

  return (
    <div className="min-h-screen bg-slate-50">
      <AppNavbar />

      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Réguas Salvas
            </h2>
            <p className="text-sm text-slate-500">
              Réguas de mensageria salvas
            </p>
          </div>
          <Link
            href="/"
            className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-300 text-slate-600 hover:bg-slate-50 transition"
          >
            ← Voltar à Calculadora
          </Link>
        </div>
      </div>

      <main className="max-w-screen-2xl mx-auto px-6 py-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <svg
                className="animate-spin h-6 w-6 text-primary"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              <span className="ml-3 text-sm text-slate-500">
                Carregando réguas…
              </span>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-sm text-red-600">Erro: {error}</p>
            </div>
          ) : journeys.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-sm text-slate-500">
                Nenhuma régua salva ainda.
              </p>
              <Link
                href="/"
                className="mt-3 inline-block text-sm text-primary hover:underline"
              >
                Criar uma régua na calculadora
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Nome</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Categoria</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Owner</th>
                    <th className="text-center px-4 py-3 font-medium text-slate-600">Status</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-600">Disparos</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-600">Valor Total</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-600">Dias pendente</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-600">Volume Base</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Criado em</th>
                  </tr>
                </thead>
                <tbody>
                  {journeys.map((j) => {
                    const result = journeyCosts.get(j.id);
                    const totalCost = result ? result.totalMonthlyCost : 0;
                    const stepsCount = j.steps?.length ?? 0;
                    const days = j.status === "pending" ? daysPending(j.created_at) : null;

                    return (
                      <tr
                        key={j.id}
                        className="border-b border-slate-100 hover:bg-slate-50/60 transition"
                      >
                        <td className="px-4 py-3 font-medium">
                          <Link
                            href={`/?journey=${j.code}`}
                            className="text-primary hover:underline"
                          >
                            {j.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {j.category ?? "-"}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {j.owner ?? "-"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusClass[j.status] ?? "bg-slate-100 text-slate-600"}`}>
                            {statusLabel[j.status] ?? j.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-slate-700 tabular-nums">
                          {stepsCount}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-700 font-mono tabular-nums">
                          {formatCurrency(totalCost)}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-500 tabular-nums">
                          {days !== null ? `${days} dia${days !== 1 ? "s" : ""}` : "—"}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-600 tabular-nums">
                          {formatNumber(j.base_volume)}
                        </td>
                        <td className="px-4 py-3 text-slate-500 tabular-nums">
                          {formatDate(j.created_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
