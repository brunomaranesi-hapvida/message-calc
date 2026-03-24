import { Channel, Provider, SimulationConfig } from "./types";

export const DEFAULT_PROVIDERS: Record<Channel, Provider> = {
  SMS: "Zenvia",
  RCS: "Zenvia",
  "HSM - Marketing": "Zenvia",
  "HSM - Utility": "Zenvia",
  Email: "Zenvia",
  "Push Notification": "Zenvia",
};

export function createDefaultConfig(): SimulationConfig {
  return {
    journeyName: "Nova Jornada",
    peopleReached: 100000,
    startMonth: 1,
    providersByChannel: { ...DEFAULT_PROVIDERS },
    optInRate: 0.7,
    deliveryRateWhats: 0.95,
    deliveryRateSMS: 0.9,
    steps: [],
  };
}
