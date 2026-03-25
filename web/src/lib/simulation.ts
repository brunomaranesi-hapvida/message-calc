import { SimulationConfig, Step, StepCost } from "./types";
import { getUnitPrice } from "./pricing";

export function computeVolumeBase(config: SimulationConfig): number {
  return Math.round(config.peopleReached * config.optInRate);
}

export function computeStepVolume(
  step: Step,
  config: SimulationConfig
): number {
  if (step.volumeMode === "absolute") {
    return Math.round(step.volumeValue);
  }
  const base = computeVolumeBase(config);
  return Math.round(base * (step.volumeValue / 100));
}

export function computeStepCost(
  step: Step,
  config: SimulationConfig,
  prices?: Record<string, Record<string, number>>
): StepCost {
  const volume = computeStepVolume(step, config);
  const provider = config.providersByChannel[step.channel];
  const unitPrice = getUnitPrice(step.channel, provider, prices);

  let fallbackVolume = 0;
  let fallbackUnitPrice = 0;
  let fallbackCost = 0;

  if (step.fallbackChannel && step.fallbackPercentage > 0) {
    fallbackVolume = Math.round(volume * (step.fallbackPercentage / 100));
    const fallbackProvider = config.providersByChannel[step.fallbackChannel];
    fallbackUnitPrice = getUnitPrice(step.fallbackChannel, fallbackProvider, prices);
    fallbackCost = fallbackVolume * fallbackUnitPrice;
  }

  const primaryVolume = volume - fallbackVolume;
  const cost = primaryVolume * unitPrice;

  return {
    step,
    volume: primaryVolume,
    unitPrice,
    cost,
    fallbackVolume,
    fallbackUnitPrice,
    fallbackCost,
  };
}

export interface SimulationResult {
  stepCosts: StepCost[];
  costPerChannel: Record<string, number>;
  messagesPerChannel: Record<string, number>;
  totalMessages: number;
  totalMonthlyCost: number;
  monthsRemaining: number;
  projection2026: number;
}

export function runSimulation(
  config: SimulationConfig,
  prices?: Record<string, Record<string, number>>
): SimulationResult {
  const stepCosts = config.steps.map((s) => computeStepCost(s, config, prices));

  const costPerChannel: Record<string, number> = {};
  const messagesPerChannel: Record<string, number> = {};

  for (const sc of stepCosts) {
    const ch = sc.step.channel;
    costPerChannel[ch] = (costPerChannel[ch] ?? 0) + sc.cost;
    messagesPerChannel[ch] = (messagesPerChannel[ch] ?? 0) + sc.volume;

    if (sc.step.fallbackChannel && sc.fallbackVolume > 0) {
      const fch = sc.step.fallbackChannel;
      costPerChannel[fch] = (costPerChannel[fch] ?? 0) + sc.fallbackCost;
      messagesPerChannel[fch] =
        (messagesPerChannel[fch] ?? 0) + sc.fallbackVolume;
    }
  }

  const totalMessages = Object.values(messagesPerChannel).reduce(
    (a, b) => a + b,
    0
  );
  const totalMonthlyCost = Object.values(costPerChannel).reduce(
    (a, b) => a + b,
    0
  );

  const monthsRemaining = 12 - config.startMonth + 1;
  const projection2026 = totalMonthlyCost * monthsRemaining;

  return {
    stepCosts,
    costPerChannel,
    messagesPerChannel,
    totalMessages,
    totalMonthlyCost,
    monthsRemaining,
    projection2026,
  };
}
