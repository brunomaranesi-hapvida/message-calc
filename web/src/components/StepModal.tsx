"use client";

import { useState, useEffect } from "react";
import { Step, Channel, CHANNELS, OffsetUnit, OffsetDirection } from "@/lib/types";
import { TRIGGERS } from "@/lib/triggers";
import { v4 as uuid } from "uuid";

interface Props {
  open: boolean;
  initial?: Step | null;
  onSave: (step: Step) => void;
  onClose: () => void;
}

const OFFSET_UNITS: { value: OffsetUnit; label: string }[] = [
  { value: "hours", label: "Horas" },
  { value: "days", label: "Dias" },
  { value: "months", label: "Meses" },
];

const OFFSET_DIRS: { value: OffsetDirection; label: string }[] = [
  { value: "before", label: "Antes" },
  { value: "after", label: "Depois" },
];

function emptyStep(): Step {
  return {
    id: uuid(),
    channel: "SMS",
    triggerId: null,
    offsetValue: 0,
    offsetUnit: "days",
    offsetDirection: "after",
    fallbackChannel: null,
    fallbackPercentage: 0,
  };
}

export default function StepModal({ open, initial, onSave, onClose }: Props) {
  const [step, setStep] = useState<Step>(emptyStep());

  useEffect(() => {
    if (open) {
      setStep(initial ? { ...initial } : emptyStep());
    }
  }, [open, initial]);

  if (!open) return null;

  const patch = (p: Partial<Step>) => setStep((s) => ({ ...s, ...p }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          {initial ? "Editar Disparo" : "Novo Disparo"}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Canal
            </label>
            <select
              value={step.channel}
              onChange={(e) => patch({ channel: e.target.value as Channel })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
            >
              {CHANNELS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Gatilho
            </label>
            <select
              value={step.triggerId ?? ""}
              onChange={(e) =>
                patch({ triggerId: e.target.value || null })
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
            >
              <option value="">Nenhum</option>
              {TRIGGERS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Offset
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min={0}
                value={step.offsetValue}
                onChange={(e) =>
                  patch({ offsetValue: Math.max(0, Number(e.target.value)) })
                }
                className="w-20 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
              />
              <select
                value={step.offsetUnit}
                onChange={(e) =>
                  patch({ offsetUnit: e.target.value as OffsetUnit })
                }
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
              >
                {OFFSET_UNITS.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </select>
              <select
                value={step.offsetDirection}
                onChange={(e) =>
                  patch({
                    offsetDirection: e.target.value as OffsetDirection,
                  })
                }
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
              >
                {OFFSET_DIRS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Fallback
            </label>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <span className="text-xs text-slate-500">Canal</span>
                <select
                  value={step.fallbackChannel ?? ""}
                  onChange={(e) =>
                    patch({
                      fallbackChannel:
                        (e.target.value as Channel) || null,
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
                >
                  <option value="">Nenhum</option>
                  {CHANNELS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-28">
                <span className="text-xs text-slate-500">% Fallback</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={step.fallbackPercentage}
                  onChange={(e) =>
                    patch({
                      fallbackPercentage: Math.min(
                        100,
                        Math.max(0, Number(e.target.value))
                      ),
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
          >
            Cancelar
          </button>
          <button
            onClick={() => onSave(step)}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-hover transition"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
