"use client";

import {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
  Suspense,
} from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { SimulationConfig, Channel, Provider, Step } from "@/lib/types";
import { createDefaultConfig } from "@/lib/defaults";
import { runSimulation } from "@/lib/simulation";
import { generatePDF } from "@/lib/pdf";
import { Journey, fetchJourneyByCode } from "@/hooks/useJourneys";
import Header from "@/components/Header";
import SaveJourneyModal from "@/components/SaveJourneyModal";
import ConfigHeader from "@/components/ConfigHeader";
import StepsTable from "@/components/StepsTable";
import ProvidersTab from "@/components/ProvidersTab";
import CostSummary from "@/components/CostSummary";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const BACKOFFICE_URL =
  process.env.NEXT_PUBLIC_BACKOFFICE_URL || "http://localhost:3001";

type Tab = "config" | "providers";

export default function Home() {
  return (
    <Suspense>
      <HomeInner />
    </Suspense>
  );
}

function HomeInner() {
  const searchParams = useSearchParams();
  const [config, setConfig] = useState<SimulationConfig>(createDefaultConfig);
  const [tab, setTab] = useState<Tab>("config");
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [journeyMeta, setJourneyMeta] = useState<Journey | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const result = useMemo(() => runSimulation(config), [config]);
  const isApproved = journeyMeta?.status === "approved";

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
        const data = JSON.parse(
          ev.target?.result as string,
        ) as SimulationConfig;
        setConfig(data);
      } catch {
        alert("Arquivo JSON inválido.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleExportPDF = () => generatePDF(config, result);

  const handleSaveJourney = async (data: {
    name: string;
    category: string;
    owner: string;
  }) => {
    const res = await fetch(`${API_URL}/journeys`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        category: data.category,
        owner: data.owner,
        base_volume: config.peopleReached,
        opt_in_rate: config.optInRate,
        wa_delivery: config.deliveryRateWhats,
        sms_delivery: config.deliveryRateSMS,
        steps: config.steps,
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  };

  const handleCopyJourney = () => {
    setConfig((prev) => ({
      ...prev,
      journeyName: `${prev.journeyName} (cópia)`,
    }));
    setJourneyMeta(null);
    window.history.replaceState(null, "", "/");
    setSaveModalOpen(true);
  };

  useEffect(() => {
    const code = searchParams.get("journey") || searchParams.get("code");
    if (!code) return;
    fetchJourneyByCode(code)
      .then((j) => {
        setJourneyMeta(j);
        setConfig((prev) => ({
          ...prev,
          journeyName: j.name,
          peopleReached: j.base_volume,
          optInRate: j.opt_in_rate,
          deliveryRateWhats: j.wa_delivery,
          deliveryRateSMS: j.sms_delivery,
          steps: j.steps || [],
        }));
      })
      .catch(() => {
        alert("Erro ao carregar régua.");
      });
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 px-6 py-3">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          <Link href="/">
            <img src="/logo-hapvida.png" alt="Hapvida" className="h-7" />
          </Link>
          <div className="flex items-center gap-6 text-sm font-medium">
            <Link
              href="/reguas"
              className="text-slate-600 hover:text-primary transition"
            >
              Réguas
            </Link>
            <a
              href={BACKOFFICE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-600 hover:text-primary transition"
            >
              Backoffice
            </a>
          </div>
        </div>
      </nav>

      <Header
        onSave={() => setSaveModalOpen(true)}
        onCopy={handleCopyJourney}
        isApproved={isApproved}
        onExportPDF={handleExportPDF}
        onExportJSON={handleExportJSON}
        fileInputRef={fileInputRef}
        onImportJSON={handleImportJSON}
      />

      <SaveJourneyModal
        open={saveModalOpen}
        defaultName={config.journeyName}
        onClose={() => setSaveModalOpen(false)}
        onSave={handleSaveJourney}
      />

      {journeyMeta && (
        <div className="bg-primary-50 border-b border-primary-100 px-6 py-2.5">
          <div className="max-w-screen-2xl mx-auto flex items-center gap-4 text-sm">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-100 text-primary-700 text-xs font-semibold">
              Editando régua
            </span>
            <span className="text-slate-600">
              Categoria:{" "}
              <span className="font-medium text-slate-800">
                {journeyMeta.category ?? "-"}
              </span>
            </span>
            <span className="text-slate-600">
              Owner:{" "}
              <span className="font-medium text-slate-800">
                {journeyMeta.owner ?? "-"}
              </span>
            </span>
            {journeyMeta.status === "approved" && journeyMeta.approved_by ? (
              <span className="text-slate-600">
                Aprovado por:{" "}
                <span className="font-medium text-slate-800">
                  {journeyMeta.approved_by}
                </span>
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                {journeyMeta.status === "pending"
                  ? "Pendente"
                  : journeyMeta.status === "rejected"
                    ? "Rejeitada"
                    : journeyMeta.status}
              </span>
            )}
          </div>
        </div>
      )}

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
                        ? "border-primary text-primary"
                        : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    Configuração
                  </button>
                  <button
                    onClick={() => setTab("providers")}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
                      tab === "providers"
                        ? "border-primary text-primary"
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
                    <ConfigHeader
                      config={config}
                      onChange={patchConfig}
                      disabled={isApproved}
                    />
                    <StepsTable
                      config={config}
                      onStepsChange={setSteps}
                      disabled={isApproved}
                    />
                  </>
                ) : (
                  <ProvidersTab
                    config={config}
                    onProviderChange={setProvider}
                    disabled={isApproved}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Right Panel — Receipt */}
          <div className="shrink-0">
            <div className="sticky top-6">
              <CostSummary config={config} result={result} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
