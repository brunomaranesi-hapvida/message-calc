"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { SimulationConfig, Channel, Provider, Step } from "@/lib/types";
import { createDefaultConfig } from "@/lib/defaults";
import { runSimulation } from "@/lib/simulation";
import { generatePDF } from "@/lib/pdf";
import ConfigHeader from "@/components/ConfigHeader";
import StepsTable from "@/components/StepsTable";
import ProvidersTab from "@/components/ProvidersTab";
import CostSummary from "@/components/CostSummary";

type Tab = "config" | "providers";

export default function Home() {
  const [config, setConfig] = useState<SimulationConfig>(createDefaultConfig);
  const [tab, setTab] = useState<Tab>("config");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const result = useMemo(() => runSimulation(config), [config]);

  const patchConfig = useCallback((patch: Partial<SimulationConfig>) => {
    setConfig((prev) => ({ ...prev, ...patch }));
  }, []);

  const setProvider = useCallback((channel: Channel, provider: Provider) => {
    setConfig((prev) => ({
      ...prev,
      providersByChannel: { ...prev.providersByChannel, [channel]: provider },
    }));
  }, []);

  const setSteps = useCallback((steps: Step[]) => {
    setConfig((prev) => ({ ...prev, steps }));
  }, []);

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${config.journeyName || "config"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string) as SimulationConfig;
        setConfig(data);
      } catch {
        alert("Arquivo JSON inválido.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleExportPDF = () => generatePDF(config, result);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              Message Cost Calculator
            </h1>
            <p className="text-sm text-slate-500">
              Simulador de custos de jornadas de comunicação
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPDF}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition"
            >
              Exportar PDF
            </button>
            <button
              onClick={handleExportJSON}
              className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-300 text-slate-600 hover:bg-slate-50 transition"
            >
              Exportar JSON
            </button>
            <label className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-300 text-slate-600 hover:bg-slate-50 transition cursor-pointer">
              Importar JSON
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImportJSON}
              />
            </label>
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-6 py-6">
        <div className="flex gap-6">
          {/* Left Panel */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
              {/* Tab Bar */}
              <div className="border-b border-slate-200 px-4">
                <nav className="flex gap-1 -mb-px">
                  <button
                    onClick={() => setTab("config")}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
                      tab === "config"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    Configuração
                  </button>
                  <button
                    onClick={() => setTab("providers")}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
                      tab === "providers"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    Provedores
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-5">
                {tab === "config" ? (
                  <>
                    <ConfigHeader config={config} onChange={patchConfig} />
                    <StepsTable config={config} onStepsChange={setSteps} />
                  </>
                ) : (
                  <ProvidersTab
                    config={config}
                    onProviderChange={setProvider}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Right Panel — Receipt */}
          <div className="shrink-0">
            <div className="sticky top-6">
              <CostSummary
                config={config}
                result={result}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
