"use client";

import { useState, useEffect, useMemo } from "react";
import { Step, Channel, SimulationConfig, OffsetUnit, OffsetDirection, VolumeMode } from "@/lib/types";
import { TRIGGERS } from "@/lib/triggers";
import { getUnitPrice } from "@/lib/pricing";
import { formatCurrency, formatNumber, formatUnitPrice } from "@/lib/format";
import { v4 as uuid } from "uuid";

interface Props {
  open: boolean;
  initial?: Step | null;
  onSave: (step: Step) => void;
  onClose: () => void;
  channels?: string[];
  config: SimulationConfig;
  prices?: Record<string, Record<string, number>>;
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
    volumeMode: "percentage",
    volumeValue: 100,
    fallbackChannel: null,
    fallbackPercentage: 0,
  };
}

export default function StepModal({ open, initial, onSave, onClose, channels, config, prices }: Props) {
  const [step, setStep] = useState<Step>(emptyStep());

  useEffect(() => {
    if (open) {
      setStep(initial ? { ...initial } : emptyStep());
    }
  }, [open, initial]);

  const costHints = useMemo(() => {
    const base = Math.round(config.peopleReached * config.optInRate);
    const provider = config.providersByChannel[step.channel];
    const unitPrice = getUnitPrice(step.channel, provider, prices);

    const totalVolume =
      step.volumeMode === "percentage"
        ? Math.round(base * (step.volumeValue / 100))
        : Math.round(step.volumeValue);

    let fallbackVolume = 0;
    let fallbackUnitPrice = 0;
    let fallbackCost = 0;

    if (step.fallbackChannel && step.fallbackPercentage > 0) {
      fallbackVolume = Math.round(totalVolume * (step.fallbackPercentage / 100));
      const fbProvider = config.providersByChannel[step.fallbackChannel];
      fallbackUnitPrice = getUnitPrice(step.fallbackChannel, fbProvider, prices);
      fallbackCost = fallbackVolume * fallbackUnitPrice;
    }

    const primaryVolume = totalVolume - fallbackVolume;
    const primaryCost = primaryVolume * unitPrice;

    return { unitPrice, totalVolume, primaryVolume, primaryCost, fallbackVolume, fallbackUnitPrice, fallbackCost };
  }, [step.channel, step.volumeMode, step.volumeValue, step.fallbackChannel, step.fallbackPercentage, config, prices]);

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
              {(channels ?? []).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-400">
              {costHints.unitPrice > 0
                ? <>{formatUnitPrice(costHints.unitPrice)} por mensagem</>
                : "Sem preço configurado"}
            </p>
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

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Volume
            </label>
            <div className="flex gap-2">
              <select
                value={step.volumeMode}
                onChange={(e) =>
                  patch({ volumeMode: e.target.value as VolumeMode })
                }
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
              >
                <option value="percentage">Percentual (%)</option>
                <option value="absolute">Quantidade</option>
              </select>
              <input
                type="number"
                min={0}
                max={step.volumeMode === "percentage" ? 100 : undefined}
                value={step.volumeValue}
                onChange={(e) => {
                  const v = Math.max(0, Number(e.target.value));
                  patch({
                    volumeValue:
                      step.volumeMode === "percentage" ? Math.min(100, v) : v,
                  });
                }}
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
                placeholder={
                  step.volumeMode === "percentage"
                    ? "% do público"
                    : "Quantidade de pessoas"
                }
              />
            </div>
            <p className="mt-1 text-xs text-slate-400">
              {formatNumber(costHints.totalVolume)} envios estimados
              {costHints.unitPrice > 0 && <> &bull; {formatCurrency(costHints.primaryCost)}</>}
            </p>
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
                  {(channels ?? []).map((c) => (
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
            {step.fallbackChannel && step.fallbackPercentage > 0 && (
              <p className="mt-1 text-xs text-slate-400">
                {formatNumber(costHints.fallbackVolume)} envios fallback
                {costHints.fallbackUnitPrice > 0 && <> &bull; {formatCurrency(costHints.fallbackCost)}</>}
              </p>
            )}
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
