"use client";

import { useEffect, useState, useMemo } from "react";
import Sidebar from "@/components/Sidebar";
import DataTable, { Column } from "@/components/DataTable";
import { ApproveButton, RejectButton, DeleteButton } from "@/components/ActionIcons";
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

  const [filterName, setFilterName] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const categories = useMemo(() => {
    const set = new Set(journeys.map((j) => j.category).filter(Boolean) as string[]);
    return Array.from(set).sort();
  }, [journeys]);

  const filtered = useMemo(() => {
    return journeys.filter((j) => {
      if (filterName && !j.name.toLowerCase().includes(filterName.toLowerCase())) return false;
      if (filterCategory && j.category !== filterCategory) return false;
      if (filterStatus && j.status !== filterStatus) return false;
      return true;
    });
  }, [journeys, filterName, filterCategory, filterStatus]);

  async function load() {
    try {
      setJourneys(await getJourneys());
    } catch {
      setJourneys([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleApprove(code: string) {
    if (!confirm("Aprovar esta regua?")) return;
    setActing(code);
    try {
      const updated = await approveJourney(code, getEmailFromToken());
      setJourneys((prev) => prev.map((j) => (j.code === code ? updated : j)));
    } catch {
      alert("Erro ao aprovar regua.");
    } finally {
      setActing(null);
    }
  }

  async function handleReject(code: string) {
    if (!confirm("Rejeitar esta regua?")) return;
    setActing(code);
    try {
      const updated = await rejectJourney(code, getEmailFromToken());
      setJourneys((prev) => prev.map((j) => (j.code === code ? updated : j)));
    } catch {
      alert("Erro ao rejeitar regua.");
    } finally {
      setActing(null);
    }
  }

  async function handleDelete(code: string) {
    if (!confirm(`Excluir a regua "${code}"?`)) return;
    setActing(code);
    try {
      await deleteJourney(code);
      setJourneys((prev) => prev.filter((j) => j.code !== code));
    } catch {
      alert("Erro ao excluir regua.");
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

  const columns: Column<Journey>[] = [
    {
      key: "name",
      label: "Nome",
      sortable: true,
      render: (j) => <span className="text-slate-900 font-medium">{j.name}</span>,
    },
    {
      key: "category",
      label: "Categoria",
      sortable: true,
      sortValue: (j) => j.category ?? "",
      render: (j) => <span className="text-slate-700">{j.category ?? "-"}</span>,
    },
    {
      key: "owner",
      label: "Owner",
      sortable: true,
      sortValue: (j) => j.owner ?? "",
      render: (j) => <span className="text-slate-700">{j.owner ?? "-"}</span>,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      align: "center",
      render: (j) => (
        <span
          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_CLASS[j.status] ?? "bg-slate-100 text-slate-600"}`}
        >
          {STATUS_LABEL[j.status] ?? j.status}
        </span>
      ),
    },
    {
      key: "approved_by",
      label: "Aprovado por",
      sortable: true,
      sortValue: (j) => j.approved_by ?? "",
      render: (j) => <span className="text-slate-500 text-xs">{j.approved_by ?? "-"}</span>,
    },
    {
      key: "created_at",
      label: "Criado em",
      sortable: true,
      render: (j) => <span className="text-slate-500">{formatDate(j.created_at)}</span>,
    },
    {
      key: "actions",
      label: "Acoes",
      align: "center",
      headerClassName: "w-28",
      render: (j) => {
        const isPending = j.status === "pending";
        const isActing = acting === j.code;
        return (
          <div className="flex items-center justify-center gap-1">
            {isPending && (
              <>
                <ApproveButton onClick={() => handleApprove(j.code)} disabled={isActing} />
                <RejectButton onClick={() => handleReject(j.code)} disabled={isActing} />
              </>
            )}
            <DeleteButton onClick={() => handleDelete(j.code)} disabled={isActing} />
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 bg-slate-50 overflow-y-auto p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Reguas</h1>

        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <input
            type="text"
            placeholder="Buscar por nome"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary w-56"
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Todas as categorias</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Todos os status</option>
            <option value="pending">Pendente</option>
            <option value="approved">Aprovada</option>
            <option value="rejected">Rejeitada</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-slate-500">Carregando...</p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filtered}
            keyExtractor={(j) => j.code}
            emptyMessage="Nenhuma regua encontrada."
          />
        )}
      </main>
    </div>
  );
}
