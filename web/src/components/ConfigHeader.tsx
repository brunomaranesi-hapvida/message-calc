"use client";

import { SimulationConfig } from "@/lib/types";

interface Props {
  config: SimulationConfig;
  onChange: (patch: Partial<SimulationConfig>) => void;
  disabled?: boolean;
}

const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export default function ConfigHeader({ config, onChange, disabled }: Props) {
  const inputClass = `w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${disabled ? "bg-slate-50 text-slate-500 cursor-not-allowed" : ""}`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Nome da Régua
        </label>
        <input
          type="text"
          disabled={disabled}
          value={config.journeyName}
          onChange={(e) => onChange({ journeyName: e.target.value })}
          className={inputClass}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Pessoas alcançadas
        </label>
        <input
          type="number"
          min={0}
          disabled={disabled}
          value={config.peopleReached}
          onChange={(e) =>
            onChange({ peopleReached: Math.max(0, Number(e.target.value)) })
          }
          className={inputClass}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Mês inicial do disparo
        </label>
        <select
          disabled={disabled}
          value={config.startMonth}
          onChange={(e) => onChange({ startMonth: Number(e.target.value) })}
          className={inputClass}
        >
          {MONTHS.map((m, i) => (
            <option key={i} value={i + 1}>
              {m}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Taxa de Opt-in
        </label>
        <input
          type="number"
          min={0}
          max={100}
          step={1}
          disabled={disabled}
          value={Math.round(config.optInRate * 100)}
          onChange={(e) =>
            onChange({
              optInRate: Math.min(100, Math.max(0, Number(e.target.value))) / 100,
            })
          }
          className={inputClass}
        />
        <span className="text-xs text-slate-500">%</span>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Taxa entrega WhatsApp
        </label>
        <input
          type="number"
          min={0}
          max={100}
          step={1}
          disabled={disabled}
          value={Math.round(config.deliveryRateWhats * 100)}
          onChange={(e) =>
            onChange({
              deliveryRateWhats:
                Math.min(100, Math.max(0, Number(e.target.value))) / 100,
            })
          }
          className={inputClass}
        />
        <span className="text-xs text-slate-500">%</span>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Taxa entrega SMS
        </label>
        <input
          type="number"
          min={0}
          max={100}
          step={1}
          disabled={disabled}
          value={Math.round(config.deliveryRateSMS * 100)}
          onChange={(e) =>
            onChange({
              deliveryRateSMS:
                Math.min(100, Math.max(0, Number(e.target.value))) / 100,
            })
          }
          className={inputClass}
        />
        <span className="text-xs text-slate-500">%</span>
      </div>
    </div>
  );
}
