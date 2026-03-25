"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { getJourneys } from "@/lib/api";

interface Journey {
  code: string;
  name: string;
  created_at: string;
}

export default function DashboardPage() {
  const [totalJourneys, setTotalJourneys] = useState<number | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const journeys: Journey[] = await getJourneys();
        setTotalJourneys(journeys.length);

        if (journeys.length > 0) {
          const sorted = [...journeys].sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          );
          setLastUpdate(
            new Date(sorted[0].created_at).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          );
        }
      } catch {
        setTotalJourneys(0);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 bg-slate-50 overflow-y-auto p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total de Réguas"
            value={loading ? "..." : String(totalJourneys ?? 0)}
          />
          <StatCard
            title="Última atualização"
            value={loading ? "..." : lastUpdate ?? "N/A"}
          />
        </div>

        <Link
          href="/journeys"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-hover transition-colors"
        >
          Ver todas as réguas
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </main>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
