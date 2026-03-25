"use client";

import { useEffect, useState, useMemo } from "react";
import Sidebar from "@/components/Sidebar";
import CrudModal from "@/components/CrudModal";
import StatusBadge from "@/components/StatusBadge";
import DataTable, { Column } from "@/components/DataTable";
import { EditButton, ToggleActiveButton, DeleteButton } from "@/components/ActionIcons";
import { getChannels, createChannel, updateChannel, deleteChannel } from "@/lib/api";

interface Channel {
  id: string;
  name: string;
  code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary";

export default function ChannelsPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");

  const [filterName, setFilterName] = useState("");
  const [filterCode, setFilterCode] = useState("");
  const [filterStatus, setFilterStatus] = useState<"" | "active" | "inactive">("");

  const filtered = useMemo(() => {
    return channels.filter((ch) => {
      if (filterName && !ch.name.toLowerCase().includes(filterName.toLowerCase())) return false;
      if (filterCode && !ch.code.toLowerCase().includes(filterCode.toLowerCase())) return false;
      if (filterStatus === "active" && !ch.is_active) return false;
      if (filterStatus === "inactive" && ch.is_active) return false;
      return true;
    });
  }, [channels, filterName, filterCode, filterStatus]);

  async function load() {
    try {
      setChannels(await getChannels());
    } catch {
      setChannels([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditingChannel(null);
    setFormName("");
    setFormCode("");
    setModalOpen(true);
  }

  function openEdit(ch: Channel) {
    setEditingChannel(ch);
    setFormName(ch.name);
    setFormCode(ch.code);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingChannel(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formName.trim() || !formCode.trim()) return;
    setSaving(true);
    try {
      if (editingChannel) {
        const updated = await updateChannel(editingChannel.id, {
          name: formName.trim(),
          code: formCode.trim(),
          is_active: editingChannel.is_active,
        });
        setChannels((prev) => prev.map((c) => (c.id === editingChannel.id ? updated : c)));
      } else {
        const created = await createChannel({ name: formName.trim(), code: formCode.trim() });
        setChannels((prev) => [...prev, created]);
      }
      closeModal();
    } catch {
      alert(editingChannel ? "Erro ao atualizar canal." : "Erro ao criar canal.");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(ch: Channel) {
    setSaving(true);
    try {
      const updated = await updateChannel(ch.id, { name: ch.name, code: ch.code, is_active: !ch.is_active });
      setChannels((prev) => prev.map((c) => (c.id === ch.id ? updated : c)));
    } catch {
      alert("Erro ao alterar status do canal.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(ch: Channel) {
    if (!confirm(`Excluir o canal "${ch.name}"?`)) return;
    setSaving(true);
    try {
      await deleteChannel(ch.id);
      setChannels((prev) => prev.filter((c) => c.id !== ch.id));
    } catch {
      alert("Erro ao excluir canal.");
    } finally {
      setSaving(false);
    }
  }

  const columns: Column<Channel>[] = [
    {
      key: "name",
      label: "Nome",
      sortable: true,
      render: (ch) => <span className="text-slate-900 font-medium">{ch.name}</span>,
    },
    {
      key: "code",
      label: "Codigo",
      sortable: true,
      render: (ch) => <span className="text-slate-700">{ch.code}</span>,
    },
    {
      key: "is_active",
      label: "Status",
      sortable: true,
      align: "center",
      sortValue: (ch) => (ch.is_active ? 1 : 0),
      render: (ch) => <StatusBadge active={ch.is_active} />,
    },
    {
      key: "actions",
      label: "Acoes",
      align: "center",
      headerClassName: "w-28",
      render: (ch) => (
        <div className="flex items-center justify-center gap-1">
          <EditButton onClick={() => openEdit(ch)} disabled={saving} />
          <ToggleActiveButton active={ch.is_active} onClick={() => handleToggle(ch)} disabled={saving} />
          <DeleteButton onClick={() => handleDelete(ch)} disabled={saving} />
        </div>
      ),
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 bg-slate-50 overflow-y-auto p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Canais</h1>
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Novo Canal
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
          <input
            type="text"
            placeholder="Buscar por codigo"
            value={filterCode}
            onChange={(e) => setFilterCode(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary w-44"
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
          <DataTable
            columns={columns}
            data={filtered}
            keyExtractor={(ch) => ch.id}
            emptyMessage="Nenhum canal encontrado."
          />
        )}

        <CrudModal
          open={modalOpen}
          title={editingChannel ? "Editar Canal" : "Novo Canal"}
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
                disabled={saving || !formName.trim() || !formCode.trim()}
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
                placeholder="Nome do canal"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Codigo</label>
              <input
                type="text"
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
                className={inputClass}
                placeholder="Ex: SMS, HSM_MARKETING"
              />
            </div>
          </form>
        </CrudModal>
      </main>
    </div>
  );
}
