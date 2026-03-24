"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { getJourneys, deleteJourney, approveJourney, rejectJourney } from "@/lib/api";
import { getToken } from "@/lib/auth";

interface Journey {
  code: string;
  name: string;
  base_volume: number;
  opt_in_rate: number;
  category: string | null;
  owner: string | null;
  status: string;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
}

function getEmailFromToken(): string {
  const token = getToken();
  if (!token) return "unknown";
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.email ?? "unknown";
  } catch {
    return "unknown";
  }
}

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendente",
  approved: "Aprovada",
  rejected: "Rejeitada",
};

const STATUS_CLASS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export default function JourneysPage() {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  async function load() {
    try {
      const data = await getJourneys();
      setJourneys(data);
    } catch {
      setJourneys([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleApprove(code: string) {
    if (!confirm("Aprovar esta régua?")) return;
    setActing(code);
    try {
      const updated = await approveJourney(code, getEmailFromToken());
      setJourneys((prev) => prev.map((j) => (j.code === code ? updated : j)));
    } catch {
      alert("Erro ao aprovar régua.");
    } finally {
      setActing(null);
    }
  }

  async function handleReject(code: string) {
    if (!confirm("Rejeitar esta régua?")) return;
    setActing(code);
    try {
      const updated = await rejectJourney(code, getEmailFromToken());
      setJourneys((prev) => prev.map((j) => (j.code === code ? updated : j)));
    } catch {
      alert("Erro ao rejeitar régua.");
    } finally {
      setActing(null);
    }
  }

  async function handleDelete(code: string) {
    if (!confirm(`Excluir a régua "${code}"?`)) return;
    setActing(code);
    try {
      await deleteJourney(code);
      setJourneys((prev) => prev.filter((j) => j.code !== code));
    } catch {
      alert("Erro ao excluir régua.");
    } finally {
      setActing(null);
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  return (
    <div className="flex h-full">
      <Sidebar />
      <main className="flex-1 bg-slate-50 p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Réguas</h1>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-slate-500">Carregando...</p>
          </div>
        ) : journeys.length === 0 ? (
          <div className="rounded-xl bg-white p-12 text-center border border-slate-200 shadow-sm">
            <p className="text-slate-500">Nenhuma régua encontrada.</p>
          </div>
        ) : (
          <div className="rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3 font-medium text-slate-500">Nome</th>
                  <th className="px-5 py-3 font-medium text-slate-500">Categoria</th>
                  <th className="px-5 py-3 font-medium text-slate-500">Owner</th>
                  <th className="px-5 py-3 font-medium text-slate-500 text-center">Status</th>
                  <th className="px-5 py-3 font-medium text-slate-500">Aprovado por</th>
                  <th className="px-5 py-3 font-medium text-slate-500">Criado em</th>
                  <th className="px-5 py-3 font-medium text-slate-500">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {journeys.map((j) => {
                  const isPending = j.status === "pending";
                  const isActing = acting === j.code;

                  return (
                    <tr key={j.code} className="hover:bg-slate-50">
                      <td className="px-5 py-4 text-slate-900 font-medium">{j.name}</td>
                      <td className="px-5 py-4 text-slate-700">{j.category ?? "-"}</td>
                      <td className="px-5 py-4 text-slate-700">{j.owner ?? "-"}</td>
                      <td className="px-5 py-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_CLASS[j.status] ?? "bg-slate-100 text-slate-600"}`}
                        >
                          {STATUS_LABEL[j.status] ?? j.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-500 text-xs">
                        {j.approved_by ?? "-"}
                      </td>
                      <td className="px-5 py-4 text-slate-500">{formatDate(j.created_at)}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {isPending && (
                            <>
                              <button
                                onClick={() => handleApprove(j.code)}
                                disabled={isActing}
                                className="text-green-600 hover:text-green-800 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                              >
                                Aprovar
                              </button>
                              <button
                                onClick={() => handleReject(j.code)}
                                disabled={isActing}
                                className="text-orange-600 hover:text-orange-800 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                              >
                                Rejeitar
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDelete(j.code)}
                            disabled={isActing}
                            className="text-red-600 hover:text-red-800 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
