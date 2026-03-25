"use client";

import { useEffect, useState, useMemo } from "react";
import Sidebar from "@/components/Sidebar";
import CrudModal from "@/components/CrudModal";
import StatusBadge from "@/components/StatusBadge";
import DataTable, { Column } from "@/components/DataTable";
import { EditButton, ToggleActiveButton, DeleteButton } from "@/components/ActionIcons";
import { getProviders, createProvider, updateProvider, deleteProvider } from "@/lib/api";

interface Provider {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary";

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [formName, setFormName] = useState("");

  const [filterName, setFilterName] = useState("");
  const [filterStatus, setFilterStatus] = useState<"" | "active" | "inactive">("");

  const filtered = useMemo(() => {
    return providers.filter((p) => {
      if (filterName && !p.name.toLowerCase().includes(filterName.toLowerCase())) return false;
      if (filterStatus === "active" && !p.is_active) return false;
      if (filterStatus === "inactive" && p.is_active) return false;
      return true;
    });
  }, [providers, filterName, filterStatus]);

  async function load() {
    try {
      setProviders(await getProviders());
    } catch {
      setProviders([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditingProvider(null);
    setFormName("");
    setModalOpen(true);
  }

  function openEdit(p: Provider) {
    setEditingProvider(p);
    setFormName(p.name);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingProvider(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formName.trim()) return;
    setSaving(true);
    try {
      if (editingProvider) {
        const updated = await updateProvider(editingProvider.id, {
          name: formName.trim(),
          is_active: editingProvider.is_active,
        });
        setProviders((prev) => prev.map((x) => (x.id === editingProvider.id ? updated : x)));
      } else {
        const created = await createProvider({ name: formName.trim() });
        setProviders((prev) => [...prev, created]);
      }
      closeModal();
    } catch {
      alert(editingProvider ? "Erro ao atualizar provedor." : "Erro ao criar provedor.");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(p: Provider) {
    setSaving(true);
    try {
      const updated = await updateProvider(p.id, { name: p.name, is_active: !p.is_active });
      setProviders((prev) => prev.map((x) => (x.id === p.id ? updated : x)));
    } catch {
      alert("Erro ao alterar status do provedor.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(p: Provider) {
    if (!confirm(`Excluir o provedor "${p.name}"?`)) return;
    setSaving(true);
    try {
      await deleteProvider(p.id);
      setProviders((prev) => prev.filter((x) => x.id !== p.id));
    } catch {
      alert("Erro ao excluir provedor.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 bg-slate-50 overflow-y-auto p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Provedores</h1>
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Novo Provedor
          </button>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <input
            type="text"
            placeholder="Buscar por nome"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary w-56"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as "" | "active" | "inactive")}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Todos os status</option>
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-slate-500">Carregando...</p>
          </div>
        ) : (
          <DataTable<Provider>
            columns={
              [
                {
                  key: "name",
                  label: "Nome",
                  sortable: true,
                  render: (p) => (
                    <span className="text-slate-900 font-medium">{p.name}</span>
                  ),
                },
                {
                  key: "is_active",
                  label: "Status",
                  sortable: true,
                  align: "center",
                  sortValue: (p) => (p.is_active ? 1 : 0),
                  render: (p) => <StatusBadge active={p.is_active} />,
                },
                {
                  key: "actions",
                  label: "Acoes",
                  align: "center",
                  headerClassName: "w-28",
                  render: (p) => (
                    <div className="flex items-center justify-center gap-1">
                      <EditButton onClick={() => openEdit(p)} disabled={saving} />
                      <ToggleActiveButton
                        active={p.is_active}
                        onClick={() => handleToggle(p)}
                        disabled={saving}
                      />
                      <DeleteButton onClick={() => handleDelete(p)} disabled={saving} />
                    </div>
                  ),
                },
              ] satisfies Column<Provider>[]
            }
            data={filtered}
            keyExtractor={(p) => p.id}
            emptyMessage="Nenhum provedor encontrado."
          />
        )}

        <CrudModal
          open={modalOpen}
          title={editingProvider ? "Editar Provedor" : "Novo Provedor"}
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
                disabled={saving || !formName.trim()}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
              >
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </>
          }
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className={inputClass}
                placeholder="Nome do provedor"
                autoFocus
              />
            </div>
          </form>
        </CrudModal>
      </main>
    </div>
  );
}
