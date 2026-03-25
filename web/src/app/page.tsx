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
import { toast } from "sonner";
import { SimulationConfig, Channel, Provider, Step, VolumeMode } from "@/lib/types";
import { createDefaultConfig } from "@/lib/defaults";
import { runSimulation } from "@/lib/simulation";
import { generatePDF } from "@/lib/pdf";
import { Journey, fetchJourneyByCode } from "@/hooks/useJourneys";
import { useCalculatorConfig } from "@/hooks/useCalculatorConfig";
import AppNavbar from "@/components/AppNavbar";
import Header from "@/components/Header";
import SaveJourneyModal from "@/components/SaveJourneyModal";
import ConfigHeader from "@/components/ConfigHeader";
import StepsTable from "@/components/StepsTable";
import ProvidersTab from "@/components/ProvidersTab";
import CostSummary from "@/components/CostSummary";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

function normalizeSteps(steps: Step[]): Step[] {
  if (!steps.length) return steps;
  const needsFill = steps.some((s) => !s.volumeMode);
  if (!needsFill) return steps;
  const share = Math.round(100 / steps.length);
  return steps.map((s) => ({
    ...s,
    volumeMode: (s.volumeMode || "percentage") as VolumeMode,
    volumeValue: s.volumeValue ?? share,
  }));
}

const STATUS_STYLES: Record<string, { label: string; classes: string }> = {
  draft:    { label: "Rascunho",  classes: "bg-slate-100 text-slate-700" },
  pending:  { label: "Pendente",  classes: "bg-yellow-100 text-yellow-700" },
  approved: { label: "Aprovada",  classes: "bg-green-100 text-green-700" },
  rejected: { label: "Rejeitada", classes: "bg-red-100 text-red-700" },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? { label: status, classes: "bg-slate-100 text-slate-700" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.classes}`}>
      {s.label}
    </span>
  );
}

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
  const { calcConfig, loading: configLoading } = useCalculatorConfig();
  const [config, setConfig] = useState<SimulationConfig>(() => createDefaultConfig());
  const [tab, setTab] = useState<Tab>("config");
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [journeyMeta, setJourneyMeta] = useState<Journey | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!configLoading) {
      setConfig((prev) => {
        if (prev.steps.length > 0) return prev;
        return createDefaultConfig(calcConfig.defaultProviders, calcConfig.defaults);
      });
    }
  }, [configLoading, calcConfig]);

  const result = useMemo(() => runSimulation(config, calcConfig.prices), [config, calcConfig.prices]);
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
        data.steps = normalizeSteps(data.steps);
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
    const saved: Journey = await res.json();
    setJourneyMeta(saved);
    setIsCopied(false);
  };

  const handleCopyJourney = () => {
    if (isCopied) return;
    setConfig((prev) => ({
      ...prev,
      journeyName: `${prev.journeyName} (cópia)`,
      steps: prev.steps.map((s) => ({ ...s })),
    }));
    setJourneyMeta(null);
    setIsCopied(true);
    window.history.replaceState(null, "", "/");
    toast.success("Régua copiada", {
      description: "Os dados foram copiados. Clique em 'Salvar Régua' para persistir.",
      duration: 4000,
    });
  };

  const handleSaveCopy = () => {
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
          steps: normalizeSteps(j.steps || []),
        }));
      })
      .catch(() => {
        alert("Erro ao carregar régua.");
      });
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-slate-50">
      <AppNavbar />

      <Header
        onSave={() => setSaveModalOpen(true)}
        onCopy={handleCopyJourney}
        onSaveCopy={handleSaveCopy}
        isApproved={isApproved}
        isCopied={isCopied}
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
            <StatusBadge status={journeyMeta.status} />
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
            {journeyMeta.status === "approved" && journeyMeta.approved_by && (
              <span className="text-slate-600">
                Aprovado por:{" "}
                <span className="font-medium text-slate-800">
                  {journeyMeta.approved_by}
                </span>
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
                      onImportConfig={setConfig}
                      disabled={isApproved}
                      channels={calcConfig.channels}
                      prices={calcConfig.prices}
                    />
                  </>
                ) : (
                  <ProvidersTab
                    config={config}
                    onProviderChange={setProvider}
                    disabled={isApproved}
                    channels={calcConfig.channels}
                    providers={calcConfig.providers}
                    prices={calcConfig.prices}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Right Panel — Receipt */}
          <div className="shrink-0">
            <div className="sticky top-6">
              <CostSummary config={config} result={result} prices={calcConfig.prices} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
