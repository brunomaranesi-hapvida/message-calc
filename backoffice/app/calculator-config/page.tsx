"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import {
  getChannels,
  getProviders,
  getDefaultConfig,
  setDefaultConfig,
  getCalculatorDefaults,
  updateCalculatorDefaults,
} from "@/lib/api";

interface Channel { id: string; name: string; is_active: boolean; }
interface Provider { id: string; name: string; is_active: boolean; }
interface DefaultConfig {
  id: string;
  channel_id: string;
  provider_id: string;
  channel: { id: string; name: string };
  provider: { id: string; name: string };
}
interface CalcDefaults {
  default_people_reached: number;
  default_start_month: number;
  default_opt_in_rate: number;
  default_whatsapp_delivery_rate: number;
  default_sms_delivery_rate: number;
}

const MONTHS = [
  "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary";

export default function CalculatorConfigPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [providerConfigs, setProviderConfigs] = useState<DefaultConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingProvider, setSavingProvider] = useState<string | null>(null);
  const [savedProvider, setSavedProvider] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [peopleReached, setPeopleReached] = useState(100000);
  const [startMonth, setStartMonth] = useState(1);
  const [optInRate, setOptInRate] = useState(70);
  const [waDeliveryRate, setWaDeliveryRate] = useState(95);
  const [smsDeliveryRate, setSmsDeliveryRate] = useState(90);

  async function load() {
    try {
      const [channelsData, providersData, configData, defaultsData] = await Promise.all([
        getChannels(),
        getProviders(),
        getDefaultConfig(),
        getCalculatorDefaults(),
      ]);
      setChannels(channelsData);
      setProviders(providersData);
      setProviderConfigs(Array.isArray(configData) ? configData : []);
      setPeopleReached(defaultsData.default_people_reached);
      setStartMonth(defaultsData.default_start_month);
      setOptInRate(Math.round(defaultsData.default_opt_in_rate * 100));
      setWaDeliveryRate(Math.round(defaultsData.default_whatsapp_delivery_rate * 100));
      setSmsDeliveryRate(Math.round(defaultsData.default_sms_delivery_rate * 100));
    } catch {
      // fallback to defaults
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function getProviderForChannel(channelId: string): string {
    const cfg = providerConfigs.find((c) => c.channel_id === channelId);
    return cfg?.provider_id ?? "";
  }

  const activeChannels = channels.filter((c) => c.is_active);
  const activeProviders = providers.filter((p) => p.is_active);

  async function handleProviderChange(channelId: string, providerId: string) {
    if (!providerId) return;
    setSavingProvider(channelId);
    setSavedProvider(null);
    try {
      await setDefaultConfig({ channel_id: channelId, provider_id: providerId });
      const fresh = await getDefaultConfig();
      setProviderConfigs(Array.isArray(fresh) ? fresh : []);
      setSavedProvider(channelId);
      setTimeout(() => setSavedProvider(null), 2000);
    } catch {
      alert("Erro ao salvar provedor padrao.");
    } finally {
      setSavingProvider(null);
    }
  }

  async function handleSaveDefaults(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await updateCalculatorDefaults({
        default_people_reached: peopleReached,
        default_start_month: startMonth,
        default_opt_in_rate: optInRate / 100,
        default_whatsapp_delivery_rate: waDeliveryRate / 100,
        default_sms_delivery_rate: smsDeliveryRate / 100,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert("Erro ao salvar configuracao.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 bg-slate-50 overflow-y-auto p-8">
          <div className="flex items-center justify-center py-20">
            <p className="text-slate-500">Carregando...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 bg-slate-50 overflow-y-auto p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Configuracao da Calculadora</h1>
        <p className="text-sm text-slate-500 mb-8">
          Parametrizacao global aplicada a novas reguas criadas na calculadora.
        </p>

        <div className="max-w-2xl space-y-8">
          {/* Defaults da Regua */}
          <section className="rounded-xl bg-white border border-slate-200 shadow-sm p-6">
            <h2 className="text-base font-semibold text-slate-800 mb-4">Defaults da Regua</h2>
            <form onSubmit={handleSaveDefaults} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Pessoas alcancadas
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={peopleReached}
                    onChange={(e) => setPeopleReached(Math.max(1, Number(e.target.value)))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Mes inicial do disparo
                  </label>
                  <select
                    value={startMonth}
                    onChange={(e) => setStartMonth(Number(e.target.value))}
                    className={inputClass}
                  >
                    {MONTHS.map((m, i) => (
                      <option key={i} value={i + 1}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Taxa de Opt-in (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={optInRate}
                    onChange={(e) => setOptInRate(Math.min(100, Math.max(0, Number(e.target.value))))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Taxa entrega WhatsApp (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={waDeliveryRate}
                    onChange={(e) => setWaDeliveryRate(Math.min(100, Math.max(0, Number(e.target.value))))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Taxa entrega SMS (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={smsDeliveryRate}
                    onChange={(e) => setSmsDeliveryRate(Math.min(100, Math.max(0, Number(e.target.value))))}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {saving ? "Salvando..." : "Salvar Defaults"}
                </button>
                {saved && (
                  <span className="text-sm text-green-600 font-medium">Salvo com sucesso</span>
                )}
              </div>
            </form>
          </section>

          {/* Provedor Padrao por Canal */}
          <section className="rounded-xl bg-white border border-slate-200 shadow-sm p-6">
            <h2 className="text-base font-semibold text-slate-800 mb-1">Provedor Padrao por Canal</h2>
            <p className="text-xs text-slate-500 mb-5">
              Define qual provedor sera usado por padrao no calculo de custo de cada canal.
              Alteracoes sao salvas automaticamente.
            </p>

            {activeChannels.length === 0 ? (
              <p className="text-sm text-slate-400">Nenhum canal ativo encontrado.</p>
            ) : (
              <div className="rounded-lg border border-slate-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-4 py-2.5 font-medium text-slate-500">Canal</th>
                      <th className="text-left px-4 py-2.5 font-medium text-slate-500">Provedor Padrao</th>
                      <th className="w-20"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeChannels.map((ch) => {
                      const isSaving = savingProvider === ch.id;
                      const justSaved = savedProvider === ch.id;
                      return (
                        <tr key={ch.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium text-slate-800">{ch.name}</td>
                          <td className="px-4 py-3">
                            <select
                              value={getProviderForChannel(ch.id)}
                              onChange={(e) => handleProviderChange(ch.id, e.target.value)}
                              disabled={isSaving}
                              className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                            >
                              <option value="">Selecione um provedor</option>
                              {activeProviders.map((p) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {isSaving && (
                              <span className="text-xs text-slate-400">Salvando...</span>
                            )}
                            {justSaved && !isSaving && (
                              <svg className="w-4 h-4 text-green-500 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
