import { SimulationConfig, CalculatorDefaults, FALLBACK_CHANNELS } from "./types";

export const FALLBACK_DEFAULT_PROVIDERS: Record<string, string> = Object.fromEntries(
  FALLBACK_CHANNELS.map((ch) => [ch, "Zenvia"])
);

export const FALLBACK_DEFAULTS: CalculatorDefaults = {
  peopleReached: 100000,
  startMonth: 1,
  optInRate: 0.7,
  whatsappDeliveryRate: 0.95,
  smsDeliveryRate: 0.9,
};

export function createDefaultConfig(
  defaultProviders?: Record<string, string>,
  defaults?: CalculatorDefaults,
): SimulationConfig {
  const providers = defaultProviders ?? FALLBACK_DEFAULT_PROVIDERS;
  const d = defaults ?? FALLBACK_DEFAULTS;
  return {
    journeyName: "Nova Régua",
    peopleReached: d.peopleReached,
    startMonth: d.startMonth,
    providersByChannel: { ...providers } as Record<string, string>,
    optInRate: d.optInRate,
    deliveryRateWhats: d.whatsappDeliveryRate,
    deliveryRateSMS: d.smsDeliveryRate,
    steps: [],
  };
}
