import { SimulationConfig, FALLBACK_CHANNELS, Channel } from "./types";
import { FALLBACK_DEFAULT_PROVIDERS } from "./defaults";
import { v4 as uuid } from "uuid";

const MAX_FILE_SIZE = 1_048_576; // 1 MB

const VALID_CHANNELS = new Set<string>(FALLBACK_CHANNELS);
const VALID_OFFSET_UNITS = new Set(["hours", "days", "months", "minutes"]);
const VALID_OFFSET_DIRS = new Set(["before", "after"]);
const VALID_VOLUME_MODES = new Set(["percentage", "absolute"]);

export type ImportResult =
  | { ok: true; config: SimulationConfig }
  | { ok: false; error: string };

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function normalizeOffsetUnit(unit: string): "hours" | "days" | "months" {
  if (unit === "minutes") return "hours";
  return unit as "hours" | "days" | "months";
}

export function validateImportedJSON(raw: unknown): ImportResult {
  if (!isObject(raw)) {
    return { ok: false, error: "JSON deve ser um objeto" };
  }

  const d = raw as Record<string, unknown>;

  if (typeof d.journeyName !== "string" || !d.journeyName.trim()) {
    return { ok: false, error: "Campo 'journeyName' é obrigatório" };
  }

  if (typeof d.peopleReached !== "number" || d.peopleReached < 0) {
    return { ok: false, error: "Campo 'peopleReached' deve ser um número >= 0" };
  }

  if (!Array.isArray(d.steps) || d.steps.length === 0) {
    return { ok: false, error: "O array 'steps' é obrigatório e não pode estar vazio" };
  }

  const startMonth =
    typeof d.startMonth === "number" ? Math.max(1, Math.min(12, d.startMonth)) : 1;
  const optInRate =
    typeof d.optInRate === "number" ? Math.max(0, Math.min(1, d.optInRate)) : 0.7;
  const deliveryRateWhats =
    typeof d.deliveryRateWhats === "number" ? Math.max(0, Math.min(1, d.deliveryRateWhats)) : 0.95;
  const deliveryRateSMS =
    typeof d.deliveryRateSMS === "number" ? Math.max(0, Math.min(1, d.deliveryRateSMS)) : 0.9;

  const providers = { ...FALLBACK_DEFAULT_PROVIDERS };
  if (isObject(d.providersByChannel)) {
    for (const [ch, prov] of Object.entries(d.providersByChannel as Record<string, unknown>)) {
      if (VALID_CHANNELS.has(ch) && typeof prov === "string") {
        providers[ch as Channel] = prov as never;
      }
    }
  }

  const stepsArr = d.steps as unknown[];
  const stepCount = stepsArr.length;
  const steps = [];

  for (let i = 0; i < stepCount; i++) {
    const s = stepsArr[i];
    if (!isObject(s)) {
      return { ok: false, error: `Step ${i + 1} inválido` };
    }

    const step = s as Record<string, unknown>;

    if (typeof step.channel !== "string" || !VALID_CHANNELS.has(step.channel)) {
      return {
        ok: false,
        error: `Step ${i + 1}: canal '${step.channel}' não é válido`,
      };
    }

    const offsetUnit = typeof step.offsetUnit === "string" && VALID_OFFSET_UNITS.has(step.offsetUnit)
      ? step.offsetUnit
      : "days";
    const offsetValue = typeof step.offsetValue === "number" && step.offsetValue >= 0
      ? step.offsetValue
      : 0;
    const offsetDirection = typeof step.offsetDirection === "string" && VALID_OFFSET_DIRS.has(step.offsetDirection)
      ? step.offsetDirection
      : "after";

    const hasVolumeMode = typeof step.volumeMode === "string" && VALID_VOLUME_MODES.has(step.volumeMode);
    const volumeMode = hasVolumeMode
      ? (step.volumeMode as "percentage" | "absolute")
      : "percentage";
    const volumeValue = hasVolumeMode && typeof step.volumeValue === "number"
      ? Math.max(0, step.volumeValue)
      : Math.round(100 / stepCount);

    let fallbackChannel: Channel | null = null;
    let fallbackPercentage = 0;
    if (typeof step.fallbackChannel === "string" && VALID_CHANNELS.has(step.fallbackChannel)) {
      fallbackChannel = step.fallbackChannel as Channel;
      fallbackPercentage =
        typeof step.fallbackPercentage === "number"
          ? Math.max(0, Math.min(100, step.fallbackPercentage))
          : 0;
    }

    steps.push({
      id: typeof step.id === "string" && step.id ? step.id : uuid(),
      channel: step.channel as Channel,
      triggerId: typeof step.triggerId === "string" ? step.triggerId : null,
      offsetValue,
      offsetUnit: normalizeOffsetUnit(offsetUnit),
      offsetDirection: offsetDirection as "before" | "after",
      volumeMode,
      volumeValue,
      fallbackChannel,
      fallbackPercentage,
    });
  }

  return {
    ok: true,
    config: {
      journeyName: d.journeyName as string,
      peopleReached: d.peopleReached as number,
      startMonth,
      providersByChannel: providers,
      optInRate,
      deliveryRateWhats,
      deliveryRateSMS,
      steps,
    },
  };
}

export function readAndValidateFile(file: File): Promise<ImportResult> {
  return new Promise((resolve) => {
    if (file.size > MAX_FILE_SIZE) {
      resolve({ ok: false, error: "Arquivo excede o limite de 1 MB" });
      return;
    }

    if (!file.name.endsWith(".json") && file.type !== "application/json") {
      resolve({ ok: false, error: "Apenas arquivos .json são aceitos" });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        resolve(validateImportedJSON(parsed));
      } catch {
        resolve({ ok: false, error: "JSON mal formatado" });
      }
    };
    reader.onerror = () => resolve({ ok: false, error: "Erro ao ler o arquivo" });
    reader.readAsText(file);
  });
}
