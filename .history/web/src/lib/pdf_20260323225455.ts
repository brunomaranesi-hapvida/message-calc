import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { SimulationResult } from "./simulation";
import { SimulationConfig } from "./types";

const PAGE_LEFT = 20;
const PAGE_RIGHT = 190;

const COLORS = {
  title: [30, 41, 59] as [number, number, number],
  heading: [51, 65, 85] as [number, number, number],
  body: [71, 85, 105] as [number, number, number],
  muted: [148, 163, 184] as [number, number, number],
  accent: [37, 99, 235] as [number, number, number],
  rule: [203, 213, 225] as [number, number, number],
  tableHead: [241, 245, 249] as [number, number, number],
  tableHeadText: [51, 65, 85] as [number, number, number],
};

function fmt(n: number): string {
  return n.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

function fmtUnit(n: number): string {
  return n.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  });
}

function fmtNum(n: number): string {
  return n.toLocaleString("pt-BR");
}

function drawRule(doc: jsPDF, y: number): number {
  doc.setDrawColor(...COLORS.rule);
  doc.setLineWidth(0.4);
  doc.line(PAGE_LEFT, y, PAGE_RIGHT, y);
  return y + 6;
}

function sectionTitle(doc: jsPDF, text: string, y: number): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.heading);
  doc.text(text, PAGE_LEFT, y);
  return y + 7;
}

export function generatePDF(
  config: SimulationConfig,
  result: SimulationResult,
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 28;

  // ── Header ──────────────────────────────────────────────────

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...COLORS.title);
  doc.text(config.journeyName || "Jornada", PAGE_LEFT, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.muted);
  doc.text("Resumo de Custos", PAGE_LEFT, y);

  const today = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  doc.text(today, PAGE_RIGHT, y, { align: "right" });
  y += 6;

  doc.setTextColor(...COLORS.body);
  doc.text(
    `Volume base: ${fmtNum(config.peopleReached)} pessoas`,
    PAGE_LEFT,
    y,
  );
  y += 8;

  y = drawRule(doc, y);

  // ── Resumo Executivo ────────────────────────────────────────

  y = sectionTitle(doc, "Resumo Executivo", y);

  const activeChannels = Object.keys(result.messagesPerChannel);

  const summaryItems = [
    ["Custo mensal total", fmt(result.totalMonthlyCost)],
    [
      `Projeção 2026 (${result.monthsRemaining} meses)`,
      fmt(result.projection2026),
    ],
    ["Canais utilizados", activeChannels.join(", ") || "—"],
    ["Total de mensagens", fmtNum(result.totalMessages)],
  ];

  autoTable(doc, {
    startY: y,
    body: summaryItems,
    theme: "plain",
    styles: {
      font: "helvetica",
      fontSize: 10,
      cellPadding: { top: 1.5, bottom: 1.5, left: 0, right: 0 },
      textColor: COLORS.body,
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 65, textColor: COLORS.heading },
      1: { halign: "left", textColor: COLORS.body },
    },
    margin: { left: PAGE_LEFT, right: PAGE_LEFT },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 6;
  y = drawRule(doc, y);

  // ── Mensagens por Canal ─────────────────────────────────────

  y = sectionTitle(doc, "Mensagens por Canal", y);

  const channelRows = activeChannels.map((ch) => [
    ch,
    fmtNum(result.messagesPerChannel[ch]),
  ]);

  autoTable(doc, {
    startY: y,
    head: [["Canal", "Mensagens"]],
    body: channelRows,
    theme: "striped",
    styles: {
      font: "helvetica",
      fontSize: 10,
      cellPadding: 4,
      textColor: COLORS.body,
    },
    headStyles: {
      fillColor: COLORS.tableHead,
      textColor: COLORS.tableHeadText,
      fontStyle: "bold",
      lineWidth: 0,
    },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    columnStyles: {
      1: { halign: "right", fontStyle: "bold" },
    },
    margin: { left: PAGE_LEFT, right: PAGE_LEFT },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 8;
  y = drawRule(doc, y);

  // ── Detalhamento por Disparo ────────────────────────────────

  y = sectionTitle(doc, "Detalhamento por Disparo", y);
  y += 2;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  result.stepCosts.forEach((sc, i) => {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.heading);
    doc.text(`Disparo ${i + 1} — ${sc.step.channel}`, PAGE_LEFT, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.body);
    const line = `${fmtNum(sc.volume)} mensagens × ${fmtUnit(sc.unitPrice)}`;
    doc.text(line, PAGE_LEFT, y);
    doc.setFont("helvetica", "bold");
    doc.text(`= ${fmt(sc.cost)}`, PAGE_RIGHT, y, { align: "right" });
    y += 6;

    if (sc.step.fallbackChannel && sc.fallbackVolume > 0) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.muted);
      // doc.text(`Fallback — ${sc.step.fallbackChannel}`, PAGE_LEFT + 4, y);
      //y += 5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...COLORS.body);
      const fbLine = `${fmtNum(sc.fallbackVolume)} mensagens × ${fmtUnit(sc.fallbackUnitPrice)}`;
      doc.text(fbLine, PAGE_LEFT, y);
      doc.setFont("helvetica", "bold");
      doc.text(`= ${fmt(sc.fallbackCost)}`, PAGE_RIGHT, y, {
        align: "right",
      });
      y += 6;
    }

    y += 4;
  });

  // ── Totals ──────────────────────────────────────────────────

  y += 10;

  if (y > 250) {
    doc.addPage();
    y = 20;
  }

  y = drawRule(doc, y);
  y += 4;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...COLORS.title);
  doc.text("TOTAL MÊS", PAGE_LEFT, y);
  doc.text(fmt(result.totalMonthlyCost), PAGE_RIGHT, y, { align: "right" });

  y += 6;

  doc.setDrawColor(...COLORS.rule);
  doc.setLineDashPattern([2, 2], 0);
  doc.setLineWidth(0.3);
  doc.line(PAGE_LEFT, y, PAGE_RIGHT, y);
  doc.setLineDashPattern([], 0);

  y += 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.accent);
  doc.text("PROJEÇÃO 2026", PAGE_LEFT, y);
  doc.text(fmt(result.projection2026), PAGE_RIGHT, y, { align: "right" });

  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.muted);
  doc.text(
    `${result.monthsRemaining} meses restantes a partir de ${config.startMonth}/${new Date().getFullYear()}`,
    PAGE_LEFT,
    y,
  );

  y += 12;
  y = drawRule(doc, y);

  // ── Footer ──────────────────────────────────────────────────

  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.muted);
  doc.text(`Gerado em ${today} — Simulação de custos`, pageWidth / 2, y + 2, {
    align: "center",
  });

  doc.save(`${config.journeyName || "simulacao"}.pdf`);
}
