import { SimulationConfig, Step, StepCost, Channel } from "./types";
import { getUnitPrice } from "./pricing";

function isHSMChannel(channel: Channel): boolean {
  return channel === "HSM - Marketing" || channel === "HSM - Utility";
}

export function computeStepVolume(
  step: Step,
  config: SimulationConfig
): number {
  const base = config.peopleReached;
  if (isHSMChannel(step.channel)) {
    return Math.round(base * config.optInRate * config.deliveryRateWhats);
  }
  if (step.channel === "SMS") {
    return Math.round(base * config.deliveryRateSMS);
  }
  return base;
}

export function computeStepCost(
  step: Step,
  config: SimulationConfig
): StepCost {
  const volume = computeStepVolume(step, config);
  const provider = config.providersByChannel[step.channel];
  const unitPrice = getUnitPrice(step.channel, provider);
  const cost = volume * unitPrice;

  let fallbackVolume = 0;
  let fallbackUnitPrice = 0;
  let fallbackCost = 0;

  if (step.fallbackChannel && step.fallbackPercentage > 0) {
    fallbackVolume = Math.round(
      config.peopleReached * (step.fallbackPercentage / 100)
    );
    const fallbackProvider = config.providersByChannel[step.fallbackChannel];
    fallbackUnitPrice = getUnitPrice(step.fallbackChannel, fallbackProvider);
    fallbackCost = fallbackVolume * fallbackUnitPrice;
  }

  return {
    step,
    volume,
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

export function runSimulation(config: SimulationConfig): SimulationResult {
  const stepCosts = config.steps.map((s) => computeStepCost(s, config));

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
