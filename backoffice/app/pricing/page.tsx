"use client";

import { useEffect, useState, useMemo } from "react";
import Sidebar from "@/components/Sidebar";
import CrudModal from "@/components/CrudModal";
import DataTable, { Column } from "@/components/DataTable";
import { EditButton } from "@/components/ActionIcons";
import { getPrices, createPrice, updatePrice, getChannels, getProviders } from "@/lib/api";

interface Price {
  id: string;
  provider_id: string;
  channel_id: string;
  price: number;
  valid_from: string;
  valid_to: string | null;
  provider: { id: string; name: string };
  channel: { id: string; name: string };
}

interface Channel { id: string; name: string; }
interface Provider { id: string; name: string; }

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 4, maximumFractionDigits: 4 });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function toInputDate(iso: string) {
  return iso ? iso.slice(0, 10) : "";
}

function isActivePrice(p: Price): boolean {
  const today = new Date().toISOString().slice(0, 10);
  const from = p.valid_from.slice(0, 10);
  const to = p.valid_to ? p.valid_to.slice(0, 10) : null;
  return from <= today && (to === null || to >= today);
}

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary";

export default function PricingPage() {
  const [prices, setPrices] = useState<Price[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPrice, setEditingPrice] = useState<Price | null>(null);
  const [formProviderId, setFormProviderId] = useState("");
  const [formChannelId, setFormChannelId] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formValidFrom, setFormValidFrom] = useState("");
  const [formValidTo, setFormValidTo] = useState("");

  const [filterProvider, setFilterProvider] = useState("");
  const [filterChannel, setFilterChannel] = useState("");
  const [filterStatus, setFilterStatus] = useState<"" | "active" | "expired">("");

  const lastActivePrice = useMemo(() => {
    if (!formProviderId || !formChannelId) return null;
    const today = new Date().toISOString().slice(0, 10);
    return prices
      .filter((p) => {
        if (p.provider_id !== formProviderId || p.channel_id !== formChannelId) return false;
        if (editingPrice && p.id === editingPrice.id) return false;
        const from = p.valid_from.slice(0, 10);
        const to = p.valid_to ? p.valid_to.slice(0, 10) : null;
        return from <= today && (to === null || to >= today);
      })
      .sort((a, b) => b.valid_from.localeCompare(a.valid_from))[0] ?? null;
  }, [formProviderId, formChannelId, prices, editingPrice]);

  const filtered = useMemo(() => {
    return prices.filter((p) => {
      if (filterProvider && p.provider_id !== filterProvider) return false;
      if (filterChannel && p.channel_id !== filterChannel) return false;
      if (filterStatus === "active" && !isActivePrice(p)) return false;
      if (filterStatus === "expired" && isActivePrice(p)) return false;
      return true;
    });
  }, [prices, filterProvider, filterChannel, filterStatus]);

  async function load() {
    try {
      const [pricesData, channelsData, providersData] = await Promise.all([
        getPrices(), getChannels(), getProviders(),
      ]);
      setPrices(pricesData);
      setChannels(channelsData);
      setProviders(providersData);
    } catch {
      setPrices([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditingPrice(null);
    setFormProviderId("");
    setFormChannelId("");
    setFormPrice("");
    setFormValidFrom(new Date().toISOString().slice(0, 10));
    setFormValidTo("");
    setModalOpen(true);
  }

  function openEdit(p: Price) {
    setEditingPrice(p);
    setFormProviderId(p.provider_id);
    setFormChannelId(p.channel_id);
    setFormPrice(String(p.price));
    setFormValidFrom(toInputDate(p.valid_from));
    setFormValidTo(p.valid_to ? toInputDate(p.valid_to) : "");
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingPrice(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formProviderId || !formChannelId || !formPrice || !formValidFrom) return;
    setSaving(true);
    try {
      const data: { provider_id: string; channel_id: string; price: number; valid_from: string; valid_to?: string } = {
        provider_id: formProviderId,
        channel_id: formChannelId,
        price: parseFloat(formPrice),
        valid_from: formValidFrom,
      };
      if (formValidTo) data.valid_to = formValidTo;

      if (editingPrice) {
        const updated = await updatePrice(editingPrice.id, data);
        setPrices((prev) => prev.map((x) => (x.id === editingPrice.id ? updated : x)));
      } else {
        const created = await createPrice(data);
        setPrices((prev) => [...prev, created]);
      }
      closeModal();
    } catch {
      alert(editingPrice ? "Erro ao atualizar preco." : "Erro ao criar preco.");
    } finally {
      setSaving(false);
    }
  }

  const columns: Column<Price>[] = [
    {
      key: "provider",
      label: "Provedor",
      sortable: true,
      sortValue: (p) => p.provider?.name ?? "",
      render: (p) => (
        <span className="text-slate-900 font-medium">{p.provider?.name ?? "-"}</span>
      ),
    },
    {
      key: "channel",
      label: "Canal",
      sortable: true,
      sortValue: (p) => p.channel?.name ?? "",
      render: (p) => <span className="text-slate-700">{p.channel?.name ?? "-"}</span>,
    },
    {
      key: "price",
      label: "Preco",
      sortable: true,
      align: "right",
      sortValue: (p) => p.price,
      render: (p) => (
        <span className="text-slate-700 font-mono">{formatBRL(p.price)}</span>
      ),
    },
    {
      key: "valid_from",
      label: "Vigencia",
      sortable: true,
      sortValue: (p) => p.valid_from,
      render: (p) => (
        <span className="text-slate-500 text-xs">
          {formatDate(p.valid_from)} — {p.valid_to ? formatDate(p.valid_to) : "Atual"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      align: "center",
      sortValue: (p) => (isActivePrice(p) ? 1 : 0),
      render: (p) => {
        const active = isActivePrice(p);
        return (
          <span
            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
              active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
            }`}
          >
            {active ? "Vigente" : "Expirado"}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "Acoes",
      align: "center",
      headerClassName: "w-16",
      render: (p) => (
        <div className="flex items-center justify-center">
          <EditButton onClick={() => openEdit(p)} disabled={saving} />
        </div>
      ),
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 bg-slate-50 overflow-y-auto p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Precos</h1>
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Novo Preco
          </button>
        </div>

        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <select
            value={filterProvider}
            onChange={(e) => setFilterProvider(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Todos os provedores</option>
            {providers.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <select
            value={filterChannel}
            onChange={(e) => setFilterChannel(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Todos os canais</option>
            {channels.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as "" | "active" | "expired")}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Todos os periodos</option>
            <option value="active">Vigente</option>
            <option value="expired">Expirado</option>
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
            keyExtractor={(p) => p.id}
            emptyMessage="Nenhum preco encontrado."
          />
        )}

        <CrudModal
          open={modalOpen}
          title={editingPrice ? "Editar Preco" : "Novo Preco"}
          onClose={closeModal}
          footer={
            <>
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-300 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={(e) => handleSubmit(e as unknown as React.FormEvent)}
                disabled={saving || !formProviderId || !formChannelId || !formPrice || !formValidFrom}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
              >
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </>
          }
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Provedor</label>
              <select value={formProviderId} onChange={(e) => setFormProviderId(e.target.value)} className={inputClass}>
                <option value="">Selecione</option>
                {providers.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Canal</label>
              <select value={formChannelId} onChange={(e) => setFormChannelId(e.target.value)} className={inputClass}>
                <option value="">Selecione</option>
                {channels.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Preco (R$)</label>
              <input
                type="number"
                step="0.0001"
                value={formPrice}
                onChange={(e) => setFormPrice(e.target.value)}
                className={inputClass}
                placeholder="0.0000"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Vigencia Inicio</label>
                <input
                  type="date"
                  value={formValidFrom}
                  onChange={(e) => setFormValidFrom(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Vigencia Fim</label>
                <input
                  type="date"
                  value={formValidTo}
                  onChange={(e) => setFormValidTo(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            {lastActivePrice && (
              <div className="mt-1 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <p className="text-xs font-medium text-slate-500 mb-1">Último preço ativo</p>
                <p className="text-sm font-semibold text-slate-800">{formatBRL(lastActivePrice.price)}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {formatDate(lastActivePrice.valid_from)} — {lastActivePrice.valid_to ? formatDate(lastActivePrice.valid_to) : "Atual"}
                </p>
              </div>
            )}
          </form>
        </CrudModal>
      </main>
    </div>
  );
}
