export const CHANNELS = [
  "SMS",
  "RCS",
  "HSM - Marketing",
  "HSM - Utility",
  "Email",
  "Push Notification",
] as const;

export type Channel = (typeof CHANNELS)[number];

export const PROVIDERS = [
  "Zenvia",
  "Twilio",
  "Gupshup",
  "Health ID",
  "Sapios",
  "Docusign",
  "ASC",
  "Salesforce",
  "Interaxa",
  "Bemobi",
] as const;

export type Provider = (typeof PROVIDERS)[number];

export type OffsetUnit = "hours" | "days" | "months";
export type OffsetDirection = "before" | "after";

export interface Trigger {
  id: string;
  slug: string;
  name: string;
}

export interface Step {
  id: string;
  channel: Channel;
  triggerId: string | null;
  offsetValue: number;
  offsetUnit: OffsetUnit;
  offsetDirection: OffsetDirection;
  fallbackChannel: Channel | null;
  fallbackPercentage: number;
}

export interface SimulationConfig {
  journeyName: string;
  peopleReached: number;
  startMonth: number;
  providersByChannel: Record<Channel, Provider>;
  optInRate: number;
  deliveryRateWhats: number;
  deliveryRateSMS: number;
  steps: Step[];
}

export interface StepCost {
  step: Step;
  volume: number;
  unitPrice: number;
  cost: number;
  fallbackVolume: number;
  fallbackUnitPrice: number;
  fallbackCost: number;
}
