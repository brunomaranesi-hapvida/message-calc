"use client";

import { useState } from "react";

interface Props {
  open: boolean;
  defaultName: string;
  onClose: () => void;
  onSave: (data: { name: string; category: string; owner: string }) => Promise<void>;
}

export default function SaveJourneyModal({ open, defaultName, onClose, onSave }: Props) {
  const [category, setCategory] = useState("");
  const [owner, setOwner] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!category.trim()) {
      setError("Categoria é obrigatória.");
      return;
    }
    if (!owner.trim()) {
      setError("Owner é obrigatório.");
      return;
    }

    setLoading(true);
    try {
      await onSave({ name: defaultName, category: category.trim(), owner: owner.trim() });
      setCategory("");
      setOwner("");
      onClose();
    } catch {
      setError("Erro ao salvar régua.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Salvar Régua</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
            <input
              type="text"
              value={defaultName}
              readOnly
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 cursor-default"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Categoria <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="">Selecione...</option>
              <option value="onboarding">Onboarding</option>
              <option value="retencao">Retenção</option>
              <option value="cobranca">Cobrança</option>
              <option value="marketing">Marketing</option>
              <option value="transacional">Transacional</option>
              <option value="outro">Outro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Owner <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              placeholder="Nome do responsável"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-300 text-slate-600 hover:bg-slate-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
