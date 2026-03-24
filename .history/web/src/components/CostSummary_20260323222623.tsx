"use client";

import { SimulationConfig } from "@/lib/types";
import { SimulationResult } from "@/lib/simulation";
import { formatCurrency, formatNumber, formatUnitPrice } from "@/lib/format";
import { getUnitPrice } from "@/lib/pricing";

interface Props {
  config: SimulationConfig;
  result: SimulationResult;
}

function Sep() {
  return <div className="my-2.5" style={{ borderTop: "1px dashed #ccc" }} />;
}

function Row({
  left,
  right,
  bold,
  muted,
}: {
  left: string;
  right: string;
  bold?: boolean;
  muted?: boolean;
}) {
  return (
    <div
      className="flex justify-between gap-4 py-[0px]"
      style={{ fontWeight: bold ? 700 : 400 }}
    >
      <span
        className="whitespace-nowrap"
        style={{ color: muted ? "#333" : undefined }}
      >
        {left}
      </span>
      <span
        className="whitespace-nowrap text-right"
        style={{ color: muted ? "#333" : undefined }}
      >
        {right}
      </span>
    </div>
  );
}

export default function CostSummary({ config, result }: Props) {
  const activeChannels = Object.keys(result.messagesPerChannel);

  return (
    <div
      className="bg-white border border-slate-200 rounded shadow-sm"
      style={{
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: "13px",
        lineHeight: 1.4,
        fontVariantNumeric: "tabular-nums",
        width: "340px",
        padding: "16px",
      }}
    >
      {/* Header */}
      <div className="text-center mb-1">
        <div className="font-bold uppercase tracking-wide">
          {config.journeyName || "Jornada"}
        </div>
        <div style={{ color: "#888" }}>Resumo de Custos</div>
      </div>

      <Sep />

      {/* Unit prices per channel */}
      {activeChannels.length > 0 && (
        <>
          {activeChannels.map((ch) => {
            const provider =
              config.providersByChannel[
                ch as keyof typeof config.providersByChannel
              ];
            const price = getUnitPrice(
              ch as keyof typeof config.providersByChannel,
              provider,
            );
            return <Row key={ch} left={ch} right={formatUnitPrice(price)} />;
          })}
          <Sep />
        </>
      )}

      {/* Volume summary */}
      <Row left="Volume Base" right={formatNumber(config.peopleReached)} />
      <Row left="Total Mensagens" right={formatNumber(result.totalMessages)} />

      <Sep />

      {/* Step breakdown */}
      {result.stepCosts.length > 0 && (
        <>
          <div className="text-center font-bold uppercase tracking-wide mb-1">
            Detalhamento por Disparo
          </div>

          <div className="space-y-2">
            {result.stepCosts.map((sc, i) => (
              <div key={sc.step.id}>
                <div className="font-bold pt-0.5">
                  Disparo {i + 1} - {sc.step.channel}
                </div>
                <Row
                  left={`${formatNumber(sc.volume)} x ${formatUnitPrice(sc.unitPrice)}`}
                  right={formatCurrency(sc.cost)}
                  muted
                />
                {sc.step.fallbackChannel && sc.fallbackVolume > 0 && (
                  <Row
                    left={`${formatNumber(sc.fallbackVolume)} x ${formatUnitPrice(sc.fallbackUnitPrice)}`}
                    right={formatCurrency(sc.fallbackCost)}
                    muted
                  />
                )}
              </div>
            ))}
          </div>

          <Sep />
        </>
      )}

      {/* Monthly total */}
      <Row
        left="TOTAL MÊS"
        right={formatCurrency(result.totalMonthlyCost)}
        bold
      />

      <Sep />

      {/* Projection */}
      <Row
        left="PROJEÇÃO 2026"
        right={formatCurrency(result.projection2026)}
        bold
      />
      <div
        className="text-center mt-0.5"
        style={{ color: "#aaa", fontSize: "11px" }}
      >
        {result.monthsRemaining} meses restantes
      </div>

      <Sep />

      {/* Footer */}
      <div className="text-center" style={{ color: "#aaa", fontSize: "11px" }}>
        Obrigado pela simulação
      </div>
    </div>
  );
}
