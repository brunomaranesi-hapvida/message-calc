"use client";

import { useState } from "react";
import { Step, Channel, CHANNELS, SimulationConfig } from "@/lib/types";
import { TRIGGERS } from "@/lib/triggers";
import { computeStepCost } from "@/lib/simulation";
import { formatCurrency, formatNumber, formatUnitPrice } from "@/lib/format";
import StepModal from "./StepModal";
import { v4 as uuid } from "uuid";

interface Props {
  config: SimulationConfig;
  onStepsChange: (steps: Step[]) => void;
}

export default function StepsTable({ config, onStepsChange }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<Step | null>(null);
  const [editingChannelId, setEditingChannelId] = useState<string | null>(null);

  const steps = config.steps;

  const openNew = () => {
    setEditingStep(null);
    setModalOpen(true);
  };

  const openEdit = (step: Step) => {
    setEditingStep(step);
    setModalOpen(true);
  };

  const handleSave = (step: Step) => {
    if (editingStep) {
      onStepsChange(steps.map((s) => (s.id === step.id ? step : s)));
    } else {
      onStepsChange([...steps, step]);
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    onStepsChange(steps.filter((s) => s.id !== id));
  };

  const handleDuplicate = (step: Step) => {
    const dup = { ...step, id: uuid() };
    const idx = steps.findIndex((s) => s.id === step.id);
    const next = [...steps];
    next.splice(idx + 1, 0, dup);
    onStepsChange(next);
  };

  const handleInlineChannel = (id: string, channel: Channel) => {
    onStepsChange(steps.map((s) => (s.id === id ? { ...s, channel } : s)));
    setEditingChannelId(null);
  };

  const getTriggerName = (id: string | null) => {
    if (!id) return "—";
    return TRIGGERS.find((t) => t.id === id)?.name ?? "—";
  };

  const formatOffset = (s: Step) => {
    const unit =
      s.offsetUnit === "hours" ? "h" : s.offsetUnit === "days" ? "d" : "m";
    const dir = s.offsetDirection === "before" ? "antes" : "depois";
    return `${s.offsetValue}${unit} ${dir}`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-700">Disparos</h3>
        <button
          onClick={openNew}
          className="px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition flex items-center gap-1"
        >
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          Adicionar
        </button>
      </div>

      {steps.length === 0 ? (
        <div className="text-center py-12 text-slate-400 border-2 border-dashed rounded-lg">
          Nenhum disparo configurado. Clique em &quot;Adicionar&quot; para
          começar.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600">
                <th className="text-left px-4 py-2.5 font-medium">Canal</th>
                <th className="text-left px-4 py-2.5 font-medium">Gatilho</th>
                <th className="text-right px-4 py-2.5 font-medium">Custo</th>
                <th className="text-center px-4 py-2.5 font-medium w-28">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {steps.map((step) => {
                const sc = computeStepCost(step, config);

                const details = `${formatNumber(sc.volume)} à : ${formatUnitPrice(sc.unitPrice)}`;
                if (step.fallbackChannel) {
                  details += `  •  Fallback: ${step.fallbackChannel} (${step.fallbackPercentage}%)`;
                }

                return (
                  <tr
                    key={step.id}
                    className="border-t border-slate-100 hover:bg-blue-50/30 transition align-top"
                  >
                    <td className="px-4 py-4">
                      <div className="font-semibold text-slate-800">
                        {editingChannelId === step.id ? (
                          <select
                            autoFocus
                            value={step.channel}
                            onChange={(e) =>
                              handleInlineChannel(
                                step.id,
                                e.target.value as Channel,
                              )
                            }
                            onBlur={() => setEditingChannelId(null)}
                            className="rounded border border-blue-400 px-1.5 py-0.5 text-sm font-semibold focus:ring-1 focus:ring-blue-500"
                          >
                            {CHANNELS.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <button
                            onClick={() => setEditingChannelId(step.id)}
                            className="text-blue-700 hover:underline"
                          >
                            {step.channel}
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        {details.join("  •  ")}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-slate-700 flex flex-col">
                      <span>{getTriggerName(step.triggerId)}</span>
                      <span className="text-xs text-slate-400 mt-1">
                        {formatOffset(step)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right font-mono font-semibold text-slate-800">
                      {formatCurrency(sc.cost + sc.fallbackCost)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEdit(step)}
                          title="Editar"
                          className="p-1.5 rounded hover:bg-slate-200 text-slate-400 hover:text-blue-600 transition"
                        >
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
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDuplicate(step)}
                          title="Duplicar"
                          className="p-1.5 rounded hover:bg-slate-200 text-slate-400 hover:text-green-600 transition"
                        >
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
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(step.id)}
                          title="Excluir"
                          className="p-1.5 rounded hover:bg-slate-200 text-slate-400 hover:text-red-600 transition"
                        >
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
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
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

      <StepModal
        open={modalOpen}
        initial={editingStep}
        onSave={handleSave}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
