import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { SimulationResult } from "./simulation";
import { SimulationConfig } from "./types";

export function generatePDF(
  config: SimulationConfig,
  result: SimulationResult
) {
  const doc = new jsPDF();
  const fmt = (n: number) =>
    n.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    });
  const fmtNum = (n: number) => n.toLocaleString("pt-BR");

  let y = 20;

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(config.journeyName.toUpperCase(), 14, y);
  y += 8;
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Resumo de Custos", 14, y);
  y += 12;

  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Mensagens por Canal", 14, y);
  y += 2;

  const channelRows = Object.entries(result.messagesPerChannel).map(
    ([ch, vol]) => [ch, fmtNum(vol)]
  );

  autoTable(doc, {
    startY: y,
    head: [["Canal", "Mensagens"]],
    body: channelRows,
    theme: "grid",
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: 14 },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 10;

  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Detalhamento por Disparo", 14, y);
  y += 2;

  const stepRows: string[][] = [];
  result.stepCosts.forEach((sc, i) => {
    stepRows.push([
      `Disparo ${i + 1} - ${sc.step.channel}`,
      fmtNum(sc.volume),
      fmt(sc.unitPrice),
      fmt(sc.cost),
    ]);
    if (sc.step.fallbackChannel && sc.fallbackVolume > 0) {
      stepRows.push([
        `  Fallback - ${sc.step.fallbackChannel}`,
        fmtNum(sc.fallbackVolume),
        fmt(sc.fallbackUnitPrice),
        fmt(sc.fallbackCost),
      ]);
    }
  });

  autoTable(doc, {
    startY: y,
    head: [["Disparo", "Volume", "Valor Unit.", "Custo"]],
    body: stepRows,
    theme: "grid",
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: 14 },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 14;

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`TOTAL MÊS:  ${fmt(result.totalMonthlyCost)}`, 14, y);
  y += 8;
  doc.text(
    `PROJEÇÃO 2026 (${result.monthsRemaining} meses):  ${fmt(result.projection2026)}`,
    14,
    y
  );

  doc.save(`${config.journeyName || "simulacao"}.pdf`);
}
