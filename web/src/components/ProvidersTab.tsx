"use client";

import { SimulationConfig, Channel, Provider, CHANNELS, PROVIDERS } from "@/lib/types";
import { getUnitPrice } from "@/lib/pricing";
import { formatUnitPrice } from "@/lib/format";

interface Props {
  config: SimulationConfig;
  onProviderChange: (channel: Channel, provider: Provider) => void;
}

export default function ProvidersTab({ config, onProviderChange }: Props) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 text-slate-600">
            <th className="text-left px-4 py-3 font-medium">Canal</th>
            <th className="text-left px-4 py-3 font-medium">Provedor</th>
            <th className="text-right px-4 py-3 font-medium">
              Custo por mensagem
            </th>
          </tr>
        </thead>
        <tbody>
          {CHANNELS.map((channel) => {
            const provider = config.providersByChannel[channel];
            const price = getUnitPrice(channel, provider);
            return (
              <tr
                key={channel}
                className="border-t border-slate-100 hover:bg-blue-50/40 transition"
              >
                <td className="px-4 py-3 font-medium text-slate-700">
                  {channel}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={provider}
                    onChange={(e) =>
                      onProviderChange(channel, e.target.value as Provider)
                    }
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {PROVIDERS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-right font-mono text-slate-600">
                  {formatUnitPrice(price)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
