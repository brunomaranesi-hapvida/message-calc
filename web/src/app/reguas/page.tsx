"use client";

import Link from "next/link";
import { useJourneys } from "@/hooks/useJourneys";

export default function ReguasPage() {
  const { journeys, loading, error, deleteJourney } = useJourneys();

  const handleDelete = async (code: string, name: string) => {
    if (!confirm(`Excluir a régua "${name}"?`)) return;
    try {
      await deleteJourney(code);
    } catch {
      alert("Erro ao excluir régua.");
    }
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return iso;
    }
  };

  const formatPercent = (v: number) => `${(v * 100).toFixed(0)}%`;
  const formatNumber = (v: number) => v.toLocaleString("pt-BR");

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

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              Réguas Salvas
            </h1>
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
      </header>

      <main className="max-w-screen-2xl mx-auto px-6 py-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          {loading ? (
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
                    <th className="text-left px-4 py-3 font-medium text-slate-600">
                      Nome
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">
                      Categoria
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">
                      Owner
                    </th>
                    <th className="text-center px-4 py-3 font-medium text-slate-600">
                      Status
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-slate-600">
                      Volume Base
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">
                      Criado em
                    </th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {journeys.map((j) => (
                    <tr
                      key={j.id}
                      className="border-b border-slate-100 hover:bg-slate-50/60 transition"
                    >
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {j.name}
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
                      <td className="px-4 py-3 text-right text-slate-600 tabular-nums">
                        {formatNumber(j.base_volume)}
                      </td>
                      <td className="px-4 py-3 text-slate-500 tabular-nums">
                        {formatDate(j.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/?journey=${j.code}`}
                            className="px-2.5 py-1 rounded-md text-xs font-medium text-primary bg-primary-50 hover:bg-primary-100 transition"
                          >
                            Visualizar
                          </Link>
                          <button
                            onClick={() => handleDelete(j.code, j.name)}
                            className="px-2.5 py-1 rounded-md text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition"
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
